import type {
  DimensionsValue,
  SpecificationFieldDefinition,
  SpecificationInput,
  SpecificationMap,
  SpecificationScope,
  StoredSpecification,
} from "./types";
import { normalizeNumber } from "./units";

export class SpecificationInputError extends Error {
  readonly fieldKey: string;

  constructor(fieldKey: string, message: string) {
    super(`${fieldKey}: ${message}`);
    this.name = "SpecificationInputError";
    this.fieldKey = fieldKey;
  }
}

function fail(field: SpecificationFieldDefinition, message: string): never {
  throw new SpecificationInputError(field.key, message);
}

function sourceNoteFor(
  field: SpecificationFieldDefinition,
  input: SpecificationInput,
): string | undefined {
  const sourceNote = input.sourceNote?.trim();
  if (input.status === "CONFLICTING" && !sourceNote) {
    fail(field, "CONFLICTING values require a non-empty sourceNote.");
  }
  return sourceNote || undefined;
}

function validateBounds(
  field: SpecificationFieldDefinition,
  value: number,
  dimension?: keyof DimensionsValue,
): void {
  const name = dimension ? `${dimension} value` : "value";
  if (field.minValue !== null && value < field.minValue) {
    fail(field, `${name} must be at least ${field.minValue}.`);
  }
  if (field.maxValue !== null && value > field.maxValue) {
    fail(field, `${name} must be at most ${field.maxValue}.`);
  }
}

function assertNoUnit(
  field: SpecificationFieldDefinition,
  unit: string | null | undefined,
): void {
  if (unit !== undefined && unit !== null && unit !== "") {
    fail(field, `unit ${unit} is invalid for ${field.unitFamily}.`);
  }
}

function normalizeNumericValue(
  field: SpecificationFieldDefinition,
  value: number,
  unit: string | null | undefined,
): Pick<
  StoredSpecification,
  "inputValue" | "inputUnit" | "normalizedValue" | "normalizedUnit"
> {
  if (!Number.isFinite(value)) {
    fail(field, "value must be a finite number.");
  }
  if (value < 0) {
    fail(field, "value cannot be negative.");
  }

  if (field.unitFamily === "NONE") {
    assertNoUnit(field, unit);
    validateBounds(field, value);
    return { inputValue: value, normalizedValue: value };
  }

  const inputUnit = unit ?? field.defaultDisplayUnit;
  if (!inputUnit) {
    fail(field, `unit is required for ${field.unitFamily}.`);
  }

  try {
    const normalized = normalizeNumber(value, inputUnit, field.unitFamily);
    validateBounds(field, normalized.normalizedValue);
    return normalized;
  } catch (error) {
    if (error instanceof SpecificationInputError) {
      throw error;
    }
    fail(field, error instanceof Error ? error.message : "invalid numeric value.");
  }
}

function isDimensionsValue(value: unknown): value is DimensionsValue {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const dimensions = value as Record<string, unknown>;
  return (
    typeof dimensions.length === "number" &&
    typeof dimensions.width === "number" &&
    typeof dimensions.height === "number"
  );
}

function baseStoredSpecification(
  input: SpecificationInput,
  sourceNote: string | undefined,
): Pick<StoredSpecification, "status" | "value" | "sourceNote"> {
  return {
    status: input.status,
    value: input.value,
    ...(sourceNote ? { sourceNote } : {}),
  };
}

export function normalizeSpecification(
  field: SpecificationFieldDefinition,
  input: SpecificationInput,
): StoredSpecification {
  if (!input || !["PROVIDED", "NOT_PROVIDED", "CONFLICTING"].includes(input.status)) {
    fail(field, "status is invalid.");
  }
  if (input.status === "NOT_PROVIDED") {
    return { status: "NOT_PROVIDED", value: null };
  }

  const sourceNote = sourceNoteFor(field, input);

  switch (field.dataType) {
    case "TEXT": {
      assertNoUnit(field, input.unit);
      if (typeof input.value !== "string") {
        fail(field, "value must be text.");
      }
      return {
        ...baseStoredSpecification(input, sourceNote),
        value: input.value.trim(),
      };
    }
    case "SELECT": {
      assertNoUnit(field, input.unit);
      if (typeof input.value !== "string") {
        fail(field, "value must be a select option.");
      }
      const value = input.value.trim();
      if (!field.options.includes(value)) {
        fail(field, `value must be one of: ${field.options.join(", ")}.`);
      }
      return { ...baseStoredSpecification(input, sourceNote), value };
    }
    case "BOOLEAN": {
      assertNoUnit(field, input.unit);
      if (typeof input.value !== "boolean") {
        fail(field, "value must be boolean.");
      }
      return baseStoredSpecification(input, sourceNote);
    }
    case "NUMBER": {
      if (typeof input.value !== "number") {
        fail(field, "value must be a number.");
      }
      return {
        ...baseStoredSpecification(input, sourceNote),
        ...normalizeNumericValue(field, input.value, input.unit),
      };
    }
    case "DIMENSIONS": {
      if (!isDimensionsValue(input.value)) {
        fail(field, "value must contain numeric length, width, and height.");
      }

      const normalized = {
        length: normalizeNumericValue(field, input.value.length, input.unit),
        width: normalizeNumericValue(field, input.value.width, input.unit),
        height: normalizeNumericValue(field, input.value.height, input.unit),
      };
      for (const dimension of ["length", "width", "height"] as const) {
        validateBounds(
          field,
          normalized[dimension].normalizedValue as number,
          dimension,
        );
      }

      const first = normalized.length;
      return {
        ...baseStoredSpecification(input, sourceNote),
        inputValue: input.value,
        ...(first.inputUnit ? { inputUnit: first.inputUnit } : {}),
        normalizedValue: {
          length: normalized.length.normalizedValue as number,
          width: normalized.width.normalizedValue as number,
          height: normalized.height.normalizedValue as number,
        },
        ...(first.normalizedUnit ? { normalizedUnit: first.normalizedUnit } : {}),
      };
    }
  }
}

export function normalizeSpecificationMap(
  fields: readonly SpecificationFieldDefinition[],
  input: Record<string, SpecificationInput>,
  scope: SpecificationScope,
): SpecificationMap {
  const availableFields = new Map(
    fields
      .filter((field) => field.scope === scope && field.status === "ACTIVE")
      .map((field) => [field.key, field]),
  );
  const result: SpecificationMap = {};

  for (const [key, specification] of Object.entries(input)) {
    const field = availableFields.get(key);
    if (!field) {
      throw new SpecificationInputError(
        key,
        `field is unknown, archived, or unavailable for ${scope}.`,
      );
    }
    result[key] = normalizeSpecification(field, specification);
  }

  return result;
}
