import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/authorization";
import { adminErrorResponse, parseJsonField } from "@/lib/admin/http";
import { promotionInputSchema } from "@/lib/content/validation";

type Params = { params: { id: string } };

const actions = new Set(["save-draft", "publish", "unpublish", "delete"]);

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function payloadOf(form: FormData): Record<string, unknown> {
  if (!form.has("payload")) return {};
  const value = parseJsonField(form, "payload");
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("payload must be an object");
  return value as Record<string, unknown>;
}

function checkUpdatedAt(form: FormData, payload: Record<string, unknown>, actual: Date) {
  const raw = form.get("updatedAt") ?? payload.updatedAt;
  if (raw == null || raw === "") return errorResponse("updatedAt is required");
  if (typeof raw !== "string") return errorResponse("updatedAt must be an ISO timestamp");
  const expected = new Date(raw);
  if (Number.isNaN(expected.getTime())) return errorResponse("updatedAt must be an ISO timestamp");
  return expected.getTime() === actual.getTime() ? null : errorResponse("Content was changed by another editor", 409);
}

function existingInput(existing: {
  name: string;
  productId: string;
  startAt: Date;
  endAt: Date;
  salePrice: unknown;
  discountPercent: unknown;
  label: string | null;
  bannerImageUrl: string | null;
  isAutoScheduleEnabled: boolean;
}) {
  return {
    name: existing.name,
    productId: existing.productId,
    startAt: new Date(existing.startAt).toISOString(),
    endAt: new Date(existing.endAt).toISOString(),
    salePrice: existing.salePrice == null ? null : Number(existing.salePrice),
    discountPercent: existing.discountPercent == null ? null : Number(existing.discountPercent),
    label: existing.label,
    bannerImageUrl: existing.bannerImageUrl,
    isAutoScheduleEnabled: existing.isAutoScheduleEnabled,
  };
}

export async function GET(_: Request, { params }: Params) {
  try {
    await requireAdmin();
    const promotion = await prisma.promotion.findUnique({ where: { id: params.id }, include: { product: true } });
    return promotion ? NextResponse.json(promotion) : errorResponse("Not found", 404);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const action = String(form.get("action") || "save-draft");
    if (!actions.has(action)) return errorResponse("Unsupported action");

    const existing = await prisma.promotion.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse("Not found", 404);

    const payload = payloadOf(form);
    const stale = checkUpdatedAt(form, payload, existing.updatedAt);
    if (stale) return stale;

    if (action === "delete") {
      if (form.get("confirm") !== "true") return errorResponse("Confirmation required");
      await prisma.promotion.delete({ where: { id: params.id } });
      return NextResponse.json({ success: true });
    }

    let fields = existingInput(existing);
    if (form.has("payload")) {
      const parsed = promotionInputSchema.safeParse({ ...fields, ...payload, status: "DRAFT" });
      if (!parsed.success) return errorResponse(parsed.error.errors[0]?.message || "Invalid promotion");
      fields = {
        ...parsed.data,
        salePrice: parsed.data.salePrice ?? null,
        discountPercent: parsed.data.discountPercent ?? null,
        label: parsed.data.label ?? null,
        bannerImageUrl: parsed.data.bannerImageUrl ?? null,
      };
    }

    const product = await prisma.product.findUnique({ where: { id: fields.productId }, select: { id: true } });
    if (!product) return errorResponse("Product not found");
    if (action === "publish") {
      const validation = promotionInputSchema.safeParse({ ...fields, status: "PUBLISHED" });
      if (!validation.success) return errorResponse(validation.error.errors[0]?.message || "Invalid promotion");
    }

    const data = {
      name: fields.name,
      productId: fields.productId,
      startAt: new Date(fields.startAt),
      endAt: new Date(fields.endAt),
      salePrice: fields.salePrice == null ? null : fields.salePrice,
      discountPercent: fields.discountPercent == null ? null : fields.discountPercent,
      label: fields.label || null,
      bannerImageUrl: fields.bannerImageUrl || null,
      isAutoScheduleEnabled: fields.isAutoScheduleEnabled,
      status: action === "publish" ? "PUBLISHED" : action === "unpublish" ? "UNPUBLISHED" : "DRAFT",
    };

    return NextResponse.json(await prisma.promotion.update({ where: { id: params.id }, data: data as never }));
  } catch (error) {
    if (error instanceof Error && (/payload|updatedAt/.test(error.message))) return errorResponse(error.message);
    return adminErrorResponse(error);
  }
}
