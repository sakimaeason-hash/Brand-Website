import { isWithinPromotionWindow } from "./timezone";

export type PromotionPriceInput = { salePrice?: number | null; discountPercent?: number | null };
export function calculateSalePrice(originalPrice: number, promotion: PromotionPriceInput) {
  if (promotion.salePrice != null) return Number(promotion.salePrice.toFixed(2));
  if (promotion.discountPercent != null) return Number((originalPrice * (1 - promotion.discountPercent / 100)).toFixed(2));
  return originalPrice;
}

export function isPromotionActive(now: Date, promotion: { status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED"; isAutoScheduleEnabled: boolean; startAt: Date; endAt: Date }) {
  return promotion.status === "PUBLISHED" && promotion.isAutoScheduleEnabled && isWithinPromotionWindow(now, promotion.startAt, promotion.endAt);
}
