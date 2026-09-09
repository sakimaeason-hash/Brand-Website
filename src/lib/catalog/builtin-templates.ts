import {
  MANUAL_REQUIRED_SEMANTICS,
  POWERED_REQUIRED_SEMANTICS,
  SEMANTIC_FIELDS,
  type SemanticFieldKey,
} from "./semantic-fields";
import type { SpecificationFieldDefinition } from "./types";

export type BuiltinCategoryRole = "PRODUCT" | "ACCESSORY";
export type BuiltinRecommendationProfile =
  | "NONE"
  | "POWERED_WHEELCHAIR"
  | "MANUAL_WHEELCHAIR";

export type BuiltinCategoryTemplate = {
  slug: string;
  name: string;
  description: string;
  role: BuiltinCategoryRole;
  recommendationProfile: BuiltinRecommendationProfile;
  sortOrder: number;
  fields: readonly SpecificationFieldDefinition[];
};

function semanticField(
  semanticKey: SemanticFieldKey,
  overrides: Partial<SpecificationFieldDefinition> & Pick<SpecificationFieldDefinition, "label" | "group">,
): SpecificationFieldDefinition {
  const semantic = SEMANTIC_FIELDS[semanticKey];
  const { label, group, ...rest } = overrides;
  return {
    key: semanticKey,
    label,
    group,
    scope: "VARIANT",
    dataType: semantic.dataType,
    unitFamily: semantic.unitFamily,
    defaultDisplayUnit: semantic.canonicalUnit,
    options: [],
    helpText: null,
    minValue: null,
    maxValue: null,
    requiredForPublish: false,
    requiredForRecommendation: false,
    semanticKey,
    isProtected: true,
    status: "ACTIVE",
    sortOrder: rest.sortOrder ?? 0,
    ...rest,
  };
}

function requiredSet(
  required: readonly { semanticKey: SemanticFieldKey; role: string }[],
): ReadonlySet<SemanticFieldKey> {
  return new Set(required.map((item) => item.semanticKey));
}

function markRecommendationFields(
  fields: readonly SpecificationFieldDefinition[],
  required: readonly { semanticKey: SemanticFieldKey; role: string }[],
): SpecificationFieldDefinition[] {
  const requiredKeys = requiredSet(required);
  return fields.map((field) => ({
    ...field,
    requiredForRecommendation: field.semanticKey ? requiredKeys.has(field.semanticKey as SemanticFieldKey) : false,
  }));
}

const poweredFields = markRecommendationFields(
  [
    semanticField("maxUserWeight", { label: "Maximum user weight", group: "Fit & seating", minValue: 1, sortOrder: 10 }),
    semanticField("effectiveSeatWidth", { label: "Effective seat width", group: "Fit & seating", minValue: 1, sortOrder: 20 }),
    semanticField("seatDepth", { label: "Seat depth", group: "Fit & seating", minValue: 1, sortOrder: 30 }),
    semanticField("cushionWidth", { label: "Cushion width", group: "Fit & seating", minValue: 1, sortOrder: 35 }),
    semanticField("cushionDepth", { label: "Cushion depth", group: "Fit & seating", minValue: 1, sortOrder: 36 }),
    semanticField("seatHeight", { label: "Seat height", group: "Fit & seating", minValue: 1, sortOrder: 40 }),
    semanticField("armrestSpacing", { label: "Inside armrest spacing", group: "Fit & seating", minValue: 1, sortOrder: 45 }),
    semanticField("seatToFootrest", { label: "Seat-to-footrest vertical distance", group: "Fit & seating", minValue: 1, sortOrder: 50 }),
    semanticField("overallDimensions", { label: "Overall dimensions", group: "Dimensions & transport", minValue: 1, sortOrder: 60 }),
    semanticField("foldedDimensions", { label: "Folded dimensions", group: "Dimensions & transport", minValue: 1, sortOrder: 70 }),
    semanticField("netWeightWithoutBattery", { label: "Net weight without battery", group: "Dimensions & transport", minValue: 0, sortOrder: 80 }),
    semanticField("batteryWeight", { label: "Battery weight", group: "Battery", minValue: 0, sortOrder: 90 }),
    semanticField("turningRadius", { label: "Turning radius", group: "Dimensions & transport", minValue: 0, sortOrder: 100 }),
    semanticField("range", { label: "Range", group: "Performance", minValue: 0, sortOrder: 110 }),
    semanticField("maxSpeed", { label: "Top speed", group: "Performance", minValue: 0, sortOrder: 120 }),
    semanticField("obstacleHeight", { label: "Obstacle height", group: "Performance", minValue: 0, sortOrder: 130 }),
    semanticField("frontWheelDiameter", { label: "Front wheel diameter", group: "Wheels", minValue: 0, sortOrder: 140 }),
    semanticField("rearWheelDiameter", { label: "Rear wheel diameter", group: "Wheels", minValue: 0, sortOrder: 150 }),
    semanticField("tireClass", { label: "Tire type", group: "Wheels", dataType: "SELECT", unitFamily: "NONE", defaultDisplayUnit: null, options: ["pneumatic", "solid", "foam-filled"], sortOrder: 160 }),
    semanticField("motorPower", { label: "Motor power", group: "Performance", minValue: 0, sortOrder: 170 }),
    semanticField("propulsionType", { label: "Propulsion type", group: "Performance", dataType: "SELECT", unitFamily: "NONE", defaultDisplayUnit: null, options: ["rear-wheel", "mid-wheel", "front-wheel", "dual-motor"], sortOrder: 180 }),
    semanticField("batteryChemistry", { label: "Battery chemistry", group: "Battery", dataType: "SELECT", unitFamily: "NONE", defaultDisplayUnit: null, options: ["lithium", "lead-acid"], sortOrder: 185 }),
    semanticField("batteryRemovable", { label: "Battery removable", group: "Battery", dataType: "BOOLEAN", unitFamily: "NONE", defaultDisplayUnit: null, sortOrder: 190 }),
    semanticField("batteryVoltage", { label: "Battery voltage", group: "Battery", minValue: 0, sortOrder: 200 }),
    semanticField("batteryCapacityAh", { label: "Battery capacity", group: "Battery", minValue: 0, sortOrder: 210 }),
    semanticField("manufacturerAirplaneFlag", { label: "Manufacturer airplane flag", group: "Battery", dataType: "BOOLEAN", unitFamily: "NONE", defaultDisplayUnit: null, sortOrder: 220 }),
  ],
  POWERED_REQUIRED_SEMANTICS,
);

const manualFields = markRecommendationFields(
  [
    semanticField("maxUserWeight", { label: "Maximum user weight", group: "Fit & seating", minValue: 1, sortOrder: 10 }),
    semanticField("effectiveSeatWidth", { label: "Effective seat width", group: "Fit & seating", minValue: 1, sortOrder: 20 }),
    semanticField("seatDepth", { label: "Seat depth", group: "Fit & seating", minValue: 1, sortOrder: 30 }),
    semanticField("seatHeight", { label: "Seat height", group: "Fit & seating", minValue: 1, sortOrder: 40 }),
    semanticField("seatToFootrest", { label: "Seat-to-footrest vertical distance", group: "Fit & seating", minValue: 1, sortOrder: 50 }),
    semanticField("overallDimensions", { label: "Overall dimensions", group: "Dimensions & transport", minValue: 1, sortOrder: 60 }),
    semanticField("foldedDimensions", { label: "Folded dimensions", group: "Dimensions & transport", minValue: 1, sortOrder: 70 }),
    semanticField("productWeight", { label: "Product weight", group: "Dimensions & transport", minValue: 0, sortOrder: 80 }),
    semanticField("propulsionType", { label: "Propulsion type", group: "Mobility configuration", dataType: "SELECT", unitFamily: "NONE", defaultDisplayUnit: null, options: ["self-propelled", "transport", "attendant-propelled"], sortOrder: 90 }),
    semanticField("frontWheelDiameter", { label: "Front wheel diameter", group: "Mobility configuration", minValue: 0, sortOrder: 100 }),
    semanticField("rearWheelDiameter", { label: "Rear wheel diameter", group: "Mobility configuration", minValue: 0, sortOrder: 110 }),
    semanticField("tireClass", { label: "Tire type", group: "Mobility configuration", dataType: "SELECT", unitFamily: "NONE", defaultDisplayUnit: null, options: ["pneumatic", "solid", "foam-filled"], sortOrder: 120 }),
  ],
  MANUAL_REQUIRED_SEMANTICS,
);

function plainField(
  key: string,
  label: string,
  group: string,
  overrides: Partial<SpecificationFieldDefinition> = {},
): SpecificationFieldDefinition {
  return {
    key,
    label,
    group,
    scope: "PRODUCT",
    dataType: "TEXT",
    unitFamily: "NONE",
    defaultDisplayUnit: null,
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

export const BUILTIN_CATEGORIES: readonly BuiltinCategoryTemplate[] = Object.freeze([
  {
    slug: "powered-wheelchairs",
    name: "Powered Wheelchairs",
    description: "Electric wheelchair products with fit and performance specifications.",
    role: "PRODUCT",
    recommendationProfile: "POWERED_WHEELCHAIR",
    sortOrder: 10,
    fields: poweredFields,
  },
  {
    slug: "manual-wheelchairs",
    name: "Manual Wheelchairs",
    description: "Manual wheelchair products with fit and mobility specifications.",
    role: "PRODUCT",
    recommendationProfile: "MANUAL_WHEELCHAIR",
    sortOrder: 20,
    fields: manualFields,
  },
  {
    slug: "mobility-scooters",
    name: "Mobility Scooters",
    description: "Mobility scooters and travel scooters.",
    role: "PRODUCT",
    recommendationProfile: "NONE",
    sortOrder: 30,
    fields: [
      plainField("seatWidth", "Seat width", "Fit & seating", { scope: "VARIANT", dataType: "NUMBER", unitFamily: "LENGTH", defaultDisplayUnit: "in" }),
      plainField("seatDepth", "Seat depth", "Fit & seating", { scope: "VARIANT", dataType: "NUMBER", unitFamily: "LENGTH", defaultDisplayUnit: "in" }),
      plainField("range", "Range", "Performance", { scope: "VARIANT", dataType: "NUMBER", unitFamily: "DISTANCE", defaultDisplayUnit: "mi" }),
    ],
  },
  {
    slug: "shower-chairs",
    name: "Shower Chairs",
    description: "Shower and bath seating products.",
    role: "PRODUCT",
    recommendationProfile: "NONE",
    sortOrder: 40,
    fields: [
      plainField("maxUserWeight", "Maximum user weight", "Fit & safety", { scope: "VARIANT", dataType: "NUMBER", unitFamily: "WEIGHT", defaultDisplayUnit: "lb" }),
      plainField("seatWidth", "Seat width", "Fit & seating", { dataType: "NUMBER", unitFamily: "LENGTH", defaultDisplayUnit: "in" }),
      plainField("seatDepth", "Seat depth", "Fit & seating", { dataType: "NUMBER", unitFamily: "LENGTH", defaultDisplayUnit: "in" }),
      plainField("overallDimensions", "Overall dimensions", "Dimensions", { dataType: "DIMENSIONS", unitFamily: "LENGTH", defaultDisplayUnit: "in" }),
      plainField("adjustableHeight", "Adjustable height", "Fit & seating"),
      plainField("material", "Material", "Construction"),
      plainField("nonSlipFeet", "Non-slip feet", "Safety", { dataType: "BOOLEAN" }),
      plainField("armrests", "Armrests", "Configuration", { dataType: "BOOLEAN" }),
      plainField("backrest", "Backrest", "Configuration", { dataType: "BOOLEAN" }),
      plainField("commodeCompatible", "Commode compatible", "Configuration", { dataType: "BOOLEAN" }),
    ],
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Independently purchasable compatible accessories.",
    role: "ACCESSORY",
    recommendationProfile: "NONE",
    sortOrder: 50,
    fields: [],
  },
]);

export function getBuiltinCategory(slug: string): BuiltinCategoryTemplate | undefined {
  return BUILTIN_CATEGORIES.find((category) => category.slug === slug);
}
