import { describe, expect, it } from "vitest";
import { normalizeNumber } from "./units";

describe("normalizeNumber", () => {
  it.each([
    [330, "lb", "WEIGHT", 149.6854821, "kg"],
    [10, "in", "LENGTH", 254, "mm"],
    [15, "mi", "DISTANCE", 24.14016, "km"],
    [6, "mph", "SPEED", 9.656064, "km/h"],
  ] as const)(
    "normalizes %s %s in the %s family while preserving the entered value",
    (value, unit, family, normalizedValue, normalizedUnit) => {
      expect(normalizeNumber(value, unit, family)).toEqual({
        inputValue: value,
        inputUnit: unit,
        normalizedValue: expect.closeTo(normalizedValue, 6),
        normalizedUnit,
      });
    },
  );

  it("allows zero because field constraints decide whether zero is valid", () => {
    expect(normalizeNumber(0, "kg", "WEIGHT")).toEqual({
      inputValue: 0,
      inputUnit: "kg",
      normalizedValue: 0,
      normalizedUnit: "kg",
    });
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects a non-finite value: %s",
    (value) => {
      expect(() => normalizeNumber(value, "kg", "WEIGHT")).toThrow(/finite/i);
    },
  );

  it("rejects negative values", () => {
    expect(() => normalizeNumber(-1, "kg", "WEIGHT")).toThrow(/negative/i);
  });

  it("rejects a unit from another family", () => {
    expect(() => normalizeNumber(10, "in", "WEIGHT")).toThrow(/WEIGHT/);
  });

  it("rejects unsupported units instead of guessing", () => {
    expect(() => normalizeNumber(10, "cm", "LENGTH")).toThrow(/LENGTH/);
  });
});
