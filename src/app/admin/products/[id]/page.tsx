import { ContentActions } from "@/components/admin/ContentActions";
import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { loadProductEditorOptions } from "@/lib/catalog/admin-product-editor";
import type { StoredSpecification } from "@/lib/catalog/types";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function specificationMap(value: unknown): Record<string, StoredSpecification> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return JSON.parse(JSON.stringify(value)) as Record<string, StoredSpecification>;
}

function productFormData(product: NonNullable<Awaited<ReturnType<typeof findProduct>>>): ProductFormData {
  return {
    id: product.id,
    updatedAt: product.updatedAt.toISOString(),
    name: product.name,
    model: product.model,
    category: product.category,
    categoryId: product.categoryId,
    categoryTemplateVersion: product.categoryTemplateVersion,
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
    specifications: specificationMap(product.specifications),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      factoryModel: variant.factoryModel,
      label: variant.label,
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      priceOverride: variant.priceOverride == null ? null : Number(variant.priceOverride),
      originalPriceOverride: variant.originalPriceOverride == null ? null : Number(variant.originalPriceOverride),
      purchaseLinkOverride: variant.purchaseLinkOverride,
      specifications: specificationMap(variant.specifications),
      isActive: variant.isActive,
      sortOrder: variant.sortOrder,
    })),
    inBoxItems: product.inBoxItems.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, note: item.note, sortOrder: item.sortOrder })),
    accessoryProductIds: product.compatibleAccessories.map((relation) => relation.accessoryProductId),
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
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      inBoxItems: { orderBy: { sortOrder: "asc" } },
      compatibleAccessories: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export default async function AdminProductDetail({ params }: { params: { id: string } }) {
  const [product, options] = await Promise.all([findProduct(params.id), loadProductEditorOptions()]);
  if (!product) notFound();

  return <article>
    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C8956C]">Product</p>
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <h2 className="text-3xl font-bold text-[#3D3330]">Edit {product.name}</h2>
      <StatusBadge status={product.status} />
    </div>
    <p className="mb-8 mt-2 text-[#5C534E]">Update product details, SKUs, specifications, accessories, image order, and storefront visibility.</p>
    <ProductForm initialData={productFormData(product)} categories={options.categories} accessories={options.accessories} />
    <ContentActions type="products" id={product.id} status={product.status} updatedAt={product.updatedAt.toISOString()} />
  </article>;
}
