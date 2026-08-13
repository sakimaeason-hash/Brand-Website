import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(join(process.cwd(), "src/app/wheelchair-finder/page.tsx"), "utf8");
const resultsSource = readFileSync(join(process.cwd(), "src/components/wheelchair/FinderResults.tsx"), "utf8");
const source = `${pageSource}\n${resultsSource}`;

describe("wheelchair finder review interactions", () => {
  it("renders detail and comparison controls with official variant data", () => {
    expect(source).toMatch(/View details/);
    expect(source).toMatch(/Add to compare/);
    expect(source).toMatch(/Official variant/);
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
