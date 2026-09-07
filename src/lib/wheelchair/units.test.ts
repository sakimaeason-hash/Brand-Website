import { describe, expect, it } from "vitest";
import { FINDER_RULES } from "./rules-config";
import { inchesToMm, kgToLb, lbToKg, mmToInches, milesToKm } from "./units";

describe("wheelchair units", () => {
  it("round-trips US and canonical units", () => {
    expect(mmToInches(inchesToMm(18))).toBeCloseTo(18, 6);
    expect(kgToLb(lbToKg(330))).toBeCloseTo(330, 6);
    expect(milesToKm(15)).toBeCloseTo(24.14016, 5);
  });

  it("keeps safety and scoring weights explicit", () => {
    expect(FINDER_RULES.seatDepth.idealBodyOffsetMm).toBe(55);
    expect(FINDER_RULES.seatDepth.bodyOffsetMinMm).toBe(50);
    expect(FINDER_RULES.seatDepth.bodyOffsetMaxMm).toBe(60);
    expect(FINDER_RULES.seatDepth.shortfallHardLimitMm).toBe(100);
    expect(FINDER_RULES.seatDepth.kneeClearanceMinMm).toBe(30);
    expect(Object.values(FINDER_RULES.scoreWeights).reduce((a, b) => a + b, 0)).toBe(100);
  });
});
