import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/authorization";
import { adminErrorResponse, parseJsonField } from "@/lib/admin/http";
import { productInputSchema, MAX_CONTENT_IMAGES } from "@/lib/content/validation";
import { removeContentImage, uploadContentImage } from "@/lib/content/storage";

type Params = { params: { id: string } };
type ImageRow = { id: string; storagePath: string; sortOrder: number; altText?: string | null; sourceNote?: string | null };
const errorResponse = (message: string, status = 400) => NextResponse.json({ error: message }, { status });
function payloadOf(form: FormData): Record<string, unknown> {
  if (!form.has("payload")) return {};
  const value = parseJsonField(form, "payload");
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function versionError(form: FormData, payload: Record<string, unknown>, actual: Date) {
  const raw = form.get("updatedAt") ?? payload.updatedAt;
  if (raw == null || raw === "") return null;
  if (typeof raw !== "string") return errorResponse("updatedAt must be an ISO timestamp");
  const expected = new Date(raw);
  if (Number.isNaN(expected.getTime())) return errorResponse("updatedAt must be an ISO timestamp");
  return expected.getTime() === actual.getTime() ? null : errorResponse("Content was changed by another editor", 409);
}
function imageEntries(value: unknown) {
  if (!Array.isArray(value)) return null;
  const result: Array<{ id: string; sortOrder?: number; altText?: string | null; sourceNote?: string | null }> = [];
  for (let index = 0; index < value.length; index += 1) {
    const entry = value[index];
    if (!entry || typeof entry !== "object" || typeof (entry as { id?: unknown }).id !== "string") return null;
    const item = entry as { sortOrder?: unknown; altText?: unknown; sourceNote?: unknown };
    if (!((item.sortOrder == null || (typeof item.sortOrder === "number" && Number.isInteger(item.sortOrder))) && (item.altText == null || typeof item.altText === "string") && (item.sourceNote == null || typeof item.sourceNote === "string"))) return null;
    result.push({ id: (entry as { id: string }).id, sortOrder: item.sortOrder as number | undefined, altText: item.altText as string | null | undefined, sourceNote: item.sourceNote as string | null | undefined });
  }
  return result;
}
function removeIds(form: FormData) {
  const raw = form.get("removeImageIds");
  if (typeof raw !== "string" || !raw) return new Set<string>();
  try { const ids = JSON.parse(raw); if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) return null; return new Set(ids as string[]); } catch { return null; }
}

export async function GET(_: Request, { params }: Params) {
  try { await requireAdmin(); const product = await prisma.product.findUnique({ where: { id: params.id }, include: { images: { orderBy: { sortOrder: "asc" } } } }); return product ? NextResponse.json(product) : errorResponse("Not found", 404); }
  catch (error) { return adminErrorResponse(error); }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const action = String(form.get("action") || "save-draft");
    if (!["save-draft", "publish", "unpublish", "delete"].includes(action)) return errorResponse("Unsupported action");
    const existing = await prisma.product.findUnique({ where: { id: params.id }, include: { images: { orderBy: { sortOrder: "asc" } } } });
    if (!existing) return errorResponse("Not found", 404);
    const payload = payloadOf(form); const stale = versionError(form, payload, existing.updatedAt); if (stale) return stale;
    const existingImages = existing.images as ImageRow[];
    if (action === "delete") {
      if (form.get("confirm") !== "true") return errorResponse("Confirmation required");
      try { for (const image of existingImages) await removeContentImage(image.storagePath); }
      catch (error) { console.error("Product image deletion failed", error); return errorResponse("Unable to remove product images from storage", 502); }
      await prisma.product.delete({ where: { id: params.id } }); return NextResponse.json({ success: true });
    }
    let data: Record<string, unknown> = {};
    if (form.has("payload")) {
      const parsed = productInputSchema.safeParse({ ...existing, ...payload, status: "DRAFT" });
      if (!parsed.success) return errorResponse(parsed.error.errors[0]?.message || "Invalid product");
      const { status: _status, ...fields } = parsed.data; data = { ...fields, originalPrice: fields.originalPrice ?? undefined };
    }
    const entries = imageEntries(payload.images); if (payload.images != null && !entries) return errorResponse("images must be an array of existing image entries");
    const ids = removeIds(form); if (!ids) return errorResponse("removeImageIds must be valid JSON array");
    const removeSet = ids || new Set<string>(); if (entries) { const keep = new Set(entries.map((entry) => entry.id)); for (const image of existingImages) if (!keep.has(image.id)) removeSet.add(image.id); }
    const removed = existingImages.filter((image) => removeSet.has(image.id));
    const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
    const remainingCount = existingImages.length - removed.length + files.length; if (remainingCount > MAX_CONTENT_IMAGES) return errorResponse("Too many images");
    const name = typeof data.name === "string" ? data.name : existing.name; const model = typeof data.model === "string" ? data.model : existing.model; const price = data.price == null ? Number(existing.price) : Number(data.price);
    if (action === "publish" && (!name.trim() || !model.trim() || !Number.isFinite(price) || price <= 0 || remainingCount < 1)) return errorResponse("Name, model, price and at least one image are required before publishing");
    try { for (const image of removed) await removeContentImage(image.storagePath); }
    catch (error) { console.error("Product image deletion failed", error); return errorResponse("Unable to remove product images from storage", 502); }
    for (const image of removed) await prisma.productImage.delete({ where: { id: image.id } });
    if (entries) for (let index = 0; index < entries.length; index += 1) { const entry = entries[index];
      const current = existingImages.find((image) => image.id === entry.id); if (!current || removeSet.has(entry.id)) continue;
      const sortOrder = entry.sortOrder ?? index; const imageData: Record<string, unknown> = {}; if (current.sortOrder !== sortOrder) imageData.sortOrder = sortOrder; if (entry.altText !== undefined && entry.altText !== current.altText) imageData.altText = entry.altText || null; if (entry.sourceNote !== undefined && entry.sourceNote !== current.sourceNote) imageData.sourceNote = entry.sourceNote || null; if (Object.keys(imageData).length) await prisma.productImage.update({ where: { id: current.id }, data: imageData });
    }
    const uploaded: string[] = []; try { const start = entries ? entries.length : existingImages.length - removed.length; for (let index = 0; index < files.length; index += 1) { const media = await uploadContentImage("products", params.id, files[index], start + index); uploaded.push(media.storagePath); await prisma.productImage.create({ data: { productId: params.id, ...media, sortOrder: start + index } }); } }
    catch { await Promise.all(uploaded.map((path) => removeContentImage(path).catch(() => undefined))); return errorResponse("Image upload failed", 502); }
    data.status = action === "publish" ? "PUBLISHED" : action === "unpublish" ? "UNPUBLISHED" : "DRAFT";
    return NextResponse.json(await prisma.product.update({ where: { id: params.id }, data: data as never, include: { images: { orderBy: { sortOrder: "asc" } } } }));
  } catch (error) { return adminErrorResponse(error); }
}
