import { describe, expect, it } from "vitest";
import {
  assessmentSchema,
  requiresProfessionalAssessment,
  sanitizeForAccount,
  sanitizeForLocalStorage,
} from "./assessment-schema";
import { inchesToMm, lbToKg, milesToKm } from "./units";
import type { FinderAssessment } from "./types";

const valid: FinderAssessment = {
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

describe("assessment validation", () => {
  it.each(["hipWidthMm", "bodySeatDepthMm", "lowerLegMm"] as const)(
    "requires %s in precision mode",
    (field) => {
      expect(
        assessmentSchema.safeParse({ ...valid, [field]: undefined }).success,
      ).toBe(false);
    },
  );

  it("allows omitted measurements in quick mode", () => {
    expect(
      assessmentSchema.safeParse({
        ...valid,
        mode: "quick",
        hipWidthMm: undefined,
        bodySeatDepthMm: undefined,
        lowerLegMm: undefined,
      }).success,
    ).toBe(true);
  });

  it.each([
    ["heightMm", 899],
    ["heightMm", 2501],
    ["weightKg", 19],
    ["weightKg", 276],
    ["hipWidthMm", 199],
    ["hipWidthMm", 761],
    ["bodySeatDepthMm", 249],
    ["bodySeatDepthMm", 761],
    ["lowerLegMm", 249],
    ["lowerLegMm", 761],
  ] as const)("rejects out-of-bounds %s", (field, value) => {
    expect(assessmentSchema.safeParse({ ...valid, [field]: value }).success).toBe(
      false,
    );
  });

  it("enforces use-profile bounds and collection sizes", () => {
    expect(
      assessmentSchema.safeParse({
        ...valid,
        use: { ...valid.use, surfaces: [] },
      }).success,
    ).toBe(false);
    expect(
      assessmentSchema.safeParse({
        ...valid,
        use: {
          ...valid.use,
          priorities: ["fit", "range", "portability", "roominess"],
        },
      }).success,
    ).toBe(false);
    expect(
      assessmentSchema.safeParse({
        ...valid,
        use: { ...valid.use, dailyRangeKm: 101, maxLiftKg: 1 },
      }).success,
    ).toBe(false);
    expect(
      assessmentSchema.safeParse({
        ...valid,
        use: {
          ...valid.use,
          storageMm: { length: 99, width: 500, height: 500 },
        },
      }).success,
    ).toBe(false);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects non-finite provided measurements (%s)",
    (value) => {
      expect(
        assessmentSchema.safeParse({
          ...valid,
          mode: "quick",
          hipWidthMm: value,
        }).success,
      ).toBe(false);
      expect(
        assessmentSchema.safeParse({ ...valid, weightKg: value }).success,
      ).toBe(false);
      expect(
        assessmentSchema.safeParse({
          ...valid,
          use: { ...valid.use, dailyRangeKm: value },
        }).success,
      ).toBe(false);
    },
  );
});

describe("assessment privacy", () => {
  it("requires professional assessment when any safety answer is true", () => {
    expect(requiresProfessionalAssessment(valid)).toBe(false);
    expect(
      requiresProfessionalAssessment({
        ...valid,
        safety: { ...valid.safety, posturalAsymmetry: true },
      }),
    ).toBe(true);
  });

  it("removes all individual safety fields without mutating the input", () => {
    const risky: FinderAssessment = {
      ...valid,
      safety: { ...valid.safety, pressureInjuryConcern: true },
    };
    const before = structuredClone(risky);

    const local = sanitizeForLocalStorage(risky);
    const account = sanitizeForAccount(risky);
    const serialized = `${JSON.stringify(local)}${JSON.stringify(account)}`;

    expect(risky).toEqual(before);
    expect(serialized).not.toContain('"safety"');
    expect(serialized).not.toContain("pressureInjuryConcern");
    expect(serialized).not.toContain("posturalAsymmetry");
    expect(serialized).not.toContain("customPositioningNeed");
  });

  it("allowlists persisted fields from structurally wider assessments", () => {
    const injected: FinderAssessment & {
      safetyNotes: string;
      caregiverName: string;
      use: FinderAssessment["use"] & {
        diagnosis: string;
        storageMm: NonNullable<FinderAssessment["use"]["storageMm"]> & {
          storageNotes: string;
        };
      };
    } = {
      ...valid,
      safetyNotes: "private-safety-notes",
      caregiverName: "private-caregiver-name",
      use: {
        ...valid.use,
        diagnosis: "private-diagnosis",
        storageMm: {
          length: 800,
          width: 700,
          height: 600,
          storageNotes: "private-storage-notes",
        },
      },
    };

    const local = sanitizeForLocalStorage(injected);
    const account = sanitizeForAccount(injected);
    const serialized = `${JSON.stringify(local)}${JSON.stringify(account)}`;

    [
      "safetyNotes",
      "caregiverName",
      "diagnosis",
      "storageNotes",
      "private-safety-notes",
      "private-caregiver-name",
      "private-diagnosis",
      "private-storage-notes",
      "pressureInjuryConcern",
      "posturalAsymmetry",
      "customPositioningNeed",
    ].forEach((sensitive) => expect(serialized).not.toContain(sensitive));
    expect(local.use.surfaces).not.toBe(injected.use.surfaces);
    expect(local.use.priorities).not.toBe(injected.use.priorities);
    expect(local.use.storageMm).not.toBe(injected.use.storageMm);
  });

  it("persists only an aggregate professional-assessment boolean for accounts", () => {
    expect(sanitizeForAccount(valid).professionalAssessmentRequired).toBe(false);
    expect(
      sanitizeForAccount({
        ...valid,
        safety: { ...valid.safety, customPositioningNeed: true },
      }).professionalAssessmentRequired,
    ).toBe(true);
  });
});
