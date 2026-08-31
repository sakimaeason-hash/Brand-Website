import { describe, expect, it } from "vitest";
import {
  FDA_VERIFICATION_STATUS,
  TRANSPORT_PRODUCT_ROWS,
  TRANSPORT_SOURCES,
  VEHICLE_METHODS,
} from "./outdoor-transportation";

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

  it("keeps FDA verification explicitly unresolved", () => {
    expect(FDA_VERIFICATION_STATUS).toBe("not_verified");
    expect(TRANSPORT_PRODUCT_ROWS.every((row) => row.fdaStatus === "not_verified")).toBe(true);
  });

  it("contains one sourced row for every official wheelchair product", () => {
    expect(TRANSPORT_PRODUCT_ROWS.map((row) => row.productId)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(TRANSPORT_PRODUCT_ROWS.every((row) => row.sources.includes("manufacturer"))).toBe(true);
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
