import { OFFICIAL_WHEELCHAIR_SPECS } from "@/data/wheelchair-specs";
import { FINDER_RULES } from "./rules-config";
import type {
  Confidence,
  DimensionsMm,
  ExclusionCode,
  FinderAssessment,
  MatchBand,
  Recommendation,
  VariantEvaluation,
  WheelchairVariantSpec,
} from "./types";
import { batteryWh } from "./units";

// The catalog has no manufacturer-verified side or inverted storage orientation.
// Fail closed by keeping the height axis upright and only rotating the footprint.
const permutations = (dimensions: DimensionsMm): DimensionsMm[] => [
  {
    length: dimensions.length,
    width: dimensions.width,
    height: dimensions.height,
  },
  {
    length: dimensions.width,
    width: dimensions.length,
    height: dimensions.height,
  },
];

export function fitsStorage(item: DimensionsMm, storage: DimensionsMm) {
  return permutations(item).some(
    (orientation) =>
      orientation.length <= storage.length &&
      orientation.width <= storage.width &&
      orientation.height <= storage.height,
  );
}

export function liftWeightKg(variant: WheelchairVariantSpec) {
  if (variant.battery.removable) return variant.netWeightWithoutBatteryKg;
  if (variant.batteryWeightKg === null) return null;
  return variant.netWeightWithoutBatteryKg + variant.batteryWeightKg;
}

export function evaluateHardConstraints(
  assessment: FinderAssessment,
  variant: WheelchairVariantSpec,
): ExclusionCode[] {
  // Callers must validate the assessment with the assessment schema before evaluation.
  const exclusions: ExclusionCode[] = [];
  const safety = assessment.safety;

  if (
    safety.pressureInjuryConcern ||
    safety.posturalAsymmetry ||
    safety.customPositioningNeed
  ) {
    exclusions.push("professional-assessment");
    return exclusions;
  }

  if (assessment.weightKg > variant.maxUserWeightKg) {
    exclusions.push("over-capacity");
  }

  if (assessment.mode === "precision") {
    if (
      assessment.hipWidthMm === undefined ||
      assessment.bodySeatDepthMm === undefined ||
      assessment.lowerLegMm === undefined
    ) {
      exclusions.push("critical-data-missing");
      return exclusions;
    }

    const effectiveWidth = verifiedSupportWidthMm(variant);
    if (assessment.hipWidthMm > effectiveWidth) {
      exclusions.push("seat-too-narrow");
    }

    const clearance = assessment.bodySeatDepthMm - variant.seatDepthMm;
    if (clearance < FINDER_RULES.seatDepth.kneeClearanceMinMm) {
      exclusions.push("seat-too-deep");
    }
    if (clearance > FINDER_RULES.seatDepth.shortfallHardLimitMm) {
      exclusions.push("seat-too-shallow");
    }

    if (
      Math.abs(assessment.lowerLegMm - variant.seatToFootrestMm) >
      FINDER_RULES.footrest.hardToleranceMm
    ) {
      exclusions.push("footrest-mismatch");
    }
  }

  if (assessment.use.storageMm && !fitsStorage(variant.foldedMm, assessment.use.storageMm)) {
    exclusions.push("storage-too-small");
  }

  if (assessment.use.maxLiftKg !== undefined) {
    const liftKg = liftWeightKg(variant);
    if (liftKg === null) {
      exclusions.push("lift-data-missing");
    } else if (liftKg > assessment.use.maxLiftKg) {
      exclusions.push("too-heavy-to-lift");
    }
  }

  if (assessment.use.airlineTravel) {
    const wattHours = batteryWh(variant.battery.voltageV, variant.battery.capacityAh);
    const verified =
      variant.battery.removable &&
      variant.battery.chemistry === "lithium" &&
      variant.battery.manufacturerAirplaneFlag &&
      wattHours !== null &&
      wattHours <= FINDER_RULES.airline.maxRemovableLithiumWh;

    if (!verified) exclusions.push("airline-not-verified");
  }

  return Array.from(new Set(exclusions));
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const closeness = (difference: number, zeroScoreAt: number) =>
  clamp(1 - Math.abs(difference) / zeroScoreAt, 0, 1);

function confidenceFor(
  assessment: FinderAssessment,
  variant: WheelchairVariantSpec,
): Confidence {
  if (assessment.mode === "quick") return "preliminary";

  const critical = [
    "seatWidthMm",
    "seatDepthMm",
    "batteryVoltageV",
    "batteryWeightKg",
    "cushionWidthMm",
    "cushionDepthMm",
  ] as const;
  const hasIssue = critical.some((field) => {
    const status = variant.source.status[field];
    return status === "missing" || status === "conflicting";
  });

  return hasIssue ? "moderate" : "high";
}

function buildDataWarnings(
  assessment: FinderAssessment,
  variant: WheelchairVariantSpec,
): string[] {
  return Object.entries(variant.source.status)
    .filter(([, status]) => status === "missing" || status === "conflicting")
    .map(([field]) => {
      if (
        field === "cushionWidthMm" &&
        assessment.mode === "precision" &&
        assessment.hipWidthMm !== undefined &&
        variant.cushionWidthMm !== null
      ) {
        return `Official cushion support is listed as ${variant.cushionWidthMm} mm versus your ${Math.round(assessment.hipWidthMm)} mm hip width; confirm a replacement cushion or the effective support width before purchase.`;
      }
      return `Official ${field} data needs confirmation.`;
    });
}

function supportWidthMm(variant: WheelchairVariantSpec) {
  return Math.min(
    variant.seatWidthMm,
    variant.armrestSpacingMm,
    variant.cushionWidthMm ?? Number.POSITIVE_INFINITY,
  );
}

function verifiedSupportWidthMm(variant: WheelchairVariantSpec) {
  const widths = [variant.seatWidthMm, variant.armrestSpacingMm];
  const cushionStatus = variant.source.status.cushionWidthMm;

  if (variant.cushionWidthMm !== null && cushionStatus !== "conflicting" && cushionStatus !== "missing") {
    widths.push(variant.cushionWidthMm);
  }

  return Math.min(...widths);
}

const descendingRatio = (value: number, fullScoreAt: number, zeroScoreAt: number) => {
  if (value <= fullScoreAt) return 1;
  if (value >= zeroScoreAt) return 0;
  return (zeroScoreAt - value) / (zeroScoreAt - fullScoreAt);
};

export function portabilityRatioFor(
  weightKg: number,
  foldedMm: DimensionsMm,
) {
  const volume = foldedMm.length * foldedMm.width * foldedMm.height;
  return (
    descendingRatio(weightKg, 15, 40) +
    descendingRatio(volume, 150_000_000, 500_000_000)
  ) / 2;
}

const confidenceRank: Record<Confidence, number> = {
  high: 3,
  moderate: 2,
  preliminary: 1,
};

const compareCodePoint = (left: string, right: string) =>
  left < right ? -1 : left > right ? 1 : 0;

function compareEvaluationQuality(
  left: VariantEvaluation,
  right: VariantEvaluation,
  identifier: (evaluation: VariantEvaluation) => string,
) {
  return (
    right.score - left.score ||
    confidenceRank[right.confidence] - confidenceRank[left.confidence] ||
    left.warnings.length - right.warnings.length ||
    compareCodePoint(identifier(left), identifier(right))
  );
}

export function matchBandForScore(score: number): MatchBand {
  if (score >= FINDER_RULES.outputBands.best) return "best";
  if (score >= FINDER_RULES.outputBands.good) return "good";
  return "potential";
}

function assertPositiveFinite(value: number, field: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${field} must be a positive finite number.`);
  }
}

function validateAssessmentNumbers(assessment: FinderAssessment) {
  assertPositiveFinite(assessment.heightMm, "heightMm");
  assertPositiveFinite(assessment.weightKg, "weightKg");
  assertPositiveFinite(assessment.use.dailyRangeKm, "dailyRangeKm");

  if (assessment.mode === "precision") {
    if (assessment.hipWidthMm !== undefined) {
      assertPositiveFinite(assessment.hipWidthMm, "hipWidthMm");
    }
    if (assessment.bodySeatDepthMm !== undefined) {
      assertPositiveFinite(assessment.bodySeatDepthMm, "bodySeatDepthMm");
    }
    if (assessment.lowerLegMm !== undefined) {
      assertPositiveFinite(assessment.lowerLegMm, "lowerLegMm");
    }
  }

  if (assessment.use.storageMm) {
    assertPositiveFinite(assessment.use.storageMm.length, "storageMm.length");
    assertPositiveFinite(assessment.use.storageMm.width, "storageMm.width");
    assertPositiveFinite(assessment.use.storageMm.height, "storageMm.height");
  }
  if (assessment.use.maxLiftKg !== undefined) {
    assertPositiveFinite(assessment.use.maxLiftKg, "maxLiftKg");
  }
}

function scoreVariant(
  assessment: FinderAssessment,
  productId: string,
  variant: WheelchairVariantSpec,
): VariantEvaluation {
  const confidence = confidenceFor(assessment, variant);
  const dataWarnings = buildDataWarnings(assessment, variant);
  const exclusions = evaluateHardConstraints(assessment, variant);
  if (exclusions.length > 0) {
    return {
      productId,
      variantId: variant.variantId,
      eligible: false,
      exclusions,
      score: 0,
      scoreParts: { fit: 0, environment: 0, transport: 0, preferences: 0 },
      confidence,
      reasons: [],
      warnings: dataWarnings,
    };
  }

  let fitRatio = 0.5;
  if (
    assessment.mode === "precision" &&
    assessment.hipWidthMm !== undefined &&
    assessment.bodySeatDepthMm !== undefined &&
    assessment.lowerLegMm !== undefined
  ) {
    const widthGap = supportWidthMm(variant) - assessment.hipWidthMm;
    const depthClearance = assessment.bodySeatDepthMm - variant.seatDepthMm;
    const legDifference = assessment.lowerLegMm - variant.seatToFootrestMm;
    fitRatio =
      (closeness(widthGap - 20, 100) +
        closeness(
          depthClearance - FINDER_RULES.seatDepth.idealClearanceMm,
          60,
        ) +
        closeness(legDifference, FINDER_RULES.footrest.hardToleranceMm)) /
      3;
  } else {
    const capacityMargin =
      (variant.maxUserWeightKg - assessment.weightKg) /
      variant.maxUserWeightKg;
    const bodyTarget =
      assessment.bodyBuild === "slim"
        ? 430
        : assessment.bodyBuild === "broad"
          ? 500
          : 460;
    fitRatio =
      (clamp(capacityMargin / 0.35, 0, 1) +
        closeness(variant.seatWidthMm - bodyTarget, 140)) /
      2;
  }

  const indoorRatio =
    (closeness(variant.turningRadiusMm - 800, 600) +
      closeness(variant.overallMm.width - 540, 180)) /
    2;
  const outdoorRatio =
    (clamp(variant.obstacleHeightMm / 40, 0, 1) +
      clamp(variant.rearWheelMm / 330, 0, 1) +
      (variant.tireClass === "mixed-pneumatic" ? 1 : 0.65)) /
    3;
  const baseEnvironmentRatio =
    assessment.use.environment === "indoor"
      ? indoorRatio
      : assessment.use.environment === "outdoor"
        ? outdoorRatio
        : (indoorRatio + outdoorRatio) / 2;
  const environmentRatios = [
    baseEnvironmentRatio,
    ...assessment.use.surfaces.map((surface) =>
      surface === "smooth" || surface === "carpet" ? indoorRatio : outdoorRatio,
    ),
  ];
  if (assessment.use.tightSpaces) environmentRatios.push(indoorRatio);
  const environmentRatio =
    environmentRatios.reduce((sum, ratio) => sum + ratio, 0) /
    environmentRatios.length;

  const portability = portabilityRatioFor(
    variant.netWeightWithoutBatteryKg,
    variant.foldedMm,
  );
  const transportRatio = assessment.use.airlineTravel ? 1 : portability;
  const rangeRatio = clamp(
    variant.rangeKm / Math.max(assessment.use.dailyRangeKm, 1),
    0,
    1,
  );
  const priorityRatios = assessment.use.priorities.map((priority) => {
    switch (priority) {
      case "fit":
        return fitRatio;
      case "portability":
        return portability;
      case "range":
        return rangeRatio;
      case "rough-terrain":
        return outdoorRatio;
      case "roominess":
        return clamp(supportWidthMm(variant) / 550, 0, 1);
    }
  });
  const preferenceRatio =
    priorityRatios.length > 0
      ? priorityRatios.reduce((sum, ratio) => sum + ratio, 0) /
        priorityRatios.length
      : portability;

  const scoreParts = {
    fit: fitRatio * FINDER_RULES.scoreWeights.fit,
    environment: environmentRatio * FINDER_RULES.scoreWeights.environment,
    transport: transportRatio * FINDER_RULES.scoreWeights.transport,
    preferences: preferenceRatio * FINDER_RULES.scoreWeights.preferences,
  };
  const score = Math.round(
    Object.values(scoreParts).reduce((sum, value) => sum + value, 0),
  );
  const warnings = assessment.use.airlineTravel
    ? [
        ...dataWarnings,
        "Airline eligibility is not guaranteed; confirm the wheelchair and battery with the airline before travel.",
      ]
    : dataWarnings;

  return {
    productId,
    variantId: variant.variantId,
    eligible: true,
    exclusions: [],
    score,
    scoreParts,
    confidence,
    reasons: [
      `Supports the entered ${assessment.use.environment} use profile.`,
      "Hard capacity and frame-geometry checks passed.",
      `Provides ${Math.round(variant.rangeKm)} km of listed range.`,
    ],
    warnings,
  };
}

export function recommendWheelchairs(assessment: FinderAssessment): {
  recommendations: Recommendation[];
  evaluations: VariantEvaluation[];
} {
  validateAssessmentNumbers(assessment);

  const evaluations = OFFICIAL_WHEELCHAIR_SPECS.flatMap((product) =>
    product.variants.map((variant) =>
      scoreVariant(assessment, product.productId, variant),
    ),
  );

  const bestByProduct = new Map<string, VariantEvaluation>();
  evaluations
    .filter((evaluation) => evaluation.eligible)
    .forEach((evaluation) => {
      const current = bestByProduct.get(evaluation.productId);
      if (
        !current ||
        compareEvaluationQuality(
          evaluation,
          current,
          (item) => item.variantId,
        ) < 0
      ) {
        bestByProduct.set(evaluation.productId, evaluation);
      }
    });

  const recommendations = Array.from(bestByProduct.values())
    .filter(
      (evaluation) => evaluation.score >= FINDER_RULES.outputBands.potential,
    )
    .sort((left, right) =>
      compareEvaluationQuality(left, right, (item) => item.productId),
    )
    .slice(0, FINDER_RULES.maxRecommendations)
    .map((evaluation) => ({
      productId: evaluation.productId,
      variantId: evaluation.variantId,
      score: evaluation.score,
      band: matchBandForScore(evaluation.score),
      confidence: evaluation.confidence,
      reasons: evaluation.reasons,
      warnings: evaluation.warnings,
    }));

  return { recommendations, evaluations };
}
