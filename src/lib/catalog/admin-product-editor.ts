import type { AccessoryOption, ProductCategoryOption } from "@/components/admin/ProductEditorTypes";
import { prisma } from "@/lib/db";
import type { SpecificationFieldDefinition, UnitFamily } from "./types";

function stringOptions(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function specificationField(field: {
  key: string;
  label: string;
  group: string;
  scope: "PRODUCT" | "VARIANT";
  dataType: "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT" | "DIMENSIONS";
  unitFamily: string;
  defaultDisplayUnit: string | null;
  options: unknown;
  helpText: string | null;
  minValue: unknown;
  maxValue: unknown;
  requiredForPublish: boolean;
  requiredForRecommendation: boolean;
  semanticKey: string | null;
  isProtected: boolean;
  status: "ACTIVE" | "ARCHIVED";
  sortOrder: number;
}): SpecificationFieldDefinition {
  return {
    ...field,
    unitFamily: field.unitFamily as UnitFamily,
    options: stringOptions(field.options),
    minValue: field.minValue == null ? null : Number(field.minValue),
    maxValue: field.maxValue == null ? null : Number(field.maxValue),
  };
}

export async function loadProductEditorOptions(): Promise<{
  categories: ProductCategoryOption[];
  accessories: AccessoryOption[];
}> {
  const [categoryRows, accessoryRows] = await Promise.all([
    prisma.productCategory.findMany({
      where: { status: "ACTIVE" },
      include: { fields: { where: { status: "ACTIVE" }, orderBy: { sortOrder: "asc" } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", categoryRelation: { is: { role: "ACCESSORY", status: "ACTIVE" } } },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return {
    categories: categoryRows.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      role: category.role,
      recommendationProfile: category.recommendationProfile,
      templateVersion: category.templateVersion,
      fields: category.fields.map(specificationField),
    })),
    accessories: accessoryRows.map((accessory) => ({
      id: accessory.id,
      name: accessory.name,
      model: accessory.model,
      price: Number(accessory.price),
      status: "PUBLISHED" as const,
      imageUrl: accessory.images[0]?.publicUrl ?? null,
    })),
  };
}
