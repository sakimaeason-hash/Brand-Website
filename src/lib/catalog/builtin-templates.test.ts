import { describe, expect, it } from "vitest";
import {
  BUILTIN_CATEGORIES,
  getBuiltinCategory,
} from "./builtin-templates";

describe("builtin catalog templates", () => {
  it("defines the stable built-in category slugs", () => {
    expect(BUILTIN_CATEGORIES.map((item) => item.slug)).toEqual([
      "powered-wheelchairs",
      "manual-wheelchairs",
      "mobility-scooters",
      "shower-chairs",
      "accessories",
    ]);
  });

  it("protects the recommendation fields for powered and manual wheelchairs", () => {
    const powered = getBuiltinCategory("powered-wheelchairs");
    const manual = getBuiltinCategory("manual-wheelchairs");

    expect(powered?.recommendationProfile).toBe("POWERED_WHEELCHAIR");
    expect(powered?.fields.find((field) => field.semanticKey === "effectiveSeatWidth"))
      .toMatchObject({ isProtected: true, requiredForRecommendation: true });
    expect(powered?.fields.find((field) => field.semanticKey === "maxSpeed"))
      .toMatchObject({ isProtected: true, scope: "VARIANT" });
    expect(manual?.recommendationProfile).toBe("MANUAL_WHEELCHAIR");
    expect(manual?.fields.find((field) => field.semanticKey === "maxUserWeight"))
      .toMatchObject({ isProtected: true, requiredForRecommendation: true });
  });

  it("keeps shower-chair and accessory templates catalog-only by default", () => {
    expect(getBuiltinCategory("shower-chairs")).toMatchObject({
      role: "PRODUCT",
      recommendationProfile: "NONE",
    });
    expect(getBuiltinCategory("accessories")).toMatchObject({
      role: "ACCESSORY",
      recommendationProfile: "NONE",
    });
  });
});
