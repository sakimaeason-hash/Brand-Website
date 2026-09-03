import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/authorization";
import { adminErrorResponse, parseJsonField } from "@/lib/admin/http";
import { productInputSchema, MAX_CONTENT_IMAGES } from "@/lib/content/validation";
import { uploadContentImage } from "@/lib/content/storage";

export async function GET() {
  try { await requireAdmin(); return NextResponse.json(await prisma.product.findMany({ include: { images: { orderBy: { sortOrder: "asc" } } }, orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] })); } catch (error) { return adminErrorResponse(error); }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const parsed = productInputSchema.safeParse({ ...parseJsonField(form, "payload") as Record<string, unknown>, status: "DRAFT" });
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > MAX_CONTENT_IMAGES) return NextResponse.json({ error: "Too many images" }, { status: 400 });
    const product = await prisma.product.create({ data: { ...parsed.data, features: parsed.data.features, price: parsed.data.price, originalPrice: parsed.data.originalPrice ?? undefined, status: "DRAFT" } });
    const uploaded: string[] = [];
    try {
      for (let index = 0; index < files.length; index += 1) { const file = files[index]; const media = await uploadContentImage("products", product.id, file, index); uploaded.push(media.storagePath); await prisma.productImage.create({ data: { productId: product.id, ...media, sortOrder: index } }); }
    } catch (error) { console.error("Product image upload failed", error); await prisma.product.delete({ where: { id: product.id } }); return NextResponse.json({ error: "Image upload failed" }, { status: 502 }); }
    return NextResponse.json(await prisma.product.findUnique({ where: { id: product.id }, include: { images: true } }), { status: 201 });
  } catch (error) { return adminErrorResponse(error); }
}
