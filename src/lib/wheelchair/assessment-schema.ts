import { z } from "zod";
import type { FinderAssessment } from "./types";

const dimensionsSchema = z.object({
  length: z.number().min(100).max(3000),
  width: z.number().min(100).max(3000),
  height: z.number().min(100).max(3000),
});

export const useProfileSchema = z.object({
  environment: z.enum(["indoor", "outdoor", "mixed"]),
  surfaces: z
    .array(z.enum(["smooth", "carpet", "grass", "gravel", "uneven"]))
    .min(1)
    .max(5)
    .refine((surfaces) => new Set(surfaces).size === surfaces.length, {
      message: "Select each surface only once",
    }),
  tightSpaces: z.boolean(),
  dailyRangeKm: z.number().min(1).max(100),
  airlineTravel: z.boolean(),
  storageMm: dimensionsSchema.optional(),
  maxLiftKg: z.number().min(2).max(100).optional(),
  priorities: z
    .array(
      z.enum(["fit", "portability", "range", "rough-terrain", "roominess"]),
    )
    .min(1)
    .max(3)
    .refine((priorities) => new Set(priorities).size === priorities.length, {
      message: "Select each priority only once",
    }),
});

const safetySchema = z.object({
  pressureInjuryConcern: z.boolean(),
  posturalAsymmetry: z.boolean(),
  customPositioningNeed: z.boolean(),
});

const assessmentObjectSchema = z.object({
  mode: z.enum(["quick", "precision"]),
  unitSystem: z.enum(["us", "metric"]),
  heightMm: z.number().min(900).max(2500),
  weightKg: z.number().min(20).max(275),
  bodyBuild: z.enum(["slim", "average", "broad"]),
  hipWidthMm: z.number().min(200).max(760).optional(),
  bodySeatDepthMm: z.number().min(250).max(760).optional(),
  lowerLegMm: z.number().min(250).max(760).optional(),
  safety: safetySchema,
  use: useProfileSchema,
});

const requirePrecisionMeasurements = (
  value: {
    mode: "quick" | "precision";
    hipWidthMm?: number;
    bodySeatDepthMm?: number;
    lowerLegMm?: number;
  },
  context: z.RefinementCtx,
) => {
  if (value.mode !== "precision") return;

  (["hipWidthMm", "bodySeatDepthMm", "lowerLegMm"] as const).forEach(
    (field) => {
      if (value[field] === undefined) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "Required for precision matching",
        });
      }
    },
  );
};

export const assessmentSchema = assessmentObjectSchema.superRefine(
  requirePrecisionMeasurements,
);

export const persistedAssessmentSchema = assessmentObjectSchema
  .omit({ safety: true })
  .superRefine(requirePrecisionMeasurements);

export type AssessmentInput = z.infer<typeof assessmentSchema>;

export function requiresProfessionalAssessment(assessment: FinderAssessment) {
  return (
    assessment.safety.pressureInjuryConcern ||
    assessment.safety.posturalAsymmetry ||
    assessment.safety.customPositioningNeed
  );
}

export function sanitizeForLocalStorage(assessment: FinderAssessment) {
  return {
    mode: assessment.mode,
    unitSystem: assessment.unitSystem,
    heightMm: assessment.heightMm,
    weightKg: assessment.weightKg,
    bodyBuild: assessment.bodyBuild,
    hipWidthMm: assessment.hipWidthMm,
    bodySeatDepthMm: assessment.bodySeatDepthMm,
    lowerLegMm: assessment.lowerLegMm,
    use: {
      environment: assessment.use.environment,
      surfaces: [...assessment.use.surfaces],
      tightSpaces: assessment.use.tightSpaces,
      dailyRangeKm: assessment.use.dailyRangeKm,
      airlineTravel: assessment.use.airlineTravel,
      storageMm: assessment.use.storageMm
        ? {
            length: assessment.use.storageMm.length,
            width: assessment.use.storageMm.width,
            height: assessment.use.storageMm.height,
          }
        : undefined,
      maxLiftKg: assessment.use.maxLiftKg,
      priorities: [...assessment.use.priorities],
    },
  };
}

export function sanitizeForAccount(assessment: FinderAssessment) {
  return {
    ...sanitizeForLocalStorage(assessment),
    professionalAssessmentRequired: requiresProfessionalAssessment(assessment),
  };
}
