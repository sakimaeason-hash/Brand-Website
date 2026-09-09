import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin, listAdminCategories, createCategory } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  listAdminCategories: vi.fn(),
  createCategory: vi.fn(),
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
  CatalogServiceError: class CatalogServiceError extends Error {},
}));

import { GET, POST } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  requireAdmin.mockResolvedValue({ userId: "admin" });
  listAdminCategories.mockResolvedValue([]);
  createCategory.mockResolvedValue({ id: "cat-1", slug: "chairs" });
});

describe("admin product category collection route", () => {
  it("rejects a non-admin before reading categories", async () => {
    requireAdmin.mockRejectedValueOnce(Object.assign(new Error("Admin access required"), { status: 403 }));
    const response = await GET();
    expect(response.status).toBe(500);
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
});
