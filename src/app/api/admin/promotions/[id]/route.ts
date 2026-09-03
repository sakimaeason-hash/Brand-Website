import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/authorization";
import { adminErrorResponse, parseJsonField } from "@/lib/admin/http";
import { promotionInputSchema } from "@/lib/content/validation";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try { await requireAdmin(); const form = await request.formData(); const action = String(form.get("action") || "save-draft"); if (action === "delete") { if (form.get("confirm") !== "true") return NextResponse.json({ error: "Confirmation required" }, { status: 400 }); await prisma.promotion.delete({ where: { id: params.id } }); return NextResponse.json({ success: true }); } let data: Record<string, unknown> = {}; if (form.has("payload")) { const parsed = promotionInputSchema.safeParse({ ...parseJsonField(form, "payload") as Record<string, unknown>, status: "DRAFT" }); if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 }); data = { ...parsed.data, startAt: new Date(parsed.data.startAt), endAt: new Date(parsed.data.endAt), salePrice: parsed.data.salePrice ?? undefined, discountPercent: parsed.data.discountPercent ?? undefined }; } data.status = action === "publish" ? "PUBLISHED" : action === "unpublish" ? "UNPUBLISHED" : "DRAFT"; return NextResponse.json(await prisma.promotion.update({ where: { id: params.id }, data: data as never })); } catch (error) { return adminErrorResponse(error); }
}
