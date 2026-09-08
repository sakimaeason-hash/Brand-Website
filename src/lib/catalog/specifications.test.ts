import { describe, expect, it } from "vitest";
import {
  normalizeSpecification,
  normalizeSpecificationMap,
  SpecificationInputError,
} from "./specifications";
import type { SpecificationFieldDefinition } from "./types";

function field(
  overrides: Partial<SpecificationFieldDefinition> = {},
): SpecificationFieldDefinition {
  return {
    key: "seatWidth",
    label: "Seat width",
    group: "Fit",
    scope: "VARIANT",
    dataType: "NUMBER",
    unitFamily: "LENGTH",
    defaultDisplayUnit: "in",
    options: [],
    helpText: null,
    minValue: null,
    maxValue: null,
    requiredForPublish: false,
    requiredForRecommendation: false,
    semanticKey: null,
    isProtected: false,
    status: "ACTIVE",
    sortOrder: 0,
    ...overrides,
  };
}

describe("normalizeSpecification", () => {
  it("normalizes a length without losing the entered value", () => {
    expect(
      normalizeSpecification(field(), {
        status: "PROVIDED",
        value: 18,
        unit: "in",
      }),
    ).toEqual({
      status: "PROVIDED",
      value: 18,
      inputValue: 18,
      inputUnit: "in",
      normalizedValue: 457.2,
      normalizedUnit: "mm",
    });
  });

  it("normalizes a weight to its canonical unit", () => {
    const weight = field({
      key: "maxUserWeight",
      label: "Maximum user weight",
      unitFamily: "WEIGHT",
      defaultDisplayUnit: "lb",
    });

    expect(
      normalizeSpecification(weight, {
        status: "PROVIDED",
        value: 330,
        unit: "lb",
      }),
    ).toMatchObject({
      inputValue: 330,
      inputUnit: "lb",
      normalizedValue: expect.closeTo(149.685, 3),
      normalizedUnit: "kg",
    });
  });

  it("keeps NOT_PROVIDED distinct from zero", () => {
    expect(
      normalizeSpecification(field(), {
        status: "NOT_PROVIDED",
        value: null,
        unit: "in",
      }),
    ).toEqual({ status: "NOT_PROVIDED", value: null });
  });

  it("normalizes boolean fields without coercion", () => {
    const removable = field({
      key: "batteryRemovable",
      dataType: "BOOLEAN",
      unitFamily: "NONE",
      defaultDisplayUnit: null,
    });

    expect(
      normalizeSpecification(removable, {
        status: "PROVIDED",
        value: false,
      }),
    ).toEqual({ status: "PROVIDED", value: false });
    expect(() =>
      normalizeSpecification(removable, {
        status: "PROVIDED",
        value: "false",
      }),
    ).toThrow(/batteryRemovable/);
  });

  it("trims select values and requires a declared option", () => {
    const tireClass = field({
      key: "tireClass",
      dataType: "SELECT",
      unitFamily: "NONE",
      defaultDisplayUnit: null,
      options: ["solid", "pneumatic"],
    });

    expect(
      normalizeSpecification(tireClass, {
        status: "PROVIDED",
        value: " solid ",
      }),
    ).toEqual({ status: "PROVIDED", value: "solid" });
    expect(() =>
      normalizeSpecification(tireClass, {
        status: "PROVIDED",
        value: "foam",
      }),
    ).toThrow(/tireClass/);
  });

  it("normalizes every dimension and preserves the entered dimensions", () => {
    const dimensions = field({
      key: "overallDimensions",
      dataType: "DIMENSIONS",
      unitFamily: "LENGTH",
    });
    const entered = { length: 40, width: 24, height: 36 };

    expect(
      normalizeSpecification(dimensions, {
        status: "PROVIDED",
        value: entered,
        unit: "in",
      }),
    ).toEqual({
      status: "PROVIDED",
      value: entered,
      inputValue: entered,
      inputUnit: "in",
      normalizedValue: { length: 1016, width: 609.6, height: 914.4 },
      normalizedUnit: "mm",
    });
  });

  it.each([undefined, "   "])(
    "allows conflicting values with an optional source note: %s",
    (sourceNote) => {
      expect(
        normalizeSpecification(field(), {
          status: "CONFLICTING",
          value: 18,
          unit: "in",
          sourceNote,
        }),
      ).toEqual({
        status: "CONFLICTING",
        value: 18,
        inputValue: 18,
        inputUnit: "in",
        normalizedValue: 457.2,
        normalizedUnit: "mm",
      });
    },
  );

  it("trims and preserves a provided source note for conflicting values", () => {
    expect(
      normalizeSpecification(field(), {
        status: "CONFLICTING",
        value: 18,
        unit: "in",
        sourceNote: " Metric and imperial source columns disagree. ",
      }),
    ).toMatchObject({
      status: "CONFLICTING",
      sourceNote: "Metric and imperial source columns disagree.",
      normalizedValue: 457.2,
    });
  });

  it("reports the field key for bad units, types, and normalized bounds", () => {
    const constrained = field({ minValue: 400, maxValue: 500 });

    for (const input of [
      { status: "PROVIDED", value: 18, unit: "lb" },
      { status: "PROVIDED", value: "18", unit: "in" },
      { status: "PROVIDED", value: 10, unit: "in" },
      { status: "PROVIDED", value: 30, unit: "in" },
    ] as const) {
      expect(() => normalizeSpecification(constrained, input)).toThrowError(
        new RegExp(constrained.key),
      );
    }
  });
});

describe("normalizeSpecificationMap", () => {
  const fields = [
    field({ key: "variantLength", scope: "VARIANT" }),
    field({ key: "productWeight", scope: "PRODUCT", unitFamily: "WEIGHT" }),
    field({ key: "archivedField", scope: "VARIANT", status: "ARCHIVED" }),
    field({ key: "optionalField", scope: "VARIANT", dataType: "TEXT", unitFamily: "NONE" }),
  ] as const;

  it("normalizes only supplied active fields in the requested scope", () => {
    expect(
      normalizeSpecificationMap(
        fields,
        {
          variantLength: { status: "PROVIDED", value: 10, unit: "in" },
        },
        "VARIANT",
      ),
    ).toEqual({
      variantLength: {
        status: "PROVIDED",
        value: 10,
        inputValue: 10,
        inputUnit: "in",
        normalizedValue: 254,
        normalizedUnit: "mm",
      },
    });
  });

  it.each(["unknownField", "productWeight", "archivedField"])(
    "rejects unavailable input key %s",
    (key) => {
      expect(() =>
        normalizeSpecificationMap(
          fields,
          { [key]: { status: "NOT_PROVIDED", value: null } },
          "VARIANT",
        ),
      ).toThrowError(SpecificationInputError);
      expect(() =>
        normalizeSpecificationMap(
          fields,
          { [key]: { status: "NOT_PROVIDED", value: null } },
          "VARIANT",
        ),
      ).toThrow(new RegExp(key));
    },
  );
});
