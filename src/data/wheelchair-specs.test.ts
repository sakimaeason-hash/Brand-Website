import { describe, expect, it } from "vitest";
import { OFFICIAL_WHEELCHAIR_SPECS, getWheelchairSpec } from "./wheelchair-specs";
import { batteryWh } from "@/lib/wheelchair/units";
import type { WheelchairVariantSpec } from "@/lib/wheelchair/types";

describe("official wheelchair specifications", () => {
  it("maps every storefront wheelchair to its official family", () => {
    expect(OFFICIAL_WHEELCHAIR_SPECS).toHaveLength(7);
    expect(getWheelchairSpec("1").officialFamily).toContain("ND03");
    expect(getWheelchairSpec("2").variants[0].variantId).toBe("PA22V100");
    expect(getWheelchairSpec("7").variants.map((v) => v.variantId)).toEqual(["PA13A100", "PA13L100", "PA13N100"]);
  });
  it("uses metric source values and derives aviation watt-hours", () => {
    const w03 = getWheelchairSpec("1").variants[0];
    expect(w03.seatWidthMm).toBe(440);
    expect(w03.netWeightWithoutBatteryKg).toBe(15);
    expect(batteryWh(w03.battery.voltageV, w03.battery.capacityAh)).toBe(252);
  });
  it("marks missing and conflicting values instead of guessing", () => {
    const w21 = getWheelchairSpec("2").variants[0];
    const spacious = getWheelchairSpec("6").variants[0];
    expect(w21.source.status.batteryVoltageV).toBe("missing");
    expect(spacious.source.status.cushionWidthMm).toBe("conflicting");
  });

  it("contains unique storefront and variant identifiers", () => {
    const productIds = OFFICIAL_WHEELCHAIR_SPECS.map((product) => product.productId);
    const variantIds = OFFICIAL_WHEELCHAIR_SPECS.flatMap((product) =>
      product.variants.map((item) => item.variantId),
    );

    expect(new Set(productIds).size).toBe(7);
    expect(new Set(variantIds).size).toBe(17);
    expect(variantIds).toHaveLength(17);
  });

  it("preserves every missing and conflicting source status", () => {
    expect(getWheelchairSpec("2").variants[0].source.status.batteryVoltageV).toBe("missing");
    expect(getWheelchairSpec("3").variants.every((item) => item.source.status.batteryVoltageV === "missing")).toBe(true);
    expect(getWheelchairSpec("5").variants.find((item) => item.variantId === "PA16K100")?.source.status.cushionWidthMm).toBe("conflicting");
    expect(getWheelchairSpec("6").variants.every((item) => item.source.status.cushionWidthMm === "conflicting")).toBe(true);
    expect(getWheelchairSpec("7").variants.every((item) => item.source.status.batteryWeightKg === "missing")).toBe(true);
  });

  it("uses authoritative metric values for conflicting conversion rows", () => {
    expect(getWheelchairSpec("5").variants.every((item) => item.turningRadiusMm === 1200)).toBe(true);
    expect(getWheelchairSpec("6").variants.every((item) => item.foldedMm.width === 360)).toBe(true);
    expect(getWheelchairSpec("7").variants.every((item) => item.seatToFootrestMm === 380)).toBe(true);
  });

  it("retains rule-relevant raw evidence for audited conflicts", () => {
    const a16 = getWheelchairSpec("5").variants[0].source.raw;
    const pa15 = getWheelchairSpec("6").variants[0].source.raw;
    const pa13 = getWheelchairSpec("7").variants[0].source.raw;

    expect(a16).toMatchObject({ turningRadiusMetric: "1200 mm", turningRadiusImperial: "42.2 in" });
    expect(pa15).toMatchObject({ foldedWidthMetric: "360 mm", foldedWidthImperial: "154.6 in" });
    expect(pa13).toMatchObject({ seatToFootrestMetric: "380 mm", seatToFootrestImperial: "18.9 in" });
  });

  it("deep-freezes the exported catalog and shared nested records", () => {
    const w03 = getWheelchairSpec("1").variants[0];
    const sibling = getWheelchairSpec("1").variants[1];

    expect(Object.isFrozen(OFFICIAL_WHEELCHAIR_SPECS)).toBe(true);
    expect(Object.isFrozen(getWheelchairSpec("1").variants)).toBe(true);
    expect(w03.battery).toBe(sibling.battery);
    expect(w03.foldedMm).toBe(sibling.foldedMm);
    expect(Object.isFrozen(w03.battery)).toBe(true);
    expect(Object.isFrozen(w03.foldedMm)).toBe(true);
    expect(Reflect.set(w03, "seatWidthMm", 999)).toBe(false);
    expect(Reflect.set(w03.battery, "capacityAh", 99)).toBe(false);
    expect(w03.seatWidthMm).toBe(440);
    expect(w03.battery.capacityAh).toBe(10);
  });

  it("rejects unknown storefront products", () => {
    expect(() => getWheelchairSpec("unknown")).toThrow("Unknown wheelchair product: unknown");
  });

  it("returns variants compatible with the official specification contract", () => {
    const wheelchairVariant: WheelchairVariantSpec = getWheelchairSpec("1").variants[0];

    expect(wheelchairVariant.variantId).toBe("GI03H102");
  });
});
