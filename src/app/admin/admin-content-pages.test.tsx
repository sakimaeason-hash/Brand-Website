import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { productCategoryFindMany, productFindUnique, productFindMany, storyFindUnique, promotionFindUnique } = vi.hoisted(() => ({
  productCategoryFindMany: vi.fn(),
  productFindUnique: vi.fn(),
  productFindMany: vi.fn(),
  storyFindUnique: vi.fn(),
  promotionFindUnique: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    productCategory: { findMany: productCategoryFindMany },
    product: { findUnique: productFindUnique, findMany: productFindMany },
    customerStory: { findUnique: storyFindUnique },
    promotion: { findUnique: promotionFindUnique },
  },
}));
vi.mock("next/navigation", () => ({ notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }) }));
vi.mock("@/components/admin/ProductForm", () => ({
  ProductForm: (props: unknown) => <pre data-testid="product-form">{JSON.stringify(props)}</pre>,
}));
vi.mock("@/components/admin/StoryForm", () => ({
  StoryForm: ({ initialData, products }: { initialData: unknown; products: unknown }) => <pre data-testid="story-form">{JSON.stringify({ initialData, products })}</pre>,
}));
vi.mock("@/components/admin/PromotionForm", () => ({
  PromotionForm: ({ initialData, products }: { initialData: unknown; products: unknown }) => <pre data-testid="promotion-form">{JSON.stringify({ initialData, products })}</pre>,
}));
vi.mock("@/components/admin/StatusBadge", () => ({ StatusBadge: () => null }));
vi.mock("@/components/admin/ContentActions", () => ({ ContentActions: () => null }));

import ProductDetailPage from "./products/[id]/page";
import NewProductPage from "./products/new/page";
import StoryDetailPage from "./stories/[id]/page";
import PromotionDetailPage from "./promotions/[id]/page";

const updatedAt = new Date("2026-08-01T12:00:00.000Z");

beforeEach(() => {
  vi.clearAllMocks();
  productCategoryFindMany.mockResolvedValue([{ id: "cat-powered", name: "Powered Wheelchairs", slug: "powered-wheelchairs", role: "PRODUCT", recommendationProfile: "POWERED_WHEELCHAIR", templateVersion: 2, fields: [{ key: "maxUserWeight", label: "Maximum user weight", group: "Fit", scope: "VARIANT", dataType: "NUMBER", unitFamily: "WEIGHT", defaultDisplayUnit: "lb", options: [], helpText: null, minValue: { toString: () => "1" }, maxValue: null, requiredForPublish: true, requiredForRecommendation: true, semanticKey: "maxUserWeight", isProtected: true, status: "ACTIVE", sortOrder: 0 }] }]);
  productFindMany.mockImplementation(async (args?: { where?: { categoryRelation?: unknown } }) => args?.where?.categoryRelation
    ? [{ id: "a1", name: "Travel bag", model: "BAG-1", price: { toString: () => "79.00" }, status: "PUBLISHED", images: [{ publicUrl: "/bag.jpg" }] }]
    : [{ id: "p1", name: "Travel Air", model: "PA22" }]);
});
afterEach(() => cleanup());

describe("admin content edit pages", () => {
  it("serializes a product record into editable client data", async () => {
    productFindUnique.mockResolvedValue({
      id: "p1", updatedAt, name: "Travel Air", model: "PA22", category: "wheelchair",
      tagline: null, description: "Compact", price: { toString: () => "899.95" }, originalPrice: null,
      amazonLink: null, weightCapacity: "300 lb", seatWidth: "18 in", range: "15 mi",
      maxSpeed: "4 mph", productWeight: "40 lb", features: ["Foldable"], isFeatured: true,
      categoryId: "cat-powered", categoryTemplateVersion: 2, specifications: {},
      sortOrder: 1, status: "DRAFT", images: [],
      variants: [{ id: "v1", sku: "PA22-A", factoryModel: "PA22", label: null, colorName: "Black", colorHex: "#111111", priceOverride: { toString: () => "849.00" }, originalPriceOverride: null, purchaseLinkOverride: null, specifications: {}, isActive: true, sortOrder: 0 }],
      inBoxItems: [{ id: "box-1", name: "Charger", quantity: 1, note: null, sortOrder: 0 }],
      compatibleAccessories: [{ accessoryProductId: "a1" }],
    });

    render(await ProductDetailPage({ params: { id: "p1" } }));
    const props = JSON.parse(screen.getByTestId("product-form").textContent || "{}");
    const value = props.initialData;

    expect(value.price).toBe(899.95);
    expect(value.updatedAt).toBe(updatedAt.toISOString());
    expect(value.features).toEqual(["Foldable"]);
    expect(value.variants[0].priceOverride).toBe(849);
    expect(value.accessoryProductIds).toEqual(["a1"]);
    expect(props.categories[0].fields[0].minValue).toBe(1);
    expect(props.accessories[0]).toMatchObject({ id: "a1", price: 79, imageUrl: "/bag.jpg" });
  });

  it("loads active categories and published accessories for a new product", async () => {
    render(await NewProductPage());
    const props = JSON.parse(screen.getByTestId("product-form").textContent || "{}");
    expect(props.categories).toHaveLength(1);
    expect(props.accessories).toEqual([expect.objectContaining({ name: "Travel bag", status: "PUBLISHED" })]);
  });

  it("loads product choices and serializes a story for editing", async () => {
    storyFindUnique.mockResolvedValue({
      id: "s1", updatedAt, displayName: "Alex", location: null, quote: "Great chair",
      productId: "p1", source: "Amazon", tags: ["Travel"], isFeatured: false,
      sortOrder: 2, status: "DRAFT", images: [], product: null,
    });

    render(await StoryDetailPage({ params: { id: "s1" } }));
    const value = JSON.parse(screen.getByTestId("story-form").textContent || "{}");

    expect(value.initialData.updatedAt).toBe(updatedAt.toISOString());
    expect(value.initialData.tags).toEqual(["Travel"]);
    expect(value.products).toEqual([{ id: "p1", name: "Travel Air", model: "PA22" }]);
  });

  it("serializes promotion dates and decimal values for editing", async () => {
    promotionFindUnique.mockResolvedValue({
      id: "promo-1", updatedAt, name: "Summer sale", productId: "p1",
      startAt: new Date("2026-07-01T16:00:00.000Z"), endAt: new Date("2026-07-02T16:00:00.000Z"),
      salePrice: { toString: () => "799.00" }, discountPercent: null, label: "Summer",
      bannerImageUrl: null, isAutoScheduleEnabled: true, status: "DRAFT", product: { name: "Travel Air" },
    });

    render(await PromotionDetailPage({ params: { id: "promo-1" } }));
    const value = JSON.parse(screen.getByTestId("promotion-form").textContent || "{}");

    expect(value.initialData.salePrice).toBe(799);
    expect(value.initialData.startAt).toBe("2026-07-01T16:00:00.000Z");
    expect(value.products).toEqual([{ id: "p1", name: "Travel Air", model: "PA22" }]);
  });
});
