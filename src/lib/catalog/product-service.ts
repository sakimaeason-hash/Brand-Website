import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { CatalogServiceError } from "./category-service";
import { normalizeProductInput, type ProductAggregateInput } from "./product-validation";
import { validateForPublish, type ProductForPublish } from "./publish-validation";
import { normalizeSpecificationMap } from "./specifications";
import type { SpecificationFieldDefinition } from "./types";

type ProductClient = Pick<
  PrismaClient,
  "product" | "productCategory" | "productVariant" | "productInBoxItem" | "productAccessory"
>;

type ProductDb = ProductClient & {
  $transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
};

function mapProductWriteError(error: unknown): never {
  if (error instanceof CatalogServiceError) throw error;
  if (error && typeof error === "object" && (error as { code?: unknown }).code === "P2002") {
    const target = (error as { meta?: { target?: unknown } }).meta?.target;
    const fields = Array.isArray(target) ? target.map(String) : typeof target === "string" ? [target] : [];
    if (fields.some((field) => field.toLowerCase().includes("sku"))) {
      throw new CatalogServiceError("SKU_CONFLICT", "An SKU with this value already exists.", 409);
    }
    throw new CatalogServiceError("CATALOG_CONFLICT", "The product conflicts with existing catalog data.", 409);
  }
  throw error;
}

function productData(input: ProductAggregateInput, status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED") {
  return {
    name: input.name,
    model: input.model,
    category: input.category,
    categoryId: input.categoryId,
    categoryTemplateVersion: input.categoryTemplateVersion,
    tagline: input.tagline ?? null,
    description: input.description ?? null,
    price: input.price,
    originalPrice: input.originalPrice ?? null,
    amazonLink: input.amazonLink ?? null,
    weightCapacity: input.weightCapacity ?? null,
    seatWidth: input.seatWidth ?? null,
    range: input.range ?? null,
    maxSpeed: input.maxSpeed ?? null,
    productWeight: input.productWeight ?? null,
    features: input.features,
    specifications: input.specifications,
    isFeatured: input.isFeatured,
    sortOrder: input.sortOrder,
    status,
  };
}

function specificationFields(fields: readonly any[]): SpecificationFieldDefinition[] {
  return fields.map((field) => ({
    ...field,
    options: Array.isArray(field.options) ? field.options : [],
    minValue: field.minValue == null ? null : Number(field.minValue),
    maxValue: field.maxValue == null ? null : Number(field.maxValue),
  }));
}

async function loadActiveCategory(client: ProductClient, categoryId: string, templateVersion: number) {
  const category = await client.productCategory.findUnique({
    where: { id: categoryId },
    include: { fields: { where: { status: "ACTIVE" }, orderBy: { sortOrder: "asc" } } },
  });
  if (!category || category.status !== "ACTIVE") {
    throw new CatalogServiceError("CATEGORY_NOT_FOUND", "Active product category not found.", 400);
  }
  if (category.templateVersion !== templateVersion) {
    throw new CatalogServiceError("TEMPLATE_OUTDATED", "Product category template has changed; reload before saving.", 409);
  }
  return { ...category, fields: specificationFields(category.fields) };
}

function normalizedAggregate(input: ProductAggregateInput, category: { fields: readonly SpecificationFieldDefinition[] }) {
  return {
    ...input,
    specifications: normalizeSpecificationMap(category.fields, input.specifications, "PRODUCT"),
    variants: input.variants.map((variant) => ({
      ...variant,
      specifications: normalizeSpecificationMap(category.fields, variant.specifications, "VARIANT"),
    })),
  };
}

function assertVersion(actual: Date, expected: string) {
  const date = new Date(expected);
  if (!Number.isFinite(date.getTime()) || actual.getTime() !== date.getTime()) {
    throw new CatalogServiceError("CONCURRENT_UPDATE", "Product was changed by another editor.", 409);
  }
}

async function assertSkuAvailability(tx: ProductClient, productId: string | null, variants: ProductAggregateInput["variants"]) {
  for (const variant of variants) {
    const existing = await tx.productVariant.findUnique({ where: { sku: variant.sku } });
    if (existing && (existing.productId !== productId || existing.id !== variant.id)) {
      throw new CatalogServiceError("SKU_CONFLICT", `SKU ${variant.sku} is already used by another variant.`, 409);
    }
  }
}

async function assertAccessories(tx: ProductClient, productId: string | null, accessoryProductIds: readonly string[]) {
  if (productId && accessoryProductIds.includes(productId)) {
    throw new CatalogServiceError("INVALID_ACCESSORY", "A product cannot be compatible with itself.", 400);
  }
  if (accessoryProductIds.length === 0) return;
  const products = await tx.product.findMany({
    where: { id: { in: [...accessoryProductIds] } },
    select: { id: true, status: true, categoryRelation: { select: { role: true } } },
  });
  const validIds = new Set(products
    .filter((product) => product.status === "PUBLISHED" && product.categoryRelation?.role === "ACCESSORY")
    .map((product) => product.id));
  if (accessoryProductIds.some((id) => !validIds.has(id))) {
    throw new CatalogServiceError("INVALID_ACCESSORY", "Compatible accessories must be published accessory products.", 400);
  }
}

async function writeVariants(tx: ProductClient, productId: string, input: ReturnType<typeof normalizedAggregate>) {
  const existingVariants = await tx.productVariant.findMany({ where: { productId }, select: { id: true } });
  const existingIds = new Set(existingVariants.map((variant) => variant.id));
  const retainedIds = new Set<string>();
  for (const variant of input.variants) {
    if (variant.id && !variant.id.startsWith("client-") && !existingIds.has(variant.id)) {
      throw new CatalogServiceError("VARIANT_OWNERSHIP", "SKU does not belong to this product.", 400, [{ tab: "variants", variantId: variant.id, fieldKey: "sku", message: "SKU does not belong to this product" }]);
    }
    if (variant.id && !variant.id.startsWith("client-")) retainedIds.add(variant.id);
  }
  await assertSkuAvailability(tx, productId, input.variants);

  for (let index = 0; index < input.variants.length; index += 1) {
    const variant = input.variants[index];
    const data = {
      productId,
      sku: variant.sku,
      factoryModel: variant.factoryModel ?? null,
      label: variant.label ?? null,
      colorName: variant.colorName ?? null,
      colorHex: variant.colorHex ?? null,
      priceOverride: variant.priceOverride ?? null,
      originalPriceOverride: variant.originalPriceOverride ?? null,
      purchaseLinkOverride: variant.purchaseLinkOverride ?? null,
      specifications: variant.specifications,
      isActive: variant.isActive,
      sortOrder: variant.sortOrder ?? index,
    };
    if (variant.id && !variant.id.startsWith("client-")) {
      await tx.productVariant.update({ where: { id: variant.id }, data });
    } else {
      await tx.productVariant.create({ data });
    }
  }
  for (const variant of existingVariants) {
    if (!retainedIds.has(variant.id)) await tx.productVariant.delete({ where: { id: variant.id } });
  }
}

async function writeInBoxItems(tx: ProductClient, productId: string, items: ReturnType<typeof normalizedAggregate>["inBoxItems"]) {
  const existingItems = await tx.productInBoxItem.findMany({ where: { productId }, select: { id: true } });
  const existingIds = new Set(existingItems.map((item) => item.id));
  const retainedIds = new Set<string>();
  for (const item of items) {
    if (item.id && !existingIds.has(item.id)) {
      throw new CatalogServiceError("IN_BOX_OWNERSHIP", "In-the-box item does not belong to this product.", 400);
    }
    if (item.id) retainedIds.add(item.id);
  }
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const data = { productId, name: item.name, quantity: item.quantity, note: item.note ?? null, sortOrder: item.sortOrder ?? index };
    if (item.id) await tx.productInBoxItem.update({ where: { id: item.id }, data });
    else await tx.productInBoxItem.create({ data });
  }
  for (const item of existingItems) {
    if (!retainedIds.has(item.id)) await tx.productInBoxItem.delete({ where: { id: item.id } });
  }
}

async function writeAccessories(tx: ProductClient, productId: string, accessoryProductIds: readonly string[]) {
  await tx.productAccessory.deleteMany({ where: { productId } });
  for (let index = 0; index < accessoryProductIds.length; index += 1) {
    await tx.productAccessory.create({ data: { productId, accessoryProductId: accessoryProductIds[index], sortOrder: index } });
  }
}

async function writeRelations(tx: ProductClient, productId: string, input: ReturnType<typeof normalizedAggregate>) {
  await writeVariants(tx, productId, input);
  await writeInBoxItems(tx, productId, input.inBoxItems);
  await writeAccessories(tx, productId, input.accessoryProductIds);
}

async function loadAggregate(client: ProductClient, id: string): Promise<any> {
  return client.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
      inBoxItems: { orderBy: { sortOrder: "asc" } },
      compatibleAccessories: {
        orderBy: { sortOrder: "asc" },
        include: { accessoryProduct: { select: { id: true, status: true, categoryRelation: { select: { role: true } } } } },
      },
      images: { orderBy: { sortOrder: "asc" } },
      categoryRelation: { include: { fields: { where: { status: "ACTIVE" }, orderBy: { sortOrder: "asc" } } } },
    },
  });
}

export async function createProductDraft(input: ProductAggregateInput, client: ProductDb = prisma) {
  const parsed = normalizeProductInput(input);
  try {
    return await client.$transaction(async (tx) => {
      const category = await loadActiveCategory(tx, parsed.categoryId, parsed.categoryTemplateVersion);
      const aggregate = normalizedAggregate(parsed, category);
      await assertSkuAvailability(tx, null, aggregate.variants);
      await assertAccessories(tx, null, aggregate.accessoryProductIds);
      const created = await tx.product.create({ data: productData(aggregate, "DRAFT") });
      await writeRelations(tx, created.id, aggregate);
      const result = await loadAggregate(tx, created.id);
      if (!result) throw new CatalogServiceError("NOT_FOUND", "Created product could not be reloaded.", 500);
      return result;
    });
  } catch (error) {
    mapProductWriteError(error);
  }
}

export async function saveProductDraft(id: string, input: ProductAggregateInput, expectedUpdatedAt: string, client: ProductDb = prisma) {
  const parsed = normalizeProductInput(input);
  try {
    return await client.$transaction(async (tx) => {
      const existing = await loadAggregate(tx, id);
      if (!existing) throw new CatalogServiceError("NOT_FOUND", "Product not found.", 404);
      assertVersion(existing.updatedAt, expectedUpdatedAt);
      const category = await loadActiveCategory(tx, parsed.categoryId, parsed.categoryTemplateVersion);
      const aggregate = normalizedAggregate(parsed, category);
      await assertAccessories(tx, id, aggregate.accessoryProductIds);
      await writeRelations(tx, id, aggregate);
      const result = await tx.product.updateMany({ where: { id, updatedAt: existing.updatedAt }, data: productData(aggregate, "DRAFT") });
      if (result.count !== 1) throw new CatalogServiceError("CONCURRENT_UPDATE", "Product was changed by another editor.", 409);
      const reloaded = await loadAggregate(tx, id);
      if (!reloaded) throw new CatalogServiceError("NOT_FOUND", "Product could not be reloaded.", 500);
      return reloaded;
    });
  } catch (error) {
    mapProductWriteError(error);
  }
}

async function changeStatus(id: string, expectedUpdatedAt: string, status: "PUBLISHED" | "UNPUBLISHED", client: ProductDb) {
  try {
    return await client.$transaction(async (tx) => {
      const existing = await loadAggregate(tx, id);
      if (!existing || !existing.categoryId) throw new CatalogServiceError("NOT_FOUND", "Product not found.", 404);
      assertVersion(existing.updatedAt, expectedUpdatedAt);
      if (status === "PUBLISHED") {
        const category = await loadActiveCategory(tx, existing.categoryId, existing.categoryTemplateVersion);
        const errors = validateForPublish(existing as ProductForPublish, category, {
          accessoryProducts: existing.compatibleAccessories.flatMap((relation: any) => relation.accessoryProduct ? [{
            id: relation.accessoryProduct.id,
            status: relation.accessoryProduct.status,
            role: relation.accessoryProduct.categoryRelation?.role,
          }] : []),
        });
        if (errors.length) throw new CatalogServiceError("PUBLISH_VALIDATION", "Publish validation failed", 400, errors);
      }
      const result = await tx.product.updateMany({ where: { id, updatedAt: existing.updatedAt }, data: { status } });
      if (result.count !== 1) throw new CatalogServiceError("CONCURRENT_UPDATE", "Product was changed by another editor.", 409);
      const updated = await loadAggregate(tx, id);
      if (!updated) throw new CatalogServiceError("NOT_FOUND", "Product could not be reloaded.", 500);
      return updated;
    });
  } catch (error) {
    mapProductWriteError(error);
  }
}

export function publishProduct(id: string, expectedUpdatedAt: string, client: ProductDb = prisma) {
  return changeStatus(id, expectedUpdatedAt, "PUBLISHED", client);
}

export function unpublishProduct(id: string, expectedUpdatedAt: string, client: ProductDb = prisma) {
  return changeStatus(id, expectedUpdatedAt, "UNPUBLISHED", client);
}
