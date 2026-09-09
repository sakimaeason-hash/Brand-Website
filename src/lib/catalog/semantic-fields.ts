import type { SpecificationDataType, UnitFamily } from "./types";

type SemanticField = {
  dataType: SpecificationDataType;
  unitFamily: UnitFamily;
  canonicalUnit: string | null;
};

export const SEMANTIC_FIELDS = {
  maxUserWeight: { dataType: "NUMBER", unitFamily: "WEIGHT", canonicalUnit: "kg" },
  effectiveSeatWidth: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  seatDepth: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  cushionWidth: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  cushionDepth: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  seatHeight: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  armrestSpacing: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  seatToFootrest: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  overallDimensions: { dataType: "DIMENSIONS", unitFamily: "LENGTH", canonicalUnit: "mm" },
  foldedDimensions: { dataType: "DIMENSIONS", unitFamily: "LENGTH", canonicalUnit: "mm" },
  netWeightWithoutBattery: { dataType: "NUMBER", unitFamily: "WEIGHT", canonicalUnit: "kg" },
  productWeight: { dataType: "NUMBER", unitFamily: "WEIGHT", canonicalUnit: "kg" },
  batteryWeight: { dataType: "NUMBER", unitFamily: "WEIGHT", canonicalUnit: "kg" },
  range: { dataType: "NUMBER", unitFamily: "DISTANCE", canonicalUnit: "km" },
  maxSpeed: { dataType: "NUMBER", unitFamily: "SPEED", canonicalUnit: "km/h" },
  turningRadius: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  obstacleHeight: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  frontWheelDiameter: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  rearWheelDiameter: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  motorPower: { dataType: "NUMBER", unitFamily: "POWER", canonicalUnit: "W" },
  tireClass: { dataType: "SELECT", unitFamily: "NONE", canonicalUnit: null },
  propulsionType: { dataType: "SELECT", unitFamily: "NONE", canonicalUnit: null },
  batteryRemovable: { dataType: "BOOLEAN", unitFamily: "NONE", canonicalUnit: null },
  batteryChemistry: { dataType: "SELECT", unitFamily: "NONE", canonicalUnit: null },
  batteryVoltage: { dataType: "NUMBER", unitFamily: "VOLTAGE", canonicalUnit: "V" },
  batteryCapacityAh: { dataType: "NUMBER", unitFamily: "CAPACITY_AH", canonicalUnit: "Ah" },
  manufacturerAirplaneFlag: { dataType: "BOOLEAN", unitFamily: "NONE", canonicalUnit: null },
} as const satisfies Record<string, SemanticField>;

export type SemanticFieldKey = keyof typeof SEMANTIC_FIELDS;

export type RequiredSemantic = {
  semanticKey: SemanticFieldKey;
  role: "hardFilter" | "exactFit" | "ranking";
};

export const POWERED_REQUIRED_SEMANTICS = [
  { semanticKey: "maxUserWeight", role: "hardFilter" },
  { semanticKey: "effectiveSeatWidth", role: "hardFilter" },
  { semanticKey: "seatDepth", role: "exactFit" },
  { semanticKey: "seatHeight", role: "exactFit" },
  { semanticKey: "seatToFootrest", role: "exactFit" },
  { semanticKey: "overallDimensions", role: "ranking" },
  { semanticKey: "foldedDimensions", role: "ranking" },
  { semanticKey: "netWeightWithoutBattery", role: "ranking" },
  { semanticKey: "range", role: "ranking" },
  { semanticKey: "turningRadius", role: "ranking" },
  { semanticKey: "obstacleHeight", role: "ranking" },
  { semanticKey: "rearWheelDiameter", role: "ranking" },
  { semanticKey: "tireClass", role: "ranking" },
] as const satisfies readonly RequiredSemantic[];

export const MANUAL_REQUIRED_SEMANTICS = [
  { semanticKey: "maxUserWeight", role: "hardFilter" },
  { semanticKey: "effectiveSeatWidth", role: "hardFilter" },
  { semanticKey: "seatDepth", role: "exactFit" },
  { semanticKey: "seatHeight", role: "exactFit" },
  { semanticKey: "seatToFootrest", role: "exactFit" },
  { semanticKey: "overallDimensions", role: "ranking" },
  { semanticKey: "foldedDimensions", role: "ranking" },
  { semanticKey: "productWeight", role: "ranking" },
  { semanticKey: "propulsionType", role: "ranking" },
  { semanticKey: "frontWheelDiameter", role: "ranking" },
  { semanticKey: "rearWheelDiameter", role: "ranking" },
  { semanticKey: "tireClass", role: "ranking" },
] as const satisfies readonly RequiredSemantic[];
