import { describe, expect, it } from "vitest";
import { FINDER_RULES } from "./rules-config";
import { recommendWheelchairs } from "./recommend";
import type { FinderAssessment } from "./types";
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

  it("ranks the 550 mm seat first when a broad user also meets its minimum knee clearance", () => {
    const result = recommendWheelchairs({
      ...base,
      hipWidthMm: 533,
      bodySeatDepthMm: 500,
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
          right.score - left.score || left.productId.localeCompare(right.productId),
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
});
