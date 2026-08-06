"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  assessmentSchema,
  persistedAssessmentSchema,
  sanitizeForLocalStorage,
} from "@/lib/wheelchair/assessment-schema";
import { recommendWheelchairs } from "@/lib/wheelchair/recommend";
import type {
  DimensionsMm,
  FinderAssessment,
} from "@/lib/wheelchair/types";

export const WHEELCHAIR_ASSESSMENT_STORAGE_KEY =
  "goldseason:wheelchair-finder:v1";

const FIRST_STEP = 1;
const FINAL_STEP = 5;

const createSafetyAnswers = (): FinderAssessment["safety"] => ({
  pressureInjuryConcern: false,
  posturalAsymmetry: false,
  customPositioningNeed: false,
});

export const createDefaultAssessment = (): FinderAssessment => ({
  mode: "quick",
  unitSystem: "us",
  heightMm: 1727,
  weightKg: 82,
  bodyBuild: "average",
  safety: createSafetyAnswers(),
  use: {
    environment: "mixed",
    surfaces: ["smooth"],
    tightSpaces: false,
    dailyRangeKm: 16,
    airlineTravel: false,
    priorities: ["fit"],
  },
});

type UseUpdate = Omit<Partial<FinderAssessment["use"]>, "storageMm"> & {
  storageMm?: FinderAssessment["use"]["storageMm"];
};

export type FinderAssessmentUpdate = Omit<
  Partial<FinderAssessment>,
  "safety" | "use"
> & {
  safety?: Partial<FinderAssessment["safety"]>;
  use?: UseUpdate;
};

const hasOwn = (value: object, field: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(value, field);

const copyDimensions = (
  dimensions: DimensionsMm | undefined,
): DimensionsMm | undefined =>
  dimensions
    ? {
        length: dimensions.length,
        width: dimensions.width,
        height: dimensions.height,
      }
    : undefined;

const safeGet = () => {
  try {
    return window.localStorage.getItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY);
  } catch {
    return null;
  }
};

const safeSet = (assessment: FinderAssessment) => {
  try {
    const serialized = JSON.stringify(sanitizeForLocalStorage(assessment));
    window.localStorage.setItem(
      WHEELCHAIR_ASSESSMENT_STORAGE_KEY,
      serialized,
    );
    return true;
  } catch {
    return false;
  }
};

const safeRemove = () => {
  try {
    window.localStorage.removeItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
};

export function useWheelchairAssessment() {
  const [assessment, setAssessment] = useState<FinderAssessment>(() =>
    createDefaultAssessment(),
  );
  const [step, setStep] = useState(FIRST_STEP);
  const [hydrated, setHydrated] = useState(false);
  const skipNextPersist = useRef(false);
  const pendingRemoval = useRef(false);

  const retryPendingRemoval = useCallback(() => {
    if (!pendingRemoval.current) return true;
    if (!safeRemove()) return false;

    pendingRemoval.current = false;
    return true;
  }, []);

  const readStoredAssessment = useCallback(() => {
    if (!retryPendingRemoval()) return null;
    return safeGet();
  }, [retryPendingRemoval]);

  const writeStoredAssessment = useCallback(
    (value: FinderAssessment) => {
      if (!retryPendingRemoval()) return false;
      return safeSet(value);
    },
    [retryPendingRemoval],
  );

  const removeStoredAssessment = useCallback(() => {
    pendingRemoval.current = true;
    if (safeRemove()) pendingRemoval.current = false;
  }, []);

  useEffect(() => {
    const stored = readStoredAssessment();
    if (stored === null) {
      skipNextPersist.current = true;
      setHydrated(true);
      return;
    }

    try {
      const parsed = persistedAssessmentSchema.safeParse(JSON.parse(stored));
      if (!parsed.success) {
        removeStoredAssessment();
        skipNextPersist.current = true;
      } else {
        setAssessment({ ...parsed.data, safety: createSafetyAnswers() });
      }
    } catch {
      removeStoredAssessment();
      skipNextPersist.current = true;
    }
    setHydrated(true);
  }, [readStoredAssessment, removeStoredAssessment]);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }

    writeStoredAssessment(assessment);
  }, [assessment, hydrated, writeStoredAssessment]);

  const update = useCallback((patch: FinderAssessmentUpdate) => {
    skipNextPersist.current = false;
    setAssessment((current) => {
      const usePatch = patch.use;
      const safetyPatch = patch.safety;

      return {
        mode: patch.mode ?? current.mode,
        unitSystem: patch.unitSystem ?? current.unitSystem,
        heightMm: patch.heightMm ?? current.heightMm,
        weightKg: patch.weightKg ?? current.weightKg,
        bodyBuild: patch.bodyBuild ?? current.bodyBuild,
        hipWidthMm: hasOwn(patch, "hipWidthMm")
          ? patch.hipWidthMm
          : current.hipWidthMm,
        bodySeatDepthMm: hasOwn(patch, "bodySeatDepthMm")
          ? patch.bodySeatDepthMm
          : current.bodySeatDepthMm,
        lowerLegMm: hasOwn(patch, "lowerLegMm")
          ? patch.lowerLegMm
          : current.lowerLegMm,
        safety: {
          pressureInjuryConcern:
            safetyPatch?.pressureInjuryConcern ??
            current.safety.pressureInjuryConcern,
          posturalAsymmetry:
            safetyPatch?.posturalAsymmetry ?? current.safety.posturalAsymmetry,
          customPositioningNeed:
            safetyPatch?.customPositioningNeed ??
            current.safety.customPositioningNeed,
        },
        use: {
          environment: usePatch?.environment ?? current.use.environment,
          surfaces: [...(usePatch?.surfaces ?? current.use.surfaces)],
          tightSpaces: usePatch?.tightSpaces ?? current.use.tightSpaces,
          dailyRangeKm: usePatch?.dailyRangeKm ?? current.use.dailyRangeKm,
          airlineTravel: usePatch?.airlineTravel ?? current.use.airlineTravel,
          storageMm:
            usePatch !== undefined && hasOwn(usePatch, "storageMm")
              ? copyDimensions(usePatch.storageMm)
              : copyDimensions(current.use.storageMm),
          maxLiftKg:
            usePatch !== undefined && hasOwn(usePatch, "maxLiftKg")
              ? usePatch.maxLiftKg
              : current.use.maxLiftKg,
          priorities: [...(usePatch?.priorities ?? current.use.priorities)],
        },
      };
    });
  }, []);

  const next = useCallback(() => {
    setStep((current) => Math.min(FINAL_STEP, current + 1));
  }, []);

  const back = useCallback(() => {
    setStep((current) => Math.max(FIRST_STEP, current - 1));
  }, []);

  const reset = useCallback(() => {
    skipNextPersist.current = true;
    setAssessment(createDefaultAssessment());
    setStep(FIRST_STEP);
    removeStoredAssessment();
  }, [removeStoredAssessment]);

  const result = useMemo(() => {
    if (step !== FINAL_STEP) return null;
    const parsed = assessmentSchema.safeParse(assessment);
    return parsed.success ? recommendWheelchairs(parsed.data) : null;
  }, [assessment, step]);

  return { assessment, step, update, next, back, reset, result };
}
