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

export interface DimensionsMm {
  readonly length: number;
  readonly width: number;
  readonly height: number;
}

export interface SourceRecord {
  readonly workbookColumns: string;
  readonly raw: Readonly<Record<string, string>>;
  readonly status: Readonly<Partial<Record<string, VerificationStatus>>>;
  readonly notes: readonly string[];
}

export interface WheelchairVariantSpec {
  readonly variantId: string;
  readonly factoryModel: string;
  readonly maxUserWeightKg: number;
  readonly seatWidthMm: number;
  readonly seatDepthMm: number;
  readonly cushionWidthMm: number | null;
  readonly cushionDepthMm: number | null;
  readonly seatHeightMm: number;
  readonly armrestSpacingMm: number;
  readonly seatToFootrestMm: number;
  readonly overallMm: DimensionsMm;
  readonly foldedMm: DimensionsMm;
  readonly netWeightWithoutBatteryKg: number;
  readonly batteryWeightKg: number | null;
  readonly rangeKm: number;
  readonly turningRadiusMm: number;
  readonly obstacleHeightMm: number;
  readonly maxSpeedKph: number;
  readonly frontWheelMm: number;
  readonly rearWheelMm: number;
  readonly tireClass: "solid" | "foam" | "mixed-pneumatic";
  readonly battery: {
    readonly removable: boolean;
    readonly chemistry: "lithium" | "lead-acid";
    readonly voltageV: number | null;
    readonly capacityAh: number;
    readonly manufacturerAirplaneFlag: boolean;
  };
  readonly source: SourceRecord;
}

export interface WheelchairProductSpec {
  readonly productId: string;
  readonly storefrontName: string;
  readonly officialFamily: string;
  readonly variants: readonly WheelchairVariantSpec[];
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
