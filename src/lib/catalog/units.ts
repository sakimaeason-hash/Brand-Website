import type { UnitFamily } from "./types";

export type NormalizedNumber = {
  inputValue: number;
  inputUnit: string;
  normalizedValue: number;
  normalizedUnit: string;
};

type UnitFamilyDefinition = {
  canonicalUnit: string;
  factors: Readonly<Record<string, number>>;
};

const UNIT_FAMILIES: Readonly<
  Record<Exclude<UnitFamily, "NONE">, UnitFamilyDefinition>
> = {
  LENGTH: { canonicalUnit: "mm", factors: { mm: 1, in: 25.4 } },
  WEIGHT: { canonicalUnit: "kg", factors: { kg: 1, lb: 0.45359237 } },
  DISTANCE: { canonicalUnit: "km", factors: { km: 1, mi: 1.609344 } },
  SPEED: { canonicalUnit: "km/h", factors: { "km/h": 1, mph: 1.609344 } },
  POWER: { canonicalUnit: "W", factors: { W: 1 } },
  VOLTAGE: { canonicalUnit: "V", factors: { V: 1 } },
  CAPACITY_AH: { canonicalUnit: "Ah", factors: { Ah: 1 } },
  ENERGY_WH: { canonicalUnit: "Wh", factors: { Wh: 1 } },
  ANGLE: { canonicalUnit: "deg", factors: { deg: 1 } },
};

export function unitsForFamily(family: UnitFamily): readonly string[] {
  if (family === "NONE") return [];
  return Object.keys(UNIT_FAMILIES[family].factors);
}

export function isUnitForFamily(unit: string, family: UnitFamily): boolean {
  return unitsForFamily(family).includes(unit);
}

function stabilizeFloat(value: number): number {
  return Number(value.toPrecision(15));
}

export function normalizeNumber(
  value: number,
  unit: string,
  family: UnitFamily,
): NormalizedNumber {
  if (!Number.isFinite(value)) {
    throw new Error("Unit normalization requires a finite value.");
  }
  if (value < 0) {
    throw new Error("Unit normalization does not accept negative values.");
  }
  if (family === "NONE") {
    throw new Error("Unit family NONE does not accept a unit.");
  }

  const definition = UNIT_FAMILIES[family];
  if (!Object.prototype.hasOwnProperty.call(definition.factors, unit)) {
    throw new Error(`Unit ${unit || "(empty)"} does not belong to ${family}.`);
  }
  const factor = definition.factors[unit];
  const normalizedValue = value * factor;
  if (!Number.isFinite(normalizedValue)) {
    throw new Error("Unit normalization produced a non-finite value.");
  }

  return {
    inputValue: value,
    inputUnit: unit,
    normalizedValue: stabilizeFloat(normalizedValue),
    normalizedUnit: definition.canonicalUnit,
  };
}
