import { describe, expect, it, vi } from "vitest";

import { products } from "./data/products";
import {
  buildCatalogMigrationPlan,
  migrateProductCatalog,
} from "../scripts/migrate-product-catalog";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  status: string;
  templateVersion: number;
};

type ProductRow = {
  id: string;
  name: string;
  model: string;
  amazonLink: string | null;
  categoryId?: string | null;
  categoryTemplateVersion?: number;
};

type VariantRow = Record<string, unknown> & {
  id: string;
  productId: string;
  sku: string;
};

function fakeMigrationDb(options: { categoriesSeeded?: boolean } = {}) {
  const categories: CategoryRow[] = options.categoriesSeeded
    ? [
        {
          id: "cat-powered",
          slug: "powered-wheelchairs",
          name: "Powered Wheelchairs",
          status: "ACTIVE",
          templateVersion: 1,
        },
        {
          id: "cat-scooters",
          slug: "mobility-scooters",
          name: "Mobility Scooters",
          status: "ACTIVE",
          templateVersion: 1,
        },
      ]
    : [];
  const fields: Array<Record<string, unknown>> = [];
  const productRows: ProductRow[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    model: product.name,
    amazonLink: product.amazonLink ?? null,
  }));
  const variants: VariantRow[] = products
    .filter((product) => product.category === "wheelchair")
    .map((product) => ({
      id: `variant-legacy-${product.id}`,
      productId: product.id,
      sku: `LEGACY-${product.id.toUpperCase()}`,
      isActive: true,
    }));

  const productCategory = {
    findUnique: vi.fn(async ({ where }: { where: { slug: string } }) =>
      categories.find((category) => category.slug === where.slug) ?? null,
    ),
    upsert: vi.fn(
      async ({ where, create, update }: Record<string, any>) => {
        const existing = categories.find(
          (category) => category.slug === where.slug,
        );
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }
        const row = {
          ...create,
          id: `cat-${categories.length + 1}`,
        } as CategoryRow;
        categories.push(row);
        return row;
      },
    ),
  };
  const specificationField = {
    upsert: vi.fn(async ({ where, create, update }: Record<string, any>) => {
      const existing = fields.find(
        (field) =>
          field.categoryId === where.categoryId_key.categoryId &&
          field.key === where.categoryId_key.key,
      );
      if (existing) {
        Object.assign(existing, update);
        return existing;
      }
      const row = { ...create, id: `field-${fields.length + 1}` };
      fields.push(row);
      return row;
    }),
  };
  const product = {
    findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
      productRows.find((row) => row.id === where.id) ?? null,
    ),
    update: vi.fn(
      async ({ where, data }: { where: { id: string }; data: Partial<ProductRow> }) => {
        const row = productRows.find((productRow) => productRow.id === where.id);
        if (!row) throw new Error("missing product");
        Object.assign(row, data);
        return row;
      },
    ),
  };
  const productVariant = {
    findUnique: vi.fn(async ({ where }: { where: { sku: string } }) =>
      variants.find((variant) => variant.sku === where.sku) ?? null,
    ),
    upsert: vi.fn(
      async ({ where, create, update }: Record<string, any>) => {
        const existing = variants.find((variant) => variant.sku === where.sku);
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }
        const row = {
          ...create,
          id: `variant-${variants.length + 1}`,
        } as VariantRow;
        variants.push(row);
        return row;
      },
    ),
    updateMany: vi.fn(
      async ({ where, data }: Record<string, any>) => {
        const matching = variants.filter(
          (variant) =>
            variant.productId === where.productId && variant.sku === where.sku,
        );
        matching.forEach((variant) => Object.assign(variant, data));
        return { count: matching.length };
      },
    ),
  };
  const db = {
    categories,
    fields,
    productRows,
    variants,
    productCategory,
    specificationField,
    product,
    productVariant,
    $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback(db),
    ),
  };
  return db;
}

describe("product catalog migration mapping", () => {
  it("maps every official powered-wheelchair product and SKU", () => {
    const plan = buildCatalogMigrationPlan();
    const powered = plan.filter(
      (product) => product.categorySlug === "powered-wheelchairs",
    );
    const skus = powered.flatMap((product) =>
      product.variants.map((variant) => variant.sku),
    );

    expect(powered).toHaveLength(7);
    expect(skus).toHaveLength(17);
    expect(new Set(skus).size).toBe(skus.length);
    expect(powered.map((product) => product.productId)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
    ]);
  });

  it("preserves authoritative values, missing data, conflicts, and source notes", () => {
    const plan = buildCatalogMigrationPlan();
    const variants = plan.flatMap((product) => product.variants);
    const pa13 = variants.find((variant) => variant.sku === "PA13A100");
    const pa16k = variants.find((variant) => variant.sku === "PA16K100");
    const pa22 = variants.find((variant) => variant.sku === "PA22V100");

    expect(pa13?.specifications).toMatchObject({
      seatToFootrest: {
        status: "PROVIDED",
        normalizedValue: 380,
        normalizedUnit: "mm",
      },
      batteryWeight: {
        status: "NOT_PROVIDED",
        value: null,
      },
    });
    expect(pa13?.specifications.batteryWeight.sourceNote).toMatch(
      /workbook columns S/i,
    );
    expect(pa16k?.specifications.cushionWidth).toMatchObject({
      status: "CONFLICTING",
      normalizedValue: 420,
      normalizedUnit: "mm",
    });
    expect(pa16k?.specifications.cushionWidth.sourceNote).toMatch(
      /differs materially/i,
    );
    expect(pa22?.specifications.batteryVoltage).toMatchObject({
      status: "NOT_PROVIDED",
      value: null,
    });
    expect(
      plan.find((product) => product.productId === "6")?.reviewReasons,
    ).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/PA15F100.*batteryVoltage.*not provided/i),
      ]),
    );
  });

  it("creates a default scooter SKU without inventing rated capacity", () => {
    const plan = buildCatalogMigrationPlan();
    const scooter = plan.find((product) => product.productId === "s1");

    expect(scooter).toMatchObject({
      categorySlug: "mobility-scooters",
      variants: [{ sku: "LEGACY-S1" }],
    });
    expect(scooter?.variants[0].specifications).not.toHaveProperty(
      "maxUserWeight",
    );
  });

  it("fails closed when a wheelchair has no official specification mapping", () => {
    const wheelchair = products.find((product) => product.id === "1")!;

    expect(() => buildCatalogMigrationPlan([wheelchair], [])).toThrow(
      /official specifications.*Travel Air W 03/i,
    );
  });

  it("reports a dry run without writing categories, products, or variants", async () => {
    const db = fakeMigrationDb({ categoriesSeeded: true });

    const result = await migrateProductCatalog(db as never, { dryRun: true });

    expect(result).toMatchObject({
      productsUpdated: 12,
      variantsUpserted: 22,
    });
    expect(db.productCategory.upsert).not.toHaveBeenCalled();
    expect(db.specificationField.upsert).not.toHaveBeenCalled();
    expect(db.product.update).not.toHaveBeenCalled();
    expect(db.productVariant.upsert).not.toHaveBeenCalled();
    expect(db.productVariant.updateMany).not.toHaveBeenCalled();
  });

  it("is idempotent and only retires generated legacy wheelchair SKUs", async () => {
    const db = fakeMigrationDb();
    db.variants.push({
      id: "admin-variant",
      productId: "1",
      sku: "ADMIN-CUSTOM-SKU",
      isActive: true,
    });

    await migrateProductCatalog(db as never);
    await migrateProductCatalog(db as never);

    expect(db.variants).toHaveLength(30);
    expect(new Set(db.variants.map((variant) => variant.sku)).size).toBe(30);
    expect(
      db.variants.find((variant) => variant.sku === "LEGACY-1"),
    ).toMatchObject({ isActive: false });
    expect(
      db.variants.find((variant) => variant.sku === "ADMIN-CUSTOM-SKU"),
    ).toMatchObject({ isActive: true });
    expect(
      db.variants.find((variant) => variant.sku === "PA26A000"),
    ).toMatchObject({
      productId: "3",
      isActive: true,
    });
    expect(db.productRows.find((product) => product.id === "3")).toMatchObject({
      model: "L-41 / PA26",
      categoryId: expect.any(String),
      categoryTemplateVersion: 1,
    });
  });

  it("stops when an official SKU belongs to a different product", async () => {
    const db = fakeMigrationDb();
    db.variants.push({
      id: "wrong-owner",
      productId: "1",
      sku: "PA26A000",
      isActive: true,
    });

    await expect(migrateProductCatalog(db as never)).rejects.toThrow(
      /PA26A000.*different product/i,
    );
  });
});
