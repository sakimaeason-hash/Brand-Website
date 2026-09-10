import { describe, expect, it } from "vitest";
import {
  CatalogServiceError,
  archiveCategory,
  createCategory,
  updateCategory,
} from "./category-service";
import { POWERED_REQUIRED_SEMANTICS, SEMANTIC_FIELDS } from "./semantic-fields";
import type { RecommendationProfile, SpecificationFieldDefinition } from "./types";

const updatedAt = new Date("2026-09-01T00:00:00.000Z");

type FakeField = Omit<SpecificationFieldDefinition, "options"> & {
  id: string;
  categoryId: string;
  options: string[];
};

type FakeCategory = Record<string, unknown> & {
  id: string;
  name: string;
  slug: string;
  role: "PRODUCT" | "ACCESSORY";
  recommendationProfile: RecommendationProfile;
  status: "ACTIVE" | "ARCHIVED";
  sortOrder: number;
  templateVersion: number;
  updatedAt: Date;
  fields: FakeField[];
  _count: { products: number };
};

type FakePublishedProduct = {
  id: string;
  specifications: Record<string, unknown>;
  variants: Array<{
    id: string;
    isActive: boolean;
    specifications: Record<string, unknown>;
  }>;
};

type CategoryDbLike = NonNullable<Parameters<typeof createCategory>[1]>;

function fakeDb(options: { publishedProducts?: FakePublishedProduct[]; createCategoryError?: unknown } = {}) {
  const protectedFields: FakeField[] = POWERED_REQUIRED_SEMANTICS.map((entry, index) => {
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
  const categories: FakeCategory[] = [{
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
  const productCategory = {
      findUnique: async ({ where }: { where: { id?: string; slug?: string } }) => {
        if (where.id) return categories.find((item) => item.id === where.id) ?? null;
        if (where.slug) return categories.find((item) => item.slug === where.slug) ?? null;
        return null;
      },
      findFirst: async ({ where }: { where: { slug: string } }) => categories.find((item) => item.slug === where.slug) ?? null,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        if (options.createCategoryError) throw options.createCategoryError;
        const row = { ...data, id: `cat-${++sequence}`, updatedAt, fields: [], products: [], _count: { products: 0 } } as unknown as FakeCategory;
        categories.push(row);
        return row;
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = categories.find((item) => item.id === where.id);
        if (!row) throw new Error("missing category");
        const nextData = { ...data };
        const increment = (nextData.templateVersion as { increment?: number } | undefined)?.increment;
        if (increment) {
          nextData.templateVersion = row.templateVersion + increment;
        }
        Object.assign(row, nextData, { updatedAt: new Date() });
        return row;
      },
      updateMany: async ({ where, data }: { where: { id: string; updatedAt: Date }; data: Record<string, unknown> }) => {
        const row = categories.find((item) => item.id === where.id && item.updatedAt.getTime() === where.updatedAt.getTime());
        if (!row) return { count: 0 };
        const nextData = { ...data };
        const increment = (nextData.templateVersion as { increment?: number } | undefined)?.increment;
        if (increment) {
          nextData.templateVersion = row.templateVersion + increment;
        }
        Object.assign(row, nextData, { updatedAt: new Date() });
        return { count: 1 };
      },
  };
  const specificationField = {
      create: async ({ data }: { data: Record<string, unknown> & { categoryId: string } }) => {
        const row = { ...data, id: `field-${++sequence}` } as unknown as FakeField;
        fields.push(row);
        categories.find((category) => category.id === data.categoryId)?.fields.push(row);
        return row;
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = fields.find((item) => item.id === where.id);
        if (!row) throw new Error("missing specification field");
        Object.assign(row, data);
        return row;
      },
  };
  const product = {
      count: async () => 0,
      findMany: async () => options.publishedProducts ?? [],
  };
  const transactionClient = { productCategory, specificationField, product };
  const db = {
    ...transactionClient,
    $transaction: async (callback: (tx: typeof transactionClient) => unknown) => callback(transactionClient),
    categories,
    fields,
  };
  return db as typeof db & CategoryDbLike;
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

    expect(created.fields.some((field) => field.semanticKey === "effectiveSeatWidth")).toBe(true);
    expect(created.fields.every((field) => field.semanticKey == null || field.isProtected)).toBe(true);
  });

  it("rejects changing a protected field type", async () => {
    const db = fakeDb();
    await expect(updateCategory("cat-1", {
      name: "Powered",
      fields: [{ key: "maxUserWeight", label: "Weight", group: "Fit", scope: "VARIANT", dataType: "TEXT", unitFamily: "NONE" }],
    }, updatedAt.toISOString(), db)).rejects.toMatchObject({ code: "PROTECTED_FIELD" });
  });

  it("rejects inventing a new protected semantic field during update", async () => {
    const db = fakeDb();
    await expect(updateCategory("cat-1", {
      name: "Powered",
      fields: [{
        key: "propulsionType",
        label: "Propulsion type",
        group: "Performance",
        scope: "VARIANT",
        dataType: "SELECT",
        unitFamily: "NONE",
        options: ["rear-wheel"],
        semanticKey: "propulsionType",
        isProtected: true,
      }],
    }, updatedAt.toISOString(), db)).rejects.toMatchObject({ code: "PROTECTED_FIELD" });
  });

  it("rejects archiving an existing protected field", async () => {
    const db = fakeDb();
    const protectedField = db.categories[0].fields.find((field) => field.key === "maxUserWeight")!;
    await expect(updateCategory("cat-1", {
      name: "Powered",
      fields: [{ ...protectedField, status: "ARCHIVED" }],
    }, updatedAt.toISOString(), db)).rejects.toMatchObject({ code: "PROTECTED_FIELD" });
  });

  it("returns a conflict for a stale category update", async () => {
    const db = fakeDb();
    await expect(updateCategory("cat-1", { name: "Powered", fields: [] }, "2026-08-01T00:00:00.000Z", db))
      .rejects.toMatchObject({ code: "CONCURRENT_UPDATE" });
  });

  it.each(["not-a-date", "0", "2026-09-01 00:00:00"])("rejects non-canonical concurrency timestamp %s as validation error", async (timestamp) => {
    const db = fakeDb();
    await expect(updateCategory("cat-1", { name: "Powered", fields: [] }, timestamp, db))
      .rejects.toMatchObject({ code: "INVALID_UPDATED_AT", status: 400 });
  });

  it("maps a database slug race to a conflict", async () => {
    const db = fakeDb({ createCategoryError: { code: "P2002", meta: { target: ["slug"] } } });
    await expect(createCategory({ name: "Racing category", fields: [] }, db))
      .rejects.toMatchObject({ code: "SLUG_CONFLICT", status: 409 });
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

  it("rejects making a field required when published data has the wrong type", async () => {
    const db = fakeDb({
      publishedProducts: [{
        id: "product-1",
        specifications: { isFoldable: { status: "PROVIDED", value: "yes" } },
        variants: [],
      }],
    });

    await expect(updateCategory("cat-1", {
      name: "Powered",
      fields: [{
        key: "isFoldable",
        label: "Foldable",
        group: "Transport",
        scope: "PRODUCT",
        dataType: "BOOLEAN",
        unitFamily: "NONE",
        requiredForPublish: true,
      }],
    }, updatedAt.toISOString(), db)).rejects.toMatchObject({ code: "PUBLISHED_DATA_INCOMPLETE" });
  });

  it("revalidates stored measurements using their original input unit", async () => {
    const db = fakeDb({
      publishedProducts: [{
        id: "product-1",
        specifications: {
          transportWeight: {
            status: "PROVIDED",
            value: 18,
            inputValue: 18,
            inputUnit: "lb",
            normalizedValue: 8.16466266,
            normalizedUnit: "kg",
          },
        },
        variants: [],
      }],
    });

    await expect(updateCategory("cat-1", {
      name: "Powered",
      fields: [{
        key: "transportWeight",
        label: "Transport weight",
        group: "Transport",
        scope: "PRODUCT",
        dataType: "NUMBER",
        unitFamily: "WEIGHT",
        defaultDisplayUnit: "kg",
        minValue: 10,
        requiredForPublish: true,
      }],
    }, updatedAt.toISOString(), db)).rejects.toMatchObject({ code: "PUBLISHED_DATA_INCOMPLETE" });
  });

  it("rejects changing an established recommendation profile", async () => {
    const db = fakeDb();
    await expect(updateCategory("cat-1", {
      name: "Powered",
      recommendationProfile: "MANUAL_WHEELCHAIR",
      fields: [],
    }, updatedAt.toISOString(), db)).rejects.toMatchObject({ code: "RECOMMENDATION_PROFILE_LOCKED" });
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

  it("preserves protected field display metadata when it is omitted", async () => {
    const db = fakeDb();
    const protectedField = db.categories[0].fields.find((field) => field.key === "maxUserWeight")!;
    protectedField.label = "Maximum supported user weight";
    protectedField.helpText = "Use the real occupant weight.";
    protectedField.sortOrder = 42;

    const updated = await updateCategory("cat-1", { name: "Powered", fields: [] }, updatedAt.toISOString(), db);
    const result = updated.fields.find((field) => field.key === "maxUserWeight");
    expect(result).toMatchObject({ label: "Maximum supported user weight", helpText: "Use the real occupant weight.", sortOrder: 42 });
  });

  it("allows protected field display metadata to be edited", async () => {
    const db = fakeDb();
    const protectedField = db.categories[0].fields.find((field) => field.key === "maxUserWeight")!;
    const { categoryId: _categoryId, ...editableProtectedField } = protectedField;

    const updated = await updateCategory("cat-1", {
      name: "Powered",
      fields: [{
        ...editableProtectedField,
        label: "Weight capacity",
        helpText: "Enter the manufacturer's verified maximum user weight.",
        sortOrder: 99,
      }],
    }, updatedAt.toISOString(), db);

    expect(updated.fields.find((field) => field.key === "maxUserWeight")).toMatchObject({
      label: "Weight capacity",
      helpText: "Enter the manufacturer's verified maximum user weight.",
      sortOrder: 99,
    });
  });

  it("does not treat zero as equivalent to a null protected bound", async () => {
    const db = fakeDb();
    const protectedField = db.categories[0].fields.find((field) => field.key === "maxUserWeight")!;
    const { categoryId: _categoryId, ...submittedProtectedField } = protectedField;

    await expect(updateCategory("cat-1", {
      name: "Powered",
      fields: [{
        ...submittedProtectedField,
        minValue: 0,
      }],
    }, updatedAt.toISOString(), db)).rejects.toMatchObject({ code: "PROTECTED_FIELD" });
  });

  it("never writes a client-provided specification field id", async () => {
    const db = fakeDb();
    await createCategory({ name: "Custom", fields: [{ id: "attacker-id", key: "finish", label: "Finish", group: "Overview", scope: "PRODUCT", dataType: "TEXT", unitFamily: "NONE" }] }, db);
    expect(db.fields.some((field) => field.id === "attacker-id")).toBe(false);
  });

  it("rejects malformed template field combinations", async () => {
    const db = fakeDb();
    await expect(createCategory({ name: "Invalid", fields: [{ key: "lengthText", label: "Length", group: "Overview", scope: "PRODUCT", dataType: "TEXT", unitFamily: "LENGTH" }] }, db)).rejects.toMatchObject({ code: "INVALID_FIELD" });
    await expect(createCategory({ name: "Invalid Select", fields: [{ key: "finish", label: "Finish", group: "Overview", scope: "PRODUCT", dataType: "SELECT", unitFamily: "NONE" }] }, db)).rejects.toMatchObject({ code: "INVALID_FIELD" });
    await expect(createCategory({ name: "Invalid Unit", fields: [{ key: "seatWidth", label: "Seat width", group: "Fit", scope: "VARIANT", dataType: "NUMBER", unitFamily: "LENGTH", defaultDisplayUnit: "lb" }] }, db)).rejects.toMatchObject({ code: "INVALID_FIELD" });
  });

  it("exposes structured service errors", () => {
    const error = new CatalogServiceError("PROTECTED_FIELD", "Protected field");
    expect(error).toMatchObject({ code: "PROTECTED_FIELD", status: 400 });
  });
});
