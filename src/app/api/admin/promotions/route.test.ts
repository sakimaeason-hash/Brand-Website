import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin, promotionFindUnique, promotionUpdate, promotionDelete, productFindUnique } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  promotionFindUnique: vi.fn(),
  promotionUpdate: vi.fn(),
  promotionDelete: vi.fn(),
  productFindUnique: vi.fn(),
}));

vi.mock("@/lib/admin/authorization", () => ({ requireAdmin }));
vi.mock("@/lib/db", () => ({
  prisma: {
    promotion: { findUnique: promotionFindUnique, update: promotionUpdate, delete: promotionDelete },
    product: { findUnique: productFindUnique },
  },
}));

import { PATCH } from "./[id]/route";

const updatedAt = new Date("2026-08-01T12:00:00.000Z");
const promotion = () => ({
  id: "promo-1",
  name: "Summer sale",
  productId: "p1",
  startAt: new Date("2026-07-01T16:00:00.000Z"),
  endAt: new Date("2026-07-02T16:00:00.000Z"),
  salePrice: 799,
  discountPercent: null,
  label: "Summer",
  bannerImageUrl: null,
  isAutoScheduleEnabled: true,
  status: "DRAFT",
  updatedAt,
});

function form(fields: Record<string, string>) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  return body;
}

beforeEach(() => {
  vi.clearAllMocks();
  requireAdmin.mockResolvedValue({ userId: "admin" });
  promotionFindUnique.mockResolvedValue(promotion());
  promotionUpdate.mockResolvedValue({ ...promotion(), status: "PUBLISHED" });
  productFindUnique.mockResolvedValue({ id: "p1" });
});

describe("admin promotion item route", () => {
  it("returns 409 when updatedAt does not match", async () => {
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "publish", updatedAt: "2026-08-01T12:00:01.000Z" }),
    }), { params: { id: "promo-1" } });

    expect(response.status).toBe(409);
    expect(promotionUpdate).not.toHaveBeenCalled();
  });

  it("requires updatedAt for every item write", async () => {
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "save-draft" }),
    }), { params: { id: "promo-1" } });

    expect(response.status).toBe(400);
    expect(promotionUpdate).not.toHaveBeenCalled();
  });

  it("revalidates the promotion before publishing", async () => {
    promotionFindUnique.mockResolvedValue({ ...promotion(), endAt: new Date("2026-06-30T16:00:00.000Z") });
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "publish", updatedAt: updatedAt.toISOString() }),
    }), { params: { id: "promo-1" } });

    expect(response.status).toBe(400);
    expect(promotionUpdate).not.toHaveBeenCalled();
  });

  it("rejects unsupported actions", async () => {
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "activate", updatedAt: updatedAt.toISOString() }),
    }), { params: { id: "promo-1" } });

    expect(response.status).toBe(400);
    expect(promotionUpdate).not.toHaveBeenCalled();
  });
});
