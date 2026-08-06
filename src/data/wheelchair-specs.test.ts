import { describe, expect, it } from "vitest";
import { OFFICIAL_WHEELCHAIR_SPECS, getWheelchairSpec } from "./wheelchair-specs";
import { batteryWh } from "@/lib/wheelchair/units";

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
});
