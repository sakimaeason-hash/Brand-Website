import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/authorization";
import { adminErrorResponse, parseJsonField } from "@/lib/admin/http";
import { promotionInputSchema } from "@/lib/content/validation";

export async function GET() { try { await requireAdmin(); return NextResponse.json(await prisma.promotion.findMany({ include: { product: { select: { name: true, model: true } } }, orderBy: { startAt: "desc" } })); } catch (error) { return adminErrorResponse(error); } }

export async function POST(request: Request) {
  try { await requireAdmin(); const form = await request.formData(); const parsed = promotionInputSchema.safeParse({ ...parseJsonField(form, "payload") as Record<string, unknown>, status: "DRAFT" }); if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 }); const product = await prisma.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true } }); if (!product) return NextResponse.json({ error: "Product not found" }, { status: 400 }); const promotion = await prisma.promotion.create({ data: { ...parsed.data, startAt: new Date(parsed.data.startAt), endAt: new Date(parsed.data.endAt), salePrice: parsed.data.salePrice ?? undefined, discountPercent: parsed.data.discountPercent ?? undefined, status: "DRAFT" } }); return NextResponse.json(promotion, { status: 201 }); } catch (error) { return adminErrorResponse(error); }
}
