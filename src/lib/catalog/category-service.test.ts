import { describe, expect, it } from "vitest";
import {
  CatalogServiceError,
  archiveCategory,
  createCategory,
  updateCategory,
} from "./category-service";
import { POWERED_REQUIRED_SEMANTICS, SEMANTIC_FIELDS } from "./semantic-fields";

const updatedAt = new Date("2026-09-01T00:00:00.000Z");

function fakeDb(options: { publishedProducts?: any[] } = {}) {
  const protectedFields = POWERED_REQUIRED_SEMANTICS.map((entry, index) => {
    const semantic = SEMANTIC_FIELDS[entry.semanticKey];
    return {
      id: `field-${entry.semanticKey}`,
      categoryId: "cat-1",
      key: entry.semanticKey,
      label: entry.semanticKey,
      group: "Fit",
      scope: "VARIANT",
      dataType: semantic.dataType,
      unitFamily: semantic.unitFamily,
      defaultDisplayUnit: semantic.canonicalUnit,
      options: [],
      helpText: null,
      minValue: null,
      maxValue: null,
      requiredForPublish: false,
      requiredForRecommendation: true,
      semanticKey: entry.semanticKey,
      isProtected: true,
      status: "ACTIVE",
      sortOrder: index,
    };
  });
  const categories: any[] = [{
    id: "cat-1",
    name: "Powered",
    slug: "powered",
    description: null,
    role: "PRODUCT",
    recommendationProfile: "POWERED_WHEELCHAIR",
    status: "ACTIVE",
    sortOrder: 0,
    templateVersion: 1,
    updatedAt,
    fields: protectedFields,
    products: [],
    _count: { products: 0 },
  }];
  const fields = [...categories[0].fields];
  let sequence = 1;
  const db: any = {
    productCategory: {
      findUnique: async ({ where }: any) => {
        if (where.id) return categories.find((item) => item.id === where.id) ?? null;
        if (where.slug) return categories.find((item) => item.slug === where.slug) ?? null;
        return null;
      },
      findFirst: async ({ where }: any) => categories.find((item) => item.slug === where.slug) ?? null,
      create: async ({ data }: any) => {
        const row = { ...data, id: `cat-${++sequence}`, updatedAt, fields: [], products: [], _count: { products: 0 } };
        categories.push(row);
        return row;
      },
      update: async ({ where, data }: any) => {
        const row = categories.find((item) => item.id === where.id);
        if (!row) throw new Error("missing category");
        const nextData = { ...data };
        if (nextData.templateVersion?.increment) {
          nextData.templateVersion = row.templateVersion + nextData.templateVersion.increment;
        }
        Object.assign(row, nextData, { updatedAt: new Date() });
        return row;
      },
      updateMany: async ({ where, data }: any) => {
        const row = categories.find((item) => item.id === where.id && item.updatedAt.getTime() === where.updatedAt.getTime());
        if (!row) return { count: 0 };
        const nextData = { ...data };
        if (nextData.templateVersion?.increment) {
          nextData.templateVersion = row.templateVersion + nextData.templateVersion.increment;
        }
        Object.assign(row, nextData, { updatedAt: new Date() });
        return { count: 1 };
      },
    },
    specificationField: {
      create: async ({ data }: any) => {
        const row = { ...data, id: `field-${++sequence}` };
        fields.push(row);
        categories.find((category) => category.id === data.categoryId)?.fields.push(row);
        return row;
      },
      update: async ({ where, data }: any) => {
        const row = fields.find((item) => item.id === where.id);
        Object.assign(row, data);
        return row;
      },
    },
    product: {
      count: async () => 0,
      findMany: async () => options.publishedProducts ?? [],
    },
    $transaction: async (callback: (tx: any) => unknown) => callback(db),
    categories,
    fields,
  };
  return db;
}

describe("category service", () => {
  it("normalizes a custom slug and defaults to no recommendation profile", async () => {
    const db = fakeDb();
    const created = await createCategory({ name: "  Shower Seats & Chairs  ", fields: [] }, db);

    expect(created.slug).toBe("shower-seats-chairs");
    expect(created.role).toBe("PRODUCT");
    expect(created.recommendationProfile).toBe("NONE");
  });

  it("injects protected template fields for a powered category", async () => {
    const db = fakeDb();
    const created = await createCategory({
      name: "Custom Powered",
      recommendationProfile: "POWERED_WHEELCHAIR",
      fields: [],
    }, db);

    expect(created.fields.some((field: any) => field.semanticKey === "effectiveSeatWidth")).toBe(true);
    expect(created.fields.every((field: any) => field.semanticKey == null || field.isProtected)).toBe(true);
  });

  it("rejects changing a protected field type", async () => {
    const db = fakeDb();
    await expect(updateCategory("cat-1", {
      name: "Powered",
      fields: [{ key: "maxUserWeight", label: "Weight", group: "Fit", scope: "VARIANT", dataType: "TEXT", unitFamily: "NONE" }],
    }, updatedAt.toISOString(), db)).rejects.toMatchObject({ code: "PROTECTED_FIELD" });
  });

  it("returns a conflict for a stale category update", async () => {
    const db = fakeDb();
    await expect(updateCategory("cat-1", { name: "Powered", fields: [] }, "2026-08-01T00:00:00.000Z", db))
      .rejects.toMatchObject({ code: "CONCURRENT_UPDATE" });
  });

  it("archives a category with optimistic concurrency", async () => {
    const db = fakeDb();
    const archived = await archiveCategory("cat-1", updatedAt.toISOString(), db);
    expect(archived.status).toBe("ARCHIVED");
  });

  it("rejects adding a required field when published products are incomplete", async () => {
    const db = fakeDb({
      publishedProducts: [{
        id: "product-1",
        specifications: {},
        variants: [{ id: "variant-1", isActive: true, specifications: {} }],
      }],
    });

    await expect(updateCategory("cat-1", {
      name: "Powered",
      fields: [{
        key: "manufacturer",
        label: "Manufacturer",
        group: "Overview",
        scope: "PRODUCT",
        dataType: "TEXT",
        unitFamily: "NONE",
        requiredForPublish: true,
      }],
    }, updatedAt.toISOString(), db)).rejects.toMatchObject({ code: "PUBLISHED_DATA_INCOMPLETE" });
  });

  it("increments the category template version when fields change", async () => {
    const db = fakeDb();
    const updated = await updateCategory("cat-1", {
      name: "Powered",
      fields: [{
        key: "manufacturer",
        label: "Manufacturer",
        group: "Overview",
        scope: "PRODUCT",
        dataType: "TEXT",
        unitFamily: "NONE",
      }],
    }, updatedAt.toISOString(), db);

    expect(updated.templateVersion).toBe(2);
  });

  it("exposes structured service errors", () => {
    const error = new CatalogServiceError("PROTECTED_FIELD", "Protected field");
    expect(error).toMatchObject({ code: "PROTECTED_FIELD", status: 400 });
  });
});
