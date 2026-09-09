import { z } from "zod";
import { SEMANTIC_FIELDS } from "./semantic-fields";
import { isUnitForFamily } from "./units";

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
}).strict().superRefine((field, ctx) => {
  if (field.minValue != null && field.maxValue != null && field.minValue > field.maxValue) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["maxValue"], message: "maxValue must be greater than or equal to minValue" });
  }
  if (["TEXT", "BOOLEAN", "SELECT"].includes(field.dataType) && field.unitFamily !== "NONE") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["unitFamily"], message: `${field.dataType} fields must use unit family NONE` });
  }
  if (field.dataType === "DIMENSIONS" && field.unitFamily !== "LENGTH") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["unitFamily"], message: "Dimension fields must use unit family LENGTH" });
  }
  if (field.dataType === "SELECT" && (!field.options || field.options.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "Select fields require at least one option" });
  }
  if (field.unitFamily === "NONE" && field.defaultDisplayUnit) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["defaultDisplayUnit"], message: "Unitless fields cannot define a display unit" });
  }
  if (field.unitFamily !== "NONE" && !field.defaultDisplayUnit) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["defaultDisplayUnit"], message: "A display unit is required for measured fields" });
  }
  if (field.defaultDisplayUnit && !isUnitForFamily(field.defaultDisplayUnit, field.unitFamily)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["defaultDisplayUnit"], message: `${field.defaultDisplayUnit} is not valid for ${field.unitFamily}` });
  }
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  role: z.enum(["PRODUCT", "ACCESSORY"]).optional(),
  recommendationProfile: z.enum(["NONE", "POWERED_WHEELCHAIR", "MANUAL_WHEELCHAIR"]).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  fields: z.array(fieldSchema).max(100).default([]),
}).strict();

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
