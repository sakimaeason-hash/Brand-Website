import { FINDER_RULES } from "./rules-config";
import type {
  DimensionsMm,
  ExclusionCode,
  FinderAssessment,
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

    const effectiveWidth = Math.min(variant.seatWidthMm, variant.armrestSpacingMm);
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
