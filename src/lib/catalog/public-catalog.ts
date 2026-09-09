import { calculateSalePrice, isPromotionActive } from "@/lib/content/promotions";
import type {
  DimensionsValue,
  PublicAccessorySummary,
  PublicProduct,
  PublicProductVariant,
  PublicSpecificationGroup,
  PublicSpecificationItem,
  SpecificationStatus,
} from "./types";

type CatalogFieldRow = {
  key: string;
  label: string;
  group: string;
  scope: "PRODUCT" | "VARIANT";
  dataType: "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT" | "DIMENSIONS";
  unitFamily: string;
  defaultDisplayUnit: string | null;
  semanticKey: string | null;
  status: string;
  sortOrder: number;
};

type CatalogVariantRow = {
  id: string;
  sku: string;
  factoryModel: string | null;
  label: string | null;
  colorName: string | null;
  colorHex: string | null;
  priceOverride: unknown;
  originalPriceOverride: unknown;
  purchaseLinkOverride: string | null;
  specifications: unknown;
  isActive: boolean;
  sortOrder: number;
};

type AccessoryRow = {
  id: string;
  name: string;
  model: string;
  price: unknown;
  amazonLink?: string | null;
  status: string;
  categoryRelation?: { role: string; status: string } | null;
  images?: readonly { sortOrder: number; publicUrl: string; altText: string | null }[];
  variants?: readonly CatalogVariantRow[];
};

export type CatalogProductRow = {
  id: string;
  name: string;
  model: string;
  tagline: string | null;
  description: string | null;
  price: unknown;
  originalPrice: unknown;
  amazonLink: string | null;
  features: unknown;
  status: string;
  isFeatured: boolean;
  sortOrder: number;
  specifications: unknown;
  categoryRelation: {
    id: string;
    name: string;
    slug: string;
    role: "PRODUCT" | "ACCESSORY";
    recommendationProfile: "NONE" | "POWERED_WHEELCHAIR" | "MANUAL_WHEELCHAIR";
    status: string;
    fields: readonly CatalogFieldRow[];
  } | null;
  images: readonly { sortOrder: number; publicUrl: string; altText: string | null }[];
  variants: readonly CatalogVariantRow[];
  inBoxItems: readonly { name: string; quantity: number; note: string | null; sortOrder: number }[];
  compatibleAccessories: readonly { sortOrder: number; accessoryProduct: AccessoryRow }[];
  promotions: readonly {
    status: string;
    isAutoScheduleEnabled: boolean;
    startAt: Date | string;
    endAt: Date | string;
    salePrice: unknown;
    discountPercent: unknown;
  }[];
};

type StoredValue = {
  status?: SpecificationStatus;
  value?: unknown;
  inputValue?: unknown;
  inputUnit?: string;
  normalizedValue?: unknown;
  normalizedUnit?: string;
};

function finiteNumber(value: unknown): number | undefined {
  if (value == null) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function strictFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function objectMap(value: unknown): Record<string, StoredValue> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, StoredValue> : {};
}

function dimensions(value: unknown): DimensionsValue | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Partial<DimensionsValue>;
  const length = finiteNumber(candidate.length);
  const width = finiteNumber(candidate.width);
  const height = finiteNumber(candidate.height);
  return length == null || width == null || height == null ? undefined : { length, width, height };
}

function strictDimensions(value: unknown): DimensionsValue | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Partial<DimensionsValue>;
  const length = strictFiniteNumber(candidate.length);
  const width = strictFiniteNumber(candidate.width);
  const height = strictFiniteNumber(candidate.height);
  return length == null || width == null || height == null ? undefined : { length, width, height };
}

function formatNumber(value: number): string {
  const rounded = Math.abs(value - Math.round(value)) < 0.005 ? Math.round(value) : Math.round(value * 100) / 100;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(rounded);
}

function preferredUsValue(value: number, unit: string): { value: number; unit: string } {
  if (unit === "kg") return { value: value / 0.45359237, unit: "lb" };
  if (unit === "mm") return { value: value / 25.4, unit: "in" };
  if (unit === "km") return { value: value / 1.609344, unit: "mi" };
  if (unit === "km/h") return { value: value / 1.609344, unit: "mph" };
  return { value, unit };
}

function displayNumber(specification: StoredValue): string {
  const inputValue = finiteNumber(specification.inputValue);
  if (inputValue != null && specification.inputUnit) return `${formatNumber(inputValue)} ${specification.inputUnit}`;
  const normalizedValue = finiteNumber(specification.normalizedValue ?? specification.value);
  const normalizedUnit = specification.normalizedUnit ?? (typeof specification.value === "number" ? specification.inputUnit : undefined);
  if (normalizedValue == null) return "Not provided";
  if (!normalizedUnit) return formatNumber(normalizedValue);
  const preferred = preferredUsValue(normalizedValue, normalizedUnit);
  return `${formatNumber(preferred.value)} ${preferred.unit}`;
}

function displayDimensions(specification: StoredValue): string {
  const input = dimensions(specification.inputValue);
  if (input && specification.inputUnit) return `${formatNumber(input.length)} × ${formatNumber(input.width)} × ${formatNumber(input.height)} ${specification.inputUnit}`;
  const normalized = dimensions(specification.normalizedValue ?? specification.value);
  if (!normalized) return "Not provided";
  const unit = specification.normalizedUnit ?? specification.inputUnit ?? "";
  const length = preferredUsValue(normalized.length, unit);
  const width = preferredUsValue(normalized.width, unit);
  const height = preferredUsValue(normalized.height, unit);
  return `${formatNumber(length.value)} × ${formatNumber(width.value)} × ${formatNumber(height.value)} ${length.unit}`.trim();
}

function toPublicSpecification(field: CatalogFieldRow, specification: StoredValue | undefined): PublicSpecificationItem {
  const status = specification?.status ?? "NOT_PROVIDED";
  let displayValue = "Not provided";
  if (status === "CONFLICTING") displayValue = "Needs verification";
  else if (status === "PROVIDED") {
    if (field.dataType === "NUMBER") displayValue = displayNumber(specification ?? {});
    else if (field.dataType === "DIMENSIONS") displayValue = displayDimensions(specification ?? {});
    else if (field.dataType === "BOOLEAN") displayValue = specification?.value === true ? "Yes" : "No";
    else displayValue = typeof specification?.value === "string" ? specification.value : "Not provided";
  }
  const normalizedValue = (() => {
    if (field.dataType === "NUMBER") {
      return strictFiniteNumber(specification?.normalizedValue);
    }
    if (field.dataType === "DIMENSIONS") {
      return strictDimensions(specification?.normalizedValue);
    }
    if (field.dataType === "BOOLEAN") {
      return typeof specification?.value === "boolean"
        ? specification.value
        : undefined;
    }
    return typeof specification?.value === "string"
      ? specification.value
      : undefined;
  })();
  return {
    key: field.key,
    label: field.label,
    ...(field.semanticKey ? { semanticKey: field.semanticKey } : {}),
    status,
    displayValue,
    ...(normalizedValue == null ? {} : { normalizedValue }),
    ...(specification?.normalizedUnit ? { normalizedUnit: specification.normalizedUnit } : {}),
  };
}

function specificationGroups(fields: readonly CatalogFieldRow[], stored: unknown, scope: "PRODUCT" | "VARIANT"): PublicSpecificationGroup[] {
  const map = objectMap(stored);
  const scoped = fields.filter((field) => field.status === "ACTIVE" && field.scope === scope).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const groups = Array.from(new Set(scoped.map((field) => field.group)));
  return groups.map((name) => ({ name, items: scoped.filter((field) => field.group === name).map((field) => toPublicSpecification(field, map[field.key])) }));
}

function activePromotion(row: CatalogProductRow, now: Date) {
  return row.promotions.find((promotion) => isPromotionActive(now, {
    status: promotion.status as "DRAFT" | "PUBLISHED" | "UNPUBLISHED",
    isAutoScheduleEnabled: promotion.isAutoScheduleEnabled,
    startAt: new Date(promotion.startAt),
    endAt: new Date(promotion.endAt),
  }));
}

function productPricing(row: CatalogProductRow, now: Date) {
  const basePrice = Number(row.price);
  const promotion = activePromotion(row, now);
  if (!promotion) return { price: basePrice, originalPrice: finiteNumber(row.originalPrice) };
  const price = calculateSalePrice(basePrice, {
    salePrice: promotion.salePrice == null ? null : Number(promotion.salePrice),
    discountPercent: promotion.discountPercent == null ? null : Number(promotion.discountPercent),
  });
  return { price, originalPrice: price === basePrice ? finiteNumber(row.originalPrice) : finiteNumber(row.originalPrice) ?? basePrice };
}

export function toPublicVariant(variant: CatalogVariantRow, row: CatalogProductRow, now = new Date()): PublicProductVariant {
  const product = productPricing(row, now);
  const priceOverride = finiteNumber(variant.priceOverride);
  const originalPriceOverride = finiteNumber(variant.originalPriceOverride);
  const originalPrice = originalPriceOverride ?? product.originalPrice;
  return {
    id: variant.id,
    sku: variant.sku,
    ...(variant.factoryModel ? { factoryModel: variant.factoryModel } : {}),
    ...(variant.label ? { label: variant.label } : {}),
    ...(variant.colorName ? { colorName: variant.colorName } : {}),
    ...(variant.colorHex ? { colorHex: variant.colorHex } : {}),
    price: priceOverride ?? product.price,
    ...(originalPrice == null ? {} : { originalPrice }),
    ...(variant.purchaseLinkOverride || row.amazonLink ? { purchaseLink: variant.purchaseLinkOverride || row.amazonLink || undefined } : {}),
    specifications: specificationGroups(row.categoryRelation?.fields ?? [], variant.specifications, "VARIANT"),
  };
}

function accessorySummary(row: AccessoryRow): PublicAccessorySummary {
  const image = row.images?.slice().sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const activeVariant = row.variants?.filter((variant) => variant.isActive).sort((a, b) => a.sortOrder - b.sortOrder)[0];
  return {
    id: row.id,
    name: row.name,
    model: row.model,
    price: finiteNumber(activeVariant?.priceOverride) ?? Number(row.price),
    ...(image ? { image: { url: image.publicUrl, alt: image.altText || row.name } } : {}),
    ...(activeVariant?.purchaseLinkOverride || row.amazonLink ? { purchaseLink: activeVariant?.purchaseLinkOverride || row.amazonLink || undefined } : {}),
  };
}

export function toPublicProduct(row: CatalogProductRow, now = new Date()): PublicProduct | null {
  if (row.status !== "PUBLISHED" || !row.categoryRelation || row.categoryRelation.status !== "ACTIVE") return null;
  const category = row.categoryRelation;
  const variants = row.variants.filter((variant) => variant.isActive).slice().sort((a, b) => a.sortOrder - b.sortOrder).map((variant) => toPublicVariant(variant, row, now));
  if (variants.length === 0) return null;
  const accessories = row.compatibleAccessories
    .filter(({ accessoryProduct }) => accessoryProduct.status === "PUBLISHED" && accessoryProduct.categoryRelation?.status === "ACTIVE" && accessoryProduct.categoryRelation.role === "ACCESSORY")
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ accessoryProduct }) => accessorySummary(accessoryProduct));
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline ?? "",
    ...(row.description ? { description: row.description } : {}),
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      role: category.role,
      recommendationProfile: category.recommendationProfile,
    },
    images: row.images.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((image) => ({ url: image.publicUrl, alt: image.altText || row.name })),
    features: Array.isArray(row.features) ? row.features.filter((feature): feature is string => typeof feature === "string") : [],
    variants,
    specifications: specificationGroups(category.fields, row.specifications, "PRODUCT"),
    inBoxItems: row.inBoxItems.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((item) => ({ name: item.name, quantity: item.quantity, ...(item.note ? { note: item.note } : {}) })),
    compatibleAccessories: accessories,
    isFeatured: row.isFeatured,
  };
}
