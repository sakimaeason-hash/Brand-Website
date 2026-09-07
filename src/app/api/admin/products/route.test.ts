import { describe, expect, it, vi, beforeEach } from "vitest";

const { requireAdmin, productCreate, productFindUnique, productUpdate, productDelete, productImageCreate, productImageDelete, productImageUpdate, removeContentImage, uploadContentImage } = vi.hoisted(() => ({
  requireAdmin: vi.fn(), productCreate: vi.fn(), productFindUnique: vi.fn(), productUpdate: vi.fn(), productDelete: vi.fn(),
  productImageCreate: vi.fn(), productImageDelete: vi.fn(), productImageUpdate: vi.fn(), removeContentImage: vi.fn(), uploadContentImage: vi.fn(),
}));

vi.mock("@/lib/admin/authorization", () => ({ requireAdmin, AdminAuthError: class AdminAuthError extends Error {} }));
vi.mock("@/lib/db", () => ({
  prisma: {
    product: { create: productCreate, findUnique: productFindUnique, update: productUpdate, delete: productDelete },
    productImage: { create: productImageCreate, delete: productImageDelete, update: productImageUpdate },
  },
}));
vi.mock("@/lib/content/storage", () => ({ removeContentImage, uploadContentImage }));

import { PATCH } from "./[id]/route";
import { POST } from "./route";

const updatedAt = new Date("2026-08-01T12:00:00.000Z");
const product = () => ({
  id: "p1", name: "Travel Air", model: "PA22", category: "wheelchair", price: 1000,
  originalPrice: null, features: [], status: "DRAFT", isFeatured: false, sortOrder: 0,
  updatedAt, images: [],
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
  removeContentImage.mockResolvedValue(undefined);
  uploadContentImage.mockResolvedValue({
    storagePath: "products/p1/abc-0-chair.jpg",
    publicUrl: "https://cdn.test/chair.jpg",
    originalName: "chair.jpg",
  });
});

describe("admin product collection route", () => {
  it("stores trimmed metadata with each uploaded image", async () => {
    const body = form({
      payload: JSON.stringify({ name: "Travel Air", model: "PA22", price: 1000 }),
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
      payload: JSON.stringify({ name: "Travel Air", model: "PA22", price: 1000 }),
      imageMetadata: "[]",
    });
    body.append("images", new File(["image"], "chair.jpg", { type: "image/jpeg" }));

    const response = await POST(requestWith(body));

    expect(response.status).toBe(400);
    expect(productCreate).not.toHaveBeenCalled();
  });
});

describe("admin product item route", () => {
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
