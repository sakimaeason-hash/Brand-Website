import { z } from "zod";
import type { SpecificationInput } from "./types";

const amazonHttpsUrl = z.string().url().refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "amazon.com" || url.hostname.endsWith(".amazon.com"));
  } catch {
    return false;
  }
}, "URL must be an HTTPS Amazon URL");
const nullableAmazonHttpsUrl = amazonHttpsUrl.nullable().optional();

export const specificationInputSchema: z.ZodType<SpecificationInput> = z.object({
  status: z.enum(["PROVIDED", "NOT_PROVIDED", "CONFLICTING"]),
  value: z.union([z.string(), z.number().finite(), z.boolean(), z.object({ length: z.number().finite(), width: z.number().finite(), height: z.number().finite() }), z.null()]),
  unit: z.string().trim().max(20).nullable().optional(),
  sourceNote: z.string().trim().max(500).nullable().optional(),
}).strict();

export const variantInputSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1).max(120),
  factoryModel: z.string().trim().max(120).nullable().optional(),
  label: z.string().trim().max(120).nullable().optional(),
  colorName: z.string().trim().max(80).nullable().optional(),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a six-digit hex value").nullable().optional(),
  priceOverride: z.coerce.number().finite().nonnegative().nullable().optional(),
  originalPriceOverride: z.coerce.number().finite().nonnegative().nullable().optional(),
  purchaseLinkOverride: nullableAmazonHttpsUrl,
  specifications: z.record(specificationInputSchema).default({}),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0),
}).strict();

const variantsSchema = z.array(variantInputSchema).min(1).refine((variants) => {
  const ids = variants.flatMap((variant) => variant.id && !variant.id.startsWith("client-") ? [variant.id] : []);
  return new Set(ids).size === ids.length;
}, "Duplicate variant id");

const inBoxItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  quantity: z.number().int().min(1).max(99),
  note: z.string().trim().max(500).nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
}).strict();

const inBoxItemsSchema = z.array(inBoxItemSchema).max(50).refine((items) => {
  const ids = items.flatMap((item) => item.id ? [item.id] : []);
  return new Set(ids).size === ids.length;
}, "Duplicate in-the-box item id");

export const productAggregateInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  model: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80).default("wheelchair"),
  categoryId: z.string().min(1),
  categoryTemplateVersion: z.number().int().positive(),
  tagline: z.string().trim().max(500).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  price: z.coerce.number().finite().nonnegative(),
  originalPrice: z.coerce.number().finite().nonnegative().nullable().optional(),
  amazonLink: nullableAmazonHttpsUrl,
  weightCapacity: z.string().trim().max(500).nullable().optional(),
  seatWidth: z.string().trim().max(500).nullable().optional(),
  range: z.string().trim().max(500).nullable().optional(),
  maxSpeed: z.string().trim().max(500).nullable().optional(),
  productWeight: z.string().trim().max(500).nullable().optional(),
  features: z.array(z.string().trim().min(1).max(200)).max(30).default([]),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().nonnegative().default(0),
  specifications: z.record(specificationInputSchema).default({}),
  variants: variantsSchema,
  inBoxItems: inBoxItemsSchema.default([]),
  accessoryProductIds: z.array(z.string().min(1)).max(50).refine((ids) => new Set(ids).size === ids.length, "Duplicate accessory"),
}).strict();

export type ProductAggregateInput = z.infer<typeof productAggregateInputSchema>;

export function normalizeProductInput(input: ProductAggregateInput): ProductAggregateInput {
  const parsed = productAggregateInputSchema.parse(input);
  const seen = new Set<string>();
  for (const variant of parsed.variants) {
    const sku = variant.sku.toUpperCase();
    if (seen.has(sku)) throw new ProductValidationError("DUPLICATE_SKU", `Duplicate SKU: ${variant.sku}`);
    seen.add(sku);
  }
  return {
    ...parsed,
    variants: parsed.variants.map((variant) => ({ ...variant, sku: variant.sku.trim().toUpperCase() })),
  };
}

export class ProductValidationError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "ProductValidationError";
  }
}
