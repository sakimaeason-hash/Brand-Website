import { describe, expect, it } from "vitest";
import { getWheelchairSpec } from "@/data/wheelchair-specs";
import type { FinderAssessment } from "./types";
import { evaluateHardConstraints, fitsStorage, liftWeightKg } from "./recommend";
import { inchesToMm, lbToKg, milesToKm } from "./units";

const assessment: FinderAssessment = {
  mode: "precision",
  unitSystem: "us",
  heightMm: inchesToMm(68),
  weightKg: lbToKg(180),
  bodyBuild: "average",
  hipWidthMm: inchesToMm(17),
  bodySeatDepthMm: inchesToMm(19),
  lowerLegMm: inchesToMm(15.5),
  safety: {
    pressureInjuryConcern: false,
    posturalAsymmetry: false,
    customPositioningNeed: false,
  },
  use: {
    environment: "mixed",
    surfaces: ["smooth"],
    tightSpaces: false,
    dailyRangeKm: milesToKm(10),
    airlineTravel: false,
    priorities: ["fit"],
  },
};

describe("hard safety filters", () => {
  it.each([
    "pressureInjuryConcern",
    "posturalAsymmetry",
    "customPositioningNeed",
  ] as const)("immediately requires a professional assessment for %s", (concern) => {
    const result = evaluateHardConstraints(
      {
        ...assessment,
        weightKg: lbToKg(331),
        safety: { ...assessment.safety, [concern]: true },
        use: {
          ...assessment.use,
          storageMm: { length: 1, width: 1, height: 1 },
        },
      },
      getWheelchairSpec("1").variants[0],
    );

    expect(result).toEqual(["professional-assessment"]);
  });

  it("blocks over-capacity and too-narrow products", () => {
    const variant = getWheelchairSpec("1").variants[0];

    expect(evaluateHardConstraints({ ...assessment, weightKg: lbToKg(331) }, variant)).toContain(
      "over-capacity",
    );
    expect(evaluateHardConstraints({ ...assessment, hipWidthMm: 441 }, variant)).toContain(
      "seat-too-narrow",
    );
  });

  it("blocks seat depth and fixed footrest mismatches at configured boundaries", () => {
    const variant = getWheelchairSpec("1").variants[0];

    expect(evaluateHardConstraints({ ...assessment, bodySeatDepthMm: 440 }, variant)).toContain(
      "seat-too-deep",
    );
    expect(evaluateHardConstraints({ ...assessment, lowerLegMm: 460 }, variant)).toContain(
      "footrest-mismatch",
    );
  });

  it("checks all six folded-storage orientations", () => {
    const item = { length: 1, width: 2, height: 3 };
    const orientations = [
      { length: 1, width: 2, height: 3 },
      { length: 1, width: 3, height: 2 },
      { length: 2, width: 1, height: 3 },
      { length: 2, width: 3, height: 1 },
      { length: 3, width: 1, height: 2 },
      { length: 3, width: 2, height: 1 },
    ];

    expect(orientations.every((storage) => fitsStorage(item, storage))).toBe(true);

    const variant = getWheelchairSpec("1").variants[0];
    const fitsRotated = {
      ...assessment,
      use: {
        ...assessment.use,
        storageMm: { length: 850, width: 550, height: 350 },
      },
    };
    const tooSmall = {
      ...assessment,
      use: {
        ...assessment.use,
        storageMm: { length: 500, width: 500, height: 500 },
      },
    };

    expect(evaluateHardConstraints(fitsRotated, variant)).not.toContain("storage-too-small");
    expect(evaluateHardConstraints(tooSmall, variant)).toContain("storage-too-small");
  });

  it("requires known compliant watt-hours for an airline request", () => {
    const airline = { ...assessment, use: { ...assessment.use, airlineTravel: true } };

    expect(evaluateHardConstraints(airline, getWheelchairSpec("1").variants[0])).not.toContain(
      "airline-not-verified",
    );
    expect(evaluateHardConstraints(airline, getWheelchairSpec("2").variants[0])).toContain(
      "airline-not-verified",
    );
  });

  it("keeps exact capacity, width, depth, and footrest hard limits eligible", () => {
    const variant = getWheelchairSpec("1").variants[0];
    const atLimits = {
      ...assessment,
      weightKg: variant.maxUserWeightKg,
      hipWidthMm: Math.min(variant.seatWidthMm, variant.armrestSpacingMm),
      bodySeatDepthMm: variant.seatDepthMm + 30,
      lowerLegMm: variant.seatToFootrestMm + 50,
    };

    expect(evaluateHardConstraints(atLimits, variant)).toEqual([]);
    expect(
      evaluateHardConstraints(
        {
          ...atLimits,
          bodySeatDepthMm: variant.seatDepthMm + 100,
        },
        variant,
      ),
    ).not.toContain("seat-too-shallow");
  });

  it("stops precision evaluation when a critical measurement is missing", () => {
    const result = evaluateHardConstraints(
      {
        ...assessment,
        hipWidthMm: undefined,
        use: {
          ...assessment.use,
          airlineTravel: true,
          storageMm: { length: 1, width: 1, height: 1 },
          maxLiftKg: 1,
        },
      },
      getWheelchairSpec("2").variants[0],
    );

    expect(result).toEqual(["critical-data-missing"]);
  });

  it("uses removable-battery lift weight and handles fixed-battery data", () => {
    const removable = getWheelchairSpec("1").variants[0];
    const fixedUnknown = getWheelchairSpec("7").variants[0];

    expect(liftWeightKg(removable)).toBe(removable.netWeightWithoutBatteryKg);
    expect(liftWeightKg(fixedUnknown)).toBeNull();
    expect(liftWeightKg({ ...fixedUnknown, batteryWeightKg: 2 })).toBe(31);
  });

  it("deduplicates simultaneous exclusions", () => {
    const variant = getWheelchairSpec("1").variants[0];
    const result = evaluateHardConstraints(
      {
        ...assessment,
        weightKg: lbToKg(331),
        hipWidthMm: 441,
        bodySeatDepthMm: 440,
        lowerLegMm: 460,
        use: {
          ...assessment.use,
          storageMm: { length: 1, width: 1, height: 1 },
          maxLiftKg: 1,
        },
      },
      variant,
    );

    expect(new Set(result).size).toBe(result.length);
    expect(result).toEqual([
      "over-capacity",
      "seat-too-narrow",
      "seat-too-deep",
      "footrest-mismatch",
      "storage-too-small",
      "too-heavy-to-lift",
    ]);
  });
});
