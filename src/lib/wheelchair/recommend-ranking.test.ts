import { describe, expect, it } from "vitest";
import { FINDER_RULES } from "./rules-config";
import {
  matchBandForScore,
  portabilityRatioFor,
  recommendWheelchairs,
} from "./recommend";
import type { FinderAssessment, Priority } from "./types";
import { inchesToMm, lbToKg, milesToKm } from "./units";

const base: FinderAssessment = {
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

const evaluationFor = (
  result: ReturnType<typeof recommendWheelchairs>,
  productId: string,
  variantId?: string,
) => {
  const evaluation = result.evaluations.find(
    (item) =>
      item.productId === productId &&
      (variantId === undefined || item.variantId === variantId),
  );
  expect(evaluation).toBeDefined();
  return evaluation!;
};

const compareCodePoint = (left: string, right: string) =>
  left < right ? -1 : left > right ? 1 : 0;

describe("wheelchair ranking", () => {
  it("returns at most three unique storefront products", () => {
    const result = recommendWheelchairs(base);

    expect(result.recommendations.length).toBeLessThanOrEqual(3);
    expect(new Set(result.recommendations.map((item) => item.productId)).size).toBe(
      result.recommendations.length,
    );
  });

  it("ranks W03 first for a verified airline request", () => {
    const result = recommendWheelchairs({
      ...base,
      use: { ...base.use, airlineTravel: true, priorities: ["portability"] },
    });

    expect(result.recommendations[0].productId).toBe("1");
    expect(
      result.recommendations.every(
        (recommendation) =>
          recommendation.productId !== "2" && recommendation.productId !== "3",
      ),
    ).toBe(true);
  });

  it("ranks the 550 mm frame first when a broad user also matches its depth and footrest", () => {
    const result = recommendWheelchairs({
      ...base,
      hipWidthMm: 533,
      bodySeatDepthMm: 500,
      lowerLegMm: 350,
      use: { ...base.use, priorities: ["roominess"] },
    });

    expect(result.recommendations[0].productId).toBe("6");
  });

  it("caps every quick-mode recommendation at preliminary confidence", () => {
    const quick = {
      ...base,
      mode: "quick" as const,
      hipWidthMm: undefined,
      bodySeatDepthMm: undefined,
      lowerLegMm: undefined,
    };

    expect(
      recommendWheelchairs(quick).recommendations.every(
        (recommendation) => recommendation.confidence === "preliminary",
      ),
    ).toBe(true);
  });

  it("is deterministic across repeated calls and returns a stable score order", () => {
    const first = recommendWheelchairs(base);
    const second = recommendWheelchairs(base);

    expect(second).toEqual(first);
    expect(first.recommendations).toEqual(
      [...first.recommendations].sort(
        (left, right) =>
          right.score - left.score || compareCodePoint(left.productId, right.productId),
      ),
    );
  });

  it("retains hard exclusions in evaluations without recommending excluded variants", () => {
    const result = recommendWheelchairs({
      ...base,
      use: { ...base.use, airlineTravel: true, priorities: ["portability"] },
    });
    const excluded = result.evaluations.filter(
      (evaluation) => !evaluation.eligible,
    );

    expect(excluded.length).toBeGreaterThan(0);
    expect(
      excluded.some(
        (evaluation) =>
          evaluation.productId === "2" &&
          evaluation.exclusions.includes("airline-not-verified"),
      ),
    ).toBe(true);
    expect(
      excluded.every((evaluation) =>
        result.recommendations.every(
          (recommendation) =>
            recommendation.productId !== evaluation.productId ||
            recommendation.variantId !== evaluation.variantId,
        ),
      ),
    ).toBe(true);
  });

  it("selects one best variant per product and breaks equal scores lexically", () => {
    const result = recommendWheelchairs(base);
    const productOne = result.recommendations.filter(
      (recommendation) => recommendation.productId === "1",
    );

    expect(productOne).toHaveLength(1);
    expect(productOne[0].variantId).toBe("GI03H102");
  });

  it("keeps weighted score parts bounded and assigns bands from configured thresholds", () => {
    const result = recommendWheelchairs(base);

    for (const evaluation of result.evaluations) {
      expect(Object.keys(evaluation.scoreParts).sort()).toEqual([
        "environment",
        "fit",
        "preferences",
        "transport",
      ]);
      expect(evaluation.score).toBeGreaterThanOrEqual(0);
      expect(evaluation.score).toBeLessThanOrEqual(100);
      expect(evaluation.scoreParts.fit).toBeLessThanOrEqual(
        FINDER_RULES.scoreWeights.fit,
      );
      expect(evaluation.scoreParts.environment).toBeLessThanOrEqual(
        FINDER_RULES.scoreWeights.environment,
      );
      expect(evaluation.scoreParts.transport).toBeLessThanOrEqual(
        FINDER_RULES.scoreWeights.transport,
      );
      expect(evaluation.scoreParts.preferences).toBeLessThanOrEqual(
        FINDER_RULES.scoreWeights.preferences,
      );
      expect(evaluation.score).toBe(
        Math.round(Object.values(evaluation.scoreParts).reduce((sum, part) => sum + part, 0)),
      );
    }

    expect(result.recommendations.length).toBeGreaterThan(0);
    for (const recommendation of result.recommendations) {
      const expectedBand =
        recommendation.score >= FINDER_RULES.outputBands.best
          ? "best"
          : recommendation.score >= FINDER_RULES.outputBands.good
            ? "good"
            : "potential";
      expect(recommendation.score).toBeGreaterThanOrEqual(
        FINDER_RULES.outputBands.potential,
      );
      expect(recommendation.band).toBe(expectedBand);
    }
  });

  it("returns no recommendations when every variant has a hard exclusion", () => {
    const result = recommendWheelchairs({
      ...base,
      safety: { ...base.safety, pressureInjuryConcern: true },
    });

    expect(result.recommendations).toEqual([]);
    expect(result.evaluations.length).toBeGreaterThan(0);
    expect(
      result.evaluations.every(
        (evaluation) =>
          !evaluation.eligible &&
          evaluation.exclusions.includes("professional-assessment"),
      ),
    ).toBe(true);
  });

  it("uses high, moderate, and preliminary confidence for the relevant data quality", () => {
    const precision = recommendWheelchairs(base);
    const broad = recommendWheelchairs({
      ...base,
      hipWidthMm: 533,
      bodySeatDepthMm: 500,
      lowerLegMm: 350,
      use: { ...base.use, priorities: ["roominess"] },
    });
    const quick = recommendWheelchairs({
      ...base,
      mode: "quick",
      hipWidthMm: undefined,
      bodySeatDepthMm: undefined,
      lowerLegMm: undefined,
    });

    expect(evaluationFor(precision, "1").confidence).toBe("high");
    expect(evaluationFor(broad, "6").confidence).toBe("moderate");
    expect(evaluationFor(quick, "1").confidence).toBe("preliminary");
  });

  it("keeps PA15 eligible while scoring and warning from its narrower support surface", () => {
    const result = recommendWheelchairs({
      ...base,
      hipWidthMm: 533,
      bodySeatDepthMm: 500,
      lowerLegMm: 350,
      use: { ...base.use, priorities: ["roominess"] },
    });
    const pa15 = evaluationFor(result, "6", "PA15B100");
    const warningText = pa15.warnings.join(" ");

    expect(pa15.eligible).toBe(true);
    expect(pa15.exclusions).toEqual([]);
    expect(pa15.confidence).toBe("moderate");
    expect(pa15.scoreParts.preferences).toBeCloseTo(
      (460 / 550) * FINDER_RULES.scoreWeights.preferences,
    );
    expect(warningText).toContain("460 mm");
    expect(warningText).toContain("533 mm");
    expect(warningText).toMatch(/replacement cushion|effective support width/i);
    expect(warningText).toMatch(/before purchase/i);
    expect(pa15.reasons).toContain(
      "Hard capacity and frame-geometry checks passed.",
    );
    expect(pa15.reasons).not.toContain(
      "Official capacity and seating constraints passed.",
    );
  });

  it("adds a non-guarantee airline warning to every eligible airline evaluation", () => {
    const result = recommendWheelchairs({
      ...base,
      use: { ...base.use, airlineTravel: true, priorities: ["portability"] },
    });
    const eligible = result.evaluations.filter((evaluation) => evaluation.eligible);

    expect(eligible.length).toBeGreaterThan(0);
    expect(
      eligible.every((evaluation) =>
        evaluation.warnings.some((warning) =>
          /not guaranteed.*confirm.*airline/i.test(warning),
        ),
      ),
    ).toBe(true);
  });

  it("retains missing-data warnings when the same variant is hard-excluded", () => {
    const result = recommendWheelchairs({
      ...base,
      use: { ...base.use, maxLiftKg: 30 },
    });
    const productSeven = evaluationFor(result, "7", "PA13A100");

    expect(productSeven.eligible).toBe(false);
    expect(productSeven.exclusions).toContain("lift-data-missing");
    expect(productSeven.confidence).toBe("moderate");
    expect(productSeven.warnings).toContain(
      "Official batteryWeightKg data needs confirmation.",
    );
  });

  it("maps fit to the fit ratio and averages every selected priority", () => {
    const priorities: Priority[] = [
      "fit",
      "portability",
      "range",
      "rough-terrain",
      "roominess",
    ];
    const forPriorities = (selected: Priority[]) =>
      evaluationFor(
        recommendWheelchairs({
          ...base,
          use: { ...base.use, dailyRangeKm: 40, priorities: selected },
        }),
        "1",
      );
    const fitOnly = forPriorities(["fit"]);
    const singletonPreferenceParts = priorities.map(
      (priority) => forPriorities([priority]).scoreParts.preferences,
    );
    const combined = forPriorities(priorities);

    expect(fitOnly.scoreParts.preferences).toBeCloseTo(
      (fitOnly.scoreParts.fit / FINDER_RULES.scoreWeights.fit) *
        FINDER_RULES.scoreWeights.preferences,
    );
    expect(combined.scoreParts.preferences).toBeCloseTo(
      singletonPreferenceParts.reduce((sum, value) => sum + value, 0) /
        singletonPreferenceParts.length,
    );
  });

  it("chooses the high-confidence warning-free PA16 variant before its tied conflict", () => {
    const result = recommendWheelchairs({
      ...base,
      weightKg: 165,
      bodySeatDepthMm: 500,
      use: {
        ...base.use,
        dailyRangeKm: 45,
        priorities: ["range"],
      },
    });
    const pa16L = evaluationFor(result, "5", "PA16L100");
    const pa16K = evaluationFor(result, "5", "PA16K100");
    const recommendation = result.recommendations.find(
      (item) => item.productId === "5",
    );

    expect(pa16L.score).toBe(pa16K.score);
    expect(pa16L.confidence).toBe("high");
    expect(pa16K.confidence).toBe("moderate");
    expect(pa16L.warnings).toHaveLength(0);
    expect(recommendation?.variantId).toBe("PA16L100");
  });

  it("scores portability fully below targets and decreases monotonically to cutoffs", () => {
    const targetVolume = { length: 1000, width: 500, height: 300 };
    const middleVolume = { length: 1000, width: 650, height: 500 };
    const cutoffVolume = { length: 1000, width: 1000, height: 500 };

    expect(portabilityRatioFor(10, targetVolume)).toBe(1);
    expect(portabilityRatioFor(15, targetVolume)).toBe(1);
    expect(portabilityRatioFor(20, targetVolume)).toBeCloseTo(0.9);
    expect(portabilityRatioFor(30, targetVolume)).toBeCloseTo(0.7);
    expect(portabilityRatioFor(15, middleVolume)).toBeCloseTo(0.75);
    expect(portabilityRatioFor(40, cutoffVolume)).toBe(0);
  });

  it("uses rough surfaces and tight-space needs in the environment score", () => {
    const environmentPart = (surfaces: FinderAssessment["use"]["surfaces"], tightSpaces: boolean) =>
      evaluationFor(
        recommendWheelchairs({
          ...base,
          bodySeatDepthMm: 500,
          use: {
            ...base.use,
            surfaces,
            tightSpaces,
            dailyRangeKm: 45,
            priorities: ["range"],
          },
        }),
        "5",
        "PA16L100",
      ).scoreParts.environment;

    const smooth = environmentPart(["smooth"], false);
    const rough = environmentPart(["gravel"], false);
    const tight = environmentPart(["smooth"], true);

    expect(rough).toBeGreaterThan(smooth);
    expect(tight).toBeLessThan(smooth);
  });

  it("assigns exact match bands at every configured threshold", () => {
    expect(matchBandForScore(FINDER_RULES.outputBands.best)).toBe("best");
    expect(matchBandForScore(FINDER_RULES.outputBands.good)).toBe("good");
    expect(matchBandForScore(FINDER_RULES.outputBands.potential)).toBe(
      "potential",
    );
  });

  it.each([
    ["non-positive height", { ...base, heightMm: 0 }],
    ["NaN weight", { ...base, weightKg: Number.NaN }],
    [
      "NaN daily range",
      { ...base, use: { ...base.use, dailyRangeKm: Number.NaN } },
    ],
    ["NaN precision hip width", { ...base, hipWidthMm: Number.NaN }],
    ["non-positive precision seat depth", { ...base, bodySeatDepthMm: 0 }],
    [
      "infinite precision lower-leg length",
      { ...base, lowerLegMm: Number.POSITIVE_INFINITY },
    ],
    [
      "non-positive storage dimension",
      {
        ...base,
        use: {
          ...base.use,
          storageMm: { length: 0, width: 500, height: 500 },
        },
      },
    ],
    [
      "non-positive maximum lift",
      { ...base, use: { ...base.use, maxLiftKg: 0 } },
    ],
  ] as const)("rejects %s at the public recommendation boundary", (_name, invalid) => {
    expect(() => recommendWheelchairs(invalid)).toThrow(RangeError);
  });
});
