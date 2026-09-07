import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/authorization";
import { products as staticProducts, type Product as StaticProduct } from "@/data/products";
import { stories as staticStories, type StaticStory } from "@/data/stories";
import { isPromotionActive, calculateSalePrice } from "./promotions";

export type PublicProduct = StaticProduct;
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

type ProductRow = {
  id: string;
  name: string;
  tagline: string | null;
  price: unknown;
  originalPrice: unknown;
  category: string;
  images?: Array<{ sortOrder: number; publicUrl: string }>;
  features: unknown;
  productWeight: string | null;
  range: string | null;
  seatWidth: string | null;
  maxSpeed: string | null;
  amazonLink: string | null;
  promotions?: PromotionRow[];
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

function toProduct(row: ProductRow): PublicProduct {
  const images = row.images?.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((image) => image.publicUrl) ?? [];
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || "",
    price: Number(row.price),
    originalPrice: row.originalPrice == null ? undefined : Number(row.originalPrice),
    category: row.category === "scooter" ? "scooter" : "wheelchair",
    images: images.length ? images : ["/products/Travel Air W 03C.png"],
    colors: ["#2D2D2D"],
    colorNames: ["Standard"],
    features: Array.isArray(row.features) ? row.features.filter((value): value is string => typeof value === "string") : [],
    weight: row.productWeight || undefined,
    range: row.range || undefined,
    seatWidth: row.seatWidth || undefined,
    maxSpeed: row.maxSpeed || undefined,
    amazonLink: row.amazonLink || undefined,
    rating: 0,
    reviews: 0,
  };
}

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

function applyActivePromotion(product: PublicProduct, promotions: PromotionRow[] | undefined, now: Date) {
  const active = promotions?.find((promotion) =>
    isPromotionActive(now, { ...promotion, startAt: new Date(promotion.startAt), endAt: new Date(promotion.endAt) }),
  );
  return active
    ? {
        ...product,
        price: calculateSalePrice(product.price, {
          salePrice: active.salePrice == null ? null : Number(active.salePrice),
          discountPercent: active.discountPercent == null ? null : Number(active.discountPercent),
        }),
      }
    : product;
}

export async function listPublishedProducts(): Promise<ReadonlyArray<PublicProduct>> {
  try {
    const rows = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: { images: { orderBy: { sortOrder: "asc" } }, promotions: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });
    const now = new Date();
    return rows.map((row) => applyActivePromotion(toProduct(row), row.promotions, now));
  } catch {
    return staticProducts;
  }
}

export async function listFeaturedProducts(): Promise<ReadonlyArray<PublicProduct>> {
  try {
    const rows = await prisma.product.findMany({
      where: { status: "PUBLISHED", isFeatured: true },
      include: { images: { orderBy: { sortOrder: "asc" } }, promotions: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      take: 4,
    });
    const now = new Date();
    return rows.map((row) => applyActivePromotion(toProduct(row), row.promotions, now));
  } catch {
    return staticProducts.slice(0, 4);
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
