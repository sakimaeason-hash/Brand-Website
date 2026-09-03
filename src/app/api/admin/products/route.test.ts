import { describe, expect, it, vi, beforeEach } from "vitest";

const { requireAdmin, productFindUnique, productUpdate, productDelete, productImageDelete, productImageUpdate, removeContentImage } = vi.hoisted(() => ({
  requireAdmin: vi.fn(), productFindUnique: vi.fn(), productUpdate: vi.fn(), productDelete: vi.fn(),
  productImageDelete: vi.fn(), productImageUpdate: vi.fn(), removeContentImage: vi.fn(),
}));

vi.mock("@/lib/admin/authorization", () => ({ requireAdmin }));
vi.mock("@/lib/db", () => ({
  prisma: {
    product: { findUnique: productFindUnique, update: productUpdate, delete: productDelete },
    productImage: { delete: productImageDelete, update: productImageUpdate },
  },
}));
vi.mock("@/lib/content/storage", () => ({ removeContentImage }));

import { PATCH } from "./[id]/route";

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

beforeEach(() => {
  vi.clearAllMocks();
  requireAdmin.mockResolvedValue({ userId: "admin" });
  productFindUnique.mockResolvedValue(product());
  productUpdate.mockResolvedValue(product());
  removeContentImage.mockResolvedValue(undefined);
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
});
