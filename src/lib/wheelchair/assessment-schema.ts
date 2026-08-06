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
    .min(1),
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
    .max(3),
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
  return Object.values(assessment.safety).some(Boolean);
}

export function sanitizeForLocalStorage(assessment: FinderAssessment) {
  const { safety: _safety, ...persistable } = assessment;
  return persistable;
}

export function sanitizeForAccount(assessment: FinderAssessment) {
  return {
    ...sanitizeForLocalStorage(assessment),
    professionalAssessmentRequired: requiresProfessionalAssessment(assessment),
  };
}
