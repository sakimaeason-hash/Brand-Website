import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { validateForPublish } from "./publish-validation";
import type { SpecificationFieldDefinition } from "./types";

const fields: SpecificationFieldDefinition[] = [
  {
    key: "maxUserWeight", label: "Maximum user weight", group: "Fit", scope: "VARIANT", dataType: "NUMBER", unitFamily: "WEIGHT", defaultDisplayUnit: "kg", options: [], helpText: null, minValue: 1, maxValue: null, requiredForPublish: true, requiredForRecommendation: true, semanticKey: "maxUserWeight", isProtected: true, status: "ACTIVE", sortOrder: 0,
  },
  {
    key: "effectiveSeatWidth", label: "Effective seat width", group: "Fit", scope: "VARIANT", dataType: "NUMBER", unitFamily: "LENGTH", defaultDisplayUnit: "mm", options: [], helpText: null, minValue: 1, maxValue: null, requiredForPublish: true, requiredForRecommendation: true, semanticKey: "effectiveSeatWidth", isProtected: true, status: "ACTIVE", sortOrder: 1,
  },
  {
    key: "finish", label: "Finish", group: "Overview", scope: "PRODUCT", dataType: "TEXT", unitFamily: "NONE", defaultDisplayUnit: null, options: [], helpText: null, minValue: null, maxValue: null, requiredForPublish: false, requiredForRecommendation: false, semanticKey: null, isProtected: false, status: "ACTIVE", sortOrder: 2,
  },
];

const template = {
  id: "cat-1", name: "Powered Wheelchairs", slug: "powered-wheelchairs", role: "PRODUCT" as const,
  recommendationProfile: "POWERED_WHEELCHAIR" as const, status: "ACTIVE" as const, templateVersion: 2,
  fields,
};

const provided = (value: number | string, unit?: string) => ({ status: "PROVIDED" as const, value, ...(unit ? { unit } : {}) });

function product(overrides: Record<string, unknown> = {}) {
  return {
    id: "p1", name: "Travel Air", model: "PA22", price: 899, originalPrice: null, amazonLink: "https://www.amazon.com/dp/test",
    categoryId: "cat-1", categoryTemplateVersion: 2, specifications: {}, images: [{ id: "img1" }],
    variants: [{ id: "v1", sku: "PA22-A", isActive: true, priceOverride: null, originalPriceOverride: null, purchaseLinkOverride: null, specifications: { maxUserWeight: provided(136, "kg"), effectiveSeatWidth: provided(460, "mm") } }],
    inBoxItems: [], compatibleAccessories: [], ...overrides,
  };
}

describe("validateForPublish", () => {
  it("allows an incomplete draft to remain a draft", () => {
    const errors = validateForPublish({ ...product(), images: [], variants: [] }, template, { requirePublish: false });
    expect(errors).toEqual([]);
  });

  it("requires an active SKU and inherited purchase link for publishing", () => {
    const errors = validateForPublish({ ...product(), amazonLink: null, variants: [{ ...product().variants[0], isActive: true, specifications: product().variants[0].specifications }] }, template);
    expect(errors).toContainEqual(expect.objectContaining({ tab: "variants", fieldKey: "purchaseLink" }));
  });

  it("reports missing wheelchair capacity and effective seat width with SKU location", () => {
    const errors = validateForPublish({ ...product(), variants: [{ ...product().variants[0], specifications: {} }] }, template);
    expect(errors).toContainEqual(expect.objectContaining({ tab: "variants", variantId: "v1", fieldKey: "maxUserWeight" }));
    expect(errors).toContainEqual(expect.objectContaining({ tab: "variants", variantId: "v1", fieldKey: "effectiveSeatWidth" }));
  });

  it("separates product and variant specification scopes", () => {
    const errors = validateForPublish({ ...product(), specifications: { finish: provided("Black") }, variants: [{ ...product().variants[0], specifications: { maxUserWeight: provided(136, "kg"), effectiveSeatWidth: provided(460, "mm"), finish: provided("wrong") } }] }, template);
    expect(errors).toContainEqual(expect.objectContaining({ tab: "variants", variantId: "v1", fieldKey: "finish" }));
  });

  it("rejects invalid accessory roles, self links, and duplicate links", () => {
    const errors = validateForPublish({ ...product(), compatibleAccessories: [{ accessoryProductId: "p1" }, { accessoryProductId: "a1" }, { accessoryProductId: "a1" }] }, template, { accessoryProducts: [{ id: "a1", role: "PRODUCT", status: "PUBLISHED" }] });
    expect(errors.filter((error) => error.tab === "accessories").length).toBeGreaterThanOrEqual(2);
  });

  it("rejects an accessory relation when the referenced product is missing", () => {
    const errors = validateForPublish({ ...product(), compatibleAccessories: [{ accessoryProductId: "missing" }] }, template, { accessoryProducts: [] });
    expect(errors).toContainEqual(expect.objectContaining({ tab: "accessories", fieldKey: "accessoryProductIds" }));
  });

  it("accepts Prisma Decimal prices", () => {
    const errors = validateForPublish(product({ price: new Prisma.Decimal("899.00") }), template);
    expect(errors).not.toContainEqual(expect.objectContaining({ tab: "overview", fieldKey: "price" }));
  });

  it("does not accept conflicting specifications as recommendation data", () => {
    const conflicting = {
      status: "CONFLICTING" as const,
      value: 136,
      inputValue: 136,
      inputUnit: "kg",
      normalizedValue: 136,
      normalizedUnit: "kg",
      sourceNote: "Manufacturer sources disagree.",
    };
    const errors = validateForPublish({
      ...product(),
      variants: [{
        ...product().variants[0],
        specifications: { ...product().variants[0].specifications, maxUserWeight: conflicting },
      }],
    }, template);

    expect(errors).toContainEqual(expect.objectContaining({
      tab: "variants",
      variantId: "v1",
      fieldKey: "maxUserWeight",
    }));
  });

  it("does not require inactive SKUs to have publish specifications", () => {
    const errors = validateForPublish({
      ...product(),
      variants: [
        product().variants[0],
        {
          id: "v-inactive",
          sku: "INACTIVE",
          isActive: false,
          purchaseLinkOverride: null,
          specifications: {},
        },
      ],
    }, template);

    expect(errors.some((error) => error.variantId === "v-inactive")).toBe(false);
  });
});
