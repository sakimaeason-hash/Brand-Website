import { normalizeSpecification } from "./specifications";
import type { FieldError, SpecificationFieldDefinition, SpecificationInput, StoredSpecification } from "./types";

type CategoryTemplate = {
  id: string;
  templateVersion: number;
  role: "PRODUCT" | "ACCESSORY";
  recommendationProfile: "NONE" | "POWERED_WHEELCHAIR" | "MANUAL_WHEELCHAIR";
  fields: readonly SpecificationFieldDefinition[];
};

type ProductForPublish = {
  id: string;
  name: string;
  model: string;
  price: unknown;
  originalPrice?: unknown;
  amazonLink?: string | null;
  categoryId: string | null;
  categoryTemplateVersion: number;
  specifications: unknown;
  images?: readonly unknown[];
  variants: readonly {
    id: string;
    sku: string;
    isActive: boolean;
    priceOverride?: unknown;
    purchaseLinkOverride?: string | null;
    specifications: unknown;
  }[];
  compatibleAccessories?: readonly { accessoryProductId: string }[];
};

type AccessoryProduct = { id: string; role: "PRODUCT" | "ACCESSORY"; status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED"; };

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof value === "object") {
    const toNumber = (value as { toNumber?: unknown }).toNumber;
    if (typeof toNumber === "function") {
      const number = toNumber.call(value);
      if (typeof number === "number" && Number.isFinite(number)) return number;
    }
    const normalized = (value as { normalizedValue?: unknown }).normalizedValue;
    if (typeof normalized === "number" && Number.isFinite(normalized)) return normalized;
  }
  return null;
}

function hasValidSpecification(map: unknown, field: SpecificationFieldDefinition): boolean {
  if (!map || typeof map !== "object" || Array.isArray(map)) return false;
  const stored = (map as Record<string, StoredSpecification | undefined>)[field.key];
  if (!stored || stored.status !== "PROVIDED" || stored.value == null) return false;
  const input: SpecificationInput = stored.inputValue !== undefined
    ? { ...stored, value: stored.inputValue, unit: stored.inputUnit ?? stored.unit }
    : stored;
  try {
    const normalized = normalizeSpecification(field, input);
    return normalized.status === "PROVIDED" && (typeof normalized.value !== "string" || normalized.value.length > 0);
  } catch {
    return false;
  }
}

function add(errors: FieldError[], error: FieldError) { errors.push(error); }

export function validateForPublish(product: ProductForPublish, template: CategoryTemplate, options: { requirePublish?: boolean; accessoryProducts?: readonly AccessoryProduct[] } = {}): FieldError[] {
  const requirePublish = options.requirePublish !== false;
  if (!requirePublish) return [];
  const errors: FieldError[] = [];
  if (!product.name?.trim()) add(errors, { tab: "overview", fieldKey: "name", message: "Name is required" });
  if (!product.model?.trim()) add(errors, { tab: "overview", fieldKey: "model", message: "Model is required" });
  if (numberValue(product.price) == null || numberValue(product.price)! <= 0) add(errors, { tab: "overview", fieldKey: "price", message: "A positive price is required" });
  if (product.categoryId !== template.id) add(errors, { tab: "overview", fieldKey: "categoryId", message: "Product category does not match the selected template" });
  if (product.categoryTemplateVersion !== template.templateVersion) add(errors, { tab: "overview", fieldKey: "categoryTemplateVersion", message: "Product template is out of date; reload before publishing" });
  if (!product.images || product.images.length < 1) add(errors, { tab: "media", fieldKey: "images", message: "At least one product image is required" });

  for (const field of template.fields.filter((candidate) => candidate.status === "ACTIVE" && fieldRequired(candidate, template.recommendationProfile))) {
    const map = field.scope === "PRODUCT" ? product.specifications : null;
    if (field.scope === "PRODUCT" && !hasValidSpecification(map, field)) add(errors, { tab: "specifications", fieldKey: field.key, message: `${field.label} is required` });
  }

  const activeVariants = product.variants.filter((variant) => variant.isActive);
  if (activeVariants.length === 0) add(errors, { tab: "variants", fieldKey: "sku", message: "At least one active SKU is required" });
  const skuSet = new Set<string>();
  for (const variant of activeVariants) {
    const key = variant.sku.trim().toUpperCase();
    if (!key || skuSet.has(key)) add(errors, { tab: "variants", variantId: variant.id, fieldKey: "sku", message: "SKU must be unique and non-empty" });
    skuSet.add(key);
    if (variant.priceOverride != null && (numberValue(variant.priceOverride) == null || numberValue(variant.priceOverride)! <= 0)) add(errors, { tab: "variants", variantId: variant.id, fieldKey: "priceOverride", message: "SKU price override must be positive" });
    if (variant.isActive && !variant.purchaseLinkOverride && !product.amazonLink) add(errors, { tab: "variants", variantId: variant.id, fieldKey: "purchaseLink", message: "Purchase link is required for every active SKU" });
    for (const field of template.fields.filter((candidate) => candidate.status === "ACTIVE" && candidate.scope === "VARIANT" && fieldRequired(candidate, template.recommendationProfile))) {
      if (!hasValidSpecification(variant.specifications, field)) add(errors, { tab: "variants", variantId: variant.id, fieldKey: field.semanticKey ?? field.key, message: `${field.label} is required${field.requiredForRecommendation ? " for wheelchair recommendations" : ""}` });
    }
    for (const key of Object.keys((variant.specifications ?? {}) as object)) {
      const field = template.fields.find((candidate) => candidate.key === key);
      if (field?.scope !== "VARIANT") add(errors, { tab: "variants", variantId: variant.id, fieldKey: key, message: "This field belongs to the product scope" });
    }
  }
  for (const key of Object.keys((product.specifications ?? {}) as object)) {
    const field = template.fields.find((candidate) => candidate.key === key);
    if (field?.scope !== "PRODUCT") add(errors, { tab: "specifications", fieldKey: key, message: "This field belongs to the SKU scope" });
  }

  const accessoryIds = product.compatibleAccessories?.map((item) => item.accessoryProductId) ?? [];
  const uniqueAccessoryIds = new Set<string>();
  for (const accessoryId of accessoryIds) {
    if (accessoryId === product.id) add(errors, { tab: "accessories", fieldKey: "accessoryProductIds", message: "A product cannot be compatible with itself" });
    if (uniqueAccessoryIds.has(accessoryId)) add(errors, { tab: "accessories", fieldKey: "accessoryProductIds", message: "Duplicate accessory" });
    uniqueAccessoryIds.add(accessoryId);
    const accessory = options.accessoryProducts?.find((candidate) => candidate.id === accessoryId);
    if (!accessory || accessory.role !== "ACCESSORY" || accessory.status !== "PUBLISHED") add(errors, { tab: "accessories", fieldKey: "accessoryProductIds", message: "Compatible accessories must be published accessory products" });
  }
  return errors;
}

function fieldRequired(field: SpecificationFieldDefinition, profile: CategoryTemplate["recommendationProfile"]): boolean {
  return field.requiredForPublish || (field.requiredForRecommendation && profile !== "NONE");
}

export type { CategoryTemplate, ProductForPublish, AccessoryProduct };
