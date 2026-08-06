import type { WheelchairProductSpec, WheelchairVariantSpec } from "@/lib/wheelchair/types";
import { lbToKg, milesToKm } from "@/lib/wheelchair/units";

const dims = (length: number, width: number, height: number) => ({ length, width, height });
const variant = (value: WheelchairVariantSpec): WheelchairVariantSpec => value;

type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
    : T;

function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nestedValue of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nestedValue);
    }
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}

const nd03Base = {
  factoryModel: "ND03", maxUserWeightKg: lbToKg(330), seatWidthMm: 440, seatDepthMm: 420,
  cushionWidthMm: 440, cushionDepthMm: 420, seatHeightMm: 520, armrestSpacingMm: 440,
  seatToFootrestMm: 390, overallMm: dims(960, 550, 940), foldedMm: dims(340, 540, 840),
  netWeightWithoutBatteryKg: 15, batteryWeightKg: 1.21, rangeKm: milesToKm(15),
  turningRadiusMm: 950, obstacleHeightMm: 40, maxSpeedKph: 6, frontWheelMm: 180, rearWheelMm: 220,
  tireClass: "foam" as const,
  battery: { removable: true, chemistry: "lithium" as const, voltageV: 25.2, capacityAh: 10, manufacturerAirplaneFlag: true },
};

const pa16Base = {
  factoryModel: "XSW001-B (A16)", maxUserWeightKg: lbToKg(400), seatWidthMm: 500, seatDepthMm: 470,
  seatHeightMm: 500, armrestSpacingMm: 500, seatToFootrestMm: 350,
  overallMm: dims(1040, 660, 970), foldedMm: dims(560, 650, 990), netWeightWithoutBatteryKg: 29.7,
  turningRadiusMm: 1200, obstacleHeightMm: 40, maxSpeedKph: 6, frontWheelMm: 200, rearWheelMm: 330,
  tireClass: "mixed-pneumatic" as const,
};

const mutableWheelchairSpecs: WheelchairProductSpec[] = [
  {
    productId: "1", storefrontName: "Travel Air W 03", officialFamily: "ND03-C/D/E/F",
    variants: [["GI03H102", "I", 20.14], ["GI04H103", "J", 20.14], ["GI05H104", "K", 21.41], ["GI06H105", "L", 21.41]].map(([variantId, column, packedWeightKg]) => variant({
      ...nd03Base, variantId: String(variantId),
      source: { workbookColumns: String(column), raw: { loadCapacity: "330 lb", netWeight: "15 kg", seat: "420 D x 440 W mm", folded: "340 x 540 x 840 mm", battery: "25.2 V x 10 Ah", packedWeight: `${packedWeightKg} kg` }, status: {}, notes: [] },
    })),
  },
  {
    productId: "2", storefrontName: "Travel Air W 21", officialFamily: "HE702 / PA22",
    variants: [variant({ variantId: "PA22V100", factoryModel: "HE702", maxUserWeightKg: lbToKg(330), seatWidthMm: 460, seatDepthMm: 480, cushionWidthMm: 420, cushionDepthMm: 480, seatHeightMm: 480, armrestSpacingMm: 450, seatToFootrestMm: 320, overallMm: dims(1150, 560, 1040), foldedMm: dims(390, 550, 793), netWeightWithoutBatteryKg: 16.2, batteryWeightKg: 1.95, rangeKm: milesToKm(15), turningRadiusMm: 970, obstacleHeightMm: 25, maxSpeedKph: 6, frontWheelMm: 180, rearWheelMm: 250, tireClass: "solid", battery: { removable: true, chemistry: "lithium", voltageV: null, capacityAh: 10, manufacturerAirplaneFlag: true }, source: { workbookColumns: "P", raw: { netWeight: "16.2 kg", seat: "480 D x 460 W mm", folded: "390 x 550 x 793 mm", battery: "10 Ah; voltage absent" }, status: { batteryVoltageV: "missing" }, notes: ["Storefront W21 was confirmed by the product owner to be the PA22 model."] } })],
  },
  {
    productId: "3", storefrontName: "Travel Air W 26", officialFamily: "L-41 / PA26",
    variants: ["PA26A000", "PA26B000"].map((variantId, index) => variant({ variantId, factoryModel: "L-41", maxUserWeightKg: lbToKg(330), seatWidthMm: 410, seatDepthMm: 460, cushionWidthMm: 410, cushionDepthMm: 400, seatHeightMm: 520, armrestSpacingMm: 460, seatToFootrestMm: 450, overallMm: dims(920, 550, 1000), foldedMm: dims(550, 350, 850), netWeightWithoutBatteryKg: lbToKg(37), batteryWeightKg: 1.21, rangeKm: milesToKm(15), turningRadiusMm: 900, obstacleHeightMm: 25, maxSpeedKph: 4, frontWheelMm: 152.4, rearWheelMm: 254, tireClass: "solid", battery: { removable: true, chemistry: "lithium", voltageV: null, capacityAh: 6, manufacturerAirplaneFlag: true }, source: { workbookColumns: index === 0 ? "Q" : "R", raw: { netWeight: "37 lb", seat: "460 +/-10 D x 410 +/-10 W mm", folded: "550 x 350 x 850 mm", battery: "6 Ah; voltage absent" }, status: { batteryVoltageV: "missing" }, notes: [] } })),
  },
  {
    productId: "4", storefrontName: "Power Max 01", officialFamily: "YKW01",
    variants: [
      { variantId: "GI01H100", model: "YKW01-A", column: "D", overall: dims(1000, 650, 975), folded: dims(450, 650, 770), netKg: 24.5 },
      { variantId: "GI02H101", model: "YKW01-B", column: "C", overall: dims(1020, 650, 1110), folded: dims(450, 650, 880), netKg: 28 },
    ].map((row) => variant({ variantId: row.variantId, factoryModel: row.model, maxUserWeightKg: lbToKg(400), seatWidthMm: 480, seatDepthMm: 480, cushionWidthMm: 460, cushionDepthMm: 480, seatHeightMm: 500, armrestSpacingMm: 480, seatToFootrestMm: 350, overallMm: row.overall, foldedMm: row.folded, netWeightWithoutBatteryKg: row.netKg, batteryWeightKg: 3.52, rangeKm: milesToKm(30), turningRadiusMm: 1200, obstacleHeightMm: 40, maxSpeedKph: 6, frontWheelMm: 200, rearWheelMm: 315, tireClass: "mixed-pneumatic", battery: { removable: true, chemistry: "lithium", voltageV: 24, capacityAh: 25, manufacturerAirplaneFlag: false }, source: { workbookColumns: row.column, raw: { loadCapacity: "400 lb", seat: "480 D x 480 W mm", battery: "24 V x 25 Ah", range: "30 mile" }, status: {}, notes: [] } })),
  },
  {
    productId: "5", storefrontName: "Power Max 16", officialFamily: "XSW001-B (A16)",
    variants: [
      { variantId: "PA16H100", column: "E", cushion: [500, 450], batteryKg: 2.2, capacityAh: 20, rangeMi: 25 },
      { variantId: "PA16L100", column: "F", cushion: [485, 445], batteryKg: 3.6, capacityAh: 25, rangeMi: 30 },
      { variantId: "PA16K100", column: "G", cushion: [420, 450], batteryKg: 3.6, capacityAh: 25, rangeMi: 30 },
    ].map((row) => variant({ ...pa16Base, variantId: row.variantId, cushionWidthMm: row.cushion[0], cushionDepthMm: row.cushion[1], batteryWeightKg: row.batteryKg, rangeKm: milesToKm(row.rangeMi), battery: { removable: true, chemistry: "lithium", voltageV: 24, capacityAh: row.capacityAh, manufacturerAirplaneFlag: false }, source: { workbookColumns: row.column, raw: { loadCapacity: "400 lb", seat: "470 D x 500 W mm", cushion: `${row.cushion[1]} D x ${row.cushion[0]} W mm`, range: `${row.rangeMi} mile`, turningRadiusMetric: "1200 mm", turningRadiusImperial: "42.2 in" }, status: row.variantId === "PA16K100" ? { cushionWidthMm: "conflicting" } : {}, notes: row.variantId === "PA16K100" ? ["The cushion width differs materially from the listed 500 mm seat width; show a caution but use the verified seat and armrest dimensions for the hard width rule."] : [] } })),
  },
  {
    productId: "6", storefrontName: "Spacious Pro 15", officialFamily: "XSW003-D / PA15",
    variants: ["PA15F100", "PA15B100"].map((variantId, index) => variant({ variantId, factoryModel: "XSW003-D", maxUserWeightKg: lbToKg(350), seatWidthMm: 550, seatDepthMm: 470, cushionWidthMm: 460, cushionDepthMm: 430, seatHeightMm: 470, armrestSpacingMm: 550, seatToFootrestMm: 350, overallMm: dims(1010, 650, 920), foldedMm: dims(730, 360, 750), netWeightWithoutBatteryKg: 22, batteryWeightKg: 8, rangeKm: milesToKm(15), turningRadiusMm: 1200, obstacleHeightMm: 40, maxSpeedKph: 6, frontWheelMm: 190, rearWheelMm: 280, tireClass: "foam", battery: { removable: true, chemistry: "lead-acid", voltageV: null, capacityAh: 12, manufacturerAirplaneFlag: false }, source: { workbookColumns: index === 0 ? "V" : "W", raw: { seat: "470 D x 550 W mm", cushion: "430 D x 460 W mm", folded: "730 x 360 x 750 mm", range: "15 mile", foldedWidthMetric: "360 mm", foldedWidthImperial: "154.6 in" }, status: { cushionWidthMm: "conflicting" }, notes: ["The workbook imperial folded-width text is invalid; 360 mm is authoritative.", "The listed cushion is narrower than the seat and armrest spacing; show this as a fit warning."] } })),
  },
  {
    productId: "7", storefrontName: "Basic 13", officialFamily: "JL100W-01A / PA13",
    variants: ["PA13A100", "PA13L100", "PA13N100"].map((variantId, index) => variant({ variantId, factoryModel: "JL100W-01A", maxUserWeightKg: lbToKg(330), seatWidthMm: 480, seatDepthMm: 440, cushionWidthMm: 440, cushionDepthMm: 450, seatHeightMm: 500, armrestSpacingMm: 480, seatToFootrestMm: 380, overallMm: dims(1000, 640, 860), foldedMm: dims(790, 410, 715), netWeightWithoutBatteryKg: 29, batteryWeightKg: null, rangeKm: milesToKm(15), turningRadiusMm: 1200, obstacleHeightMm: 40, maxSpeedKph: 6, frontWheelMm: 180, rearWheelMm: 300, tireClass: "solid", battery: { removable: false, chemistry: "lead-acid", voltageV: null, capacityAh: 12, manufacturerAirplaneFlag: false }, source: { workbookColumns: ["S", "T", "U"][index], raw: { netWeight: "29 kg excluding battery", seat: "440 D x 480 W mm", cushion: "450 D x 440 W mm", batteryWeight: "/", seatToFootrestMetric: "380 mm", seatToFootrestImperial: "18.9 in" }, status: { batteryWeightKg: "missing" }, notes: ["The workbook's 18.9 in pedal-to-seat text conflicts with 380 mm; derive 15.0 in from 380 mm."] } })),
  },
];

export const OFFICIAL_WHEELCHAIR_SPECS = deepFreeze(mutableWheelchairSpecs);

export function getWheelchairSpec(productId: string) {
  const product = OFFICIAL_WHEELCHAIR_SPECS.find((item) => item.productId === productId);
  if (!product) throw new Error(`Unknown wheelchair product: ${productId}`);
  return product;
}
