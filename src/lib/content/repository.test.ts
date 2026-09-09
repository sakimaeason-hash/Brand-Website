import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    product: { findMany: vi.fn(), findUnique: vi.fn() },
    productCategory: { findMany: vi.fn() },
    customerStory: { findMany: vi.fn(), findUnique: vi.fn() },
    promotion: { findMany: vi.fn(), findUnique: vi.fn() },
  },
}));
vi.mock("@/lib/admin/authorization", () => ({ requireAdmin: vi.fn() }));
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/authorization";
import {
  getDraftPreview,
  listFeaturedProducts,
  listPublicCategories,
  listPublishedProducts,
  listPublishedPromotions,
  listPublishedStories,
} from "./repository";

describe("content repository", () => {
  it("filters database products to published records", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([{
      id: "p1", name: "Published", model: "P1", category: "wheelchair", tagline: null, description: null,
      price: 10, originalPrice: null, amazonLink: "https://www.amazon.com/dp/p1", features: ["folds"], status: "PUBLISHED", isFeatured: false, sortOrder: 0,
      specifications: {}, images: [], promotions: [], inBoxItems: [], compatibleAccessories: [],
      categoryRelation: { id: "c1", name: "Powered Wheelchairs", slug: "powered-wheelchairs", role: "PRODUCT", status: "ACTIVE", fields: [] },
      variants: [{ id: "v1", sku: "P1-A", factoryModel: "P1", label: null, colorName: null, colorHex: null, priceOverride: null, originalPriceOverride: null, purchaseLinkOverride: null, specifications: {}, isActive: true, sortOrder: 0 }],
    }] as never);
    const products = await listPublishedProducts();
    expect(products[0].name).toBe("Published");
    expect(products[0].variants[0].sku).toBe("P1-A");
    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { status: "PUBLISHED" } }));
  });

  it("lists active public categories that contain published products", async () => {
    vi.mocked(prisma.productCategory.findMany).mockResolvedValue([{ id: "c1", name: "Powered Wheelchairs", slug: "powered-wheelchairs", role: "PRODUCT" }] as never);
    await expect(listPublicCategories()).resolves.toEqual([{ id: "c1", name: "Powered Wheelchairs", slug: "powered-wheelchairs", role: "PRODUCT" }]);
    expect(prisma.productCategory.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: "ACTIVE", products: { some: { status: "PUBLISHED" } } },
    }));
  });

  it("falls back to static stories when the database fails", async () => {
    vi.mocked(prisma.customerStory.findMany).mockRejectedValue(new Error("offline"));
    expect((await listPublishedStories()).length).toBeGreaterThan(0);
  });

  it("keeps the storefront empty when no content is published", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.customerStory.findMany).mockResolvedValue([] as never);

    await expect(listPublishedProducts()).resolves.toEqual([]);
    await expect(listFeaturedProducts()).resolves.toEqual([]);
    await expect(listPublishedStories()).resolves.toEqual([]);
  });

  it("limits featured products to published records marked as featured", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([] as never);

    await listFeaturedProducts();

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PUBLISHED", isFeatured: true },
      }),
    );
  });

  it("returns only currently published promotions for storefront banners", async () => {
    vi.mocked(prisma.promotion.findMany).mockResolvedValue([] as never);

    await listPublishedPromotions();

    expect(prisma.promotion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "PUBLISHED" } }),
    );
  });

  it("requires an admin session before loading a draft preview", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("forbidden"));

    await expect(getDraftPreview("products", "p1")).rejects.toThrow("forbidden");
    expect(prisma.product.findUnique).not.toHaveBeenCalled();
  });
});
