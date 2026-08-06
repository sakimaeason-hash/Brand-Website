export const PRODUCT_DATA_VERSION = "2026-08-05";
export const RULES_VERSION = "1.0.0";

export type VerificationStatus = "verified" | "conflicting" | "missing";
export type UnitSystem = "us" | "metric";
export type AssessmentMode = "quick" | "precision";
export type BodyBuild = "slim" | "average" | "broad";
export type Environment = "indoor" | "outdoor" | "mixed";
export type Surface = "smooth" | "carpet" | "grass" | "gravel" | "uneven";
export type Priority = "fit" | "portability" | "range" | "rough-terrain" | "roominess";
export type Confidence = "preliminary" | "moderate" | "high";
export type MatchBand = "best" | "good" | "potential";
export type NoMatchKind = "professional" | "incomplete" | "hard" | "soft-conflict";

export interface DimensionsMm { length: number; width: number; height: number }

export interface SourceRecord {
  workbookColumns: string;
  raw: Record<string, string>;
  status: Partial<Record<string, VerificationStatus>>;
  notes: string[];
}

export interface WheelchairVariantSpec {
  variantId: string;
  factoryModel: string;
  maxUserWeightKg: number;
  seatWidthMm: number;
  seatDepthMm: number;
  cushionWidthMm: number | null;
  cushionDepthMm: number | null;
  seatHeightMm: number;
  armrestSpacingMm: number;
  seatToFootrestMm: number;
  overallMm: DimensionsMm;
  foldedMm: DimensionsMm;
  netWeightWithoutBatteryKg: number;
  batteryWeightKg: number | null;
  rangeKm: number;
  turningRadiusMm: number;
  obstacleHeightMm: number;
  maxSpeedKph: number;
  frontWheelMm: number;
  rearWheelMm: number;
  tireClass: "solid" | "foam" | "mixed-pneumatic";
  battery: {
    removable: boolean;
    chemistry: "lithium" | "lead-acid";
    voltageV: number | null;
    capacityAh: number;
    manufacturerAirplaneFlag: boolean;
  };
  source: SourceRecord;
}

export interface WheelchairProductSpec {
  productId: string;
  storefrontName: string;
  officialFamily: string;
  variants: WheelchairVariantSpec[];
}

export interface FinderAssessment {
  mode: AssessmentMode;
  unitSystem: UnitSystem;
  heightMm: number;
  weightKg: number;
  bodyBuild: BodyBuild;
  hipWidthMm?: number;
  bodySeatDepthMm?: number;
  lowerLegMm?: number;
  safety: {
    pressureInjuryConcern: boolean;
    posturalAsymmetry: boolean;
    customPositioningNeed: boolean;
  };
  use: {
    environment: Environment;
    surfaces: Surface[];
    tightSpaces: boolean;
    dailyRangeKm: number;
    airlineTravel: boolean;
    storageMm?: DimensionsMm;
    maxLiftKg?: number;
    priorities: Priority[];
  };
}

export type ExclusionCode =
  | "professional-assessment"
  | "over-capacity"
  | "seat-too-narrow"
  | "seat-too-deep"
  | "seat-too-shallow"
  | "footrest-mismatch"
  | "storage-too-small"
  | "lift-data-missing"
  | "too-heavy-to-lift"
  | "airline-not-verified"
  | "critical-data-missing";

export interface VariantEvaluation {
  productId: string;
  variantId: string;
  eligible: boolean;
  exclusions: ExclusionCode[];
  score: number;
  scoreParts: { fit: number; environment: number; transport: number; preferences: number };
  confidence: Confidence;
  reasons: string[];
  warnings: string[];
}

export interface Recommendation {
  productId: string;
  variantId: string;
  score: number;
  band: MatchBand;
  confidence: Confidence;
  reasons: string[];
  warnings: string[];
}
