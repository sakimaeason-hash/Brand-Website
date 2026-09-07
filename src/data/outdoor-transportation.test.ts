import { describe, expect, it } from "vitest";
import {
  FDA_VERIFICATION_STATUS,
  TRANSPORT_PRODUCT_ROWS,
  TRANSPORT_SOURCES,
  VEHICLE_METHODS,
} from "./outdoor-transportation";
import { OFFICIAL_WHEELCHAIR_SPECS } from "./wheelchair-specs";
import { kgToLb, mmToInches } from "@/lib/wheelchair/units";

const oneDecimal = (value: number) => Number(value.toFixed(1));

describe("outdoor transportation guide data", () => {
  it("keeps vehicle methods in the documented stable order", () => {
    expect(VEHICLE_METHODS.map((method) => method.id)).toEqual([
      "sedan",
      "suv-crossover",
      "accessible-van",
    ]);
    expect(VEHICLE_METHODS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: expect.any(String), bestFor: expect.any(String), caution: expect.any(String) }),
      ]),
    );
  });

  it("deep-freezes shared source and vehicle data", () => {
    expect(Object.isFrozen(TRANSPORT_SOURCES)).toBe(true);
    expect(Object.isFrozen(TRANSPORT_SOURCES[0])).toBe(true);
    expect(Object.isFrozen(VEHICLE_METHODS)).toBe(true);
    expect(Object.isFrozen(VEHICLE_METHODS[0])).toBe(true);
  });

  it("keeps FDA verification explicitly unresolved", () => {
    expect(FDA_VERIFICATION_STATUS).toBe("not_verified");
    expect(TRANSPORT_PRODUCT_ROWS.every((row) => row.fdaStatus === "not_verified")).toBe(true);
  });

  it("contains one sourced row for every official wheelchair product", () => {
    expect(TRANSPORT_PRODUCT_ROWS.map((row) => row.productId)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(TRANSPORT_PRODUCT_ROWS.every((row) => row.sources.includes("manufacturer"))).toBe(true);
  });

  it("derives each displayed transport measurement from the official first variant", () => {
    for (const product of OFFICIAL_WHEELCHAIR_SPECS) {
      const row = TRANSPORT_PRODUCT_ROWS.find((item) => item.productId === product.productId);
      const spec = product.variants[0];

      expect(row).toBeDefined();
      expect(row).toMatchObject({
        productId: product.productId,
        name: product.storefrontName,
        netWeightLb: oneDecimal(kgToLb(spec.netWeightWithoutBatteryKg)),
        seatWidthIn: oneDecimal(mmToInches(spec.seatWidthMm)),
        removableBattery: spec.battery.removable,
      });
      expect(row?.foldedIn).toEqual({
        length: oneDecimal(mmToInches(spec.foldedMm.length)),
        width: oneDecimal(mmToInches(spec.foldedMm.width)),
        height: oneDecimal(mmToInches(spec.foldedMm.height)),
      });
    }
  });

  it("does not expose FDA approval or clearance claims", () => {
    expect(JSON.stringify({ sources: TRANSPORT_SOURCES, products: TRANSPORT_PRODUCT_ROWS })).not.toMatch(
      /FDA\s+(approved|cleared)/i,
    );
  });

  it("keeps source kinds ordered and links valid", () => {
    expect(TRANSPORT_SOURCES.map((source) => source.kind)).toEqual([
      "fda",
      "nhtsa",
      "standard",
      "manufacturer",
    ]);
    expect(TRANSPORT_SOURCES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "fda", href: "https://www.fda.gov/medical-devices/medical-device-databases" }),
        expect.objectContaining({ kind: "nhtsa", href: "https://www.nhtsa.gov/vehicle-safety" }),
        expect.objectContaining({ kind: "standard", href: "https://www.resna.org/standards" }),
        expect.objectContaining({ kind: "manufacturer", href: "/products" }),
      ]),
    );
    expect(TRANSPORT_SOURCES.every((source) => source.href.startsWith("https://") || source.href.startsWith("/"))).toBe(true);
  });
});
