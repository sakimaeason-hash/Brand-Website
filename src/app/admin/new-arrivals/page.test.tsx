import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin, findMany, refresh, redirect } = vi.hoisted(() => ({ requireAdmin: vi.fn(), findMany: vi.fn(), refresh: vi.fn(), redirect: vi.fn(() => { throw new Error("NEXT_REDIRECT"); }) }));
vi.mock("@/lib/admin/authorization", () => ({ requireAdmin, AdminAuthError: class extends Error { constructor(message: string, public status: number) { super(message); } } }));
vi.mock("@/lib/db", () => ({ prisma: { product: { findMany } } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }), redirect }));

import Page from "./page";
import AdminPage from "../page";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminAuthError } from "@/lib/admin/authorization";

beforeEach(() => {
  vi.clearAllMocks();
  requireAdmin.mockResolvedValue({ userId: "admin" });
  findMany.mockResolvedValue([]);
});
afterEach(() => cleanup());

describe("New Arrivals administration", () => {
  it("redirects signed-out visitors before querying product data", async () => {
    requireAdmin.mockRejectedValueOnce(new AdminAuthError("Authentication required", 401));
    await expect(Page()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/auth/signin?callbackUrl=/admin/new-arrivals");
    expect(findMany).not.toHaveBeenCalled();
  });

  it("shows an access-denied message without querying products for non-admins", async () => {
    requireAdmin.mockRejectedValueOnce(new AdminAuthError("Admin access required", 403));
    render(await Page());
    expect(screen.getByRole("heading", { name: "Admin access required" })).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
    expect(findMany).not.toHaveBeenCalled();
  });

  it("shows all product statuses, selection, eligibility, edit links and existing promotions", async () => {
    findMany.mockResolvedValue([
      { id: "p1", name: "Travel Air", model: "PA22", status: "PUBLISHED", isNewArrival: true, updatedAt: new Date(), categoryRelation: { status: "ACTIVE" }, variants: [{ id: "v1" }] },
      { id: "p2", name: "New draft", model: "DRAFT-1", status: "DRAFT", isNewArrival: true, updatedAt: new Date(), categoryRelation: null, variants: [] },
    ]);
    render(await Page());
    expect(requireAdmin.mock.invocationCallOrder[0]).toBeLessThan(findMany.mock.invocationCallOrder[0]);
    expect(findMany.mock.calls[0][0]).not.toHaveProperty("where");
    expect(findMany.mock.calls[0][0]).toMatchObject({ select: { id: true, isNewArrival: true, updatedAt: true } });
    expect(screen.getByRole("heading", { name: "New Arrivals & Offers" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Travel Air" })).toHaveAttribute("href", "/admin/products/p1");
    expect(screen.getByRole("link", { name: "Manage special offers" })).toHaveAttribute("href", "/admin/promotions");
    expect(screen.getByText(/published.*active category.*active SKU/i)).toBeInTheDocument();
    expect(within(screen.getByRole("row", { name: /Travel Air/ })).getByText("Visible")).toBeInTheDocument();
    expect(within(screen.getByRole("row", { name: /New draft/ })).getByText("Awaiting publication")).toBeInTheDocument();
  });

  it("includes a direct management link in admin navigation", () => {
    render(<AdminNav />);
    expect(screen.getByRole("link", { name: "New Arrivals & Offers" })).toHaveAttribute("href", "/admin/new-arrivals");
  });

  it("includes a direct management link in the overview", () => {
    render(<AdminPage />);
    expect(screen.getByRole("link", { name: /New Arrivals & Offers/ })).toHaveAttribute("href", "/admin/new-arrivals");
  });
});
