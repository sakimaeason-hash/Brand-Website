import { describe, expect, it } from "vitest";
import { etInputToUtc, utcToEtInput, isWithinPromotionWindow } from "./timezone";

describe("promotion timezone", () => {
  it("round trips Eastern Time in winter and summer", () => {
    expect(etInputToUtc("2026-01-15T12:00").toISOString()).toBe("2026-01-15T17:00:00.000Z");
    const summer = etInputToUtc("2026-07-01T12:00");
    expect(summer.toISOString()).toBe("2026-07-01T16:00:00.000Z");
    expect(utcToEtInput(summer)).toBe("2026-07-01T12:00");
  });

  it("uses an exclusive end boundary", () => {
    const start = new Date("2026-07-01T16:00:00.000Z");
    const end = new Date("2026-07-01T20:00:00.000Z");
    expect(isWithinPromotionWindow(new Date("2026-07-01T19:59:59.999Z"), start, end)).toBe(true);
    expect(isWithinPromotionWindow(end, start, end)).toBe(false);
  });

  it("rejects nonexistent spring-forward times instead of silently shifting them", () => {
    expect(() => etInputToUtc("2026-03-08T02:30")).toThrow("does not exist");
  });

  it("uses the earlier occurrence of an ambiguous fall-back time", () => {
    expect(etInputToUtc("2026-11-01T01:30").toISOString()).toBe("2026-11-01T05:30:00.000Z");
  });
});
