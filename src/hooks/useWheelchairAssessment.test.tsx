import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, StrictMode } from "react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_ASSESSMENT,
  WHEELCHAIR_ASSESSMENT_STORAGE_KEY,
  useWheelchairAssessment,
} from "./useWheelchairAssessment";

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
      expect(result.current.assessment).toEqual(DEFAULT_ASSESSMENT);
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
    expect(result.current.assessment).toEqual(DEFAULT_ASSESSMENT);
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
});
