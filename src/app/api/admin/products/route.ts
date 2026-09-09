import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/authorization";
import { adminErrorResponse, parseJsonField } from "@/lib/admin/http";
import { createProductDraft } from "@/lib/catalog/product-service";
import { productAggregateInputSchema } from "@/lib/catalog/product-validation";
import { parseImageMetadata } from "@/lib/content/media";
import { removeContentImage, uploadContentImage } from "@/lib/content/storage";
import { MAX_CONTENT_IMAGES } from "@/lib/content/validation";
import { prisma } from "@/lib/db";

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { orderBy: { sortOrder: "asc" as const } },
  inBoxItems: { orderBy: { sortOrder: "asc" as const } },
  compatibleAccessories: { orderBy: { sortOrder: "asc" as const } },
  categoryRelation: { include: { fields: { orderBy: { sortOrder: "asc" as const } } } },
};

function validationError(error: { errors: Array<{ message: string }> }) {
  return NextResponse.json({ error: error.errors[0]?.message ?? "Invalid product", code: "VALIDATION_ERROR", fields: error.errors }, { status: 400 });
}

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await prisma.product.findMany({
      include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { sortOrder: "asc" } }, categoryRelation: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    }));
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    let payload: unknown;
    try {
      payload = parseJsonField(form, "payload");
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid payload", code: "VALIDATION_ERROR", fields: [] }, { status: 400 });
    }
    const parsed = productAggregateInputSchema.safeParse(payload);
    if (!parsed.success) return validationError(parsed.error);

    const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > MAX_CONTENT_IMAGES) return NextResponse.json({ error: "Too many images", code: "VALIDATION_ERROR", fields: [] }, { status: 400 });
    let metadata;
    try {
      const rawMetadata = form.get("imageMetadata");
      metadata = parseImageMetadata(typeof rawMetadata === "string" ? rawMetadata : null, files.length);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid image metadata", code: "VALIDATION_ERROR", fields: [] }, { status: 400 });
    }

    const product = await createProductDraft(parsed.data);
    const uploaded: string[] = [];
    try {
      for (let index = 0; index < files.length; index += 1) {
        const media = await uploadContentImage("products", product.id, files[index], index);
        uploaded.push(media.storagePath);
        await prisma.productImage.create({ data: { productId: product.id, ...media, ...metadata[index], sortOrder: index } });
      }
    } catch (error) {
      console.error("Product image upload failed", error);
      await Promise.all(uploaded.map((path) => removeContentImage(path).catch((cleanupError) => console.error("Product image cleanup failed", cleanupError))));
      await prisma.product.delete({ where: { id: product.id } });
      return NextResponse.json({ error: "Image upload failed", code: "IMAGE_UPLOAD_FAILED", fields: [] }, { status: 502 });
    }
    return NextResponse.json(await prisma.product.findUnique({ where: { id: product.id }, include: productInclude }), { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
