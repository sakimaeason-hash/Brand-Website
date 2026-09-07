import { OFFICIAL_WHEELCHAIR_SPECS } from "./wheelchair-specs";
import { kgToLb, mmToInches } from "@/lib/wheelchair/units";

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

export type TransportSourceKind = "fda" | "nhtsa" | "standard" | "manufacturer";
export type FdaVerificationStatus = "not_verified" | "verified";

export const FDA_VERIFICATION_STATUS: FdaVerificationStatus = "not_verified";

export interface TransportSource {
  readonly kind: TransportSourceKind;
  readonly label: string;
  readonly href: string;
}

export const TRANSPORT_SOURCES: readonly TransportSource[] = deepFreeze([
  {
    kind: "fda",
    label: "FDA medical device databases",
    href: "https://www.fda.gov/medical-devices/medical-device-databases",
  },
  {
    kind: "nhtsa",
    label: "NHTSA vehicle safety",
    href: "https://www.nhtsa.gov/vehicle-safety",
  },
  {
    kind: "standard",
    label: "RESNA standards",
    href: "https://www.resna.org/standards",
  },
  { kind: "manufacturer", label: "Manufacturer product pages", href: "/products" },
]);

export interface VehicleMethod {
  readonly id: "sedan" | "suv-crossover" | "accessible-van";
  readonly title: string;
  readonly bestFor: string;
  readonly caution: string;
}

export const VEHICLE_METHODS: readonly VehicleMethod[] = deepFreeze([
  {
    id: "sedan",
    title: "Sedan trunk",
    bestFor: "Compact, folded wheelchairs with a light lift weight.",
    caution: "Measure the trunk opening and trunk depth, not only the advertised cargo volume.",
  },
  {
    id: "suv-crossover",
    title: "SUV or crossover cargo area",
    bestFor: "Folded wheelchairs that need a wider opening or more vertical clearance.",
    caution: "Check the lift-over height and keep the folded chair secured during travel.",
  },
  {
    id: "accessible-van",
    title: "Accessible van",
    bestFor: "Occupied transport, ramps, lifts, and heavier or wider wheelchairs.",
    caution: "Confirm ramp, lift, tie-down, and occupant-restraint compatibility with the vehicle provider.",
  },
]);

export interface TransportProductRow {
  readonly productId: string;
  readonly name: string;
  readonly netWeightLb: number;
  readonly foldedIn: Readonly<{ length: number; width: number; height: number }>;
  readonly seatWidthIn: number;
  readonly removableBattery: boolean;
  readonly fdaStatus: FdaVerificationStatus;
  readonly sources: readonly TransportSourceKind[];
}

const oneDecimal = (value: number) => Number(value.toFixed(1));

export const TRANSPORT_PRODUCT_ROWS: readonly TransportProductRow[] = deepFreeze(
  OFFICIAL_WHEELCHAIR_SPECS.map((product) => {
    const spec = product.variants[0];
    return {
      productId: product.productId,
      name: product.storefrontName,
      netWeightLb: oneDecimal(kgToLb(spec.netWeightWithoutBatteryKg)),
      foldedIn: {
        length: oneDecimal(mmToInches(spec.foldedMm.length)),
        width: oneDecimal(mmToInches(spec.foldedMm.width)),
        height: oneDecimal(mmToInches(spec.foldedMm.height)),
      },
      seatWidthIn: oneDecimal(mmToInches(spec.seatWidthMm)),
      removableBattery: spec.battery.removable,
      fdaStatus: FDA_VERIFICATION_STATUS,
      sources: ["manufacturer", "fda"] as const,
    };
  }),
);
