import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toPublicProduct, type CatalogProductRow } from "@/lib/catalog/public-catalog";

vi.mock("@/lib/db", () => ({ prisma: { product: { findMany: vi.fn() } } }));
vi.mock("@/lib/admin/authorization", () => ({ requireAdmin: vi.fn() }));
import { prisma } from "@/lib/db";
import { listNewArrivalsContent } from "./repository";

const now = new Date("2026-09-28T12:00:00Z");
const promotion = {
  id: "offer-1", productId: "p1", name: "September offer", label: "Seasonal offer", bannerImageUrl: null,
  status: "PUBLISHED" as const, isAutoScheduleEnabled: true,
  startAt: new Date("2026-09-27T12:00:00Z"), endAt: new Date("2026-09-29T12:00:00Z"),
  salePrice: null, discountPercent: 10,
};
const product = {
  id: "p1", name: "Published model", model: "MODEL-1", tagline: "Verified catalog copy", description: null,
  price: 1000, originalPrice: null, amazonLink: "https://www.amazon.com/dp/B000000001", features: [],
  status: "PUBLISHED", isFeatured: false, isNewArrival: true, sortOrder: 0, specifications: {},
  categoryRelation: { id: "c1", name: "Wheelchairs", slug: "wheelchairs", role: "PRODUCT" as const, recommendationProfile: "POWERED_WHEELCHAIR" as const, status: "ACTIVE", fields: [] },
  images: [{ publicUrl: "/products/chair.jpg", altText: "Product side view", sortOrder: 0 }],
  variants: [{ id: "v1", sku: "MODEL-1-GREY", factoryModel: "MODEL-1", label: "Grey", colorName: "Grey", colorHex: "#888888", priceOverride: null, originalPriceOverride: null, purchaseLinkOverride: null, specifications: {}, isActive: true, sortOrder: 0 }],
  inBoxItems: [], compatibleAccessories: [], promotions: [promotion],
} satisfies CatalogProductRow & { isNewArrival: boolean };

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.mocked(prisma.product.findMany).mockResolvedValue([product] as never);
});
afterEach(() => vi.useRealTimers());

describe("strict new arrivals content", () => {
  it("uses published database products marked as new, independently of homepage featured", async () => {
    const content = await listNewArrivalsContent();
    expect(content.products).toEqual([toPublicProduct(product, now)]);
    expect(content.offers[0].promotion).toMatchObject({ id: "offer-1", productId: "p1", name: "September offer" });
    expect(content.offers[0].product.variants[0].price).toBe(900);
    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { status: "PUBLISHED" } }));
  });

  it("removes only new-arrival placement when an administrator clears the flag", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([{ ...product, isNewArrival: false, isFeatured: true }] as never);
    const content = await listNewArrivalsContent();
    expect(content.products).toEqual([]);
    expect(content.offers).toHaveLength(1);
  });

  it.each([
    { status: "DRAFT" }, { status: "UNPUBLISHED" }, { categoryRelation: null },
    { categoryRelation: { ...product.categoryRelation, status: "ARCHIVED" } },
    { variants: [] }, { variants: [{ ...product.variants[0], isActive: false }] },
  ])("excludes non-public products and their promotions: %j", async (change) => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([{ ...product, ...change }] as never);
    await expect(listNewArrivalsContent()).resolves.toEqual({ products: [], offers: [] });
  });

  it.each([
    { status: "DRAFT" }, { status: "UNPUBLISHED" }, { isAutoScheduleEnabled: false },
    { startAt: new Date("2026-09-29T00:00:00Z") }, { endAt: now },
  ])("hides inactive promotions: %j", async (change) => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([{ ...product, promotions: [{ ...promotion, ...change }] }] as never);
    const content = await listNewArrivalsContent();
    expect(content.products).toHaveLength(1);
    expect(content.offers).toEqual([]);
  });

  it("uses each offer's own pricing and keeps explicit SKU prices", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([{
      ...product,
      variants: [...product.variants, { ...product.variants[0], id: "v2", sku: "MODEL-1-BLACK", priceOverride: 1200 }],
      promotions: [promotion, { ...promotion, id: "offer-2", discountPercent: 20 }],
    }] as never);
    const content = await listNewArrivalsContent();
    expect(content.offers.map((offer) => offer.product.variants.map((variant) => variant.price))).toEqual([[900, 1200], [800, 1200]]);
  });

  it("stays empty after products or promotions are removed instead of showing static examples", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    await expect(listNewArrivalsContent()).resolves.toEqual({ products: [], offers: [] });
  });

  it("surfaces database errors rather than reintroducing removed static products", async () => {
    const failure = new Error("database unavailable");
    vi.mocked(prisma.product.findMany).mockRejectedValue(failure);
    await expect(listNewArrivalsContent()).rejects.toBe(failure);
  });
});
