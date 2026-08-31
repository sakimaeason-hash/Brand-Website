# Outdoor Transportation Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改写现有户外庭院指南的前提下，新增一篇照片优先的英文户外运输指南，覆盖轿车、SUV/跨界车、无障碍改装面包车和重型轮椅，并按 FDA 与美国运输安全规范分层标注数据来源。

**Architecture:** 新页面使用 App Router 静态客户端页面，沿用现有指南页的布局、目录、Badge、Button 和图片样式。运输文章的来源清单和产品展示行放在独立数据模块中，产品运输数字从 `OFFICIAL_WHEELCHAIR_SPECS` 派生，FDA 核验状态单独建模为 `not_verified`，避免把制造商规格误写成 FDA 许可。指南总览只增加一个导航卡片，不改现有四篇页面。

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript, Tailwind CSS, Vitest, `next/image`, `src/lib/wheelchair/units.ts`。

---

### Task 1: 建立运输指南来源与产品数据边界

**Files:**
- Create: `src/data/outdoor-transportation.ts`
- Test: `src/data/outdoor-transportation.test.ts`
- Reference: `src/data/wheelchair-specs.ts`, `src/data/products.ts`, `src/lib/wheelchair/units.ts`

- [ ] **Step 1: Write the failing data contract test**

Create `src/data/outdoor-transportation.test.ts` with tests that define the public contract before implementation:

```ts
import { describe, expect, it } from "vitest";
import {
  FDA_VERIFICATION_STATUS,
  TRANSPORT_SOURCES,
  TRANSPORT_PRODUCT_ROWS,
  VEHICLE_METHODS,
} from "./outdoor-transportation";

describe("outdoor transportation guide data", () => {
  it("keeps the three vehicle methods in a stable order", () => {
    expect(VEHICLE_METHODS.map((item) => item.id)).toEqual([
      "sedan",
      "suv-crossover",
      "accessible-van",
    ]);
  });

  it("marks FDA model verification conservatively", () => {
    expect(FDA_VERIFICATION_STATUS).toBe("not_verified");
    expect(TRANSPORT_PRODUCT_ROWS.every((row) => row.fdaStatus === "not_verified")).toBe(true);
  });

  it("derives every product row from an official wheelchair product id", () => {
    expect(TRANSPORT_PRODUCT_ROWS.map((row) => row.productId)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(TRANSPORT_PRODUCT_ROWS.every((row) => row.sources.includes("manufacturer"))).toBe(true);
  });

  it("keeps each source link labeled by its authority", () => {
    expect(TRANSPORT_SOURCES.map((source) => source.kind)).toEqual(["fda", "nhtsa", "standard", "manufacturer"]);
    expect(TRANSPORT_SOURCES.every((source) => source.href.startsWith("https://") || source.href.startsWith("/"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm.cmd test -- --run src/data/outdoor-transportation.test.ts --maxWorkers=1`

Expected: FAIL because `src/data/outdoor-transportation.ts` does not yet export the data contract.

- [ ] **Step 3: Implement the data module**

Create `src/data/outdoor-transportation.ts` with these exact responsibilities:

```ts
import { OFFICIAL_WHEELCHAIR_SPECS } from "./wheelchair-specs";
import { kgToLb, mmToInches } from "@/lib/wheelchair/units";

export type TransportSourceKind = "fda" | "nhtsa" | "standard" | "manufacturer";
export type FdaVerificationStatus = "not_verified" | "verified";
export const FDA_VERIFICATION_STATUS: FdaVerificationStatus = "not_verified";

export const TRANSPORT_SOURCES = [
  { kind: "fda", label: "FDA device databases", href: "https://www.fda.gov/medical-devices/medical-device-databases" },
  { kind: "nhtsa", label: "NHTSA vehicle safety", href: "https://www.nhtsa.gov/vehicle-safety" },
  { kind: "standard", label: "RESNA/ANSI standards", href: "https://www.resna.org/standards" },
  { kind: "manufacturer", label: "GoldSeason manufacturer specification", href: "/products" },
] as const;

export const VEHICLE_METHODS = [
  { id: "sedan", title: "Sedan", bestFor: "Lighter foldable chairs and a helper who can lift safely.", caution: "Confirm trunk opening width, hinge clearance, and the helper's safe lifting limit." },
  { id: "suv-crossover", title: "SUV / Crossover", bestFor: "Portable ramp loading with more vertical cargo clearance.", caution: "Confirm cargo length, ramp angle, ramp rating, and door clearance." },
  { id: "accessible-van", title: "Accessible van", bestFor: "Occupied transport or chairs that should not be lifted by hand.", caution: "Use a certified lift or ramp and an approved wheelchair/occupant restraint system." },
] as const;

export const TRANSPORT_PRODUCT_ROWS = OFFICIAL_WHEELCHAIR_SPECS.map((spec) => {
  const variant = spec.variants[0];
  return {
    productId: spec.productId,
    name: spec.storefrontName,
    netWeightLb: Number(kgToLb(variant.netWeightWithoutBatteryKg).toFixed(1)),
    foldedIn: {
      length: Number(mmToInches(variant.foldedMm.length).toFixed(1)),
      width: Number(mmToInches(variant.foldedMm.width).toFixed(1)),
      height: Number(mmToInches(variant.foldedMm.height).toFixed(1)),
    },
    seatWidthIn: Number(mmToInches(variant.seatWidthMm).toFixed(1)),
    removableBattery: variant.battery.removable,
    fdaStatus: FDA_VERIFICATION_STATUS,
    sources: ["manufacturer", "fda"] as const,
  };
});
```

Keep the source URL list centralized. If a source URL is unavailable during implementation, preserve the label and use the corresponding official landing page; do not invent model-specific FDA numbers.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm.cmd test -- --run src/data/outdoor-transportation.test.ts --maxWorkers=1`

Expected: PASS with all four data contract assertions passing.

- [ ] **Step 5: Commit the data boundary**

```bash
git add src/data/outdoor-transportation.ts src/data/outdoor-transportation.test.ts
git commit -m "feat: add sourced outdoor transport guide data"
```

### Task 2: Add the guide to the navigation index

**Files:**
- Modify: `src/app/guides/page.tsx:7-57`
- Test: `src/app/guides/page.test.ts`

- [ ] **Step 1: Write the failing navigation test**

Create `src/app/guides/page.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "src/app/guides/page.tsx"), "utf8");

describe("guides navigation", () => {
  it("links to the standalone outdoor transportation guide", () => {
    expect(source).toMatch(/slug:\s*["']outdoor-transportation["']/);
    expect(source).toMatch(/title:\s*["']Outdoor Transportation["']/);
    expect(source).toMatch(/href=\{`\/guides\/\$\{guide\.slug\}`\}/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm.cmd test -- --run src/app/guides/page.test.ts --maxWorkers=1`

Expected: FAIL because the guides array has no `outdoor-transportation` entry.

- [ ] **Step 3: Add the navigation card**

Append one object to the existing `guides` array in `src/app/guides/page.tsx` without changing the four existing entries:

```ts
{
  slug: "outdoor-transportation",
  title: "Outdoor Transportation",
  subtitle: "Wheelchair Travel & Loading",
  description: "A photo-first guide to measuring your vehicle, choosing a loading method, and securing light or heavy wheelchairs for everyday drives.",
  difficulty: "Medium",
  budget: "$0–$8,000+",
  duration: "30 minutes – 2 weeks",
  icon: "🚐",
  color: "#315C4A",
  sections: 9,
},
```

- [ ] **Step 4: Run the navigation test**

Run: `npm.cmd test -- --run src/app/guides/page.test.ts --maxWorkers=1`

Expected: PASS.

- [ ] **Step 5: Commit navigation**

```bash
git add src/app/guides/page.tsx src/app/guides/page.test.ts
git commit -m "feat: link outdoor transportation guide"
```

### Task 3: Add photo assets and the page content

**Files:**
- Create: `public/Homeguide/Outdoor Transportation/vehicle-cargo-measurement.jpg`
- Create: `public/Homeguide/Outdoor Transportation/folded-wheelchair-scale.jpg`
- Create: `public/Homeguide/Outdoor Transportation/suv-ramp-loading.jpg`
- Create: `public/Homeguide/Outdoor Transportation/sedan-trunk-loading.jpg`
- Create: `public/Homeguide/Outdoor Transportation/accessible-van-heavy-wheelchair-lift.jpg`
- Create: `public/Homeguide/Outdoor Transportation/wheelchair-transport-tie-down.jpg`
- Create: `src/app/guides/outdoor-transportation/page.tsx`
- Test: `src/app/guides/outdoor-transportation/page.test.ts`

- [ ] **Step 1: Write the failing page contract test**

Create `src/app/guides/outdoor-transportation/page.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "src/app/guides/outdoor-transportation/page.tsx"), "utf8");

describe("outdoor transportation guide page", () => {
  it("covers the three vehicle scenarios and the heavy-wheelchair path", () => {
    expect(source).toMatch(/Wheelchair Transportation Outdoors/);
    expect(source).toMatch(/Sedan/);
    expect(source).toMatch(/SUV \/ Crossover/);
    expect(source).toMatch(/Accessible van/);
    expect(source).toMatch(/Heavy Wheelchair/);
    expect(source).toMatch(/Final Drive Checklist/);
  });

  it("uses sourced product data and shows FDA verification conservatively", () => {
    expect(source).toMatch(/TRANSPORT_PRODUCT_ROWS/);
    expect(source).toMatch(/TRANSPORT_SOURCES/);
    expect(source).toMatch(/FDA listing not verified/);
    expect(source).not.toMatch(/FDA approved|FDA cleared/);
  });

  it("uses descriptive alt text for every guide image", () => {
    expect(source).toMatch(/alt=/);
    expect((source.match(/<GuideImage/g) ?? []).length).toBeGreaterThanOrEqual(6);
    expect((source.match(/alt=/g) ?? []).length).toBeGreaterThanOrEqual(6);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm.cmd test -- --run src/app/guides/outdoor-transportation/page.test.ts --maxWorkers=1`

Expected: FAIL because the route and page do not exist yet.

- [ ] **Step 3: Create the six realistic photo assets**

Use the image-generation workflow to create six US-home/vehicle photographs. Keep the composition instructional rather than decorative, show no unsafe lifting posture, and export web-friendly JPEG/PNG files with the exact paths listed above. Each image must depict the named action and must not be presented as an actual GoldSeason product close-up unless the supplied product image is used.

- [ ] **Step 4: Implement the page shell and sections**

Create a `"use client"` page following `src/app/guides/bathroom/page.tsx` conventions. Import `Image` from `next/image`, `Link`, `Badge`, `Button`, `TRANSPORT_PRODUCT_ROWS`, `TRANSPORT_SOURCES`, and `VEHICLE_METHODS`. Implement these stable section IDs in order:

```ts
const tableOfContents = [
  ["measure", "1. Measure Before Loading"],
  ["vehicles", "2. Choose a Vehicle Method"],
  ["steps", "3. Photo Loading Sequence"],
  ["heavy", "4. Heavy Wheelchair Path"],
  ["products", "5. GoldSeason Transport Fit"],
  ["worksheet", "6. Vehicle Fit Worksheet"],
  ["checklist", "7. Final Drive Checklist"],
  ["help", "8. When to Get Professional Help"],
  ["sources", "9. Sources and Verification"],
];
```

The page must include:

- Hero copy in English with the tags `Sedan`, `SUV / Crossover`, `Accessible Van`, and `Heavy Wheelchair`.
- Three measurement cards: cargo opening width, cargo depth with seats folded, and chair-only weight without battery.
- Three vehicle method cards rendered from `VEHICLE_METHODS`.
- Six `<Image>` figures with descriptive `alt` and captions: opening measurement, weighing the folded chair, sedan loading, SUV ramp loading, accessible-van lift, and tie-down points.
- A heavy-wheelchair warning that requires total load calculation, a ramp/lift rating above the loaded total, two-person help when needed, and an approved occupant restraint system when the user remains seated. State that ordinary cargo straps do not replace occupant restraints.
- A product table rendered from `TRANSPORT_PRODUCT_ROWS`, showing model, chair-only pounds, folded length x width x height in inches, seat width, removable battery, `Manufacturer spec`, and `FDA listing not verified` when applicable. Do not display a vehicle-fit guarantee.
- A worksheet with labeled text inputs for vehicle opening width, cargo depth, ramp rating, chair-only weight, battery/accessory weight, and helper capacity. Inputs are for planning only and do not run an automated safety verdict.
- A final checklist with keyboard-operable checkboxes and a `window.print()` button.
- A sources section rendering `TRANSPORT_SOURCES`, with source kind labels and `target="_blank" rel="noreferrer"` for external links. The FDA disclaimer must say FDA is used for device information verification, not vehicle-fit certification.

Use `formatLength`, `formatWeight`, or the existing unit helpers rather than hand-written conversion factors. Keep paragraphs concise, preserve the current site's English copy, and use `next/image` with stable aspect ratios so image loading cannot shift the layout.

- [ ] **Step 5: Run page tests and verify they pass**

Run: `npm.cmd test -- --run src/app/guides/outdoor-transportation/page.test.ts --maxWorkers=1`

Expected: PASS with all content, source, safety, and image assertions passing.

- [ ] **Step 6: Commit the page and assets**

```bash
git add "public/Homeguide/Outdoor Transportation" src/app/guides/outdoor-transportation/page.tsx src/app/guides/outdoor-transportation/page.test.ts
git commit -m "feat: add photo-first outdoor transportation guide"
```

### Task 4: Verify accessibility, source wording, and responsive behavior

**Files:**
- Modify: `src/app/guides/outdoor-transportation/page.tsx`
- Test: `src/app/guides/outdoor-transportation/page.test.ts`

- [ ] **Step 1: Add the final wording and interaction assertions**

Extend the page test with these checks:

```ts
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
```

- [ ] **Step 2: Run the focused test and fix only content or accessibility failures**

Run: `npm.cmd test -- --run src/app/guides/outdoor-transportation/page.test.ts --maxWorkers=1`

Expected: PASS with no forbidden FDA clearance language and no missing checklist controls.

- [ ] **Step 3: Run the complete verification suite**

Run each command from the project root:

```powershell
npm.cmd test -- --run --maxWorkers=1
npx.cmd tsc --noEmit --incremental false
npm.cmd audit --json
npm.cmd run build
git diff --check
git status --short --untracked-files=all
```

Expected: all tests pass, TypeScript exits 0, audit reports 0 vulnerabilities, production build exits 0, and `git diff --check` emits no errors. Existing `<img>` lint warnings elsewhere may remain, but the new page must use `next/image`.

- [ ] **Step 4: Browser-check the new route**

Run the local app and inspect `/guides/outdoor-transportation` at a desktop width and a narrow mobile width. Confirm:

- The six photos have stable aspect ratios and readable captions.
- The product table scrolls horizontally on mobile instead of overlapping.
- Long model names, source labels, disclaimers, and checklist text remain inside their containers.
- Every table-of-contents button moves to the correct section.
- Checkbox labels and the print button work with keyboard focus.
- The page is reachable from `/guides` and does not require login.

- [ ] **Step 5: Commit verification-only fixes**

```bash
git add src/app/guides/outdoor-transportation/page.tsx src/app/guides/outdoor-transportation/page.test.ts
git commit -m "test: verify outdoor transportation guide accessibility"
```

### Task 5: Handoff for deployment

**Files:**
- Reference only: `package.json`, `vercel.json`, `src/app/layout.tsx`

- [ ] **Step 1: Confirm no deployment files changed**

Run: `git status --short --untracked-files=all`

Expected: only the intended guide, data, test, and image files are modified or committed; existing Analytics, security, and wheelchair-finder changes remain untouched.

- [ ] **Step 2: Report the production handoff**

State the route, source policy, test/build results, and that deployment to `brand-website` / `goldseason.vip` is a separate explicit action. Do not claim FDA approval or production deployment unless separately verified.
