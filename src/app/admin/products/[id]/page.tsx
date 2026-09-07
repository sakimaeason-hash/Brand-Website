import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ContentActions } from "@/components/admin/ContentActions";
import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";

function productFormData(product: NonNullable<Awaited<ReturnType<typeof findProduct>>>): ProductFormData {
  return {
    id: product.id,
    updatedAt: product.updatedAt.toISOString(),
    name: product.name,
    model: product.model,
    category: product.category,
    tagline: product.tagline,
    description: product.description,
    price: Number(product.price),
    originalPrice: product.originalPrice == null ? null : Number(product.originalPrice),
    amazonLink: product.amazonLink,
    weightCapacity: product.weightCapacity,
    seatWidth: product.seatWidth,
    range: product.range,
    maxSpeed: product.maxSpeed,
    productWeight: product.productWeight,
    features: Array.isArray(product.features) ? product.features.filter((item): item is string => typeof item === "string") : [],
    isFeatured: product.isFeatured,
    sortOrder: product.sortOrder,
    images: product.images.map((image) => ({
      id: image.id,
      publicUrl: image.publicUrl,
      originalName: image.originalName,
      altText: image.altText,
      sourceNote: image.sourceNote,
      sortOrder: image.sortOrder,
    })),
  };
}

function findProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}

export default async function AdminProductDetail({ params }: { params: { id: string } }) {
  const product = await findProduct(params.id);
  if (!product) notFound();

  return (
    <article>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C8956C]">Product</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h2 className="text-3xl font-bold text-[#3D3330]">Edit {product.name}</h2>
        <StatusBadge status={product.status} />
      </div>
      <p className="mb-8 mt-2 text-[#5C534E]">Update product details, image order and storefront visibility.</p>
      <ProductForm initialData={productFormData(product)} />
      <ContentActions type="products" id={product.id} status={product.status} updatedAt={product.updatedAt.toISOString()} />
    </article>
  );
}
