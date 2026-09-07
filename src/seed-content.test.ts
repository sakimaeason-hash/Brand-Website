import { describe, expect, it, vi } from "vitest";

vi.mock("./lib/db", () => ({ prisma: {} }));

import { products } from "./data/products";
import { stories } from "./data/stories";
import { seedContent } from "../scripts/seed-content";

type ProductRow = Record<string, unknown> & { id: string; name: string; model: string };
type StoryRow = Record<string, unknown> & { id: string; displayName: string };
type SeedImageRow = Record<string, unknown> & { id?: string; productId?: string; storyId?: string; storagePath: string };

function fakePrisma(initial: { products?: ProductRow[]; stories?: StoryRow[] } = {}) {
  const productRows = [...(initial.products ?? [])];
  const storyRows = [...(initial.stories ?? [])];
  const productImages: SeedImageRow[] = [];
  const storyImages: SeedImageRow[] = [];
  let sequence = 0;
  const product = {
    findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
      productRows.find((row) => row.id === where.id) ?? null),
    findFirst: vi.fn(async ({ where }: { where: { name: string; model: string } }) =>
      productRows.find((row) => row.name === where.name && row.model === where.model) ?? null),
    create: vi.fn(async ({ data }: { data: ProductRow }) => {
      const row = { ...data, id: data.id || `p${++sequence}` };
      productRows.push(row);
      return row;
    }),
    update: vi.fn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
      const row = productRows.find((item) => item.id === where.id);
      if (!row) throw new Error("missing product");
      Object.assign(row, data);
      return row;
    }),
  };
  const customerStory = {
    findFirst: vi.fn(async ({ where }: { where: { displayName: string } }) =>
      storyRows.find((row) => row.displayName === where.displayName) ?? null),
    create: vi.fn(async ({ data }: { data: StoryRow }) => {
      const row = { ...data, id: data.id || `s${++sequence}` };
      storyRows.push(row);
      return row;
    }),
    update: vi.fn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
      const row = storyRows.find((item) => item.id === where.id);
      if (!row) throw new Error("missing story");
      Object.assign(row, data);
      return row;
    }),
  };
  const productImage = {
    findFirst: vi.fn(async ({ where }: { where: { productId: string; storagePath: string } }) =>
      productImages.find((row) => row.productId === where.productId && row.storagePath === where.storagePath) ?? null),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const row = { ...data, id: `pi${productImages.length + 1}` } as SeedImageRow;
      productImages.push(row);
      return row;
    }),
    update: vi.fn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
      const row = productImages.find((item) => item.id === where.id);
      if (!row) throw new Error("missing product image");
      Object.assign(row, data);
      return row;
    }),
  };
  const storyImage = {
    findFirst: vi.fn(async ({ where }: { where: { storyId: string; storagePath: string } }) =>
      storyImages.find((row) => row.storyId === where.storyId && row.storagePath === where.storagePath) ?? null),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const row = { ...data, id: `si${storyImages.length + 1}` } as SeedImageRow;
      storyImages.push(row);
      return row;
    }),
    update: vi.fn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
      const row = storyImages.find((item) => item.id === where.id);
      if (!row) throw new Error("missing story image");
      Object.assign(row, data);
      return row;
    }),
  };
  return { product, customerStory, productImage, storyImage, productRows, storyRows };
}

describe("content seed", () => {
  it("upserts products and stories by stable keys and registers public images", async () => {
    const db = fakePrisma();
    await seedContent(db as never, { products: products.slice(0, 1), stories: stories.slice(0, 1) });
    await seedContent(db as never, { products: products.slice(0, 1), stories: stories.slice(0, 1) });

    expect(db.product.create).toHaveBeenCalledTimes(1);
    expect(db.product.update).toHaveBeenCalledTimes(1);
    expect(db.productImage.create).toHaveBeenCalledTimes(products[0].images.length);
    expect(db.productImage.update).toHaveBeenCalledTimes(products[0].images.length);
    expect(db.customerStory.create).toHaveBeenCalledTimes(1);
    expect(db.customerStory.update).toHaveBeenCalledTimes(1);
    expect(db.storyImage.create).toHaveBeenCalledTimes(1);
    expect(db.storyImage.update).toHaveBeenCalledTimes(1);
    expect(db.productImage.create.mock.calls[0][0].data.storagePath).toMatch(/^\/products\//);
    expect(db.storyImage.create.mock.calls[0][0].data.storagePath).toMatch(/^\/stories\//);
  });

  it("does not treat transport weight as the user's rated weight capacity", async () => {
    const db = fakePrisma();
    const [product] = products;

    await seedContent(db as never, { products: [product], stories: [] });

    expect(db.productRows[0]).toMatchObject({
      id: product.id,
      name: product.name,
      model: product.name,
      productWeight: product.weight,
      weightCapacity: null,
    });
  });

  it("updates an earlier static-id seed instead of trying to create a duplicate", async () => {
    const [product] = products;
    const db = fakePrisma({ products: [{ id: product.id, name: product.name, model: product.id }] });

    await seedContent(db as never, { products: [product], stories: [] });

    expect(db.product.create).not.toHaveBeenCalled();
    expect(db.product.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: product.id } }));
    expect(db.productRows[0]).toMatchObject({ model: product.name, weightCapacity: null });
  });

  it("propagates database failures so the CLI exits non-zero", async () => {
    const db = fakePrisma();
    db.product.findFirst.mockRejectedValueOnce(new Error("database offline"));
    await expect(seedContent(db as never, { products: products.slice(0, 1), stories: [] })).rejects.toThrow(
      "database offline",
    );
  });
});
