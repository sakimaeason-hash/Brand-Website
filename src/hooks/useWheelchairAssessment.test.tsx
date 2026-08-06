import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, StrictMode } from "react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  WHEELCHAIR_ASSESSMENT_STORAGE_KEY,
  createDefaultAssessment,
  useWheelchairAssessment,
} from "./useWheelchairAssessment";
import type { FinderAssessmentUpdate } from "./useWheelchairAssessment";

const storedDraft = (overrides: Record<string, unknown> = {}) => ({
  mode: "quick",
  unitSystem: "us",
  heightMm: 1727,
  weightKg: 82,
  bodyBuild: "average",
  use: {
    environment: "mixed",
    surfaces: ["smooth"],
    tightSpaces: false,
    dailyRangeKm: 16,
    airlineTravel: false,
    priorities: ["fit"],
  },
  ...overrides,
});

const createMemoryStorage = (): Storage => {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, String(value));
    },
  };
};

const replaceLocalStorage = (descriptor: PropertyDescriptor) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    ...descriptor,
  });

  return () => {
    if (original) {
      Object.defineProperty(globalThis, "localStorage", original);
    } else {
      Reflect.deleteProperty(globalThis, "localStorage");
    }
  };
};

const installLocalStorage = (storage: Storage) =>
  replaceLocalStorage({ value: storage });

const StrictWrapper = ({ children }: PropsWithChildren) =>
  createElement(StrictMode, null, children);

describe("useWheelchairAssessment", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: createMemoryStorage(),
    });
  });

  it("never writes risky safety answers to local storage", async () => {
    const { result } = renderHook(() => useWheelchairAssessment(), {
      wrapper: StrictWrapper,
    });

    act(() => {
      result.current.update({
        safety: { pressureInjuryConcern: true },
      });
      result.current.next();
    });

    await waitFor(() => {
      const serialized = localStorage.getItem(
        WHEELCHAIR_ASSESSMENT_STORAGE_KEY,
      );
      expect(serialized).not.toBeNull();
      expect(serialized).not.toContain('"safety"');
      expect(serialized).not.toContain("pressureInjuryConcern");
      expect(serialized).not.toContain("posturalAsymmetry");
      expect(serialized).not.toContain("customPositioningNeed");
    });
  });

  it("keeps memory state usable when the localStorage property getter throws", () => {
    const restore = replaceLocalStorage({
      get: () => {
        throw new DOMException("Storage access blocked", "SecurityError");
      },
    });
    let unmount: (() => void) | undefined;

    try {
      const hook = renderHook(() => useWheelchairAssessment());
      unmount = hook.unmount;
      act(() => {
        hook.result.current.update({ heightMm: 1800 });
        hook.result.current.next();
      });
      expect(hook.result.current.assessment.heightMm).toBe(1800);
      expect(hook.result.current.step).toBe(2);
      expect(hook.result.current.result).toBeNull();
    } finally {
      unmount?.();
      restore();
    }
  });

  it("keeps memory state usable when getItem throws", () => {
    const storage = createMemoryStorage();
    const restore = installLocalStorage({
      ...storage,
      getItem: () => {
        throw new DOMException("Storage access blocked", "SecurityError");
      },
    });
    let unmount: (() => void) | undefined;

    try {
      const hook = renderHook(() => useWheelchairAssessment());
      unmount = hook.unmount;
      act(() => {
        hook.result.current.update({ heightMm: 1800 });
        hook.result.current.next();
      });
      expect(hook.result.current.assessment.heightMm).toBe(1800);
      expect(hook.result.current.step).toBe(2);
    } finally {
      unmount?.();
      restore();
    }
  });

  it("keeps memory state usable when setItem throws", () => {
    const storage = createMemoryStorage();
    const restore = installLocalStorage({
      ...storage,
      setItem: () => {
        throw new DOMException("Storage quota exceeded", "QuotaExceededError");
      },
    });
    let unmount: (() => void) | undefined;

    try {
      const hook = renderHook(() => useWheelchairAssessment());
      unmount = hook.unmount;
      act(() => {
        hook.result.current.update({ heightMm: 1800 });
        hook.result.current.next();
      });
      expect(hook.result.current.assessment.heightMm).toBe(1800);
      expect(hook.result.current.step).toBe(2);
    } finally {
      unmount?.();
      restore();
    }
  });

  it("retries a failed corrupt-draft removal before the next write", async () => {
    const backing = createMemoryStorage();
    backing.setItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY, "not-json");
    let removeAttempts = 0;
    const restore = installLocalStorage({
      ...backing,
      removeItem: (key) => {
        removeAttempts += 1;
        if (removeAttempts === 1) {
          throw new DOMException("Storage removal blocked", "SecurityError");
        }
        backing.removeItem(key);
      },
    });
    let unmount: (() => void) | undefined;

    try {
      const hook = renderHook(() => useWheelchairAssessment());
      unmount = hook.unmount;
      expect(hook.result.current.assessment).toEqual(createDefaultAssessment());

      act(() => {
        hook.result.current.update({ heightMm: 1800 });
      });
      await waitFor(() => {
        expect(removeAttempts).toBe(2);
        expect(backing.getItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY)).toContain(
          '"heightMm":1800',
        );
      });
    } finally {
      unmount?.();
      restore();
    }
  });

  it("resets memory immediately and retries a failed removal before writing again", async () => {
    const backing = createMemoryStorage();
    let removeAttempts = 0;
    const restore = installLocalStorage({
      ...backing,
      removeItem: (key) => {
        removeAttempts += 1;
        if (removeAttempts === 1) {
          throw new DOMException("Storage removal blocked", "SecurityError");
        }
        backing.removeItem(key);
      },
    });
    let unmount: (() => void) | undefined;

    try {
      const hook = renderHook(() => useWheelchairAssessment());
      unmount = hook.unmount;
      act(() => {
        hook.result.current.update({ heightMm: 1700 });
      });
      await waitFor(() =>
        expect(backing.getItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY)).toContain(
          '"heightMm":1700',
        ),
      );

      act(() => {
        hook.result.current.reset();
      });
      expect(hook.result.current.assessment).toEqual(createDefaultAssessment());
      expect(hook.result.current.step).toBe(1);

      act(() => {
        hook.result.current.update({ heightMm: 1800 });
      });
      await waitFor(() => {
        expect(removeAttempts).toBe(2);
        expect(backing.getItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY)).toContain(
          '"heightMm":1800',
        );
      });
    } finally {
      unmount?.();
      restore();
    }
  });

  it("restores validated non-sensitive fields and discards injected safety", async () => {
    localStorage.setItem(
      WHEELCHAIR_ASSESSMENT_STORAGE_KEY,
      JSON.stringify(
        storedDraft({
          heightMm: 1800,
          safety: {
            pressureInjuryConcern: true,
            posturalAsymmetry: true,
            customPositioningNeed: true,
          },
        }),
      ),
    );

    const { result } = renderHook(() => useWheelchairAssessment(), {
      wrapper: StrictWrapper,
    });

    await waitFor(() => expect(result.current.assessment.heightMm).toBe(1800));
    expect(result.current.assessment.safety).toEqual({
      pressureInjuryConcern: false,
      posturalAsymmetry: false,
      customPositioningNeed: false,
    });
  });

  it.each(["not-json", JSON.stringify({ version: 0 })])(
    "ignores and removes corrupt or invalid storage: %s",
    async (stored) => {
      localStorage.setItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY, stored);

      const { result } = renderHook(() => useWheelchairAssessment());

      await waitFor(() =>
        expect(
          localStorage.getItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY),
        ).toBeNull(),
      );
      expect(result.current.assessment).toEqual(createDefaultAssessment());
    },
  );

  it("deep-merges safety and use updates", () => {
    const { result } = renderHook(() => useWheelchairAssessment());
    const originalRange = result.current.assessment.use.dailyRangeKm;

    act(() => {
      result.current.update({
        safety: { pressureInjuryConcern: true },
        use: { environment: "outdoor" },
      });
    });

    expect(result.current.assessment.safety).toEqual({
      pressureInjuryConcern: true,
      posturalAsymmetry: false,
      customPositioningNeed: false,
    });
    expect(result.current.assessment.use.environment).toBe("outdoor");
    expect(result.current.assessment.use.dailyRangeKm).toBe(originalRange);
  });

  it("allowlists structured updates before storing them in state or storage", async () => {
    const injectedPatch: FinderAssessmentUpdate & {
      privateRoot: string;
      use: NonNullable<FinderAssessmentUpdate["use"]> & {
        diagnosis: string;
      };
      safety: NonNullable<FinderAssessmentUpdate["safety"]> & {
        privateSafetyNote: string;
      };
    } = {
      heightMm: 1800,
      privateRoot: "private-root-value",
      use: {
        environment: "outdoor",
        surfaces: ["gravel"],
        priorities: ["range"],
        diagnosis: "private-diagnosis-value",
      },
      safety: {
        pressureInjuryConcern: true,
        privateSafetyNote: "private-safety-value",
      },
    };
    const { result } = renderHook(() => useWheelchairAssessment());

    act(() => {
      result.current.update(injectedPatch);
    });

    expect(result.current.assessment.heightMm).toBe(1800);
    expect(result.current.assessment.use.environment).toBe("outdoor");
    expect(result.current.assessment.safety.pressureInjuryConcern).toBe(true);
    injectedPatch.use.surfaces?.push("smooth");
    injectedPatch.use.priorities?.push("fit");
    expect(result.current.assessment.use.surfaces).toEqual(["gravel"]);
    expect(result.current.assessment.use.priorities).toEqual(["range"]);
    const stateJson = JSON.stringify(result.current.assessment);
    [
      "privateRoot",
      "private-root-value",
      "diagnosis",
      "private-diagnosis-value",
      "privateSafetyNote",
      "private-safety-value",
    ].forEach((sensitive) => expect(stateJson).not.toContain(sensitive));

    await waitFor(() => {
      const persisted = localStorage.getItem(
        WHEELCHAIR_ASSESSMENT_STORAGE_KEY,
      );
      expect(persisted).not.toBeNull();
      [
        '"safety"',
        "pressureInjuryConcern",
        "posturalAsymmetry",
        "customPositioningNeed",
        "privateRoot",
        "private-root-value",
        "diagnosis",
        "private-diagnosis-value",
        "privateSafetyNote",
        "private-safety-value",
      ].forEach((sensitive) => expect(persisted).not.toContain(sensitive));
    });
  });

  it("clears optional measurements and transport constraints explicitly", () => {
    const { result } = renderHook(() => useWheelchairAssessment());

    act(() => {
      result.current.update({
        hipWidthMm: 430,
        bodySeatDepthMm: 480,
        lowerLegMm: 400,
        use: {
          storageMm: { length: 800, width: 700, height: 600 },
          maxLiftKg: 25,
        },
      });
    });
    expect(result.current.assessment.use.storageMm).toEqual({
      length: 800,
      width: 700,
      height: 600,
    });

    act(() => {
      result.current.update({
        hipWidthMm: undefined,
        bodySeatDepthMm: undefined,
        lowerLegMm: undefined,
        use: { storageMm: undefined, maxLiftKg: undefined },
      });
    });

    expect(result.current.assessment.hipWidthMm).toBeUndefined();
    expect(result.current.assessment.bodySeatDepthMm).toBeUndefined();
    expect(result.current.assessment.lowerLegMm).toBeUndefined();
    expect(result.current.assessment.use.storageMm).toBeUndefined();
    expect(result.current.assessment.use.maxLiftKg).toBeUndefined();
  });

  it("clamps steps and reset leaves no persisted draft", async () => {
    const { result } = renderHook(() => useWheelchairAssessment(), {
      wrapper: StrictWrapper,
    });

    act(() => {
      result.current.back();
    });
    expect(result.current.step).toBe(1);

    act(() => {
      for (let index = 0; index < 10; index += 1) result.current.next();
      result.current.update({ heightMm: 1800 });
    });
    expect(result.current.step).toBe(5);

    await waitFor(() =>
      expect(
        localStorage.getItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY),
      ).not.toBeNull(),
    );

    act(() => {
      result.current.reset();
    });

    expect(result.current.step).toBe(1);
    expect(result.current.assessment).toEqual(createDefaultAssessment());
    await waitFor(() =>
      expect(
        localStorage.getItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY),
      ).toBeNull(),
    );
  });

  it("persists a reset-then-update queued in one StrictMode act", async () => {
    const { result } = renderHook(() => useWheelchairAssessment(), {
      wrapper: StrictWrapper,
    });
    act(() => {
      result.current.update({ heightMm: 1700 });
    });
    await waitFor(() =>
      expect(
        localStorage.getItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY),
      ).toContain('"heightMm":1700'),
    );

    act(() => {
      result.current.reset();
      result.current.update({ heightMm: 1800 });
    });

    expect(result.current.assessment.heightMm).toBe(1800);
    await waitFor(() =>
      expect(
        localStorage.getItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY),
      ).toContain('"heightMm":1800'),
    );
  });

  it("removes a draft when update-then-reset is queued in one StrictMode act", async () => {
    const { result } = renderHook(() => useWheelchairAssessment(), {
      wrapper: StrictWrapper,
    });
    act(() => {
      result.current.update({ heightMm: 1700 });
    });
    await waitFor(() =>
      expect(
        localStorage.getItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY),
      ).toContain('"heightMm":1700'),
    );

    act(() => {
      result.current.update({ heightMm: 1800 });
      result.current.reset();
    });

    expect(result.current.assessment).toEqual(createDefaultAssessment());
    await waitFor(() =>
      expect(
        localStorage.getItem(WHEELCHAIR_ASSESSMENT_STORAGE_KEY),
      ).toBeNull(),
    );
  });

  it("computes recommendations only for a valid final assessment", () => {
    const { result } = renderHook(() => useWheelchairAssessment());
    expect(result.current.result).toBeNull();

    act(() => {
      for (let index = 0; index < 4; index += 1) result.current.next();
    });
    expect(result.current.step).toBe(5);
    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.update({ weightKg: Number.NaN });
    });
    expect(result.current.result).toBeNull();
  });

  it("creates isolated default assessment objects", () => {
    const first = createDefaultAssessment();
    const second = createDefaultAssessment();

    expect(first).not.toBe(second);
    expect(first.safety).not.toBe(second.safety);
    expect(first.use).not.toBe(second.use);
    expect(first.use.surfaces).not.toBe(second.use.surfaces);
    expect(first.use.priorities).not.toBe(second.use.priorities);
    first.use.surfaces.push("gravel");
    expect(second.use.surfaces).toEqual(["smooth"]);
  });

  it("does not expose a mutable shared default assessment", async () => {
    const hookModule = await import("./useWheelchairAssessment");
    expect(hookModule).not.toHaveProperty("DEFAULT_ASSESSMENT");
  });
});
