import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/db", () => ({ prisma: { product: { findMany: vi.fn() }, customerStory: { findMany: vi.fn() } } }));
import { prisma } from "@/lib/db";
import { listPublishedProducts, listPublishedStories } from "./repository";

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
});
