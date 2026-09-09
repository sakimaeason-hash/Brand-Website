import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { MANUAL_REQUIRED_SEMANTICS, POWERED_REQUIRED_SEMANTICS, SEMANTIC_FIELDS } from "./semantic-fields";
import { categoryInputSchema, protectedFieldForSemantic, slugifyCategoryName, type CategoryInput } from "./category-validation";

type CategoryDb = Pick<PrismaClient, "productCategory" | "product" | "specificationField"> & {
  $transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
};

function hasProvidedSpecification(specifications: unknown, key: string): boolean {
  if (!specifications || typeof specifications !== "object" || Array.isArray(specifications)) return false;
  const value = (specifications as Record<string, any>)[key];
  return value?.status === "PROVIDED" || value?.status === "CONFLICTING";
}

export class CatalogServiceError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = code === "CONCURRENT_UPDATE" ? 409 : code === "SLUG_CONFLICT" ? 409 : 400, public readonly fields: unknown[] = []) {
    super(message);
    this.name = "CatalogServiceError";
  }
}

function normalizeInput(input: CategoryInput): CategoryInput & { slug: string; role: "PRODUCT" | "ACCESSORY"; recommendationProfile: "NONE" | "POWERED_WHEELCHAIR" | "MANUAL_WHEELCHAIR" } {
  const parsed = categoryInputSchema.parse(input);
  const role = parsed.role ?? "PRODUCT";
  const recommendationProfile = parsed.recommendationProfile ?? "NONE";
  if (role === "ACCESSORY" && recommendationProfile !== "NONE") {
    throw new CatalogServiceError("INVALID_RECOMMENDATION_PROFILE", "Accessory categories cannot enter wheelchair recommendations.");
  }
  const slug = slugifyCategoryName(parsed.slug || parsed.name);
  if (!slug) throw new CatalogServiceError("INVALID_SLUG", "Category slug cannot be empty.");
  const seen = new Set<string>();
  for (const field of parsed.fields) {
    if (seen.has(field.key)) throw new CatalogServiceError("DUPLICATE_FIELD", `Duplicate field key: ${field.key}.`);
    seen.add(field.key);
    if (field.semanticKey && !protectedFieldForSemantic(field.semanticKey)) throw new CatalogServiceError("UNKNOWN_SEMANTIC", `Unknown semantic field: ${field.semanticKey}.`);
    if (field.isProtected || field.semanticKey) throw new CatalogServiceError("PROTECTED_FIELD", "Custom requests cannot define protected recommendation fields.");
    if (field.dataType !== "NUMBER" && (field.minValue != null || field.maxValue != null)) throw new CatalogServiceError("INVALID_FIELD", "Only numeric fields may define value bounds.");
  }
  return { ...parsed, slug, role, recommendationProfile };
}

function protectedTemplate(profile: CategoryInput["recommendationProfile"]) {
  const required = profile === "POWERED_WHEELCHAIR" ? POWERED_REQUIRED_SEMANTICS : profile === "MANUAL_WHEELCHAIR" ? MANUAL_REQUIRED_SEMANTICS : [];
  return required.map((entry, index) => {
    const semantic = SEMANTIC_FIELDS[entry.semanticKey];
    return {
      key: entry.semanticKey,
      label: entry.semanticKey,
      group: entry.role === "hardFilter" ? "Fit & seating" : entry.role === "exactFit" ? "Fit & seating" : "Recommendation data",
      scope: "VARIANT" as const,
      dataType: semantic.dataType,
      unitFamily: semantic.unitFamily,
      defaultDisplayUnit: semantic.canonicalUnit,
      options: entry.semanticKey === "tireClass" ? ["pneumatic", "solid", "foam-filled"] : entry.semanticKey === "propulsionType" ? ["self-propelled", "transport", "attendant-propelled"] : [],
      helpText: null,
      minValue: null,
      maxValue: null,
      requiredForPublish: false,
      requiredForRecommendation: true,
      semanticKey: entry.semanticKey,
      isProtected: true,
      status: "ACTIVE" as const,
      sortOrder: index,
    };
  });
}

function mergedFields(input: ReturnType<typeof normalizeInput>) {
  const protectedFields = protectedTemplate(input.recommendationProfile);
  const customByKey = new Map(input.fields.map((field) => [field.key, field]));
  return [...protectedFields, ...input.fields.filter((field) => !protectedFields.some((protectedField) => protectedField.key === field.key))].map((field) => {
    const custom = customByKey.get(field.key);
    if (custom && !field.isProtected) {
      return {
        ...field,
        ...custom,
        options: custom.options ?? [],
        helpText: custom.helpText ?? null,
        minValue: custom.minValue ?? null,
        maxValue: custom.maxValue ?? null,
        requiredForPublish: custom.requiredForPublish ?? false,
        requiredForRecommendation: custom.requiredForRecommendation ?? false,
        semanticKey: null,
        isProtected: false,
        status: custom.status ?? "ACTIVE",
        sortOrder: custom.sortOrder ?? field.sortOrder,
      };
    }
    return field;
  });
}

function categoryData(input: ReturnType<typeof normalizeInput>) {
  return {
    name: input.name.trim(),
    slug: input.slug,
    description: input.description?.trim() || null,
    role: input.role,
    recommendationProfile: input.recommendationProfile,
    sortOrder: input.sortOrder ?? 0,
  };
}

export async function listAdminCategories(client: CategoryDb = prisma) {
  return client.productCategory.findMany({
    include: { fields: { orderBy: { sortOrder: "asc" } }, _count: { select: { products: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function createCategory(input: CategoryInput, client: CategoryDb = prisma) {
  const normalized = normalizeInput(input);
  const duplicate = await client.productCategory.findUnique({ where: { slug: normalized.slug } });
  if (duplicate) throw new CatalogServiceError("SLUG_CONFLICT", "A category with this slug already exists.");
  return client.$transaction(async (tx) => {
    const category = await tx.productCategory.create({ data: { ...categoryData(normalized), templateVersion: 1 } });
    for (const field of mergedFields(normalized)) await tx.specificationField.create({ data: { categoryId: category.id, ...field } });
    const result = await tx.productCategory.findUnique({ where: { id: category.id }, include: { fields: { orderBy: { sortOrder: "asc" } }, _count: { select: { products: true } } } });
    if (!result) throw new CatalogServiceError("NOT_FOUND", "Created category could not be reloaded.", 500);
    return result;
  });
}

function assertProtectedField(existing: any, incoming: any) {
  if (!existing.isProtected && !existing.semanticKey) return;
  if (incoming.dataType !== existing.dataType || incoming.unitFamily !== existing.unitFamily || incoming.semanticKey !== existing.semanticKey || incoming.scope !== existing.scope) {
    throw new CatalogServiceError("PROTECTED_FIELD", "Protected recommendation fields cannot be changed.");
  }
}

export async function updateCategory(id: string, input: CategoryInput, updatedAt: string, client: CategoryDb = prisma) {
  const existing = await client.productCategory.findUnique({ where: { id }, include: { fields: true } });
  if (!existing) throw new CatalogServiceError("NOT_FOUND", "Category not found.", 404);
  if (existing.updatedAt.getTime() !== new Date(updatedAt).getTime()) throw new CatalogServiceError("CONCURRENT_UPDATE", "Category was changed by another editor.");
  const protectedByKey = new Map((existing.fields as any[]).filter((field) => field.isProtected).map((field) => [field.key, field]));
  for (const incoming of input.fields) {
    const protectedField = protectedByKey.get(incoming.key);
    if (protectedField && (incoming.dataType !== protectedField.dataType || incoming.unitFamily !== protectedField.unitFamily || incoming.scope !== protectedField.scope)) {
      throw new CatalogServiceError("PROTECTED_FIELD", "Protected recommendation fields cannot be changed.");
    }
  }
  const normalized = normalizeInput({
    ...input,
    slug: input.slug ?? existing.slug,
    role: input.role ?? existing.role,
    recommendationProfile: input.recommendationProfile ?? existing.recommendationProfile,
  });
  const duplicate = await client.productCategory.findUnique({ where: { slug: normalized.slug } });
  if (duplicate && duplicate.id !== id) throw new CatalogServiceError("SLUG_CONFLICT", "A category with this slug already exists.");
  const incomingFields = mergedFields(normalized);
  const existingRequiredKeys = new Set((existing.fields as any[]).filter((field) => field.requiredForPublish && field.status === "ACTIVE").map((field) => field.key));
  const requiredFields = incomingFields.filter((field) => field.requiredForPublish && field.status === "ACTIVE" && !existingRequiredKeys.has(field.key));
  if (requiredFields.length > 0) {
    const publishedProducts = await client.product.findMany({
      where: { categoryId: id, status: "PUBLISHED" },
      include: { variants: true },
    });
    const errors: Array<{ fieldKey: string; productId: string; variantId?: string; message: string }> = [];
    for (const product of publishedProducts as any[]) {
      for (const field of requiredFields.filter((candidate) => candidate.scope === "PRODUCT")) {
        if (!hasProvidedSpecification(product.specifications, field.key)) {
          errors.push({ fieldKey: field.key, productId: product.id, message: "Published product is missing this required field." });
        }
      }
      for (const variant of (product.variants ?? []).filter((item: any) => item.isActive)) {
        for (const field of requiredFields.filter((candidate) => candidate.scope === "VARIANT")) {
          if (!hasProvidedSpecification(variant.specifications, field.key)) {
            errors.push({ fieldKey: field.key, productId: product.id, variantId: variant.id, message: "Published SKU is missing this required field." });
          }
        }
      }
    }
    if (errors.length > 0) throw new CatalogServiceError("PUBLISHED_DATA_INCOMPLETE", "Published products must be completed before this field becomes required.", 400, errors);
  }
  for (const field of existing.fields) {
    const incoming = incomingFields.find((candidate) => candidate.key === field.key);
    if (!incoming && field.isProtected) throw new CatalogServiceError("PROTECTED_FIELD", "Protected recommendation fields cannot be removed.");
    if (incoming) assertProtectedField(field, incoming);
  }
  return client.$transaction(async (tx) => {
    const updateResult = await tx.productCategory.updateMany({
      where: { id, updatedAt: existing.updatedAt },
      data: { ...categoryData(normalized), templateVersion: { increment: 1 } },
    });
    if (updateResult.count !== 1) throw new CatalogServiceError("CONCURRENT_UPDATE", "Category was changed by another editor.");
    const category = await tx.productCategory.findUnique({ where: { id } });
    if (!category) throw new CatalogServiceError("NOT_FOUND", "Category not found.", 404);
    for (const field of incomingFields) {
      const current = existing.fields.find((item: any) => item.key === field.key);
      if (current) await tx.specificationField.update({ where: { id: current.id }, data: field });
      else await tx.specificationField.create({ data: { categoryId: id, ...field } });
    }
    for (const field of existing.fields) {
      if (!incomingFields.some((candidate) => candidate.key === field.key) && !field.isProtected) await tx.specificationField.update({ where: { id: field.id }, data: { status: "ARCHIVED" } });
    }
    const result = await tx.productCategory.findUnique({ where: { id: category.id }, include: { fields: { orderBy: { sortOrder: "asc" } }, _count: { select: { products: true } } } });
    if (!result) throw new CatalogServiceError("NOT_FOUND", "Updated category could not be reloaded.", 500);
    return result;
  });
}

export async function archiveCategory(id: string, updatedAt: string, client: CategoryDb = prisma) {
  const existing = await client.productCategory.findUnique({ where: { id } });
  if (!existing) throw new CatalogServiceError("NOT_FOUND", "Category not found.", 404);
  if (existing.updatedAt.getTime() !== new Date(updatedAt).getTime()) throw new CatalogServiceError("CONCURRENT_UPDATE", "Category was changed by another editor.");
  const result = await client.productCategory.updateMany({
    where: { id, updatedAt: existing.updatedAt },
    data: { status: "ARCHIVED" },
  });
  if (result.count !== 1) throw new CatalogServiceError("CONCURRENT_UPDATE", "Category was changed by another editor.");
  const archived = await client.productCategory.findUnique({ where: { id }, include: { fields: { orderBy: { sortOrder: "asc" } }, _count: { select: { products: true } } } });
  if (!archived) throw new CatalogServiceError("NOT_FOUND", "Category not found.", 404);
  return archived;
}
