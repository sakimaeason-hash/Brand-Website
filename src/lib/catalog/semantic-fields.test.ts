import { describe, expect, it } from "vitest";
import {
  MANUAL_REQUIRED_SEMANTICS,
  POWERED_REQUIRED_SEMANTICS,
  SEMANTIC_FIELDS,
} from "./semantic-fields";

describe("catalog semantic fields", () => {
  it("registers powered performance semantics with canonical units", () => {
    expect(SEMANTIC_FIELDS.maxSpeed).toEqual({
      dataType: "NUMBER",
      unitFamily: "SPEED",
      canonicalUnit: "km/h",
    });
    expect(SEMANTIC_FIELDS.motorPower).toEqual({
      dataType: "NUMBER",
      unitFamily: "POWER",
      canonicalUnit: "W",
    });
  });

  it("requires powered speed and motor power for ranking", () => {
    expect(POWERED_REQUIRED_SEMANTICS).toContainEqual({
      semanticKey: "maxSpeed",
      role: "ranking",
    });
    expect(POWERED_REQUIRED_SEMANTICS).toContainEqual({
      semanticKey: "motorPower",
      role: "ranking",
    });
  });

  it("uses overall dimensions to carry manual vehicle width", () => {
    expect(MANUAL_REQUIRED_SEMANTICS).not.toContainEqual(
      expect.objectContaining({ semanticKey: "overallWidth" }),
    );
    expect(MANUAL_REQUIRED_SEMANTICS).toContainEqual({
      semanticKey: "overallDimensions",
      role: "ranking",
    });
  });
});
