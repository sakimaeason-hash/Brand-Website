import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/authorization";
import { adminErrorResponse, parseJsonField } from "@/lib/admin/http";
import { publishProduct, saveProductDraft, unpublishProduct } from "@/lib/catalog/product-service";
import { productAggregateInputSchema, type ProductAggregateInput } from "@/lib/catalog/product-validation";
import { parseImageMetadata, shouldRemoveFromContentStorage } from "@/lib/content/media";
import { removeContentImage, uploadContentImage } from "@/lib/content/storage";
import { MAX_CONTENT_IMAGES } from "@/lib/content/validation";
import { prisma } from "@/lib/db";

type Params = { params: { id: string } };
type ImageRow = { id: string; storagePath: string; sortOrder: number; altText?: string | null; sourceNote?: string | null };
type ImageEntry = { id: string; sortOrder?: number; altText?: string | null; sourceNote?: string | null };

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { orderBy: { sortOrder: "asc" as const } },
  inBoxItems: { orderBy: { sortOrder: "asc" as const } },
  compatibleAccessories: { orderBy: { sortOrder: "asc" as const } },
  categoryRelation: { include: { fields: { orderBy: { sortOrder: "asc" as const } } } },
};

const errorResponse = (message: string, status = 400, code = "VALIDATION_ERROR") => NextResponse.json({ error: message, code, fields: [] }, { status });

function payloadOf(form: FormData): Record<string, unknown> {
  if (!form.has("payload")) return {};
  const value = parseJsonField(form, "payload");
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("payload must be a JSON object");
  return value as Record<string, unknown>;
}

function versionError(form: FormData, payload: Record<string, unknown>, actual: Date) {
  const raw = form.get("updatedAt") ?? payload.updatedAt;
  if (raw == null || raw === "") return errorResponse("updatedAt is required");
  if (typeof raw !== "string") return errorResponse("updatedAt must be an ISO timestamp");
  const expected = new Date(raw);
  if (Number.isNaN(expected.getTime())) return errorResponse("updatedAt must be an ISO timestamp");
  return expected.getTime() === actual.getTime() ? null : errorResponse("Content was changed by another editor", 409, "CONCURRENT_UPDATE");
}

function imageEntries(value: unknown): ImageEntry[] | null {
  if (!Array.isArray(value)) return null;
  const result: ImageEntry[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || typeof (entry as { id?: unknown }).id !== "string") return null;
    const item = entry as { id: string; sortOrder?: unknown; altText?: unknown; sourceNote?: unknown };
    if (!((item.sortOrder == null || (typeof item.sortOrder === "number" && Number.isInteger(item.sortOrder))) && (item.altText == null || typeof item.altText === "string") && (item.sourceNote == null || typeof item.sourceNote === "string"))) return null;
    result.push({ id: item.id, sortOrder: item.sortOrder as number | undefined, altText: item.altText as string | null | undefined, sourceNote: item.sourceNote as string | null | undefined });
  }
  return result;
}

function removeIds(form: FormData) {
  const raw = form.get("removeImageIds");
  if (typeof raw !== "string" || !raw) return new Set<string>();
  try {
    const ids = JSON.parse(raw);
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) return null;
    return new Set(ids as string[]);
  } catch {
    return null;
  }
}

function aggregateFromPayload(payload: Record<string, unknown>): { data?: ProductAggregateInput; response?: NextResponse } {
  const { images: _images, updatedAt: _updatedAt, ...candidate } = payload;
  if (Object.keys(candidate).length === 0) return {};
  const parsed = productAggregateInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return { response: NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid product", code: "VALIDATION_ERROR", fields: parsed.error.errors }, { status: 400 }) };
  }
  return { data: parsed.data };
}

function isoDate(value: unknown, fallback: string): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && Number.isFinite(new Date(value).getTime())) return new Date(value).toISOString();
  return fallback;
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/wheelchair-finder");
}

async function cleanupUploads(paths: readonly string[]) {
  await Promise.all(paths.map((path) => removeContentImage(path).catch((error) => console.error("Product image cleanup failed", error))));
}

async function cleanupRegisteredImages(ids: readonly string[]) {
  await Promise.all(ids.map((id) => Promise.resolve(prisma.productImage.delete({ where: { id } })).catch((error) => console.error("Product image record cleanup failed", error))));
}

export async function GET(_: Request, { params }: Params) {
  try {
    await requireAdmin();
    const product = await prisma.product.findUnique({ where: { id: params.id }, include: productInclude });
    return product ? NextResponse.json(product) : errorResponse("Not found", 404, "NOT_FOUND");
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const action = String(form.get("action") || "save-draft");
    if (!["save-draft", "publish", "unpublish", "delete"].includes(action)) return errorResponse("Unsupported action");
    const existing = await prisma.product.findUnique({ where: { id: params.id }, include: productInclude });
    if (!existing) return errorResponse("Not found", 404, "NOT_FOUND");

    let payload: Record<string, unknown>;
    try {
      payload = payloadOf(form);
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Invalid payload");
    }
    const stale = versionError(form, payload, existing.updatedAt);
    if (stale) return stale;
    const rawUpdatedAt = String(form.get("updatedAt") ?? payload.updatedAt);
    const existingImages = existing.images as ImageRow[];

    if (action === "delete") {
      if (form.get("confirm") !== "true") return errorResponse("Confirmation required");
      try {
        for (const image of existingImages) if (shouldRemoveFromContentStorage(image.storagePath)) await removeContentImage(image.storagePath);
      } catch (error) {
        console.error("Product image deletion failed", error);
        return errorResponse("Unable to remove product images from storage", 502, "IMAGE_DELETE_FAILED");
      }
      await prisma.product.delete({ where: { id: params.id } });
      revalidateCatalog();
      return NextResponse.json({ success: true });
    }

    const aggregate = aggregateFromPayload(payload);
    if (aggregate.response) return aggregate.response;
    const entries = payload.images === undefined ? undefined : imageEntries(payload.images);
    if (payload.images !== undefined && !entries) return errorResponse("images must be an array of existing image entries");
    if (entries?.some((entry) => !existingImages.some((image) => image.id === entry.id))) return errorResponse("images contains an unknown image id");
    const ids = removeIds(form);
    if (!ids) return errorResponse("removeImageIds must be valid JSON array");
    const removeSet = ids;
    if (entries) {
      const keep = new Set(entries.map((entry) => entry.id));
      for (const image of existingImages) if (!keep.has(image.id)) removeSet.add(image.id);
    }
    const removed = existingImages.filter((image) => removeSet.has(image.id));
    const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
    const remainingCount = existingImages.length - removed.length + files.length;
    if (remainingCount > MAX_CONTENT_IMAGES) return errorResponse("Too many images");
    let metadata;
    try {
      const rawMetadata = form.get("imageMetadata");
      metadata = parseImageMetadata(typeof rawMetadata === "string" ? rawMetadata : null, files.length);
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Invalid image metadata");
    }

    const uploaded: Array<{ storagePath: string; publicUrl: string; originalName: string; altText?: string | null; sourceNote?: string | null; sortOrder: number }> = [];
    try {
      const start = entries ? entries.length : existingImages.length - removed.length;
      for (let index = 0; index < files.length; index += 1) {
        const media = await uploadContentImage("products", params.id, files[index], start + index);
        uploaded.push({ ...media, ...metadata[index], sortOrder: start + index });
      }
    } catch (error) {
      console.error("Product image upload failed", error);
      await cleanupUploads(uploaded.map((image) => image.storagePath));
      return errorResponse("Image upload failed", 502, "IMAGE_UPLOAD_FAILED");
    }

    let result: any = existing;
    if (aggregate.data) {
      try {
        result = await saveProductDraft(params.id, aggregate.data, rawUpdatedAt);
      } catch (error) {
        await cleanupUploads(uploaded.map((image) => image.storagePath));
        return adminErrorResponse(error);
      }
    }

    const registeredImageIds: string[] = [];
    try {
      for (const image of uploaded) {
        const created = await prisma.productImage.create({ data: { productId: params.id, ...image } });
        registeredImageIds.push(created.id);
      }
    } catch (error) {
      await cleanupRegisteredImages(registeredImageIds);
      await cleanupUploads(uploaded.map((image) => image.storagePath));
      return errorResponse("Image upload failed", 502, "IMAGE_UPLOAD_FAILED");
    }
    try {
      for (const image of removed) if (shouldRemoveFromContentStorage(image.storagePath)) await removeContentImage(image.storagePath);
    } catch (error) {
      console.error("Product image deletion failed", error);
      await cleanupRegisteredImages(registeredImageIds);
      await cleanupUploads(uploaded.map((image) => image.storagePath));
      return errorResponse("Unable to remove product images from storage", 502, "IMAGE_DELETE_FAILED");
    }
    for (const image of removed) await prisma.productImage.delete({ where: { id: image.id } });
    if (entries) {
      for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        const current = existingImages.find((image) => image.id === entry.id);
        if (!current || removeSet.has(entry.id)) continue;
        const sortOrder = entry.sortOrder ?? index;
        const imageData: Record<string, unknown> = {};
        if (current.sortOrder !== sortOrder) imageData.sortOrder = sortOrder;
        if (entry.altText !== undefined && entry.altText !== current.altText) imageData.altText = entry.altText?.trim() || null;
        if (entry.sourceNote !== undefined && entry.sourceNote !== current.sourceNote) imageData.sourceNote = entry.sourceNote?.trim() || null;
        if (Object.keys(imageData).length) await prisma.productImage.update({ where: { id: current.id }, data: imageData });
      }
    }

    const actionTimestamp = isoDate(result.updatedAt, rawUpdatedAt);
    if (action === "publish") {
      result = await publishProduct(params.id, actionTimestamp);
      revalidateCatalog();
    } else if (action === "unpublish") {
      result = await unpublishProduct(params.id, actionTimestamp);
      revalidateCatalog();
    } else if (!aggregate.data || removed.length > 0 || uploaded.length > 0 || entries) {
      result = await prisma.product.findUnique({ where: { id: params.id }, include: productInclude });
    }
    return NextResponse.json(result);
  } catch (error) {
    return adminErrorResponse(error);
  }
}
