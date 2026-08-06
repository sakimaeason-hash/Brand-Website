import { describe, expect, it } from "vitest";
import { products, wheelchairProducts } from "./products";

describe("central storefront catalog", () => {
  it("preserves all five scooters and seven wheelchairs", () => {
    expect(products.filter((p) => p.category === "scooter")).toHaveLength(5);
    expect(wheelchairProducts).toHaveLength(7);
  });

  it("uses official facts for wheelchair summaries", () => {
    expect(wheelchairProducts.find((p) => p.id === "1")?.weight).toBe("33.1 lb without battery");
    expect(wheelchairProducts.find((p) => p.id === "2")?.range).toBe("15 mi");
    expect(wheelchairProducts.find((p) => p.id === "6")?.seatWidth).toBe("21.7 in");
  });
});
