import { describe, expect, it } from "vitest";
import type {
  PublicProduct,
  PublicSpecificationGroup,
  PublicSpecificationItem,
} from "@/lib/catalog/types";
import {
  listFinderCandidates,
  mapPublicVariantToCandidate,
  wheelchairCandidatesFromProducts,
} from "./catalog";

type NormalizedValue = PublicSpecificationItem["normalizedValue"];

const units: Record<string, string | undefined> = {
  maxUserWeight: "kg",
  effectiveSeatWidth: "mm",
  seatDepth: "mm",
  seatHeight: "mm",
  seatToFootrest: "mm",
  overallDimensions: "mm",
  foldedDimensions: "mm",
  netWeightWithoutBattery: "kg",
  productWeight: "kg",
  range: "km",
  turningRadius: "mm",
  obstacleHeight: "mm",
  frontWheelDiameter: "mm",
  rearWheelDiameter: "mm",
  batteryWeight: "kg",
  batteryVoltage: "V",
  batteryCapacityAh: "Ah",
};

function item(
  semanticKey: string,
  normalizedValue: NormalizedValue,
  overrides: Partial<PublicSpecificationItem> = {},
): PublicSpecificationItem {
  return {
    key: `field-${semanticKey}`,
    label: semanticKey,
    semanticKey,
    status: "PROVIDED",
    displayValue: `display-only-${semanticKey}`,
    ...(normalizedValue === undefined ? {} : { normalizedValue }),
    ...(units[semanticKey] ? { normalizedUnit: units[semanticKey] } : {}),
    ...overrides,
  };
}

const commonItems = (): PublicSpecificationItem[] => [
  item("maxUserWeight", 136),
  item("effectiveSeatWidth", 460),
  item("seatDepth", 430),
  item("seatHeight", 480),
  item("seatToFootrest", 390),
  item("overallDimensions", { length: 1050, width: 620, height: 930 }),
  item("foldedDimensions", { length: 800, width: 380, height: 720 }),
  item("frontWheelDiameter", 190),
  item("rearWheelDiameter", 320),
  item("tireClass", "pneumatic"),
];

const poweredItems = (): PublicSpecificationItem[] => [
  ...commonItems(),
  item("netWeightWithoutBattery", 23),
  item("range", 32),
  item("turningRadius", 850),
  item("obstacleHeight", 45),
  item("batteryWeight", 3),
  item("batteryRemovable", true),
  item("batteryVoltage", 24),
  item("batteryCapacityAh", 12),
];

const manualItems = (): PublicSpecificationItem[] => [
  ...commonItems(),
  item("productWeight", 14),
  item("propulsionType", "self-propelled"),
];

function groups(items: readonly PublicSpecificationItem[]): PublicSpecificationGroup[] {
  return [{ name: "Recommendation", items }];
}

function product(
  recommendationProfile:
    | "NONE"
    | "POWERED_WHEELCHAIR"
    | "MANUAL_WHEELCHAIR",
  variantItems: readonly PublicSpecificationItem[],
  overrides: Partial<PublicProduct> = {},
): PublicProduct {
  return {
    id: `product-${recommendationProfile.toLowerCase()}`,
    name: `${recommendationProfile} chair`,
    tagline: "Catalog product",
    category: {
      id: `category-${recommendationProfile.toLowerCase()}`,
      name: recommendationProfile,
      slug: recommendationProfile.toLowerCase(),
      role: "PRODUCT",
      recommendationProfile,
    },
    images: [{ url: "/chair.jpg", alt: "Wheelchair" }],
    features: [],
    variants: [
      {
        id: `variant-${recommendationProfile.toLowerCase()}`,
        sku: `SKU-${recommendationProfile}`,
        price: 999,
        purchaseLink: "https://www.amazon.com/dp/example",
        specifications: groups(variantItems),
      },
    ],
    specifications: [],
    inBoxItems: [],
    compatibleAccessories: [],
    isFeatured: false,
    ...overrides,
  };
}

describe("wheelchair catalog candidates", () => {
  it("loads candidates through an injectable strict product source", async () => {
    const powered = product("POWERED_WHEELCHAIR", poweredItems());

    const result = await listFinderCandidates(async () => [powered]);

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].mobilityType).toBe("powered");
  });

  it("propagates strict product query failures to the Server Page", async () => {
    const failure = new Error("database offline");

    await expect(
      listFinderCandidates(async () => Promise.reject(failure)),
    ).rejects.toBe(failure);
  });

  it("maps a powered database DTO using semantic normalized values only", () => {
    const source = product("POWERED_WHEELCHAIR", poweredItems());

    const result = mapPublicVariantToCandidate(source, source.variants[0]);

    expect(result.errors).toEqual([]);
    expect(result.candidate).toMatchObject({
      mobilityType: "powered",
      productId: source.id,
      productName: source.name,
      variantId: source.variants[0].id,
      sku: source.variants[0].sku,
      maxUserWeightKg: 136,
      effectiveSeatWidthMm: 460,
      rangeKm: 32,
      netWeightWithoutBatteryKg: 23,
      tireClass: "pneumatic",
      productUrl: "https://www.amazon.com/dp/example",
      imageUrl: "/chair.jpg",
      battery: {
        weightKg: 3,
        removable: true,
        voltageV: 24,
        capacityAh: 12,
      },
    });
  });

  it("maps manual propulsion without inventing powered fields", () => {
    const source = product("MANUAL_WHEELCHAIR", manualItems());

    const result = mapPublicVariantToCandidate(source, source.variants[0]);

    expect(result.errors).toEqual([]);
    expect(result.candidate).toMatchObject({
      mobilityType: "manual",
      productWeightKg: 14,
      propulsionType: "self-propel",
      frontWheelMm: 190,
      rearWheelMm: 320,
      tireClass: "pneumatic",
    });
    expect(result.candidate).not.toHaveProperty("rangeKm");
    expect(result.candidate).not.toHaveProperty("battery");
  });

  it("maps attendant-propelled manual chairs to the transport class", () => {
    const source = product(
      "MANUAL_WHEELCHAIR",
      manualItems().map((specification) =>
        specification.semanticKey === "propulsionType"
          ? item("propulsionType", "attendant-propelled")
          : specification,
      ),
    );

    expect(
      mapPublicVariantToCandidate(source, source.variants[0]).candidate,
    ).toMatchObject({ propulsionType: "transport" });
  });

  it("filters scooters, shower chairs, and accessories with recommendation profile NONE", () => {
    const powered = product("POWERED_WHEELCHAIR", poweredItems());
    const scooter = product("NONE", poweredItems(), {
      id: "scooter",
      category: {
        id: "scooters",
        name: "Mobility Scooters",
        slug: "mobility-scooters",
        role: "PRODUCT",
        recommendationProfile: "NONE",
      },
    });
    const showerChair = product("NONE", manualItems(), {
      id: "shower-chair",
      category: {
        id: "shower-chairs",
        name: "Shower Chairs",
        slug: "shower-chairs",
        role: "PRODUCT",
        recommendationProfile: "NONE",
      },
    });
    const accessory = product("NONE", [], {
      id: "accessory",
      category: {
        id: "accessories",
        name: "Accessories",
        slug: "accessories",
        role: "ACCESSORY",
        recommendationProfile: "NONE",
      },
    });

    const result = wheelchairCandidatesFromProducts([
      powered,
      scooter,
      showerChair,
      accessory,
    ]);

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].productId).toBe(powered.id);
    expect(result.errors).toEqual([]);
  });

  it.each(["NOT_PROVIDED", "CONFLICTING"] as const)(
    "rejects %s hard-filter data even when display and normalized values are present",
    (status) => {
      const source = product(
        "POWERED_WHEELCHAIR",
        poweredItems().map((specification) =>
          specification.semanticKey === "effectiveSeatWidth"
            ? item("effectiveSeatWidth", 0, {
                status,
                displayValue: "18 in",
              })
            : specification,
        ),
      );

      const result = mapPublicVariantToCandidate(source, source.variants[0]);

      expect(result.candidate).toBeNull();
      expect(result.errors.join(" ")).toContain("effectiveSeatWidth");
      expect(result.errors.join(" ")).not.toContain("18 in");
    },
  );

  it("rejects missing and invalid normalized values instead of coercing display text", () => {
    const source = product(
      "POWERED_WHEELCHAIR",
      poweredItems().map((specification) => {
        if (specification.semanticKey === "maxUserWeight") {
          return item("maxUserWeight", "136" as unknown as NormalizedValue, {
            displayValue: "300 lb",
          });
        }
        if (specification.semanticKey === "effectiveSeatWidth") {
          return item("effectiveSeatWidth", undefined, {
            displayValue: "18 in",
          });
        }
        return specification;
      }),
    );

    const result = mapPublicVariantToCandidate(source, source.variants[0]);

    expect(result.candidate).toBeNull();
    expect(result.errors.join(" ")).toContain("maxUserWeight");
    expect(result.errors.join(" ")).toContain("effectiveSeatWidth");
  });

  it("reads semantic specifications from product and variant groups", () => {
    const allItems = poweredItems();
    const productLevel = allItems.filter((specification) =>
      ["overallDimensions", "foldedDimensions"].includes(
        specification.semanticKey ?? "",
      ),
    );
    const variantLevel = allItems.filter(
      (specification) => !productLevel.includes(specification),
    );
    const source = product("POWERED_WHEELCHAIR", variantLevel, {
      specifications: groups(productLevel),
    });

    expect(
      mapPublicVariantToCandidate(source, source.variants[0]),
    ).toMatchObject({
      candidate: {
        overallMm: { length: 1050, width: 620, height: 930 },
        foldedMm: { length: 800, width: 380, height: 720 },
      },
      errors: [],
    });
  });
});
