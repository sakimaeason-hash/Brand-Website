import type { SpecificationFieldDefinition, StoredSpecification } from "@/lib/catalog/types";

export type ProductImageInput = {
  id: string;
  publicUrl: string;
  originalName: string;
  altText: string | null;
  sourceNote: string | null;
  sortOrder: number;
};

export type ProductCategoryOption = {
  id: string;
  name: string;
  slug: string;
  role: "PRODUCT" | "ACCESSORY";
  recommendationProfile: "NONE" | "POWERED_WHEELCHAIR" | "MANUAL_WHEELCHAIR";
  templateVersion: number;
  fields: SpecificationFieldDefinition[];
};

export type AccessoryOption = {
  id: string;
  name: string;
  model: string;
  price: number;
  status: "PUBLISHED";
  imageUrl: string | null;
};

export type SpecificationDraft = {
  status: "PROVIDED" | "NOT_PROVIDED" | "CONFLICTING";
  value: string | boolean | { length: string; width: string; height: string } | null;
  unit?: string | null;
  sourceNote?: string | null;
};

export type SpecificationDraftMap = Record<string, SpecificationDraft>;

export type ProductVariantFormData = {
  id?: string;
  sku: string;
  factoryModel: string | null;
  label: string | null;
  colorName: string | null;
  colorHex: string | null;
  priceOverride: number | null;
  originalPriceOverride: number | null;
  purchaseLinkOverride: string | null;
  specifications: Record<string, StoredSpecification>;
  isActive: boolean;
  sortOrder: number;
};

export type InBoxFormData = {
  id?: string;
  name: string;
  quantity: number;
  note: string | null;
  sortOrder: number;
};

export type ProductFormData = {
  id: string;
  updatedAt: string;
  name: string;
  model: string;
  category: string;
  categoryId: string | null;
  categoryTemplateVersion: number;
  tagline: string | null;
  description: string | null;
  price: number;
  originalPrice: number | null;
  amazonLink: string | null;
  weightCapacity: string | null;
  seatWidth: string | null;
  range: string | null;
  maxSpeed: string | null;
  productWeight: string | null;
  features: string[];
  isFeatured: boolean;
  sortOrder: number;
  specifications: Record<string, StoredSpecification>;
  variants: ProductVariantFormData[];
  inBoxItems: InBoxFormData[];
  accessoryProductIds: string[];
  images: ProductImageInput[];
};

export type VariantDraft = {
  localKey: string;
  id?: string;
  sku: string;
  factoryModel: string;
  label: string;
  colorName: string;
  colorHex: string;
  priceOverride: string;
  originalPriceOverride: string;
  purchaseLinkOverride: string;
  overridePrice: boolean;
  overrideOriginalPrice: boolean;
  overridePurchaseLink: boolean;
  specifications: SpecificationDraftMap;
  isActive: boolean;
  sortOrder: string;
};

export type InBoxDraft = {
  localKey: string;
  id?: string;
  name: string;
  quantity: string;
  note: string;
  sortOrder: string;
};

export type ProductFieldError = {
  tab: "overview" | "specifications" | "variants" | "accessories" | "media";
  fieldKey: string;
  variantId?: string;
  message: string;
};
