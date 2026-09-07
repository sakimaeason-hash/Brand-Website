import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "src/app/guides/page.tsx"), "utf8");

describe("guides overview navigation", () => {
  it("links the outdoor transportation guide with complete metadata", () => {
    expect(source).toMatch(/slug:\s*["']outdoor-transportation["']/);
    expect(source).toMatch(/title:\s*["']Outdoor Transportation["']/);
    expect(source).toMatch(/subtitle:\s*["']Wheelchair Travel & Loading["']/);
    expect(source).toMatch(/sections:\s*9/);
    expect(source).toMatch(/A photo-first guide to measuring your vehicle/);
  });
});
