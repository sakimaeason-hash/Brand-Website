import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    product: { findMany: vi.fn(), findUnique: vi.fn() },
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
  listPublishedProducts,
  listPublishedPromotions,
  listPublishedStories,
} from "./repository";

describe("content repository", () => {
  it("filters database products to published records", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([{ id: "p1", name: "Published", model: "P1", category: "wheelchair", tagline: null, description: null, price: 10, originalPrice: null, amazonLink: null, weightCapacity: "300 lb", seatWidth: "18 in", range: "15 mi", maxSpeed: "4 mph", productWeight: "40 lb", features: ["folds"], status: "PUBLISHED", isFeatured: false, sortOrder: 0, images: [] }] as never);
    const products = await listPublishedProducts();
    expect(products[0].name).toBe("Published");
    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { status: "PUBLISHED" } }));
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
