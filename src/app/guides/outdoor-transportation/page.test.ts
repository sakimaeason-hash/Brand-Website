import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(process.cwd(), "src/app/guides/outdoor-transportation/page.tsx"),
  "utf8",
);

describe("outdoor transportation guide page", () => {
  it("covers the three vehicle scenarios and the heavy-wheelchair path", () => {
    expect(source).toMatch(/Wheelchair Transportation Outdoors/);
    expect(source).toMatch(/Sedan/);
    expect(source).toMatch(/SUV \/ Crossover/);
    expect(source).toMatch(/Accessible van/);
    expect(source).toMatch(/Heavy Wheelchair/);
    expect(source).toMatch(/Final Drive Checklist/);
  });

  it("uses official product rows without a source-status column", () => {
    expect(source).toMatch(/TRANSPORT_PRODUCT_ROWS/);
    expect(source).not.toMatch(/Source status/);
    expect(source).not.toMatch(/FDA listing not verified/);
    expect(source).not.toMatch(/FDA approved|FDA cleared/);
  });

  it("does not render a sources and verification section", () => {
    expect(source).not.toMatch(/Sources and Verification/);
    expect(source).not.toMatch(/TRANSPORT_SOURCES/);
  });

  it("uses descriptive alt text for every guide image", () => {
    expect(source).toMatch(/alt=/);
    expect((source.match(/<GuideImage/g) ?? []).length).toBeGreaterThanOrEqual(6);
    expect((source.match(/alt=/g) ?? []).length).toBeGreaterThanOrEqual(6);
  });

  it("keeps safety claims bounded", () => {
    expect(source).toMatch(/does not replace professional|does not replace a professional/i);
    expect(source).toMatch(/ordinary cargo straps/i);
    expect(source).toMatch(/occupant restraints/i);
    expect(source).toMatch(/manufacturer.*spec/i);
  });

  it("supports the printable checklist interaction", () => {
    expect(source).toMatch(/window\.print\(\)/);
    expect(source).toMatch(/type="checkbox"/);
    expect(source).toMatch(/aria-label|label/);
  });
});
