import {
  SEMANTIC_FIELDS,
  type SemanticFieldKey,
} from "@/lib/catalog/semantic-fields";
import type {
  DimensionsValue,
  PublicProduct,
  PublicProductVariant,
  PublicSpecificationItem,
} from "@/lib/catalog/types";
import type {
  DimensionsMm,
  TireClass,
  WheelchairCandidate,
} from "./types";

export type CandidateMappingResult = {
  candidate: WheelchairCandidate | null;
  errors: string[];
};

export type WheelchairCatalogResult = {
  candidates: WheelchairCandidate[];
  errors: string[];
};

type SemanticItems = ReadonlyMap<string, PublicSpecificationItem>;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPositiveNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;

const isNonNegativeNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value >= 0;

function isDimensions(value: unknown): value is DimensionsValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const dimensions = value as Partial<DimensionsValue>;
  return (
    isPositiveNumber(dimensions.length) &&
    isPositiveNumber(dimensions.width) &&
    isPositiveNumber(dimensions.height)
  );
}

function semanticItems(
  product: PublicProduct,
  variant: PublicProductVariant,
): SemanticItems {
  const result = new Map<string, PublicSpecificationItem>();
  for (const group of [...product.specifications, ...variant.specifications]) {
    for (const item of group.items) {
      if (item.semanticKey) result.set(item.semanticKey, item);
    }
  }
  return result;
}

function expectedUnit(semanticKey: SemanticFieldKey): string | null {
  return SEMANTIC_FIELDS[semanticKey].canonicalUnit;
}

function providedValue(
  items: SemanticItems,
  semanticKey: SemanticFieldKey,
  errors: string[],
): unknown {
  const item = items.get(semanticKey);
  if (!item) {
    errors.push(`${semanticKey}: normalized value is missing.`);
    return undefined;
  }
  if (item.status !== "PROVIDED") {
    errors.push(`${semanticKey}: status ${item.status} is not usable.`);
    return undefined;
  }
  const unit = expectedUnit(semanticKey);
  if (unit !== null && item.normalizedUnit !== unit) {
    errors.push(`${semanticKey}: normalized unit must be ${unit}.`);
    return undefined;
  }
  if (unit === null && item.normalizedUnit) {
    errors.push(`${semanticKey}: normalized value must not have a unit.`);
    return undefined;
  }
  if (item.normalizedValue === undefined) {
    errors.push(`${semanticKey}: normalized value is missing.`);
    return undefined;
  }
  return item.normalizedValue;
}

function requiredNumber(
  items: SemanticItems,
  semanticKey: SemanticFieldKey,
  errors: string[],
  allowZero = false,
): number | null {
  const value = providedValue(items, semanticKey, errors);
  if (allowZero && isNonNegativeNumber(value)) return value;
  if (!allowZero && isPositiveNumber(value)) return value;
  if (value !== undefined) {
    errors.push(`${semanticKey}: normalized value must be a valid number.`);
  }
  return null;
}

function requiredDimensions(
  items: SemanticItems,
  semanticKey: SemanticFieldKey,
  errors: string[],
): DimensionsMm | null {
  const value = providedValue(items, semanticKey, errors);
  if (!isDimensions(value)) {
    if (value !== undefined) {
      errors.push(`${semanticKey}: normalized dimensions must be positive.`);
    }
    return null;
  }
  return { length: value.length, width: value.width, height: value.height };
}

function requiredSelect<T extends string>(
  items: SemanticItems,
  semanticKey: SemanticFieldKey,
  allowed: readonly T[],
  errors: string[],
): T | null {
  const value = providedValue(items, semanticKey, errors);
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    if (value !== undefined) {
      errors.push(
        `${semanticKey}: normalized value must be one of ${allowed.join(", ")}.`,
      );
    }
    return null;
  }
  return value as T;
}

function optionalValue<T>(
  items: SemanticItems,
  semanticKey: SemanticFieldKey,
  validate: (value: unknown) => value is T,
  warnings: string[],
): T | null {
  const item = items.get(semanticKey);
  const unit = expectedUnit(semanticKey);
  if (
    !item ||
    item.status !== "PROVIDED" ||
    (unit !== null && item.normalizedUnit !== unit) ||
    (unit === null && Boolean(item.normalizedUnit)) ||
    !validate(item.normalizedValue)
  ) {
    warnings.push(`Official ${semanticKey} data needs confirmation.`);
    return null;
  }
  return item.normalizedValue;
}

function metadata(
  product: PublicProduct,
  variant: PublicProductVariant,
  errors: string[],
) {
  const productUrl = variant.purchaseLink?.trim();
  const imageUrl = product.images[0]?.url.trim();
  if (!product.id.trim()) errors.push("productId: value is missing.");
  if (!product.name.trim()) errors.push("productName: value is missing.");
  if (!variant.id.trim()) errors.push("variantId: value is missing.");
  if (!variant.sku.trim()) errors.push("sku: value is missing.");
  if (!productUrl) errors.push("productUrl: Amazon purchase link is missing.");
  if (!imageUrl) errors.push("imageUrl: product image is missing.");
  return { productUrl: productUrl ?? "", imageUrl: imageUrl ?? "" };
}

export function mapPublicVariantToCandidate(
  product: PublicProduct,
  variant: PublicProductVariant,
): CandidateMappingResult {
  const profile = product.category.recommendationProfile;
  if (
    product.category.role !== "PRODUCT" ||
    (profile !== "POWERED_WHEELCHAIR" && profile !== "MANUAL_WHEELCHAIR")
  ) {
    return { candidate: null, errors: [] };
  }

  const errors: string[] = [];
  const items = semanticItems(product, variant);
  const urls = metadata(product, variant, errors);
  const maxUserWeightKg = requiredNumber(items, "maxUserWeight", errors);
  const effectiveSeatWidthMm = requiredNumber(
    items,
    "effectiveSeatWidth",
    errors,
  );
  const seatDepthMm = requiredNumber(items, "seatDepth", errors);
  const seatHeightMm = requiredNumber(items, "seatHeight", errors);
  const seatToFootrestMm = requiredNumber(items, "seatToFootrest", errors);
  const overallMm = requiredDimensions(items, "overallDimensions", errors);
  const foldedMm = requiredDimensions(items, "foldedDimensions", errors);

  const common = {
    productId: product.id,
    productName: product.name,
    variantId: variant.id,
    sku: variant.sku,
    maxUserWeightKg: maxUserWeightKg!,
    effectiveSeatWidthMm: effectiveSeatWidthMm!,
    seatDepthMm: seatDepthMm!,
    seatHeightMm: seatHeightMm!,
    seatToFootrestMm: seatToFootrestMm!,
    overallMm: overallMm!,
    foldedMm: foldedMm!,
    productUrl: urls.productUrl,
    imageUrl: urls.imageUrl,
  };

  if (profile === "POWERED_WHEELCHAIR") {
    const rangeKm = requiredNumber(items, "range", errors);
    const netWeightWithoutBatteryKg = requiredNumber(
      items,
      "netWeightWithoutBattery",
      errors,
    );
    const turningRadiusMm = requiredNumber(items, "turningRadius", errors);
    const obstacleHeightMm = requiredNumber(
      items,
      "obstacleHeight",
      errors,
      true,
    );
    const rearWheelMm = requiredNumber(items, "rearWheelDiameter", errors);
    const tireClass = requiredSelect<TireClass>(
      items,
      "tireClass",
      ["pneumatic", "solid", "foam-filled"],
      errors,
    );
    const dataWarnings: string[] = [];
    const battery = {
      weightKg: optionalValue(
        items,
        "batteryWeight",
        isNonNegativeNumber,
        dataWarnings,
      ),
      removable: optionalValue(
        items,
        "batteryRemovable",
        (value): value is boolean => typeof value === "boolean",
        dataWarnings,
      ),
      chemistry: optionalValue(
        items,
        "batteryChemistry",
        (value): value is "lithium" | "lead-acid" =>
          value === "lithium" || value === "lead-acid",
        dataWarnings,
      ),
      voltageV: optionalValue(
        items,
        "batteryVoltage",
        isPositiveNumber,
        dataWarnings,
      ),
      capacityAh: optionalValue(
        items,
        "batteryCapacityAh",
        isPositiveNumber,
        dataWarnings,
      ),
      manufacturerAirplaneFlag: optionalValue(
        items,
        "manufacturerAirplaneFlag",
        (value): value is boolean => typeof value === "boolean",
        dataWarnings,
      ),
    } as const;

    if (errors.length > 0) return { candidate: null, errors };
    return {
      candidate: {
        ...common,
        mobilityType: "powered",
        dataWarnings,
        rangeKm: rangeKm!,
        netWeightWithoutBatteryKg: netWeightWithoutBatteryKg!,
        turningRadiusMm: turningRadiusMm!,
        obstacleHeightMm: obstacleHeightMm!,
        rearWheelMm: rearWheelMm!,
        tireClass: tireClass!,
        battery,
      },
      errors: [],
    };
  }

  const productWeightKg = requiredNumber(items, "productWeight", errors);
  const propulsion = requiredSelect(
    items,
    "propulsionType",
    ["self-propelled", "transport", "attendant-propelled"] as const,
    errors,
  );
  const frontWheelMm = requiredNumber(items, "frontWheelDiameter", errors);
  const rearWheelMm = requiredNumber(items, "rearWheelDiameter", errors);
  const tireClass = requiredSelect<TireClass>(
    items,
    "tireClass",
    ["pneumatic", "solid", "foam-filled"],
    errors,
  );

  if (errors.length > 0) return { candidate: null, errors };
  return {
    candidate: {
      ...common,
      mobilityType: "manual",
      dataWarnings: [],
      productWeightKg: productWeightKg!,
      propulsionType:
        propulsion === "self-propelled" ? "self-propel" : "transport",
      frontWheelMm: frontWheelMm!,
      rearWheelMm: rearWheelMm!,
      tireClass: tireClass!,
    },
    errors: [],
  };
}

export function wheelchairCandidatesFromProducts(
  products: readonly PublicProduct[],
): WheelchairCatalogResult {
  const candidates: WheelchairCandidate[] = [];
  const errors: string[] = [];

  for (const product of products) {
    if (
      product.category.role !== "PRODUCT" ||
      product.category.recommendationProfile === "NONE"
    ) {
      continue;
    }
    for (const variant of product.variants) {
      const result = mapPublicVariantToCandidate(product, variant);
      if (result.candidate) candidates.push(result.candidate);
      errors.push(
        ...result.errors.map(
          (error) => `${product.id}/${variant.id}: ${error}`,
        ),
      );
    }
  }

  return { candidates, errors };
}

type ProductLoader = () => Promise<readonly PublicProduct[]>;

export async function listFinderCandidates(
  loadProducts?: ProductLoader,
): Promise<WheelchairCatalogResult> {
  const loader =
    loadProducts ??
    (await import("@/lib/content/repository")).listPublishedProductsStrict;
  return wheelchairCandidatesFromProducts(await loader());
}
