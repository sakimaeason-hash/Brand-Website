import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin, updateMany, findUnique, revalidatePath } = vi.hoisted(() => ({
  requireAdmin: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn(), revalidatePath: vi.fn(),
}));
vi.mock("@/lib/admin/authorization", () => ({ requireAdmin, AdminAuthError: class extends Error {} }));
vi.mock("@/lib/db", () => ({ prisma: { product: { updateMany, findUnique } } }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { PATCH } from "./route";
const version = "2026-09-28T00:00:00.000Z";
let record: null | { id: string; updatedAt: Date; isNewArrival: boolean; status: string; isFeatured: boolean; variants: string[]; images: string[] };

async function patch(value: unknown, id = "p1") {
  return PATCH(new Request("http://test", {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: typeof value === "string" ? value : JSON.stringify(value),
  }), { params: { id } });
}

beforeEach(() => {
  vi.clearAllMocks();
  requireAdmin.mockResolvedValue({ userId: "admin" });
  record = { id: "p1", updatedAt: new Date(version), isNewArrival: false, status: "PUBLISHED", isFeatured: true, variants: ["sku-1"], images: ["img-1"] };
  updateMany.mockImplementation(async ({ where, data }) => {
    if (!record || where.id !== record.id || where.updatedAt.getTime() !== record.updatedAt.getTime()) return { count: 0 };
    Object.assign(record, data);
    return { count: 1 };
  });
  findUnique.mockImplementation(async () => record && { id: record.id });
});

describe("new-arrival membership endpoint", () => {
  it.each([true, false])("atomically sets membership to %s without changing publication or product contents", async (isNewArrival) => {
    record!.isNewArrival = !isNewArrival;
    const response = await patch({ isNewArrival, updatedAt: version });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ id: "p1", isNewArrival, updatedAt: expect.any(String) });
    expect(new Date(body.updatedAt).getTime()).toBeGreaterThan(new Date(version).getTime());
    expect(record).toMatchObject({ isNewArrival, status: "PUBLISHED", isFeatured: true, variants: ["sku-1"], images: ["img-1"] });
    expect(updateMany).toHaveBeenCalledWith({ where: { id: "p1", updatedAt: new Date(version) }, data: { isNewArrival, updatedAt: new Date(body.updatedAt) } });
    expect(revalidatePath).toHaveBeenCalledWith("/new-arrivals");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/new-arrivals");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/products/p1");
  });

  it.each([401, 403])("rejects %s before reading the request or querying product data", async (status) => {
    requireAdmin.mockRejectedValueOnce(Object.assign(new Error("Admin access required"), { status }));
    const request = new Request("http://test", { method: "PATCH", body: "invalid" });
    const json = vi.spyOn(request, "json");
    const response = await PATCH(request, { params: { id: "p1" } });
    expect(response.status).toBe(status);
    expect(json).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it.each([
    "{broken", {}, { isNewArrival: "true", updatedAt: version }, { isNewArrival: 1, updatedAt: version },
    { isNewArrival: true }, { isNewArrival: true, updatedAt: "not-a-date" },
    { isNewArrival: true, updatedAt: "2026-09-28" }, { isNewArrival: true, updatedAt: version, status: "PUBLISHED" },
  ])("rejects invalid membership or version input %#", async (input) => {
    const response = await patch(input);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "VALIDATION_ERROR", error: expect.any(String) });
    expect(updateMany).not.toHaveBeenCalled();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when the product does not exist", async () => {
    record = null;
    const response = await patch({ isNewArrival: true, updatedAt: version });
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ code: "NOT_FOUND" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns 409 for a stale version without changing membership", async () => {
    record!.updatedAt = new Date("2026-09-28T01:00:00.000Z");
    const response = await patch({ isNewArrival: true, updatedAt: version });
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ code: "CONCURRENT_UPDATE" });
    expect(record!.isNewArrival).toBe(false);
  });

  it("allows only one concurrent write using the same version", async () => {
    const responses = await Promise.all([
      patch({ isNewArrival: true, updatedAt: version }), patch({ isNewArrival: false, updatedAt: version }),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
    expect(record!.isNewArrival).toBe(true);
  });

  it("does not expose database exception details", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    updateMany.mockRejectedValueOnce(new Error("secret database connection details"));
    const response = await patch({ isNewArrival: true, updatedAt: version });
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("secret");
    log.mockRestore();
  });
});
