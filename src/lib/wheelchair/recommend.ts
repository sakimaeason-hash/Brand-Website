import { FINDER_RULES } from "./rules-config";
import type {
  Confidence,
  DimensionsMm,
  ExclusionCode,
  FinderAssessment,
  MatchBand,
  Recommendation,
  TireClass,
  VariantEvaluation,
  WheelchairCandidate,
} from "./types";

// Without manufacturer verification, storage keeps the height axis upright.
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

export function liftWeightKg(candidate: WheelchairCandidate) {
  if (candidate.mobilityType === "manual") return candidate.productWeightKg;
  if (candidate.battery.removable === true) {
    return candidate.netWeightWithoutBatteryKg;
  }
  if (
    candidate.battery.removable !== false ||
    candidate.battery.weightKg === null
  ) {
    return null;
  }
  return candidate.netWeightWithoutBatteryKg + candidate.battery.weightKg;
}

/** The hip-to-knee measurement is not the target wheelchair seat depth. */
export function targetSeatDepthMm(hipToKneeMm: number) {
  return hipToKneeMm - FINDER_RULES.seatDepth.idealBodyOffsetMm;
}

/** Footrest height above the floor = seat height - lower-leg length. */
export function targetFootrestHeightMm(seatHeightMm: number, lowerLegMm: number) {
  return seatHeightMm - lowerLegMm;
}

/** The catalog field is seat-surface-to-footrest, so derive its floor height. */
export function productFootrestHeightMm(candidate: WheelchairCandidate) {
  return candidate.seatHeightMm - candidate.seatToFootrestMm;
}

export function evaluateHardConstraints(
  assessment: FinderAssessment,
  candidate: WheelchairCandidate,
): ExclusionCode[] {
  // Callers must validate the assessment with the assessment schema first.
  if (
    assessment.safety.pressureInjuryConcern ||
    assessment.safety.posturalAsymmetry ||
    assessment.safety.customPositioningNeed
  ) {
    return ["professional-assessment"];
  }

  const exclusions: ExclusionCode[] = [];
  if (assessment.weightKg > candidate.maxUserWeightKg) {
    exclusions.push("over-capacity");
  }

  if (assessment.mode === "precision") {
    if (
      assessment.hipWidthMm !== undefined &&
      assessment.hipWidthMm > candidate.effectiveSeatWidthMm
    ) {
      exclusions.push("seat-too-narrow");
    }
    if (
      assessment.hipWidthMm === undefined ||
      assessment.bodySeatDepthMm === undefined ||
      assessment.lowerLegMm === undefined
    ) {
      exclusions.push("critical-data-missing");
    }
  }

  return exclusions;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const closeness = (difference: number, zeroScoreAt: number) =>
  clamp(1 - Math.abs(difference) / zeroScoreAt, 0, 1);

function confidenceFor(
  assessment: FinderAssessment,
  candidate: WheelchairCandidate,
): Confidence {
  if (assessment.mode === "quick") return "preliminary";
  return candidate.dataWarnings.length > 0 ? "moderate" : "high";
}

function buildSoftFitWarnings(
  assessment: FinderAssessment,
  candidate: WheelchairCandidate,
): string[] {
  if (
    assessment.mode !== "precision" ||
    assessment.bodySeatDepthMm === undefined ||
    assessment.lowerLegMm === undefined
  ) {
    return [];
  }

  const warnings: string[] = [];
  const bodyOffset = assessment.bodySeatDepthMm - candidate.seatDepthMm;
  if (bodyOffset < FINDER_RULES.seatDepth.bodyOffsetMinMm) {
    const deeperBy = FINDER_RULES.seatDepth.bodyOffsetMinMm - bodyOffset;
    warnings.push(
      `This seat is about ${Math.round(deeperBy)} mm deeper than the recommended range for your hip-to-knee length; the usual target is 50–60 mm shorter. Confirm knee clearance before purchase.`,
    );
  } else if (bodyOffset > FINDER_RULES.seatDepth.bodyOffsetMaxMm) {
    const shorterBy = bodyOffset - FINDER_RULES.seatDepth.bodyOffsetMaxMm;
    warnings.push(
      `This seat is about ${Math.round(shorterBy)} mm shorter than the recommended range for your hip-to-knee length; the usual target is 50–60 mm shorter. Confirm thigh support before purchase.`,
    );
  }

  const targetFootrestHeight = targetFootrestHeightMm(
    candidate.seatHeightMm,
    assessment.lowerLegMm,
  );
  const footrestDifference = Math.abs(
    targetFootrestHeight - productFootrestHeightMm(candidate),
  );
  if (footrestDifference > FINDER_RULES.footrest.hardToleranceMm) {
    warnings.push(
      `Your calculated footrest height is about ${Math.round(targetFootrestHeight)} mm above the floor; this variant's calculated footrest height differs by about ${Math.round(footrestDifference)} mm. Confirm foot support before purchase.`,
    );
  }

  return warnings;
}

const descendingRatio = (
  value: number,
  fullScoreAt: number,
  zeroScoreAt: number,
) => {
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

function scoreCommonFit(
  assessment: FinderAssessment,
  candidate: WheelchairCandidate,
) {
  if (
    assessment.mode === "precision" &&
    assessment.hipWidthMm !== undefined &&
    assessment.bodySeatDepthMm !== undefined &&
    assessment.lowerLegMm !== undefined
  ) {
    const widthGap = candidate.effectiveSeatWidthMm - assessment.hipWidthMm;
    const seatDepthDifference =
      candidate.seatDepthMm - targetSeatDepthMm(assessment.bodySeatDepthMm);
    const targetFootrestHeight = targetFootrestHeightMm(
      candidate.seatHeightMm,
      assessment.lowerLegMm,
    );
    const footrestDifference =
      targetFootrestHeight - productFootrestHeightMm(candidate);
    return (
      closeness(widthGap - 20, 100) +
      closeness(seatDepthDifference, 60) +
      closeness(footrestDifference, FINDER_RULES.footrest.hardToleranceMm)
    ) / 3;
  }

  const capacityMargin =
    (candidate.maxUserWeightKg - assessment.weightKg) /
    candidate.maxUserWeightKg;
  const bodyTarget =
    assessment.bodyBuild === "slim"
      ? 430
      : assessment.bodyBuild === "broad"
        ? 500
        : 460;
  return (
    clamp(capacityMargin / 0.35, 0, 1) +
    closeness(candidate.effectiveSeatWidthMm - bodyTarget, 140)
  ) / 2;
}

function tireTerrainRatio(tireClass: TireClass) {
  if (tireClass === "pneumatic") return 1;
  if (tireClass === "foam-filled") return 0.8;
  return 0.65;
}

function environmentRatioFor(
  assessment: FinderAssessment,
  indoorRatio: number,
  outdoorRatio: number,
) {
  const baseRatio =
    assessment.use.environment === "indoor"
      ? indoorRatio
      : assessment.use.environment === "outdoor"
        ? outdoorRatio
        : (indoorRatio + outdoorRatio) / 2;
  const ratios = [
    baseRatio,
    ...assessment.use.surfaces.map((surface) =>
      surface === "smooth" || surface === "carpet"
        ? indoorRatio
        : outdoorRatio,
    ),
  ];
  if (assessment.use.tightSpaces) ratios.push(indoorRatio);
  return ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
}

type UseScore = {
  environment: number;
  transport: number;
  portability: number;
  roughTerrain: number;
  range: number | null;
};

function poweredAirlineRatio(
  candidate: Extract<WheelchairCandidate, { mobilityType: "powered" }>,
) {
  const battery = candidate.battery;
  if (
    battery.removable !== true ||
    battery.voltageV === null ||
    battery.capacityAh === null
  ) {
    return 0;
  }
  return battery.voltageV * battery.capacityAh <=
    FINDER_RULES.airline.maxRemovableLithiumWh
    ? 1
    : 0;
}

function scoreTransportFit(
  assessment: FinderAssessment,
  candidate: WheelchairCandidate,
  baseline: number,
) {
  const ratios = [baseline];
  if (assessment.use.storageMm) {
    ratios.push(fitsStorage(candidate.foldedMm, assessment.use.storageMm) ? 1 : 0);
  }
  if (assessment.use.maxLiftKg !== undefined) {
    const liftWeight = liftWeightKg(candidate);
    if (liftWeight !== null) {
      ratios.push(clamp(assessment.use.maxLiftKg / liftWeight, 0, 1));
    }
  }
  return ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
}

function scorePoweredUse(
  assessment: FinderAssessment,
  candidate: Extract<WheelchairCandidate, { mobilityType: "powered" }>,
): UseScore {
  const indoor =
    (closeness(candidate.turningRadiusMm - 800, 600) +
      closeness(candidate.overallMm.width - 540, 180)) /
    2;
  const outdoor =
    (clamp(candidate.obstacleHeightMm / 40, 0, 1) +
      clamp(candidate.rearWheelMm / 330, 0, 1) +
      tireTerrainRatio(candidate.tireClass)) /
    3;
  const portability = portabilityRatioFor(
    candidate.netWeightWithoutBatteryKg,
    candidate.foldedMm,
  );
  const baselineTransport = assessment.use.airlineTravel
    ? poweredAirlineRatio(candidate)
    : portability;
  return {
    environment: environmentRatioFor(assessment, indoor, outdoor),
    transport: scoreTransportFit(assessment, candidate, baselineTransport),
    portability,
    roughTerrain: outdoor,
    range: clamp(
      candidate.rangeKm / Math.max(assessment.use.dailyRangeKm, 1),
      0,
      1,
    ),
  };
}

function scoreManualUse(
  assessment: FinderAssessment,
  candidate: Extract<WheelchairCandidate, { mobilityType: "manual" }>,
): UseScore {
  const indoor =
    (closeness(candidate.overallMm.width - 560, 180) +
      closeness(candidate.frontWheelMm - 180, 180)) /
    2;
  const outdoor =
    (clamp(candidate.frontWheelMm / 200, 0, 1) +
      clamp(candidate.rearWheelMm / 610, 0, 1) +
      tireTerrainRatio(candidate.tireClass) +
      (candidate.propulsionType === "self-propel" ? 1 : 0.55)) /
    4;
  const portability = portabilityRatioFor(
    candidate.productWeightKg,
    candidate.foldedMm,
  );
  const baselineTransport =
    portability * (candidate.propulsionType === "transport" ? 1 : 0.9);
  return {
    environment: environmentRatioFor(assessment, indoor, outdoor),
    transport: scoreTransportFit(assessment, candidate, baselineTransport),
    portability,
    roughTerrain: outdoor,
    range: null,
  };
}

function preferenceRatioFor(
  assessment: FinderAssessment,
  candidate: WheelchairCandidate,
  fit: number,
  use: UseScore,
) {
  const ratios: number[] = [];
  for (const priority of assessment.use.priorities) {
    switch (priority) {
      case "fit":
        ratios.push(fit);
        break;
      case "portability":
        ratios.push(use.portability);
        break;
      case "range":
        if (use.range !== null) ratios.push(use.range);
        break;
      case "rough-terrain":
        ratios.push(use.roughTerrain);
        break;
      case "roominess":
        ratios.push(clamp(candidate.effectiveSeatWidthMm / 550, 0, 1));
        break;
      case "self-propulsion":
        if (candidate.mobilityType === "manual") {
          ratios.push(candidate.propulsionType === "self-propel" ? 1 : 0.55);
        }
        break;
    }
  }
  return ratios.length > 0
    ? ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length
    : use.portability;
}

function airlineWarning(candidate: WheelchairCandidate): string {
  return candidate.mobilityType === "powered"
    ? "Airline eligibility is not guaranteed; confirm the wheelchair and battery with the airline before travel."
    : "Airline acceptance is not guaranteed; confirm folded dimensions and handling requirements with the airline before travel.";
}

function scoreVariant(
  assessment: FinderAssessment,
  candidate: WheelchairCandidate,
): VariantEvaluation {
  const confidence = confidenceFor(assessment, candidate);
  const dataWarnings = [...candidate.dataWarnings];
  const exclusions = evaluateHardConstraints(assessment, candidate);
  if (exclusions.length > 0) {
    return {
      productId: candidate.productId,
      variantId: candidate.variantId,
      mobilityType: candidate.mobilityType,
      eligible: false,
      exclusions,
      score: 0,
      scoreParts: { fit: 0, environment: 0, transport: 0, preferences: 0 },
      confidence,
      reasons: [],
      warnings: dataWarnings,
    };
  }

  const fitRatio = scoreCommonFit(assessment, candidate);
  const use =
    candidate.mobilityType === "powered"
      ? scorePoweredUse(assessment, candidate)
      : scoreManualUse(assessment, candidate);
  const preferenceRatio = preferenceRatioFor(
    assessment,
    candidate,
    fitRatio,
    use,
  );
  const scoreParts = {
    fit: fitRatio * FINDER_RULES.scoreWeights.fit,
    environment: use.environment * FINDER_RULES.scoreWeights.environment,
    transport: use.transport * FINDER_RULES.scoreWeights.transport,
    preferences: preferenceRatio * FINDER_RULES.scoreWeights.preferences,
  };
  const score = Math.round(
    Object.values(scoreParts).reduce((sum, value) => sum + value, 0),
  );
  const warnings = assessment.use.airlineTravel
    ? [...dataWarnings, airlineWarning(candidate)]
    : dataWarnings;
  warnings.push(...buildSoftFitWarnings(assessment, candidate));

  const useReason =
    candidate.mobilityType === "powered"
      ? `Provides ${Math.round(candidate.rangeKm)} km of listed range.`
      : candidate.propulsionType === "self-propel"
        ? `Uses a self-propel configuration at ${candidate.productWeightKg} kg.`
        : `Uses a transport configuration at ${candidate.productWeightKg} kg.`;

  return {
    productId: candidate.productId,
    variantId: candidate.variantId,
    mobilityType: candidate.mobilityType,
    eligible: true,
    exclusions: [],
    score,
    scoreParts,
    confidence,
    reasons: [
      `Supports the entered ${assessment.use.environment} use profile.`,
      "Hard capacity and frame-geometry checks passed.",
      useReason,
    ],
    warnings,
  };
}

export function recommendWheelchairs(
  assessment: FinderAssessment,
  candidates: readonly WheelchairCandidate[],
): {
  recommendations: Recommendation[];
  evaluations: VariantEvaluation[];
} {
  validateAssessmentNumbers(assessment);

  const evaluations = candidates
    .filter((candidate) => candidate.mobilityType === assessment.mobilityType)
    .map((candidate) => scoreVariant(assessment, candidate));
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

  const rankedEligible = Array.from(bestByProduct.values()).sort((left, right) =>
    compareEvaluationQuality(left, right, (item) => item.productId),
  );
  const recommendations = rankedEligible
    .filter((evaluation) => evaluation.score >= FINDER_RULES.outputBands.potential)
    .concat(
      rankedEligible.filter(
        (evaluation) => evaluation.score < FINDER_RULES.outputBands.potential,
      ),
    )
    .slice(0, FINDER_RULES.maxRecommendations)
    .map((evaluation) => ({
      productId: evaluation.productId,
      variantId: evaluation.variantId,
      mobilityType: evaluation.mobilityType,
      score: evaluation.score,
      band: matchBandForScore(evaluation.score),
      confidence: evaluation.confidence,
      reasons: evaluation.reasons,
      warnings: evaluation.warnings,
    }));

  return { recommendations, evaluations };
}
