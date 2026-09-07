const MM_PER_INCH = 25.4;
const LB_PER_KG = 2.2046226218;
const KM_PER_MILE = 1.609344;

export const inchesToMm = (value: number) => value * MM_PER_INCH;
export const mmToInches = (value: number) => value / MM_PER_INCH;
export const lbToKg = (value: number) => value / LB_PER_KG;
export const kgToLb = (value: number) => value * LB_PER_KG;
export const milesToKm = (value: number) => value * KM_PER_MILE;
export const kmToMiles = (value: number) => value / KM_PER_MILE;

export function formatLength(mm: number, unit: "us" | "metric") {
  return unit === "us" ? `${mmToInches(mm).toFixed(1)} in` : `${Math.round(mm / 10)} cm`;
}

export function formatWeight(kg: number, unit: "us" | "metric") {
  return unit === "us" ? `${kgToLb(kg).toFixed(1)} lb` : `${kg.toFixed(1)} kg`;
}

export function formatRange(km: number, unit: "us" | "metric") {
  return unit === "us" ? `${kmToMiles(km).toFixed(0)} mi` : `${km.toFixed(0)} km`;
}

export function batteryWh(voltageV: number | null, capacityAh: number) {
  return voltageV === null ? null : voltageV * capacityAh;
}
