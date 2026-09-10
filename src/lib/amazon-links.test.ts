import { describe, expect, it } from "vitest";
import { getAmazonPurchaseLink } from "./amazon-links";

describe("Amazon purchase links", () => {
  it("accepts HTTPS Amazon hosts and rejects other destinations", () => {
    expect(getAmazonPurchaseLink("https://www.amazon.com/dp/B0TEST")).toBe("https://www.amazon.com/dp/B0TEST");
    expect(getAmazonPurchaseLink("https://smile.amazon.com/dp/B0TEST")).toBe("https://smile.amazon.com/dp/B0TEST");
    expect(getAmazonPurchaseLink("http://www.amazon.com/dp/B0TEST")).toBeNull();
    expect(getAmazonPurchaseLink("https://example.com/product")).toBeNull();
    expect(getAmazonPurchaseLink("https://amazon.com.evil.example/dp/B0TEST")).toBeNull();
  });
});
