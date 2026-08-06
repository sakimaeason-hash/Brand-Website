"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  assessmentSchema,
  persistedAssessmentSchema,
  sanitizeForLocalStorage,
} from "@/lib/wheelchair/assessment-schema";
import { recommendWheelchairs } from "@/lib/wheelchair/recommend";
import type { FinderAssessment } from "@/lib/wheelchair/types";

export const WHEELCHAIR_ASSESSMENT_STORAGE_KEY =
  "goldseason:wheelchair-finder:v1";

const FIRST_STEP = 1;
const FINAL_STEP = 5;

const createSafetyAnswers = (): FinderAssessment["safety"] => ({
  pressureInjuryConcern: false,
  posturalAsymmetry: false,
  customPositioningNeed: false,
});

const createDefaultAssessment = (): FinderAssessment => ({
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

export const DEFAULT_ASSESSMENT = createDefaultAssessment();

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

const mergeUseUpdate = (
  current: FinderAssessment["use"],
  update: UseUpdate,
): FinderAssessment["use"] => {
  const next = { ...current, ...update };
  if (!Object.prototype.hasOwnProperty.call(update, "storageMm")) return next;

  return {
    ...next,
    storageMm: update.storageMm,
  };
};

export function useWheelchairAssessment() {
  const [assessment, setAssessment] = useState<FinderAssessment>(() =>
    createDefaultAssessment(),
  );
  const [step, setStep] = useState(FIRST_STEP);
  const [hydrated, setHydrated] = useState(false);
  const skipNextPersist = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY);
    if (stored === null) {
      skipNextPersist.current = true;
      setHydrated(true);
      return;
    }

    try {
      const parsed = persistedAssessmentSchema.safeParse(JSON.parse(stored));
      if (!parsed.success) {
        localStorage.removeItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY);
        skipNextPersist.current = true;
      } else {
        setAssessment({ ...parsed.data, safety: createSafetyAnswers() });
      }
    } catch {
      localStorage.removeItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY);
      skipNextPersist.current = true;
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }

    localStorage.setItem(
      WHEELCHAIR_ASSESSMENT_STORAGE_KEY,
      JSON.stringify(sanitizeForLocalStorage(assessment)),
    );
  }, [assessment, hydrated]);

  const update = useCallback((patch: FinderAssessmentUpdate) => {
    setAssessment((current) => ({
      ...current,
      ...patch,
      safety: patch.safety
        ? { ...current.safety, ...patch.safety }
        : current.safety,
      use: patch.use ? mergeUseUpdate(current.use, patch.use) : current.use,
    }));
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
    localStorage.removeItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY);
  }, []);

  const result = useMemo(() => {
    if (step !== FINAL_STEP) return null;
    const parsed = assessmentSchema.safeParse(assessment);
    return parsed.success ? recommendWheelchairs(parsed.data) : null;
  }, [assessment, step]);

  return { assessment, step, update, next, back, reset, result };
}
