import { z } from "zod";

export const MAX_CONTENT_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_CONTENT_IMAGES = 12;
export const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateImage(file: File): File {
  if (!allowedImageTypes.has(file.type)) throw new Error("Unsupported image type");
  if (file.size > MAX_CONTENT_IMAGE_BYTES) throw new Error("Image exceeds 10 MB");
  return file;
}

export function sanitizeFileName(name: string): string {
  return name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "upload";
}

export function normalizeOptionalText(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

const optionalText = z.string().trim().max(500).optional().nullable();
const status = z.enum(["DRAFT", "PUBLISHED", "UNPUBLISHED"]);

export const productInputSchema = z.object({
  name: z.string().trim().min(1).max(120), model: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80).default("wheelchair"), tagline: optionalText,
  description: z.string().trim().max(5000).optional().nullable(), price: z.coerce.number().finite().nonnegative(),
  originalPrice: z.coerce.number().finite().nonnegative().optional().nullable(), amazonLink: z.string().url().optional().nullable(),
  weightCapacity: optionalText, seatWidth: optionalText, range: optionalText, maxSpeed: optionalText, productWeight: optionalText,
  features: z.array(z.string().trim().min(1).max(200)).max(30).default([]), isFeatured: z.boolean().default(false), sortOrder: z.number().int().default(0),
  status: status.optional().default("DRAFT"),
});

export const storyInputSchema = z.object({
  displayName: z.string().trim().min(1).max(120), location: optionalText, quote: z.string().trim().min(1).max(5000), productId: z.string().trim().optional().nullable(),
  source: optionalText, tags: z.array(z.enum(["Travel", "Comfort", "Support", "New User", "Family", "Independence"])).max(10).default([]),
  isFeatured: z.boolean().default(false), sortOrder: z.number().int().default(0), status: status.optional().default("DRAFT"),
});

export const promotionInputSchema = z.object({
  name: z.string().trim().min(1).max(120), productId: z.string().trim().min(1), startAt: z.string().datetime({ offset: true }), endAt: z.string().datetime({ offset: true }),
  salePrice: z.coerce.number().finite().nonnegative().optional().nullable(), discountPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  label: optionalText, bannerImageUrl: z.string().url().optional().nullable(), isAutoScheduleEnabled: z.boolean().default(true), status: status.optional().default("DRAFT"),
}).superRefine((value, ctx) => {
  if (new Date(value.endAt) <= new Date(value.startAt)) ctx.addIssue({ code: "custom", path: ["endAt"], message: "End time must be after start time" });
  if ((value.salePrice == null) === (value.discountPercent == null)) ctx.addIssue({ code: "custom", path: ["salePrice"], message: "Provide sale price or discount" });
});
