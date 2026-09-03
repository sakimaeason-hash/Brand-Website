import { prisma } from "@/lib/db";
import { products as staticProducts, type Product as StaticProduct } from "@/data/products";
import { stories as staticStories, type StaticStory } from "@/data/stories";
import { isPromotionActive, calculateSalePrice } from "./promotions";

export type PublicProduct = StaticProduct;
export type PublicStory = StaticStory;

type ProductRow = {
  id: string; name: string; tagline: string | null; price: unknown; originalPrice: unknown; category: string;
  images?: Array<{ sortOrder: number; publicUrl: string }>;
  features: unknown; productWeight: string | null; range: string | null; seatWidth: string | null; maxSpeed: string | null; amazonLink: string | null;
  promotions?: PromotionRow[];
};
type PromotionRow = { status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED"; isAutoScheduleEnabled: boolean; startAt: Date; endAt: Date; salePrice: unknown; discountPercent: unknown };

function toProduct(row: ProductRow): PublicProduct {
  const images = row.images?.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((image) => image.publicUrl) ?? [];
  return { id: row.id, name: row.name, tagline: row.tagline || "", price: Number(row.price), originalPrice: row.originalPrice == null ? undefined : Number(row.originalPrice), category: row.category === "scooter" ? "scooter" : "wheelchair", images: images.length ? images : ["/products/Travel Air W 03C.png"], colors: ["#2D2D2D"], colorNames: ["Standard"], features: Array.isArray(row.features) ? row.features : [], weight: row.productWeight || undefined, range: row.range || undefined, seatWidth: row.seatWidth || undefined, maxSpeed: row.maxSpeed || undefined, amazonLink: row.amazonLink || undefined, rating: 0, reviews: 0 };
}

export async function listPublishedProducts(): Promise<ReadonlyArray<PublicProduct>> {
  try { const rows = await prisma.product.findMany({ where: { status: "PUBLISHED" }, include: { images: { orderBy: { sortOrder: "asc" } }, promotions: true }, orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] }); if (!rows.length) return staticProducts; const now = new Date(); return rows.map((row) => { const product = toProduct(row); const active = row.promotions?.find((promotion) => isPromotionActive(now, { ...promotion, startAt: new Date(promotion.startAt), endAt: new Date(promotion.endAt) })); return active ? { ...product, price: calculateSalePrice(product.price, { salePrice: active.salePrice == null ? null : Number(active.salePrice), discountPercent: active.discountPercent == null ? null : Number(active.discountPercent) }) } : product; }); } catch { return staticProducts; }
}

export async function listPublishedStories(): Promise<ReadonlyArray<PublicStory>> {
  try { const rows = await prisma.customerStory.findMany({ where: { status: "PUBLISHED" }, include: { images: { orderBy: { sortOrder: "asc" } }, product: true }, orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] }); if (!rows.length) return staticStories; return rows.map((row, index) => ({ id: index + 1, name: row.displayName, location: row.location || row.source || "", quote: row.quote, product: row.product?.name || "GoldSeason mobility", tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [], image: row.images?.[0]?.publicUrl })); } catch { return staticStories; }
}

export async function getAdminContentSummary() { const [products, stories, promotions] = await Promise.all([prisma.product.count(), prisma.customerStory.count(), prisma.promotion.count()]); return { products, stories, promotions }; }

export async function getDraftPreview(type: "products" | "stories" | "promotions", id: string) { if (type === "products") return prisma.product.findUnique({ where: { id }, include: { images: true, promotions: true } }); if (type === "stories") return prisma.customerStory.findUnique({ where: { id }, include: { images: true, product: true } }); return prisma.promotion.findUnique({ where: { id }, include: { product: true } }); }
