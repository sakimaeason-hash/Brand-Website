import { describe, expect, it } from "vitest";
import { createProductDraft, publishProduct, saveProductDraft } from "./product-service";

const input = {
  name: "Travel Air", model: "PA22", category: "wheelchair", categoryId: "cat-1", categoryTemplateVersion: 1,
  tagline: null, description: null, price: 899, originalPrice: null, amazonLink: "https://www.amazon.com/dp/test",
  weightCapacity: null, seatWidth: null, range: null, maxSpeed: null, productWeight: null, features: [], isFeatured: false, sortOrder: 0,
  specifications: {}, variants: [{ sku: "PA22-A", factoryModel: "PA22", label: "Standard", colorName: "Black", colorHex: "#111111", priceOverride: null, originalPriceOverride: null, purchaseLinkOverride: null, specifications: {}, isActive: true, sortOrder: 0 }], inBoxItems: [], accessoryProductIds: [],
};

type FakeOptions = {
  categoryStatus?: "ACTIVE" | "ARCHIVED";
  variantCreateError?: unknown;
  accessoryProducts?: Array<{ id: string; status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED"; role: "PRODUCT" | "ACCESSORY" }>;
};

function fakeDb(options: FakeOptions = {}) {
  const calls: string[] = [];
  const products: any[] = [];
  const variants: any[] = [];
  const inBoxItems: any[] = [];
  const accessories: any[] = [];
  const category = { id: "cat-1", status: options.categoryStatus ?? "ACTIVE", templateVersion: 1, recommendationProfile: "NONE", fields: [] };
  let sequence = 0;
  let transactionDepth = 0;
  const mark = (name: string) => calls.push(`${transactionDepth > 0 ? "tx:" : "outside:"}${name}`);
  const enrichedProduct = (id: string) => {
    const product = products.find((item) => item.id === id);
    if (!product) return null;
    return {
      ...product,
      variants: variants.filter((item) => item.productId === id),
      inBoxItems: inBoxItems.filter((item) => item.productId === id),
      compatibleAccessories: accessories.filter((item) => item.productId === id).map((relation) => {
        const referenced = options.accessoryProducts?.find((item) => item.id === relation.accessoryProductId);
        return { ...relation, accessoryProduct: referenced ? { id: referenced.id, status: referenced.status, categoryRelation: { role: referenced.role } } : null };
      }),
      images: [{ id: "image-1" }],
      categoryRelation: category,
    };
  };
  const db: any = {
    productCategory: {
      findUnique: async () => { mark("category.findUnique"); return category; },
    },
    product: {
      findUnique: async ({ where }: any) => { mark("product.findUnique"); return enrichedProduct(where.id); },
      findMany: async ({ where }: any) => {
        mark("product.findMany");
        return (options.accessoryProducts ?? []).filter((item) => where.id.in.includes(item.id)).map((item) => ({ id: item.id, status: item.status, categoryRelation: { role: item.role } }));
      },
      create: async ({ data }: any) => {
        mark("product.create");
        const row = { ...data, id: `p-${++sequence}`, updatedAt: new Date("2026-09-01T00:00:00.000Z") };
        products.push(row);
        return row;
      },
      updateMany: async ({ where, data }: any) => {
        mark("product.updateMany");
        const row = products.find((item) => item.id === where.id && (!where.updatedAt || item.updatedAt.getTime() === where.updatedAt.getTime()));
        if (!row) return { count: 0 };
        Object.assign(row, data, { updatedAt: new Date("2026-09-01T00:00:01.000Z") });
        return { count: 1 };
      },
    },
    productVariant: {
      findUnique: async ({ where }: any) => { mark("variant.findUnique"); return variants.find((item) => item.sku === where.sku) ?? null; },
      findMany: async ({ where }: any) => { mark("variant.findMany"); return variants.filter((item) => item.productId === where.productId); },
      update: async ({ where, data }: any) => {
        mark("variant.update");
        const row = variants.find((item) => item.id === where.id);
        if (!row) throw new Error("missing variant");
        Object.assign(row, data);
        return row;
      },
      create: async ({ data }: any) => {
        mark("variant.create");
        if (options.variantCreateError) throw options.variantCreateError;
        const row = { ...data, id: `v-${++sequence}` };
        variants.push(row);
        return row;
      },
      delete: async ({ where }: any) => { mark("variant.delete"); variants.splice(variants.findIndex((item) => item.id === where.id), 1); },
    },
    productInBoxItem: {
      findMany: async ({ where }: any) => { mark("box.findMany"); return inBoxItems.filter((item) => item.productId === where.productId); },
      update: async ({ where, data }: any) => {
        mark("box.update");
        const row = inBoxItems.find((item) => item.id === where.id);
        if (!row) throw new Error("missing in-box item");
        Object.assign(row, data);
        return row;
      },
      create: async ({ data }: any) => { mark("box.create"); const row = { ...data, id: `box-${++sequence}` }; inBoxItems.push(row); return row; },
      delete: async ({ where }: any) => { mark("box.delete"); inBoxItems.splice(inBoxItems.findIndex((item) => item.id === where.id), 1); },
      deleteMany: async ({ where }: any) => { mark("box.deleteMany"); for (let index = inBoxItems.length - 1; index >= 0; index -= 1) if (inBoxItems[index].productId === where.productId) inBoxItems.splice(index, 1); },
    },
    productAccessory: {
      create: async ({ data }: any) => { mark("accessory.create"); accessories.push(data); return data; },
      deleteMany: async ({ where }: any) => { mark("accessory.deleteMany"); for (let index = accessories.length - 1; index >= 0; index -= 1) if (accessories[index].productId === where.productId) accessories.splice(index, 1); },
    },
    $transaction: async (callback: (tx: any) => unknown) => {
      calls.push("transaction");
      const snapshots = [products, variants, inBoxItems, accessories].map((rows) => structuredClone(rows));
      transactionDepth += 1;
      try {
        return await callback(db);
      } catch (error) {
        [products, variants, inBoxItems, accessories].forEach((rows, index) => rows.splice(0, rows.length, ...snapshots[index]));
        throw error;
      } finally {
        transactionDepth -= 1;
      }
    },
    calls,
    products,
    variants,
    inBoxItems,
    accessories,
  };
  return db;
}

describe("product service", () => {
  it("creates a draft aggregate with every read and write inside one transaction", async () => {
    const db = fakeDb();
    const created = await createProductDraft(input, db);

    expect(created.id).toBe("p-1");
    expect(db.calls[0]).toBe("transaction");
    expect(db.calls.filter((call: string) => call.startsWith("outside:"))).toEqual([]);
    expect(db.calls).toContain("tx:variant.create");
  });

  it("uses optimistic concurrency when saving a draft", async () => {
    const db = fakeDb();
    const created = await createProductDraft(input, db);
    const saved = await saveProductDraft("p-1", {
      ...input,
      name: "Updated",
      variants: [{ ...input.variants[0], id: created.variants[0].id }],
    }, "2026-09-01T00:00:00.000Z", db);
    expect(saved.name).toBe("Updated");
  });

  it("rejects a variant id owned by another product", async () => {
    const db = fakeDb();
    await createProductDraft(input, db);

    await expect(saveProductDraft("p-1", {
      ...input,
      variants: [{ ...input.variants[0], id: "v-from-another-product" }],
    }, "2026-09-01T00:00:00.000Z", db)).rejects.toMatchObject({ code: "VARIANT_OWNERSHIP" });
  });

  it("rejects a SKU already used by another product", async () => {
    const db = fakeDb();
    await createProductDraft(input, db);
    db.variants.push({ id: "foreign-variant", productId: "foreign-product", sku: "TAKEN-SKU" });

    await expect(saveProductDraft("p-1", {
      ...input,
      variants: [{ ...input.variants[0], sku: "TAKEN-SKU" }],
    }, "2026-09-01T00:00:00.000Z", db)).rejects.toMatchObject({ code: "SKU_CONFLICT", status: 409 });
  });

  it("rejects self links and products that are not published accessories", async () => {
    const db = fakeDb({ accessoryProducts: [{ id: "not-accessory", status: "PUBLISHED", role: "PRODUCT" }] });
    await createProductDraft(input, db);

    await expect(saveProductDraft("p-1", { ...input, accessoryProductIds: ["p-1"] }, "2026-09-01T00:00:00.000Z", db))
      .rejects.toMatchObject({ code: "INVALID_ACCESSORY" });
    await expect(saveProductDraft("p-1", { ...input, accessoryProductIds: ["not-accessory"] }, "2026-09-01T00:00:00.000Z", db))
      .rejects.toMatchObject({ code: "INVALID_ACCESSORY" });
  });

  it("updates an existing in-the-box row by id", async () => {
    const db = fakeDb();
    const created = await createProductDraft({ ...input, inBoxItems: [{ name: "Charger", quantity: 1, note: null }] }, db);
    const boxId = db.inBoxItems[0].id;
    db.calls.length = 0;

    await saveProductDraft("p-1", {
      ...input,
      variants: [{ ...input.variants[0], id: created.variants[0].id }],
      inBoxItems: [{ id: boxId, name: "Travel charger", quantity: 1, note: "US plug" }],
    }, "2026-09-01T00:00:00.000Z", db);

    expect(db.calls).toContain("tx:box.update");
    expect(db.calls).not.toContain("tx:box.deleteMany");
    expect(db.inBoxItems).toContainEqual(expect.objectContaining({ id: boxId, name: "Travel charger" }));
  });

  it("maps unique SKU races and rolls back the product aggregate", async () => {
    const db = fakeDb({ variantCreateError: { code: "P2002", meta: { target: ["sku"] } } });

    await expect(createProductDraft(input, db)).rejects.toMatchObject({ code: "SKU_CONFLICT", status: 409 });
    expect(db.products).toEqual([]);
    expect(db.variants).toEqual([]);
  });

  it("refuses to publish when the category was archived", async () => {
    const db = fakeDb();
    await createProductDraft(input, db);
    db.productCategory.findUnique = async () => ({ ...db.products[0].categoryRelation, id: "cat-1", status: "ARCHIVED", templateVersion: 1, recommendationProfile: "NONE", fields: [] });

    await expect(publishProduct("p-1", "2026-09-01T00:00:00.000Z", db))
      .rejects.toMatchObject({ code: "CATEGORY_NOT_FOUND" });
  });
});
