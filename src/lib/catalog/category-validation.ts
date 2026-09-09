import { z } from "zod";
import { SEMANTIC_FIELDS } from "./semantic-fields";

const fieldSchema = z.object({
  id: z.string().optional(),
  key: z.string().regex(/^[a-z][a-zA-Z0-9]*$/, "Field key must use camelCase").max(80),
  label: z.string().trim().min(1).max(120),
  group: z.string().trim().min(1).max(80),
  scope: z.enum(["PRODUCT", "VARIANT"]),
  dataType: z.enum(["TEXT", "NUMBER", "BOOLEAN", "SELECT", "DIMENSIONS"]),
  unitFamily: z.enum(["NONE", "LENGTH", "WEIGHT", "DISTANCE", "SPEED", "POWER", "VOLTAGE", "CAPACITY_AH", "ENERGY_WH", "ANGLE"]),
  defaultDisplayUnit: z.string().trim().max(20).nullable().optional(),
  options: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
  helpText: z.string().trim().max(500).nullable().optional(),
  minValue: z.number().finite().nullable().optional(),
  maxValue: z.number().finite().nullable().optional(),
  requiredForPublish: z.boolean().optional(),
  requiredForRecommendation: z.boolean().optional(),
  semanticKey: z.string().optional().nullable(),
  isProtected: z.boolean().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  role: z.enum(["PRODUCT", "ACCESSORY"]).optional(),
  recommendationProfile: z.enum(["NONE", "POWERED_WHEELCHAIR", "MANUAL_WHEELCHAIR"]).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  fields: z.array(fieldSchema).max(100).default([]),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export function slugifyCategoryName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function protectedFieldForSemantic(semanticKey: string | null | undefined) {
  if (!semanticKey || !(semanticKey in SEMANTIC_FIELDS)) return null;
  return SEMANTIC_FIELDS[semanticKey as keyof typeof SEMANTIC_FIELDS];
}
