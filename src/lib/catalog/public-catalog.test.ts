import { describe, expect, it } from "vitest";
import { toPublicProduct, toPublicVariant } from "./public-catalog";

const now = new Date("2026-09-09T12:00:00.000Z");

function productRow() {
  return {
    id: "p1",
    name: "Travel Air W 26",
    model: "PA26",
    tagline: "Travel ready",
    description: "Compact powered wheelchair",
    price: 999,
    originalPrice: null,
    amazonLink: "https://www.amazon.com/dp/default",
    features: ["Foldable"],
    status: "PUBLISHED",
    isFeatured: true,
    sortOrder: 0,
    specifications: { finish: { status: "PROVIDED", value: "Matte" } },
    categoryRelation: {
      id: "cat-powered",
      name: "Powered Wheelchairs",
      slug: "powered-wheelchairs",
      role: "PRODUCT",
      recommendationProfile: "POWERED_WHEELCHAIR",
      status: "ACTIVE",
      fields: [
        { key: "finish", label: "Finish", group: "Appearance", scope: "PRODUCT", dataType: "SELECT", unitFamily: "NONE", defaultDisplayUnit: null, semanticKey: null, status: "ACTIVE", sortOrder: 0 },
        { key: "maxUserWeight", label: "Maximum user weight", group: "Fit", scope: "VARIANT", dataType: "NUMBER", unitFamily: "WEIGHT", defaultDisplayUnit: "lb", semanticKey: "maxUserWeight", status: "ACTIVE", sortOrder: 1 },
        { key: "tireClass", label: "Tire type", group: "Wheels", scope: "VARIANT", dataType: "SELECT", unitFamily: "NONE", defaultDisplayUnit: null, semanticKey: "tireClass", status: "ACTIVE", sortOrder: 2 },
        { key: "batteryRemovable", label: "Battery removable", group: "Battery", scope: "VARIANT", dataType: "BOOLEAN", unitFamily: "NONE", defaultDisplayUnit: null, semanticKey: "batteryRemovable", status: "ACTIVE", sortOrder: 3 },
      ],
    },
    images: [{ sortOrder: 0, publicUrl: "/chair.jpg", altText: "Red wheelchair" }],
    variants: [
      { id: "v1", sku: "PA26-RED", factoryModel: "PA26", label: "Red", colorName: "Red", colorHex: "#AA0000", priceOverride: null, originalPriceOverride: null, purchaseLinkOverride: null, specifications: { maxUserWeight: { status: "PROVIDED", value: 300, inputValue: 300, inputUnit: "lb", normalizedValue: 136.077711, normalizedUnit: "kg" }, tireClass: { status: "PROVIDED", value: "pneumatic" }, batteryRemovable: { status: "PROVIDED", value: true } }, isActive: true, sortOrder: 0 },
      { id: "v2", sku: "PA26-BLUE", factoryModel: "PA26", label: "Blue", colorName: "Blue", colorHex: "#0000AA", priceOverride: 699, originalPriceOverride: 899, purchaseLinkOverride: "https://www.amazon.com/dp/blue", specifications: { maxUserWeight: { status: "PROVIDED", value: 136.077711, unit: "kg", normalizedValue: 136.077711, normalizedUnit: "kg" } }, isActive: true, sortOrder: 1 },
      { id: "v3", sku: "PA26-OLD", factoryModel: null, label: null, colorName: null, colorHex: null, priceOverride: 1, originalPriceOverride: null, purchaseLinkOverride: null, specifications: {}, isActive: false, sortOrder: 2 },
    ],
    inBoxItems: [{ name: "Charger", quantity: 1, note: null, sortOrder: 0 }],
    compatibleAccessories: [
      { sortOrder: 0, accessoryProduct: { id: "a1", name: "Travel bag", model: "BAG-1", price: 79, status: "PUBLISHED", categoryRelation: { role: "ACCESSORY", status: "ACTIVE" }, images: [{ sortOrder: 0, publicUrl: "/bag.jpg", altText: null }] } },
      { sortOrder: 1, accessoryProduct: { id: "a2", name: "Old bag", model: "OLD", price: 10, status: "UNPUBLISHED", categoryRelation: { role: "ACCESSORY", status: "ACTIVE" }, images: [] } },
    ],
    promotions: [{ status: "PUBLISHED", isAutoScheduleEnabled: true, startAt: new Date("2026-09-01"), endAt: new Date("2026-09-30"), salePrice: 799, discountPercent: null }],
  } as const;
}

describe("public catalog mapping", () => {
  it("applies product promotions before SKU overrides and filters inactive relations", () => {
    const product = toPublicProduct(productRow(), now);
    expect(product).not.toBeNull();
    expect(product?.variants).toHaveLength(2);
    expect(product?.variants[0]).toMatchObject({ sku: "PA26-RED", price: 799, originalPrice: 999, purchaseLink: "https://www.amazon.com/dp/default" });
    expect(product?.variants[1]).toMatchObject({ sku: "PA26-BLUE", price: 699, originalPrice: 899, purchaseLink: "https://www.amazon.com/dp/blue" });
    expect(product?.compatibleAccessories.map((item) => item.name)).toEqual(["Travel bag"]);
  });

  it("formats US units while preserving canonical values for filtering", () => {
    const product = toPublicProduct(productRow(), now);
    const redCapacity = product?.variants[0].specifications[0].items[0];
    const blueCapacity = product?.variants[1].specifications[0].items[0];
    expect(redCapacity).toMatchObject({ displayValue: "300 lb", normalizedValue: 136.077711, normalizedUnit: "kg", semanticKey: "maxUserWeight" });
    expect(blueCapacity?.displayValue).toBe("300 lb");
  });

  it("exposes recommendation profiles and normalized select and boolean values", () => {
    const product = toPublicProduct(productRow(), now);
    const items = product?.variants[0].specifications.flatMap((group) => group.items);

    expect(product?.category.recommendationProfile).toBe("POWERED_WHEELCHAIR");
    expect(items?.find((item) => item.semanticKey === "tireClass")).toMatchObject({
      normalizedValue: "pneumatic",
    });
    expect(items?.find((item) => item.semanticKey === "batteryRemovable")).toMatchObject({
      normalizedValue: true,
    });
  });

  it("does not coerce malformed normalized numeric data", () => {
    const row = productRow();
    const product = toPublicProduct({
      ...row,
      categoryRelation: {
        ...row.categoryRelation,
        fields: [
          ...row.categoryRelation.fields,
          { key: "overallDimensions", label: "Overall dimensions", group: "Dimensions", scope: "VARIANT", dataType: "DIMENSIONS", unitFamily: "LENGTH", defaultDisplayUnit: "mm", semanticKey: "overallDimensions", status: "ACTIVE", sortOrder: 4 },
        ],
      },
      variants: [
        {
          ...row.variants[0],
          specifications: {
            ...row.variants[0].specifications,
            maxUserWeight: {
              ...row.variants[0].specifications.maxUserWeight,
              normalizedValue: "136.077711",
            },
            overallDimensions: {
              status: "PROVIDED",
              value: { length: 1000, width: 620, height: 930 },
              normalizedValue: { length: "1000", width: 620, height: 930 },
              normalizedUnit: "mm",
            },
          },
        },
      ],
    }, now);

    expect(
      product?.variants[0].specifications[0].items[0].normalizedValue,
    ).toBeUndefined();
    expect(
      product?.variants[0].specifications
        .flatMap((group) => group.items)
        .find((item) => item.semanticKey === "overallDimensions")
        ?.normalizedValue,
    ).toBeUndefined();
  });

  it("inherits the product original price when only current price is overridden", () => {
    const row = productRow();
    const variant = toPublicVariant({ ...row.variants[1], priceOverride: 749, originalPriceOverride: null }, row, now);
    expect(variant).toMatchObject({ price: 749, originalPrice: 999 });
  });

  it("fails closed for unpublished products or archived categories", () => {
    expect(toPublicProduct({ ...productRow(), status: "DRAFT" }, now)).toBeNull();
    expect(toPublicProduct({ ...productRow(), categoryRelation: { ...productRow().categoryRelation, status: "ARCHIVED" } }, now)).toBeNull();
  });
});
