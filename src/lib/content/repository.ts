import { requireAdmin } from "@/lib/admin/authorization";
import { toPublicProduct } from "@/lib/catalog/public-catalog";
import type { PublicCategorySummary, PublicProduct, PublicSpecificationGroup } from "@/lib/catalog/types";
import { products as staticProducts, type Product as StaticProduct } from "@/data/products";
import { stories as staticStories, type StaticStory } from "@/data/stories";
import { prisma } from "@/lib/db";
import { isPromotionActive } from "./promotions";

export type { PublicProduct } from "@/lib/catalog/types";
export type PublicStory = Omit<StaticStory, "id"> & { id: string | number };
export type PublicPromotion = {
  id: string;
  name: string;
  label?: string;
  bannerImageUrl?: string;
  productId: string;
  productName: string;
  startAt: string;
  endAt: string;
  salePrice?: number;
  discountPercent?: number;
};

type PromotionRow = {
  id?: string;
  name?: string;
  label?: string | null;
  bannerImageUrl?: string | null;
  productId?: string;
  product?: { name: string } | null;
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
  isAutoScheduleEnabled: boolean;
  startAt: Date;
  endAt: Date;
  salePrice: unknown;
  discountPercent: unknown;
};

const publishedProductInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  promotions: true,
  categoryRelation: {
    include: { fields: { where: { status: "ACTIVE" as const }, orderBy: { sortOrder: "asc" as const } } },
  },
  variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" as const } },
  inBoxItems: { orderBy: { sortOrder: "asc" as const } },
  compatibleAccessories: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      accessoryProduct: {
        include: {
          categoryRelation: true,
          images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
          variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" as const } },
        },
      },
    },
  },
};

function legacySpecificationGroups(product: StaticProduct): PublicSpecificationGroup[] {
  const items = [
    ["weight", "Product weight", product.weight],
    ["range", "Range", product.range],
    ["seatWidth", "Seat width", product.seatWidth],
    ["maxSpeed", "Maximum speed", product.maxSpeed],
    ["warranty", "Warranty", product.warranty],
  ] as const;
  const present = items.flatMap(([key, label, value]) => value ? [{ key, label, status: "PROVIDED" as const, displayValue: value }] : []);
  return present.length ? [{ name: "Product details", items: present }] : [];
}

function staticProductToPublicProduct(product: StaticProduct): PublicProduct {
  const category: PublicCategorySummary = product.category === "wheelchair"
    ? { id: "legacy-wheelchairs", name: "Powered Wheelchairs", slug: "powered-wheelchairs", role: "PRODUCT", recommendationProfile: "POWERED_WHEELCHAIR" }
    : { id: "legacy-scooters", name: "Mobility Scooters", slug: "mobility-scooters", role: "PRODUCT", recommendationProfile: "NONE" };
  const variantCount = Math.max(1, product.colors.length, product.colorNames.length);
  return {
    id: product.id,
    name: product.name,
    tagline: product.tagline,
    category,
    images: product.images.map((url) => ({ url, alt: product.name })),
    features: product.features,
    variants: Array.from({ length: variantCount }, (_, index) => ({
      id: `legacy-${product.id}-${index + 1}`,
      sku: `LEGACY-${product.id.toUpperCase()}-${index + 1}`,
      label: product.colorNames[index] || `Option ${index + 1}`,
      colorName: product.colorNames[index],
      colorHex: product.colors[index],
      price: product.price,
      ...(product.originalPrice == null ? {} : { originalPrice: product.originalPrice }),
      ...(product.amazonLink ? { purchaseLink: product.amazonLink } : {}),
      specifications: legacySpecificationGroups(product),
    })),
    specifications: [],
    inBoxItems: [],
    compatibleAccessories: [],
    isFeatured: true,
  };
}

const staticPublicProducts = staticProducts.map(staticProductToPublicProduct);

function toPromotion(row: PromotionRow): PublicPromotion | null {
  if (!row.id || !row.name || !row.productId || !row.product?.name) return null;
  return {
    id: row.id,
    name: row.name,
    label: row.label || undefined,
    bannerImageUrl: row.bannerImageUrl || undefined,
    productId: row.productId,
    productName: row.product.name,
    startAt: new Date(row.startAt).toISOString(),
    endAt: new Date(row.endAt).toISOString(),
    salePrice: row.salePrice == null ? undefined : Number(row.salePrice),
    discountPercent: row.discountPercent == null ? undefined : Number(row.discountPercent),
  };
}

function publicProductsFromRows(rows: Awaited<ReturnType<typeof queryPublishedProducts>>, now = new Date()): PublicProduct[] {
  return rows.flatMap((row) => {
    const product = toPublicProduct(row, now);
    return product ? [product] : [];
  });
}

function queryPublishedProducts(featuredOnly = false) {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", ...(featuredOnly ? { isFeatured: true } : {}) },
    include: publishedProductInclude,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    ...(featuredOnly ? { take: 4 } : {}),
  });
}

export async function listPublishedProducts(): Promise<ReadonlyArray<PublicProduct>> {
  try {
    return publicProductsFromRows(await queryPublishedProducts());
  } catch {
    return staticPublicProducts;
  }
}

export async function listPublishedProductsStrict(): Promise<
  ReadonlyArray<PublicProduct>
> {
  return publicProductsFromRows(await queryPublishedProducts());
}

export async function listFeaturedProducts(): Promise<ReadonlyArray<PublicProduct>> {
  try {
    return publicProductsFromRows(await queryPublishedProducts(true));
  } catch {
    return staticPublicProducts.slice(0, 4);
  }
}

export async function listPublicCategories(): Promise<ReadonlyArray<PublicCategorySummary>> {
  try {
    return await prisma.productCategory.findMany({
      where: { status: "ACTIVE", products: { some: { status: "PUBLISHED" } } },
      select: { id: true, name: true, slug: true, role: true, recommendationProfile: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  } catch {
    const unique = new Map(staticPublicProducts.map((product) => [product.category.id, product.category]));
    return Array.from(unique.values());
  }
}

export async function listPublishedStories(): Promise<ReadonlyArray<PublicStory>> {
  try {
    const rows = await prisma.customerStory.findMany({
      where: { status: "PUBLISHED" },
      include: { images: { orderBy: { sortOrder: "asc" } }, product: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.displayName,
      location: row.location || row.source || "",
      quote: row.quote,
      product: row.product?.name || "GoldSeason mobility",
      tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
      image: row.images?.[0]?.publicUrl,
    }));
  } catch {
    return staticStories;
  }
}

export async function listPublishedPromotions(): Promise<ReadonlyArray<PublicPromotion>> {
  try {
    const rows = await prisma.promotion.findMany({
      where: { status: "PUBLISHED" },
      include: { product: true },
      orderBy: [{ startAt: "asc" }, { updatedAt: "desc" }],
    });
    const now = new Date();
    return rows
      .filter((row) => isPromotionActive(now, { ...row, startAt: new Date(row.startAt), endAt: new Date(row.endAt) }))
      .map(toPromotion)
      .filter((promotion): promotion is PublicPromotion => Boolean(promotion));
  } catch {
    return [];
  }
}

export async function getAdminContentSummary() {
  const [products, stories, promotions] = await Promise.all([
    prisma.product.count(),
    prisma.customerStory.count(),
    prisma.promotion.count(),
  ]);
  return { products, stories, promotions };
}

export async function getDraftPreview(type: "products" | "stories" | "promotions", id: string) {
  await requireAdmin();
  if (type === "products") {
    return prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, promotions: true } });
  }
  if (type === "stories") {
    return prisma.customerStory.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, product: true } });
  }
  return prisma.promotion.findUnique({ where: { id }, include: { product: true } });
}
