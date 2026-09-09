import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { MANUAL_REQUIRED_SEMANTICS, POWERED_REQUIRED_SEMANTICS, SEMANTIC_FIELDS } from "./semantic-fields";
import { categoryInputSchema, protectedFieldForSemantic, slugifyCategoryName, type CategoryInput } from "./category-validation";
import { normalizeSpecification } from "./specifications";
import type { SpecificationFieldDefinition, SpecificationInput, StoredSpecification } from "./types";

type CategoryDb = Pick<PrismaClient, "productCategory" | "product" | "specificationField"> & {
  $transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
};

function hasValidProvidedSpecification(specifications: unknown, field: any): boolean {
  if (!specifications || typeof specifications !== "object" || Array.isArray(specifications)) return false;
  const value = (specifications as Record<string, StoredSpecification | undefined>)[field.key];
  if (value?.status !== "PROVIDED" || value.value == null) return false;
  try {
    const definition: SpecificationFieldDefinition = {
      ...field,
      options: Array.isArray(field.options) ? field.options : [],
      minValue: field.minValue == null ? null : Number(field.minValue),
      maxValue: field.maxValue == null ? null : Number(field.maxValue),
    };
    const input: SpecificationInput = value.inputValue !== undefined
      ? { ...value, value: value.inputValue, unit: value.inputUnit ?? value.unit }
      : value;
    const normalized = normalizeSpecification(definition, input);
    return normalized.status === "PROVIDED" && (typeof normalized.value !== "string" || normalized.value.trim().length > 0);
  } catch {
    return false;
  }
}

function sameNullableNumber(incoming: number | null, existing: unknown): boolean {
  if (incoming === null || existing == null) return incoming === null && existing == null;
  return Number(incoming) === Number(existing);
}

export class CatalogServiceError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = code === "CONCURRENT_UPDATE" ? 409 : code === "SLUG_CONFLICT" ? 409 : 400, public readonly fields: unknown[] = []) {
    super(message);
    this.name = "CatalogServiceError";
  }
}

function expectedDate(value: string): Date {
  const date = new Date(value);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) || !Number.isFinite(date.getTime()) || date.toISOString() !== value) {
    throw new CatalogServiceError("INVALID_UPDATED_AT", "updatedAt must be a valid ISO timestamp.");
  }
  return date;
}

function mapCategoryWriteError(error: unknown): never {
  if (error instanceof CatalogServiceError) throw error;
  if (error && typeof error === "object" && (error as { code?: unknown }).code === "P2002") {
    const target = (error as { meta?: { target?: unknown } }).meta?.target;
    const fields = Array.isArray(target) ? target.map(String) : typeof target === "string" ? [target] : [];
    if (fields.some((field) => field.toLowerCase().includes("slug"))) {
      throw new CatalogServiceError("SLUG_CONFLICT", "A category with this slug already exists.", 409);
    }
    throw new CatalogServiceError("FIELD_CONFLICT", "A specification field with this key or semantic already exists.", 409);
  }
  throw error;
}

function normalizeInput(input: CategoryInput, allowProtectedFields = false): CategoryInput & { slug: string; role: "PRODUCT" | "ACCESSORY"; recommendationProfile: "NONE" | "POWERED_WHEELCHAIR" | "MANUAL_WHEELCHAIR" } {
  let parsed: CategoryInput;
  try {
    parsed = categoryInputSchema.parse(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid category template.";
    throw new CatalogServiceError("INVALID_FIELD", message, 400, error && typeof error === "object" && "issues" in error ? (error as { issues: unknown[] }).issues : []);
  }
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
    if (!allowProtectedFields && (field.isProtected || field.semanticKey)) throw new CatalogServiceError("PROTECTED_FIELD", "Custom requests cannot define protected recommendation fields.");
    if (allowProtectedFields && field.semanticKey && !field.isProtected) throw new CatalogServiceError("PROTECTED_FIELD", "Semantic fields must remain protected.");
    if (!["NUMBER", "DIMENSIONS"].includes(field.dataType) && (field.minValue != null || field.maxValue != null)) throw new CatalogServiceError("INVALID_FIELD", "Only numeric or dimension fields may define value bounds.");
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

function persistedProtectedField(field: any) {
  return {
    key: field.key,
    label: field.label,
    group: field.group,
    scope: field.scope,
    dataType: field.dataType,
    unitFamily: field.unitFamily,
    defaultDisplayUnit: field.defaultDisplayUnit ?? null,
    options: Array.isArray(field.options) ? field.options : [],
    helpText: field.helpText ?? null,
    minValue: field.minValue ?? null,
    maxValue: field.maxValue ?? null,
    requiredForPublish: field.requiredForPublish,
    requiredForRecommendation: field.requiredForRecommendation,
    semanticKey: field.semanticKey,
    isProtected: true,
    status: "ACTIVE" as const,
    sortOrder: field.sortOrder,
  };
}

function mergeProtectedFields(existingFields: any[], requestedFields: CategoryInput["fields"], incomingFields: ReturnType<typeof mergedFields>) {
  const existingByKey = new Map(existingFields.filter((field) => field.isProtected).map((field) => [field.key, field]));
  const requestedByKey = new Map(requestedFields.map((field) => [field.key, field]));
  const merged = incomingFields.map((field) => {
    const existing = existingByKey.get(field.key);
    if (!existing || !field.isProtected) return field;
    const requested = requestedByKey.get(field.key);
    const persisted = persistedProtectedField(existing);
    return {
      ...persisted,
      label: requested?.label ?? persisted.label,
      helpText: requested && Object.prototype.hasOwnProperty.call(requested, "helpText") ? requested.helpText ?? null : persisted.helpText,
      sortOrder: requested?.sortOrder ?? persisted.sortOrder,
    };
  });
  const mergedKeys = new Set(merged.map((field) => field.key));
  for (const existing of Array.from(existingByKey.values())) {
    if (!mergedKeys.has(existing.key)) merged.push(persistedProtectedField(existing));
  }
  return merged;
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
  try {
    return await client.$transaction(async (tx) => {
      const category = await tx.productCategory.create({ data: { ...categoryData(normalized), templateVersion: 1 } });
      for (const field of mergedFields(normalized)) {
        const data = { ...field } as Record<string, unknown>;
        delete data.id;
        await tx.specificationField.create({ data: { categoryId: category.id, ...data } as Prisma.SpecificationFieldUncheckedCreateInput });
      }
      const result = await tx.productCategory.findUnique({ where: { id: category.id }, include: { fields: { orderBy: { sortOrder: "asc" } }, _count: { select: { products: true } } } });
      if (!result) throw new CatalogServiceError("NOT_FOUND", "Created category could not be reloaded.", 500);
      return result;
    });
  } catch (error) { mapCategoryWriteError(error); }
}

function assertProtectedField(existing: any, incoming: any) {
  if (!existing.isProtected && !existing.semanticKey) return;
  const immutableChanged =
    incoming.dataType !== existing.dataType ||
    incoming.unitFamily !== existing.unitFamily ||
    incoming.scope !== existing.scope ||
    (incoming.semanticKey !== undefined && incoming.semanticKey !== existing.semanticKey) ||
    (incoming.isProtected !== undefined && incoming.isProtected !== true) ||
    (incoming.status !== undefined && incoming.status !== "ACTIVE") ||
    (incoming.defaultDisplayUnit !== undefined && incoming.defaultDisplayUnit !== existing.defaultDisplayUnit) ||
    (incoming.group !== undefined && incoming.group !== existing.group) ||
    (incoming.requiredForPublish !== undefined && incoming.requiredForPublish !== existing.requiredForPublish) ||
    (incoming.requiredForRecommendation !== undefined && incoming.requiredForRecommendation !== existing.requiredForRecommendation) ||
    (incoming.minValue !== undefined && !sameNullableNumber(incoming.minValue, existing.minValue)) ||
    (incoming.maxValue !== undefined && !sameNullableNumber(incoming.maxValue, existing.maxValue)) ||
    (incoming.options !== undefined && JSON.stringify(incoming.options) !== JSON.stringify(existing.options));
  if (immutableChanged) {
    throw new CatalogServiceError("PROTECTED_FIELD", "Protected recommendation fields cannot be changed.");
  }
}

export async function updateCategory(id: string, input: CategoryInput, updatedAt: string, client: CategoryDb = prisma) {
  const existing = await client.productCategory.findUnique({ where: { id }, include: { fields: true } });
  if (!existing) throw new CatalogServiceError("NOT_FOUND", "Category not found.", 404);
  if (existing.updatedAt.getTime() !== expectedDate(updatedAt).getTime()) throw new CatalogServiceError("CONCURRENT_UPDATE", "Category was changed by another editor.");
  const requestedProfile = input.recommendationProfile ?? existing.recommendationProfile;
  if (requestedProfile !== existing.recommendationProfile && existing.fields.some((field) => field.isProtected || field.semanticKey)) {
    throw new CatalogServiceError("RECOMMENDATION_PROFILE_LOCKED", "Recommendation profile cannot be changed after protected fields have been established.");
  }
  const protectedByKey = new Map((existing.fields as any[]).filter((field) => field.isProtected).map((field) => [field.key, field]));
  for (const incoming of input.fields) {
    const protectedField = protectedByKey.get(incoming.key);
    if ((incoming.isProtected || incoming.semanticKey) && !protectedField) throw new CatalogServiceError("PROTECTED_FIELD", "Only existing recommendation fields may be submitted as protected.");
    if (protectedField) assertProtectedField(protectedField, incoming);
  }
  const normalized = normalizeInput({
    ...input,
    slug: input.slug ?? existing.slug,
    role: input.role ?? existing.role,
    recommendationProfile: requestedProfile,
  }, true);
  const duplicate = await client.productCategory.findUnique({ where: { slug: normalized.slug } });
  if (duplicate && duplicate.id !== id) throw new CatalogServiceError("SLUG_CONFLICT", "A category with this slug already exists.");
  const incomingFields = mergeProtectedFields(existing.fields as any[], normalized.fields, mergedFields(normalized));
  for (const field of existing.fields) {
    const incoming = incomingFields.find((candidate) => candidate.key === field.key);
    if (!incoming && field.isProtected) throw new CatalogServiceError("PROTECTED_FIELD", "Protected recommendation fields cannot be removed.");
    if (incoming) assertProtectedField(field, incoming);
  }
  try { return await client.$transaction(async (tx) => {
    const existingRequiredKeys = new Set((existing.fields as any[]).filter((field) => (field.requiredForPublish || field.requiredForRecommendation) && field.status === "ACTIVE").map((field) => field.key));
    const requiredFields = incomingFields.filter((field) => (field.requiredForPublish || field.requiredForRecommendation) && field.status === "ACTIVE" && !existingRequiredKeys.has(field.key));
    if (requiredFields.length > 0) {
      const publishedProducts = await tx.product.findMany({ where: { categoryId: id, status: "PUBLISHED" }, include: { variants: true } });
      const errors: Array<{ fieldKey: string; productId: string; variantId?: string; message: string }> = [];
      for (const product of publishedProducts as any[]) {
        for (const field of requiredFields.filter((candidate) => candidate.scope === "PRODUCT")) {
          if (!hasValidProvidedSpecification(product.specifications, field)) errors.push({ fieldKey: field.key, productId: product.id, message: "Published product is missing this required field." });
        }
        for (const variant of (product.variants ?? []).filter((item: any) => item.isActive)) {
          for (const field of requiredFields.filter((candidate) => candidate.scope === "VARIANT")) {
            if (!hasValidProvidedSpecification(variant.specifications, field)) errors.push({ fieldKey: field.key, productId: product.id, variantId: variant.id, message: "Published SKU is missing this required field." });
          }
        }
      }
      if (errors.length > 0) throw new CatalogServiceError("PUBLISHED_DATA_INCOMPLETE", "Published products must be completed before this field becomes required.", 400, errors);
    }
    const updateResult = await tx.productCategory.updateMany({
      where: { id, updatedAt: existing.updatedAt },
      data: { ...categoryData(normalized), templateVersion: { increment: 1 } },
    });
    if (updateResult.count !== 1) throw new CatalogServiceError("CONCURRENT_UPDATE", "Category was changed by another editor.");
    const category = await tx.productCategory.findUnique({ where: { id } });
    if (!category) throw new CatalogServiceError("NOT_FOUND", "Category not found.", 404);
    for (const field of incomingFields) {
      const current = existing.fields.find((item: any) => item.key === field.key);
      const data = { ...field } as Record<string, unknown>;
      delete data.id;
      if (current) await tx.specificationField.update({ where: { id: current.id }, data: data as Prisma.SpecificationFieldUpdateInput });
      else await tx.specificationField.create({ data: { categoryId: id, ...data } as Prisma.SpecificationFieldUncheckedCreateInput });
    }
    for (const field of existing.fields) {
      if (!incomingFields.some((candidate) => candidate.key === field.key) && !field.isProtected) await tx.specificationField.update({ where: { id: field.id }, data: { status: "ARCHIVED" } });
    }
    const result = await tx.productCategory.findUnique({ where: { id: category.id }, include: { fields: { orderBy: { sortOrder: "asc" } }, _count: { select: { products: true } } } });
    if (!result) throw new CatalogServiceError("NOT_FOUND", "Updated category could not be reloaded.", 500);
    return result;
  }); } catch (error) { mapCategoryWriteError(error); }
}

export async function archiveCategory(id: string, updatedAt: string, client: CategoryDb = prisma) {
  const existing = await client.productCategory.findUnique({ where: { id } });
  if (!existing) throw new CatalogServiceError("NOT_FOUND", "Category not found.", 404);
  if (existing.updatedAt.getTime() !== expectedDate(updatedAt).getTime()) throw new CatalogServiceError("CONCURRENT_UPDATE", "Category was changed by another editor.");
  return client.$transaction(async (tx) => {
    const result = await tx.productCategory.updateMany({ where: { id, updatedAt: existing.updatedAt }, data: { status: "ARCHIVED" } });
    if (result.count !== 1) throw new CatalogServiceError("CONCURRENT_UPDATE", "Category was changed by another editor.");
    const archived = await tx.productCategory.findUnique({ where: { id }, include: { fields: { orderBy: { sortOrder: "asc" } }, _count: { select: { products: true } } } });
    if (!archived) throw new CatalogServiceError("NOT_FOUND", "Category not found.", 404);
    return archived;
  });
}
