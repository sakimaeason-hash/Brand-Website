import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/authorization";
import { adminErrorResponse, parseJsonField } from "@/lib/admin/http";
import { productInputSchema } from "@/lib/content/validation";

export async function GET(_: Request, { params }: { params: { id: string } }) { try { await requireAdmin(); const product = await prisma.product.findUnique({ where: { id: params.id }, include: { images: { orderBy: { sortOrder: "asc" } } } }); return product ? NextResponse.json(product) : NextResponse.json({ error: "Not found" }, { status: 404 }); } catch (error) { return adminErrorResponse(error); } }

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(); const form = await request.formData(); const action = String(form.get("action") || "save-draft");
    const existing = await prisma.product.findUnique({ where: { id: params.id }, include: { images: true } }); if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (action === "delete") { if (form.get("confirm") !== "true") return NextResponse.json({ error: "Confirmation required" }, { status: 400 }); await prisma.product.delete({ where: { id: params.id } }); return NextResponse.json({ success: true }); }
    if (action === "publish" && (!existing.name.trim() || !existing.model.trim() || Number(existing.price) <= 0)) return NextResponse.json({ error: "Name, model and price are required before publishing" }, { status: 400 });
    let data: Record<string, unknown> = {};
    if (form.has("payload")) { const parsed = productInputSchema.safeParse({ ...parseJsonField(form, "payload") as Record<string, unknown>, status: "DRAFT" }); if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 }); data = { ...parsed.data, originalPrice: parsed.data.originalPrice ?? undefined }; }
    if (action === "publish") data.status = "PUBLISHED"; else if (action === "unpublish") data.status = "UNPUBLISHED"; else data.status = "DRAFT";
    const product = await prisma.product.update({ where: { id: params.id }, data: data as never, include: { images: true } }); return NextResponse.json(product);
  } catch (error) { return adminErrorResponse(error); }
}
