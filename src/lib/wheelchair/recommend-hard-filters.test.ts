import { describe, expect, it } from "vitest";
import { getWheelchairSpec } from "@/data/wheelchair-specs";
import { FINDER_RULES } from "./rules-config";
import type { FinderAssessment, WheelchairVariantSpec } from "./types";
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

const airlineAssessment: FinderAssessment = {
  ...assessment,
  use: { ...assessment.use, airlineTravel: true },
};

const airlineBaseVariant = getWheelchairSpec("1").variants[0];
const airlineFailureCases: ReadonlyArray<{
  name: string;
  variant: WheelchairVariantSpec;
}> = [
  {
    name: "battery watt-hours exceed 300 Wh",
    variant: {
      ...airlineBaseVariant,
      battery: { ...airlineBaseVariant.battery, voltageV: 31 },
    },
  },
  {
    name: "battery chemistry is not lithium",
    variant: {
      ...airlineBaseVariant,
      battery: { ...airlineBaseVariant.battery, chemistry: "lead-acid" },
    },
  },
  {
    name: "battery is not removable",
    variant: {
      ...airlineBaseVariant,
      battery: { ...airlineBaseVariant.battery, removable: false },
    },
  },
  {
    name: "manufacturer airplane flag is false",
    variant: {
      ...airlineBaseVariant,
      battery: { ...airlineBaseVariant.battery, manufacturerAirplaneFlag: false },
    },
  },
  {
    name: "battery voltage is unknown",
    variant: getWheelchairSpec("2").variants[0],
  },
];

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

  it("hard-excludes a confirmed narrow cushion support surface", () => {
    const variant = getWheelchairSpec("7").variants[0];

    expect(variant.cushionWidthMm).toBe(440);
    expect(variant.source.status.cushionWidthMm).toBeUndefined();
    expect(
      evaluateHardConstraints({ ...assessment, hipWidthMm: 450 }, variant),
    ).toContain("seat-too-narrow");
  });

  it("uses only capacity and effective width as hard product filters", () => {
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

    expect(result).toEqual(["over-capacity", "seat-too-narrow"]);
  });

  it("keeps seat depth and footrest mismatches as non-hard fit signals", () => {
    const variant = getWheelchairSpec("1").variants[0];

    expect(evaluateHardConstraints({ ...assessment, bodySeatDepthMm: 440 }, variant)).not.toContain("seat-too-deep");
    expect(evaluateHardConstraints({ ...assessment, lowerLegMm: 460 }, variant)).not.toContain("footrest-mismatch");
  });

  it("keeps storage fit as a non-hard transport signal", () => {
    const item = { length: 1, width: 2, height: 3 };

    expect(fitsStorage(item, { length: 3, width: 2, height: 1 })).toBe(false);
    expect(fitsStorage(item, { length: 2, width: 1, height: 3 })).toBe(true);

    const variant = getWheelchairSpec("1").variants[0];
    const unsupportedSideStorage = {
      ...assessment,
      use: {
        ...assessment.use,
        storageMm: { length: 850, width: 550, height: 350 },
      },
    };
    const fitsUprightRotated = {
      ...assessment,
      use: {
        ...assessment.use,
        storageMm: { length: 550, width: 350, height: 850 },
      },
    };
    const tooSmall = {
      ...assessment,
      use: {
        ...assessment.use,
        storageMm: { length: 500, width: 500, height: 500 },
      },
    };

    expect(evaluateHardConstraints(unsupportedSideStorage, variant)).not.toContain("storage-too-small");
    expect(evaluateHardConstraints(fitsUprightRotated, variant)).not.toContain("storage-too-small");
    expect(evaluateHardConstraints(tooSmall, variant)).not.toContain("storage-too-small");
  });

  it.each(airlineFailureCases)("keeps airline verification as a non-hard transport signal when $name", ({ variant }) => {
    expect(evaluateHardConstraints(airlineAssessment, variant)).not.toContain("airline-not-verified");
  });

  it("accepts an otherwise compliant removable lithium battery at exactly 300 Wh", () => {
    const atLimit = {
      ...airlineBaseVariant,
      battery: { ...airlineBaseVariant.battery, voltageV: 30 },
    };

    expect(evaluateHardConstraints(airlineAssessment, atLimit)).not.toContain(
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

  it("keeps unknown fixed-battery lift weight as a non-hard transport signal", () => {
    const result = evaluateHardConstraints(
      {
        ...assessment,
        use: { ...assessment.use, maxLiftKg: 30 },
      },
      getWheelchairSpec("7").variants[0],
    );

    expect(result).not.toContain("lift-data-missing");
  });

  it("keeps caregiver lift limits as non-hard transport signals", () => {
    const variant = getWheelchairSpec("1").variants[0];
    const atLimit = {
      ...assessment,
      use: { ...assessment.use, maxLiftKg: variant.netWeightWithoutBatteryKg },
    };
    const belowRequiredWeight = {
      ...assessment,
      use: { ...assessment.use, maxLiftKg: variant.netWeightWithoutBatteryKg - 0.01 },
    };

    expect(evaluateHardConstraints(atLimit, variant)).not.toContain("too-heavy-to-lift");
    expect(evaluateHardConstraints(belowRequiredWeight, variant)).not.toContain("too-heavy-to-lift");
  });

  it("keeps large seat-depth shortfalls as non-hard fit signals", () => {
    const variant = getWheelchairSpec("1").variants[0];
    const result = evaluateHardConstraints(
      {
        ...assessment,
        bodySeatDepthMm:
          variant.seatDepthMm + FINDER_RULES.seatDepth.shortfallHardLimitMm + 1,
      },
      variant,
    );

    expect(result).not.toContain("seat-too-shallow");
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
    expect(result).toEqual(["over-capacity", "seat-too-narrow"]);
  });
});
