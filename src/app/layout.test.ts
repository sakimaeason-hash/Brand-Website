import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  join(process.cwd(), "src/app/layout.tsx"),
  "utf8",
);

describe("root layout analytics", () => {
  it("loads Vercel Analytics for every page", () => {
    expect(source).toMatch(
      /import \{ Analytics \} from ["']@vercel\/analytics\/next["']/,
    );
    expect(source).toMatch(/<Analytics \/>/);
  });
});
