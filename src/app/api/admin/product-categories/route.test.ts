import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin, listAdminCategories, createCategory, updateCategory, archiveCategory, CatalogServiceError } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  listAdminCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  archiveCategory: vi.fn(),
  CatalogServiceError: class CatalogServiceError extends Error {
    constructor(
      public readonly code: string,
      message: string,
      public readonly status = 400,
      public readonly fields: unknown[] = [],
    ) {
      super(message);
    }
  },
}));

vi.mock("@/lib/admin/authorization", () => ({
  requireAdmin,
  AdminAuthError: class AdminAuthError extends Error {
    status = 403;
  },
}));
vi.mock("@/lib/catalog/category-service", () => ({
  listAdminCategories,
  createCategory,
  updateCategory,
  archiveCategory,
  CatalogServiceError,
}));

import { PATCH } from "./[id]/route";
import { GET, POST } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  requireAdmin.mockResolvedValue({ userId: "admin" });
  listAdminCategories.mockResolvedValue([]);
  createCategory.mockResolvedValue({ id: "cat-1", slug: "chairs" });
  updateCategory.mockResolvedValue({ id: "cat-1", slug: "chairs" });
  archiveCategory.mockResolvedValue({ id: "cat-1", status: "ARCHIVED" });
});

describe("admin product category collection route", () => {
  it("rejects a non-admin before reading categories", async () => {
    requireAdmin.mockRejectedValueOnce(Object.assign(new Error("Admin access required"), { status: 403 }));
    const response = await GET();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "Admin access required",
      code: "ADMIN_ACCESS_REQUIRED",
      fields: [],
    });
    expect(listAdminCategories).not.toHaveBeenCalled();
  });

  it("lists categories after admin authorization", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
    expect(requireAdmin).toHaveBeenCalledTimes(1);
  });

  it("creates a category from JSON", async () => {
    const response = await POST(new Request("http://test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Chairs", fields: [] }),
    }));
    expect(response.status).toBe(201);
    expect(createCategory).toHaveBeenCalledWith({ name: "Chairs", fields: [] });
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(new Request("http://test", { method: "POST", body: "{", headers: { "content-type": "application/json" } }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "VALIDATION_ERROR" });
  });
});

describe("admin product category item route", () => {
  const updatedAt = "2026-09-01T00:00:00.000Z";

  it("saves a category with its optimistic concurrency timestamp", async () => {
    const payload = { name: "Power Chairs", fields: [] };
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "save", updatedAt, payload }),
    }), { params: { id: "cat-1" } });

    expect(response.status).toBe(200);
    expect(updateCategory).toHaveBeenCalledWith("cat-1", payload, updatedAt);
  });

  it("accepts the flat payload sent by the existing category form", async () => {
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ updatedAt, name: "Power Chairs", fields: [] }),
    }), { params: { id: "cat-1" } });

    expect(response.status).toBe(200);
    expect(updateCategory).toHaveBeenCalledWith("cat-1", { name: "Power Chairs", fields: [] }, updatedAt);
  });

  it("archives a category with its optimistic concurrency timestamp", async () => {
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "archive", updatedAt }),
    }), { params: { id: "cat-1" } });

    expect(response.status).toBe(200);
    expect(archiveCategory).toHaveBeenCalledWith("cat-1", updatedAt);
    expect(updateCategory).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: "{",
    }), { params: { id: "cat-1" } });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("returns 400 for an unsupported action", async () => {
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "delete", updatedAt }),
    }), { params: { id: "cat-1" } });

    expect(response.status).toBe(400);
    expect(updateCategory).not.toHaveBeenCalled();
    expect(archiveCategory).not.toHaveBeenCalled();
  });

  it("does not treat null as the save action", async () => {
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: null, updatedAt, payload: { name: "Chairs", fields: [] } }),
    }), { params: { id: "cat-1" } });

    expect(response.status).toBe(400);
    expect(updateCategory).not.toHaveBeenCalled();
  });

  it("preserves structured 409 service errors", async () => {
    updateCategory.mockRejectedValueOnce(new CatalogServiceError(
      "SLUG_CONFLICT",
      "A category with this slug already exists.",
      409,
      [{ fieldKey: "slug" }],
    ));
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ updatedAt, payload: { name: "Chairs", fields: [] } }),
    }), { params: { id: "cat-1" } });

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "A category with this slug already exists.",
      code: "SLUG_CONFLICT",
      fields: [{ fieldKey: "slug" }],
    });
  });
});
