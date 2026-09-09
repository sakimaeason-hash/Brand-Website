import { describe, expect, it } from "vitest";

import { seedProductCategories } from "../scripts/seed-product-categories";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  role: string;
  recommendationProfile: string;
  status: string;
  templateVersion: number;
};

type FieldRow = Record<string, unknown> & {
  id: string;
  categoryId: string;
  key: string;
  semanticKey?: string | null;
};

function fakePrisma() {
  const categories: CategoryRow[] = [];
  const fields: FieldRow[] = [];
  let sequence = 0;

  const productCategory = {
    upsert: async ({ where, create, update }: any) => {
      const current = categories.find((item) => item.slug === where.slug);
      if (current) {
        Object.assign(current, update);
        return current;
      }
      const row = { ...create, id: `cat-${++sequence}` } as CategoryRow;
      categories.push(row);
      return row;
    },
  };
  const specificationField = {
    upsert: async ({ where, create, update }: any) => {
      const current = fields.find(
        (item) => item.categoryId === where.categoryId_key.categoryId && item.key === where.categoryId_key.key,
      );
      if (current) {
        Object.assign(current, update);
        return current;
      }
      const row = { ...create, id: `field-${fields.length + 1}` } as FieldRow;
      fields.push(row);
      return row;
    },
  };
  const client = {
    $transaction: async (callback: (tx: any) => unknown) => callback({ productCategory, specificationField }),
    productCategory,
    specificationField,
    categories,
    fields,
  };
  return client;
}

describe("seedProductCategories", () => {
  it("is idempotent and does not duplicate categories or fields", async () => {
    const db = fakePrisma();

    const first = await seedProductCategories(db as never);
    const second = await seedProductCategories(db as never);

    expect(first.categories).toBe(5);
    expect(second.categories).toBe(5);
    expect(db.categories).toHaveLength(5);
    expect(db.fields.length).toBeGreaterThan(0);
    expect(new Set(db.fields.map((field) => `${field.categoryId}:${field.key}`)).size).toBe(db.fields.length);
  });

  it("only updates protected fields when seed runs again", async () => {
    const db = fakePrisma();
    await seedProductCategories(db as never);
    const custom = db.fields.find((field) => field.semanticKey === null);
    if (custom) custom.label = "Administrator label";

    await seedProductCategories(db as never);

    expect(custom?.label).toBe("Administrator label");
  });

  it("does not resurrect an archived built-in category", async () => {
    const db = fakePrisma();
    await seedProductCategories(db as never);
    db.categories[0].status = "ARCHIVED";

    await seedProductCategories(db as never);

    expect(db.categories[0].status).toBe("ARCHIVED");
  });

  it("does not resurrect an archived protected field", async () => {
    const db = fakePrisma();
    await seedProductCategories(db as never);
    const protectedField = db.fields.find((field) => field.semanticKey === "maxUserWeight");
    expect(protectedField).toBeDefined();
    protectedField!.status = "ARCHIVED";

    await seedProductCategories(db as never);

    expect(protectedField!.status).toBe("ARCHIVED");
  });
});
