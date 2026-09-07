import { describe, expect, it } from "vitest";
import { calculateSalePrice, isPromotionActive } from "./promotions";

describe("promotions", () => {
  it("prefers sale price and otherwise applies a percentage", () => {
    expect(calculateSalePrice(100, { salePrice: 74.5, discountPercent: 20 })).toBe(74.5);
    expect(calculateSalePrice(99.99, { discountPercent: 15 })).toBe(84.99);
  });
  it("only activates published scheduled promotions in the window", () => {
    const p = { status: "PUBLISHED" as const, isAutoScheduleEnabled: true, startAt: new Date("2026-07-01T00:00:00Z"), endAt: new Date("2026-07-02T00:00:00Z") };
    expect(isPromotionActive(new Date("2026-07-01T12:00:00Z"), p)).toBe(true);
    expect(isPromotionActive(new Date("2026-07-02T00:00:00Z"), p)).toBe(false);
  });
});
