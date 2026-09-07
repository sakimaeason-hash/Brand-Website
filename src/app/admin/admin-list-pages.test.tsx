import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { productFindMany, storyFindMany, promotionFindMany } = vi.hoisted(() => ({
  productFindMany: vi.fn(),
  storyFindMany: vi.fn(),
  promotionFindMany: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    product: { findMany: productFindMany },
    customerStory: { findMany: storyFindMany },
    promotion: { findMany: promotionFindMany },
  },
}));
vi.mock("@/components/admin/StatusBadge", () => ({ StatusBadge: ({ status }: { status: string }) => <span>{status}</span> }));

import ProductsPage from "./products/page";
import StoriesPage from "./stories/page";
import PromotionsPage from "./promotions/page";

beforeEach(() => {
  vi.clearAllMocks();
  productFindMany.mockResolvedValue([]);
  storyFindMany.mockResolvedValue([]);
  promotionFindMany.mockResolvedValue([]);
});
afterEach(() => cleanup());

describe("admin content list pages", () => {
  it("shows product thumbnails and detail links", async () => {
    productFindMany.mockResolvedValue([{
      id: "p1", name: "Travel Air W 26", model: "PA22", status: "PUBLISHED",
      updatedAt: new Date("2026-08-01T12:00:00.000Z"), images: [{ publicUrl: "/products/chair.jpg" }],
    }]);

    render(await ProductsPage());

    expect(screen.getByRole("link", { name: /Travel Air W 26/ })).toHaveAttribute("href", "/admin/products/p1");
    expect(screen.getByRole("img", { name: "Travel Air W 26" })).toHaveAttribute("src", expect.stringContaining("%2Fproducts%2Fchair.jpg"));
  });

  it("shows story thumbnails with links into the editor", async () => {
    storyFindMany.mockResolvedValue([{
      id: "s1", displayName: "Alex", status: "DRAFT", images: [{ publicUrl: "/stories/alex.jpg" }],
    }]);

    render(await StoriesPage());

    expect(screen.getByRole("link", { name: "Alex" })).toHaveAttribute("href", "/admin/stories/s1");
    expect(screen.getByRole("img", { name: "Alex" })).toHaveAttribute("src", expect.stringContaining("%2Fstories%2Falex.jpg"));
  });

  it("derives scheduled, active, ended and paused promotion states in ET", async () => {
    const now = Date.now();
    promotionFindMany.mockResolvedValue([
      { id: "scheduled", name: "Scheduled", status: "PUBLISHED", isAutoScheduleEnabled: true, startAt: new Date(now + 86400000), endAt: new Date(now + 172800000) },
      { id: "active", name: "Active", status: "PUBLISHED", isAutoScheduleEnabled: true, startAt: new Date(now - 86400000), endAt: new Date(now + 86400000) },
      { id: "ended", name: "Ended", status: "PUBLISHED", isAutoScheduleEnabled: true, startAt: new Date(now - 172800000), endAt: new Date(now - 86400000) },
      { id: "paused", name: "Paused", status: "UNPUBLISHED", isAutoScheduleEnabled: true, startAt: new Date(now - 86400000), endAt: new Date(now + 86400000) },
    ]);

    render(await PromotionsPage());

    expect(screen.getByRole("link", { name: "Scheduled" })).toHaveAttribute("href", "/admin/promotions/scheduled");
    expect(screen.getByText("scheduled", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("active", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("ended", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("paused", { exact: true })).toBeInTheDocument();
    expect(screen.getAllByText(/ET/).length).toBeGreaterThan(0);
  });
});
