import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(join(process.cwd(), "src/app/wheelchair-finder/page.tsx"), "utf8");
const resultsSource = readFileSync(join(process.cwd(), "src/components/wheelchair/FinderResults.tsx"), "utf8");
const clientSource = readFileSync(
  join(process.cwd(), "src/components/wheelchair/WheelchairFinderClient.tsx"),
  "utf8",
);
const source = `${pageSource}\n${clientSource}\n${resultsSource}`;

describe("wheelchair finder review interactions", () => {
  it("loads dynamic candidates in a Server Component and delegates interaction", () => {
    expect(pageSource).not.toMatch(/^"use client"/);
    expect(pageSource).toMatch(/listFinderCandidates/);
    expect(pageSource).toMatch(/WheelchairFinderClient/);
    expect(pageSource).toMatch(/catalogError/);
  });

  it("does not read the legacy static product or specification catalogs", () => {
    expect(source).not.toMatch(/@\/data\/products/);
    expect(source).not.toMatch(/@\/data\/wheelchair-specs/);
  });

  it("renders product identity and Amazon links from dynamic candidates", () => {
    expect(resultsSource).toMatch(/productName/);
    expect(resultsSource).toMatch(/productUrl/);
    expect(resultsSource).toMatch(/mobilityType/);
  });

  it("renders detail and comparison controls with official variant data", () => {
    expect(source).toMatch(/View details/);
    expect(source).toMatch(/Add to compare/);
    expect(source).toMatch(/Official (variant|SKU)/);
    expect(source).toMatch(/variantId/);
  });

  it("caps comparison selections at three and supports printing", () => {
    expect(source).toMatch(/current\.length < 3/);
    expect(source).toMatch(/window\.print\(\)/);
    expect(source).toMatch(/role=\"table\"/);
  });

  it("supports direct keyboard entry with draft text and blur commits", () => {
    expect(source).toMatch(/inputMode:\s*\"decimal\"/);
    expect(source).toMatch(/inputDrafts/);
    expect(source).toMatch(/onBlur=/);
    expect(source).toMatch(/Object\.prototype\.hasOwnProperty/);
    expect(source).not.toMatch(/type=\"number\"/);
  });
});
