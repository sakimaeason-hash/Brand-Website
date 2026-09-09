import { describe, expect, it, vi, beforeEach } from "vitest";

const { requireAdmin, productCreate, productFindUnique, productUpdate, productDelete, productImageCreate, productImageDelete, productImageUpdate, removeContentImage, uploadContentImage, createProductDraft, saveProductDraft, publishProduct, unpublishProduct, revalidatePath } = vi.hoisted(() => ({
  requireAdmin: vi.fn(), productCreate: vi.fn(), productFindUnique: vi.fn(), productUpdate: vi.fn(), productDelete: vi.fn(),
  productImageCreate: vi.fn(), productImageDelete: vi.fn(), productImageUpdate: vi.fn(), removeContentImage: vi.fn(), uploadContentImage: vi.fn(),
  createProductDraft: vi.fn(), saveProductDraft: vi.fn(), publishProduct: vi.fn(), unpublishProduct: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/admin/authorization", () => ({ requireAdmin, AdminAuthError: class AdminAuthError extends Error {} }));
vi.mock("@/lib/db", () => ({
  prisma: {
    product: { create: productCreate, findUnique: productFindUnique, update: productUpdate, delete: productDelete },
    productImage: { create: productImageCreate, delete: productImageDelete, update: productImageUpdate },
  },
}));
vi.mock("@/lib/content/storage", () => ({ removeContentImage, uploadContentImage }));
vi.mock("@/lib/catalog/product-service", () => ({ createProductDraft, saveProductDraft, publishProduct, unpublishProduct, CatalogServiceError: class CatalogServiceError extends Error { constructor(public code: string, message: string, public status = 400, public fields: unknown[] = []) { super(message); } } }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { PATCH } from "./[id]/route";
import { POST } from "./route";

const updatedAt = new Date("2026-08-01T12:00:00.000Z");
const product = () => ({
  id: "p1", name: "Travel Air", model: "PA22", category: "wheelchair", price: 1000,
  originalPrice: null, features: [], status: "DRAFT", isFeatured: false, sortOrder: 0,
  updatedAt, images: [],
});
const aggregatePayload = (overrides: Record<string, unknown> = {}) => ({
  name: "Travel Air", model: "PA22", category: "wheelchair", categoryId: "cat-1", categoryTemplateVersion: 1,
  price: 1000, originalPrice: null, amazonLink: "https://www.amazon.com/dp/test", features: [], isFeatured: false, sortOrder: 0,
  specifications: {}, variants: [{ sku: "PA22-A", specifications: {}, isActive: true, sortOrder: 0 }], inBoxItems: [], accessoryProductIds: [],
  ...overrides,
});

function form(fields: Record<string, string>) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  return body;
}

function requestWith(body: FormData): Request {
  return { formData: vi.fn().mockResolvedValue(body) } as unknown as Request;
}

beforeEach(() => {
  vi.clearAllMocks();
  requireAdmin.mockResolvedValue({ userId: "admin" });
  productCreate.mockResolvedValue(product());
  productFindUnique.mockResolvedValue(product());
  productUpdate.mockResolvedValue(product());
  productImageCreate.mockResolvedValue({ id: "img-created" });
  removeContentImage.mockResolvedValue(undefined);
  uploadContentImage.mockResolvedValue({
    storagePath: "products/p1/abc-0-chair.jpg",
    publicUrl: "https://cdn.test/chair.jpg",
    originalName: "chair.jpg",
  });
  createProductDraft.mockResolvedValue({ ...product(), id: "p1", updatedAt: new Date("2026-08-01T12:00:00.000Z"), images: [] });
  saveProductDraft.mockResolvedValue({ ...product(), id: "p1", images: [] });
  publishProduct.mockResolvedValue({ ...product(), id: "p1", status: "PUBLISHED", images: [{ id: "img1", publicUrl: "https://cdn.test/chair.jpg" }] });
  unpublishProduct.mockResolvedValue({ ...product(), id: "p1", status: "UNPUBLISHED", images: [] });
});

describe("admin product collection route", () => {
  it("uses the dynamic product service for SKU and accessory payloads", async () => {
    const body = form({
      payload: JSON.stringify(aggregatePayload()),
      imageMetadata: "[]",
    });

    const response = await POST(requestWith(body));

    expect(response.status).toBe(201);
    expect(createProductDraft).toHaveBeenCalledWith(expect.objectContaining({ categoryId: "cat-1", variants: [expect.objectContaining({ sku: "PA22-A" })] }));
    expect(productCreate).not.toHaveBeenCalled();
  });
  it("stores trimmed metadata with each uploaded image", async () => {
    const body = form({
      payload: JSON.stringify(aggregatePayload()),
      imageMetadata: JSON.stringify([{ altText: " Front view ", sourceNote: " Studio sample " }]),
    });
    body.append("images", new File(["image"], "chair.jpg", { type: "image/jpeg" }));

    const response = await POST(requestWith(body));

    expect(response.status).toBe(201);
    expect(productImageCreate).toHaveBeenCalledWith({ data: expect.objectContaining({
      productId: "p1",
      altText: "Front view",
      sourceNote: "Studio sample",
      sortOrder: 0,
    }) });
  });

  it("rejects mismatched image metadata before creating a product", async () => {
    const body = form({
      payload: JSON.stringify(aggregatePayload()),
      imageMetadata: "[]",
    });
    body.append("images", new File(["image"], "chair.jpg", { type: "image/jpeg" }));

    const response = await POST(requestWith(body));

    expect(response.status).toBe(400);
    expect(productCreate).not.toHaveBeenCalled();
  });

  it("removes uploaded blobs and the created draft when image upload fails", async () => {
    uploadContentImage
      .mockResolvedValueOnce({ storagePath: "products/p1/first.jpg", publicUrl: "https://cdn.test/first.jpg", originalName: "first.jpg" })
      .mockRejectedValueOnce(new Error("Blob unavailable"));
    const body = form({ payload: JSON.stringify(aggregatePayload()), imageMetadata: "[{},{}]" });
    body.append("images", new File(["image"], "first.jpg", { type: "image/jpeg" }));
    body.append("images", new File(["image"], "second.jpg", { type: "image/jpeg" }));

    const response = await POST(requestWith(body));

    expect(response.status).toBe(502);
    expect(removeContentImage).toHaveBeenCalledWith("products/p1/first.jpg");
    expect(productDelete).toHaveBeenCalledWith({ where: { id: "p1" } });
  });
});

describe("admin product item route", () => {
  it("returns structured publish errors from the dynamic product service", async () => {
    publishProduct.mockRejectedValueOnce(Object.assign(new Error("Publish validation failed"), { code: "PUBLISH_VALIDATION", status: 400, fields: [{ tab: "variants", variantId: "v1", fieldKey: "effectiveSeatWidth", message: "Required" }] }));
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "publish", updatedAt: updatedAt.toISOString() }),
    }), { params: { id: "p1" } });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "PUBLISH_VALIDATION", fields: [{ fieldKey: "effectiveSeatWidth" }] });
  });

  it("saves a complete dynamic aggregate through the product service", async () => {
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "save-draft", updatedAt: updatedAt.toISOString(), payload: JSON.stringify(aggregatePayload()) }),
    }), { params: { id: "p1" } });

    expect(response.status).toBe(200);
    expect(saveProductDraft).toHaveBeenCalledWith("p1", expect.objectContaining({
      categoryId: "cat-1",
      variants: [expect.objectContaining({ sku: "PA22-A" })],
    }), updatedAt.toISOString());
    expect(productUpdate).not.toHaveBeenCalled();
  });

  it("does not remove existing images when aggregate validation fails", async () => {
    productFindUnique.mockResolvedValue({ ...product(), images: [{ id: "img1", storagePath: "products/p1/image.jpg", sortOrder: 0 }] });
    saveProductDraft.mockRejectedValueOnce(Object.assign(new Error("Invalid accessory"), { code: "INVALID_ACCESSORY", status: 400, fields: [] }));

    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "save-draft", updatedAt: updatedAt.toISOString(), payload: JSON.stringify({ ...aggregatePayload(), images: [] }) }),
    }), { params: { id: "p1" } });

    expect(response.status).toBe(400);
    expect(removeContentImage).not.toHaveBeenCalled();
    expect(productImageDelete).not.toHaveBeenCalled();
  });

  it("rolls back newly registered images when a later image insert fails", async () => {
    productFindUnique.mockResolvedValue({ ...product(), images: [{ id: "old-image", storagePath: "products/p1/old.jpg", sortOrder: 0 }] });
    uploadContentImage
      .mockResolvedValueOnce({ storagePath: "products/p1/new-1.jpg", publicUrl: "https://cdn.test/new-1.jpg", originalName: "new-1.jpg" })
      .mockResolvedValueOnce({ storagePath: "products/p1/new-2.jpg", publicUrl: "https://cdn.test/new-2.jpg", originalName: "new-2.jpg" });
    productImageCreate
      .mockResolvedValueOnce({ id: "new-image-1" })
      .mockRejectedValueOnce(new Error("Database unavailable"));
    const body = form({
      action: "save-draft",
      updatedAt: updatedAt.toISOString(),
      payload: JSON.stringify({ ...aggregatePayload(), images: [{ id: "old-image", sortOrder: 0 }] }),
      imageMetadata: "[{},{}]",
    });
    body.append("images", new File(["image"], "new-1.jpg", { type: "image/jpeg" }));
    body.append("images", new File(["image"], "new-2.jpg", { type: "image/jpeg" }));

    const response = await PATCH(requestWith(body), { params: { id: "p1" } });

    expect(response.status).toBe(502);
    expect(productImageDelete).toHaveBeenCalledWith({ where: { id: "new-image-1" } });
    expect(productImageDelete).not.toHaveBeenCalledWith({ where: { id: "old-image" } });
    expect(removeContentImage).toHaveBeenCalledWith("products/p1/new-1.jpg");
    expect(removeContentImage).toHaveBeenCalledWith("products/p1/new-2.jpg");
    expect(removeContentImage).not.toHaveBeenCalledWith("products/p1/old.jpg");
  });

  it("revalidates public catalog paths after publishing", async () => {
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "publish", updatedAt: updatedAt.toISOString() }),
    }), { params: { id: "p1" } });

    expect(response.status).toBe(200);
    expect(revalidatePath.mock.calls.map(([path]) => path)).toEqual(expect.arrayContaining(["/", "/products", "/wheelchair-finder"]));
  });
  it("returns 409 when updatedAt does not match", async () => {
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "save-draft", updatedAt: "2026-08-01T12:00:01.000Z" }),
    }), { params: { id: "p1" } });

    expect(response.status).toBe(409);
    expect(productUpdate).not.toHaveBeenCalled();
  });

  it("requires updatedAt for every item write", async () => {
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "save-draft" }),
    }), { params: { id: "p1" } });

    expect(response.status).toBe(400);
    expect(productUpdate).not.toHaveBeenCalled();
  });

  it("requires an image when publishing", async () => {
    publishProduct.mockRejectedValueOnce(Object.assign(new Error("Publish validation failed"), {
      code: "PUBLISH_VALIDATION",
      status: 400,
      fields: [{ tab: "media", fieldKey: "images", message: "At least one product image is required" }],
    }));
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "publish", updatedAt: updatedAt.toISOString() }),
    }), { params: { id: "p1" } });

    expect(response.status).toBe(400);
    expect(productUpdate).not.toHaveBeenCalled();
  });

  it("keeps database references when Storage deletion fails", async () => {
    const existing = { ...product(), images: [{ id: "img1", storagePath: "products/p1/abc-0-chair.jpg" }] };
    productFindUnique.mockResolvedValue(existing);
    removeContentImage.mockRejectedValueOnce(new Error("Storage unavailable"));

    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "delete", confirm: "true", updatedAt: updatedAt.toISOString() }),
    }), { params: { id: "p1" } });

    expect(response.status).toBe(502);
    expect(productDelete).not.toHaveBeenCalled();
  });

  it("deletes removed images and preserves the requested order", async () => {
    const existing = {
      ...product(),
      images: [
        { id: "img1", storagePath: "products/p1/abc-0-chair.jpg", sortOrder: 0 },
        { id: "img2", storagePath: "products/p1/def-1-chair.jpg", sortOrder: 1 },
      ],
    };
    productFindUnique.mockResolvedValue(existing);
    const payload = { updatedAt: updatedAt.toISOString(), images: [{ id: "img2", sortOrder: 0 }] };
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "save-draft", payload: JSON.stringify(payload) }),
    }), { params: { id: "p1" } });

    expect(response.status).toBe(200);
    expect(removeContentImage).toHaveBeenCalledWith("products/p1/abc-0-chair.jpg");
    expect(productImageDelete).toHaveBeenCalledWith({ where: { id: "img1" } });
    expect(productImageUpdate).toHaveBeenCalledWith({ where: { id: "img2" }, data: { sortOrder: 0 } });
  });

  it("removes repository images from the database without calling Storage", async () => {
    productFindUnique.mockResolvedValue({
      ...product(),
      images: [{ id: "img1", storagePath: "/products/travel-air.jpg", sortOrder: 0 }],
    });

    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({
        action: "save-draft",
        updatedAt: updatedAt.toISOString(),
        payload: JSON.stringify({ images: [] }),
      }),
    }), { params: { id: "p1" } });

    expect(response.status).toBe(200);
    expect(removeContentImage).not.toHaveBeenCalled();
    expect(productImageDelete).toHaveBeenCalledWith({ where: { id: "img1" } });
  });
});
