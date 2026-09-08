export type SpecificationStatus = "PROVIDED" | "NOT_PROVIDED" | "CONFLICTING";

export type RecommendationProfile =
  | "NONE"
  | "POWERED_WHEELCHAIR"
  | "MANUAL_WHEELCHAIR";

export type SpecificationScope = "PRODUCT" | "VARIANT";

export type SpecificationDataType =
  | "TEXT"
  | "NUMBER"
  | "BOOLEAN"
  | "SELECT"
  | "DIMENSIONS";

export type UnitFamily =
  | "NONE"
  | "LENGTH"
  | "WEIGHT"
  | "DISTANCE"
  | "SPEED"
  | "POWER"
  | "VOLTAGE"
  | "CAPACITY_AH"
  | "ENERGY_WH"
  | "ANGLE";

export type DimensionsValue = {
  length: number;
  width: number;
  height: number;
};

export type SpecificationInput = {
  status: SpecificationStatus;
  value: string | number | boolean | DimensionsValue | null;
  unit?: string | null;
  sourceNote?: string | null;
};

export type StoredSpecification = SpecificationInput & {
  inputValue?: number | DimensionsValue;
  inputUnit?: string;
  normalizedValue?: number | DimensionsValue;
  normalizedUnit?: string;
};

export type SpecificationMap = Record<string, StoredSpecification>;

export type SpecificationFieldDefinition = {
  key: string;
  label: string;
  group: string;
  scope: SpecificationScope;
  dataType: SpecificationDataType;
  unitFamily: UnitFamily;
  defaultDisplayUnit: string | null;
  options: readonly string[];
  helpText: string | null;
  minValue: number | null;
  maxValue: number | null;
  requiredForPublish: boolean;
  requiredForRecommendation: boolean;
  semanticKey: string | null;
  isProtected: boolean;
  status: "ACTIVE" | "ARCHIVED";
  sortOrder: number;
};

export type FieldError = {
  tab: "overview" | "specifications" | "variants" | "accessories" | "media";
  fieldKey: string;
  variantId?: string;
  message: string;
};
