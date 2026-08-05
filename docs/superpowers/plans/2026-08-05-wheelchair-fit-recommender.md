# Wheelchair Fit Recommender Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $subagent-driven-development (recommended) or $executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an explainable, self-service powered-wheelchair finder that uses verified GoldSeason specifications, filters unsafe matches, ranks one to three suitable products, and lets signed-in customers save sanitized results.

**Architecture:** A versioned, typed product catalog feeds a side-effect-free TypeScript recommendation engine. A client-side Next.js wizard owns transient and local progress, while authenticated Route Handlers persist only sanitized assessment snapshots; support summaries and anonymous funnel events use separate minimal schemas. Product cards, comparison results, and saved assessments all read the same catalog.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Zod, React Hook Form, Prisma 5/PostgreSQL (Neon), NextAuth, Vitest, Testing Library, Playwright, axe-core, Vercel.

---

## Working context and baseline

- Worktree: `C:/Users/PC/.config/superpowers/worktrees/website/wheelchair-fit-recommender`
- Branch: `codex/wheelchair-fit-recommender`
- Design: `docs/superpowers/specs/2026-08-05-wheelchair-fit-recommender-design.md`
- Baseline on 2026-08-05:
  - `npm.cmd run lint` passes with pre-existing `<img>` optimization warnings.
  - `npm run build` passes after `npx.cmd prisma generate`.
- Never stage or overwrite the user's unrelated changes in `C:/Brand WEB/website`.
- Canonical calculation units are kilograms, millimetres, kilometres, and kilometres per hour. US display values are derived at render time.
- The official workbook remains external source evidence; the application stores normalized, reviewed values and provenance, not the workbook itself.

## File map

### Domain and data

- Create `src/lib/wheelchair/types.ts` — domain types and version constants.
- Create `src/lib/wheelchair/units.ts` — pure unit conversions and display formatting.
- Create `src/lib/wheelchair/rules-config.ts` — auditable hard limits, caution bands, and score weights.
- Create `src/lib/wheelchair/assessment-schema.ts` — Zod schemas and storage sanitization.
- Create `src/lib/wheelchair/recommend.ts` — hard filtering, scenario scoring, confidence, grouping, and ranking.
- Create `src/data/wheelchair-specs.ts` — normalized official specifications and source-status notes.
- Create `src/data/products.ts` — central storefront catalog for scooters and wheelchairs.

### Finder UI

- Create `src/app/wheelchair-finder/page.tsx` — route metadata and finder shell.
- Create `src/components/wheelchair-finder/WheelchairFinder.tsx` — wizard state and transitions.
- Create `src/components/wheelchair-finder/FinderProgress.tsx` — accessible progress indicator.
- Create `src/components/wheelchair-finder/BasicStep.tsx` — units, height, weight, and quick/precision choice.
- Create `src/components/wheelchair-finder/SafetyStep.tsx` — non-diagnostic safety gate.
- Create `src/components/wheelchair-finder/MeasurementStep.tsx` — guided hip, seat-depth, and lower-leg measurements.
- Create `src/components/wheelchair-finder/ScenarioStep.tsx` — environment, range, travel, storage, lifting, and priorities.
- Create `src/components/wheelchair-finder/MeasurementGuide.tsx` — image, instructions, and common errors.
- Create `src/components/wheelchair-finder/FinderResults.tsx` — recommendations and reasons.
- Create `src/components/wheelchair-finder/ProductComparison.tsx` — side-by-side official facts.
- Create `src/components/wheelchair-finder/NoMatchState.tsx` — professional, incomplete, hard-no-match, and soft-conflict states.
- Create `src/components/wheelchair-finder/SaveAssessmentButton.tsx` — authenticated save action.
- Create `src/components/wheelchair-finder/SupportSummaryButton.tsx` — expiring summary code generation.
- Create `src/hooks/useWheelchairAssessment.ts` — reducer, local persistence, reset, and recomputation.
- Create `public/wheelchair-finder/measure-hip-width.png` — realistic guided measurement photograph.
- Create `public/wheelchair-finder/measure-seat-depth.png` — realistic guided measurement photograph.
- Create `public/wheelchair-finder/measure-lower-leg.png` — realistic guided measurement photograph.

### Storefront, account, and server

- Modify `src/app/products/page.tsx:20-256,349-467,839-925` — import the central catalog, add finder CTA, and show official facts.
- Modify `prisma/schema.prisma:10-22` — add user relations and finder persistence models.
- Create `prisma/migrations/20260805000000_add_wheelchair_finder/migration.sql` — additive PostgreSQL migration.
- Create `src/app/api/wheelchair-assessments/route.ts` — authenticated list/create.
- Create `src/app/api/wheelchair-assessments/[id]/route.ts` — authenticated delete.
- Create `src/app/api/wheelchair-support-summaries/route.ts` — create an explicit, expiring sanitized support summary.
- Create `src/app/api/wheelchair-support-summaries/[code]/route.ts` — retrieve a non-expired summary by high-entropy code.
- Create `src/app/api/wheelchair-finder-events/route.ts` — accept only non-sensitive allow-listed events.
- Create `src/app/account/wheelchair-assessments/page.tsx` — saved assessment list.
- Create `src/components/wheelchair-finder/SavedAssessmentList.tsx` — delete and empty states.
- Create `src/app/wheelchair-finder/support/[code]/page.tsx` — support-readable result summary.
- Modify `src/app/account/page.tsx:19-23,49-61` — assessment count and link.

### Verification

- Create `vitest.config.ts`, `vitest.setup.ts`, and focused `*.test.ts(x)` files next to domain/UI code.
- Create `playwright.config.ts`.
- Create `e2e/wheelchair-finder.spec.ts` — quick, precision, no-match, persistence, and purchase flows.
- Create `e2e/wheelchair-finder-accessibility.spec.ts` — WCAG A/AA automated scan and keyboard flow.
- Create `docs/product-data/wheelchair-spec-quality.md` — reviewed corrections, missing values, and suppressed criteria.

---

### Task 1: Add deterministic unit, component, and browser test harnesses

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `playwright.config.ts`
- Create: `src/lib/wheelchair/test-setup.test.ts`

- [ ] **Step 1: Write a smoke test before adding the test script**

```ts
// src/lib/wheelchair/test-setup.test.ts
import { describe, expect, it } from "vitest";

describe("test harness", () => {
  it("runs TypeScript tests", () => {
    expect(2 + 2).toBe(4);
  });
});
```

- [ ] **Step 2: Run the test command to verify the harness is absent**

Run: `npm.cmd test -- --run src/lib/wheelchair/test-setup.test.ts`
Expected: FAIL with `Missing script: "test"`.

- [ ] **Step 3: Install test-only dependencies without creating an untracked lockfile**

Run:

```powershell
npm.cmd install --save-dev vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @playwright/test @axe-core/playwright --no-package-lock
```

Expected: dependencies are added to `devDependencies`; `git status --short` does not show `package-lock.json`.

- [ ] **Step 4: Add scripts and configurations**

Add these `package.json` scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed"
}
```

```ts
// vitest.config.ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    clearMocks: true,
  },
});
```

```ts
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
```

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm.cmd run dev -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"], channel: "chrome" },
    },
  ],
});
```

- [ ] **Step 5: Run the smoke test and static checks**

Run: `npm.cmd test -- --run src/lib/wheelchair/test-setup.test.ts`
Expected: PASS, 1 test.

Run: `npm.cmd run lint`
Expected: PASS with only the pre-existing `<img>` warnings.

- [ ] **Step 6: Commit the harness**

```powershell
git add package.json vitest.config.ts vitest.setup.ts playwright.config.ts src/lib/wheelchair/test-setup.test.ts
git commit -m "test: add wheelchair finder test harness"
```

---

### Task 2: Define canonical domain types, conversions, and rule configuration

**Files:**
- Create: `src/lib/wheelchair/types.ts`
- Create: `src/lib/wheelchair/units.ts`
- Create: `src/lib/wheelchair/rules-config.ts`
- Create: `src/lib/wheelchair/units.test.ts`

- [ ] **Step 1: Write failing conversion and configuration tests**

```ts
// src/lib/wheelchair/units.test.ts
import { describe, expect, it } from "vitest";
import { FINDER_RULES } from "./rules-config";
import { inchesToMm, kgToLb, lbToKg, mmToInches, milesToKm } from "./units";

describe("wheelchair units", () => {
  it("round-trips US and canonical units", () => {
    expect(mmToInches(inchesToMm(18))).toBeCloseTo(18, 6);
    expect(kgToLb(lbToKg(330))).toBeCloseTo(330, 6);
    expect(milesToKm(15)).toBeCloseTo(24.1401, 4);
  });

  it("keeps safety and scoring weights explicit", () => {
    expect(FINDER_RULES.seatDepth.shortfallHardLimitMm).toBe(100);
    expect(FINDER_RULES.seatDepth.kneeClearanceMinMm).toBe(30);
    expect(Object.values(FINDER_RULES.scoreWeights).reduce((a, b) => a + b, 0)).toBe(100);
  });
});
```

- [ ] **Step 2: Run the tests to verify missing modules**

Run: `npm.cmd test -- src/lib/wheelchair/units.test.ts`
Expected: FAIL because `units.ts` and `rules-config.ts` do not exist.

- [ ] **Step 3: Add the complete domain contracts**

```ts
// src/lib/wheelchair/types.ts
export const PRODUCT_DATA_VERSION = "2026-08-05";
export const RULES_VERSION = "1.0.0";

export type VerificationStatus = "verified" | "conflicting" | "missing";
export type UnitSystem = "us" | "metric";
export type AssessmentMode = "quick" | "precision";
export type BodyBuild = "slim" | "average" | "broad";
export type Environment = "indoor" | "outdoor" | "mixed";
export type Surface = "smooth" | "carpet" | "grass" | "gravel" | "uneven";
export type Priority = "fit" | "portability" | "range" | "rough-terrain" | "roominess";
export type Confidence = "preliminary" | "moderate" | "high";
export type MatchBand = "best" | "good" | "potential";
export type NoMatchKind = "professional" | "incomplete" | "hard" | "soft-conflict";

export interface DimensionsMm { length: number; width: number; height: number }

export interface SourceRecord {
  workbookColumns: string;
  raw: Record<string, string>;
  status: Partial<Record<string, VerificationStatus>>;
  notes: string[];
}

export interface WheelchairVariantSpec {
  variantId: string;
  factoryModel: string;
  maxUserWeightKg: number;
  seatWidthMm: number;
  seatDepthMm: number;
  cushionWidthMm: number | null;
  cushionDepthMm: number | null;
  seatHeightMm: number;
  armrestSpacingMm: number;
  seatToFootrestMm: number;
  overallMm: DimensionsMm;
  foldedMm: DimensionsMm;
  netWeightWithoutBatteryKg: number;
  batteryWeightKg: number | null;
  rangeKm: number;
  turningRadiusMm: number;
  obstacleHeightMm: number;
  maxSpeedKph: number;
  frontWheelMm: number;
  rearWheelMm: number;
  tireClass: "solid" | "foam" | "mixed-pneumatic";
  battery: {
    removable: boolean;
    chemistry: "lithium" | "lead-acid";
    voltageV: number | null;
    capacityAh: number;
    manufacturerAirplaneFlag: boolean;
  };
  source: SourceRecord;
}

export interface WheelchairProductSpec {
  productId: string;
  storefrontName: string;
  officialFamily: string;
  variants: WheelchairVariantSpec[];
}

export interface FinderAssessment {
  mode: AssessmentMode;
  unitSystem: UnitSystem;
  heightMm: number;
  weightKg: number;
  bodyBuild: BodyBuild;
  hipWidthMm?: number;
  bodySeatDepthMm?: number;
  lowerLegMm?: number;
  safety: {
    pressureInjuryConcern: boolean;
    posturalAsymmetry: boolean;
    customPositioningNeed: boolean;
  };
  use: {
    environment: Environment;
    surfaces: Surface[];
    tightSpaces: boolean;
    dailyRangeKm: number;
    airlineTravel: boolean;
    storageMm?: DimensionsMm;
    maxLiftKg?: number;
    priorities: Priority[];
  };
}

export type ExclusionCode =
  | "professional-assessment"
  | "over-capacity"
  | "seat-too-narrow"
  | "seat-too-deep"
  | "seat-too-shallow"
  | "footrest-mismatch"
  | "storage-too-small"
  | "lift-data-missing"
  | "too-heavy-to-lift"
  | "airline-not-verified"
  | "critical-data-missing";

export interface VariantEvaluation {
  productId: string;
  variantId: string;
  eligible: boolean;
  exclusions: ExclusionCode[];
  score: number;
  scoreParts: { fit: number; environment: number; transport: number; preferences: number };
  confidence: Confidence;
  reasons: string[];
  warnings: string[];
}

export interface Recommendation {
  productId: string;
  variantId: string;
  score: number;
  band: MatchBand;
  confidence: Confidence;
  reasons: string[];
  warnings: string[];
}
```

```ts
// src/lib/wheelchair/units.ts
const MM_PER_INCH = 25.4;
const LB_PER_KG = 2.2046226218;
const KM_PER_MILE = 1.609344;

export const inchesToMm = (value: number) => value * MM_PER_INCH;
export const mmToInches = (value: number) => value / MM_PER_INCH;
export const lbToKg = (value: number) => value / LB_PER_KG;
export const kgToLb = (value: number) => value * LB_PER_KG;
export const milesToKm = (value: number) => value * KM_PER_MILE;
export const kmToMiles = (value: number) => value / KM_PER_MILE;

export function formatLength(mm: number, unit: "us" | "metric") {
  return unit === "us" ? `${mmToInches(mm).toFixed(1)} in` : `${Math.round(mm / 10)} cm`;
}

export function formatWeight(kg: number, unit: "us" | "metric") {
  return unit === "us" ? `${kgToLb(kg).toFixed(1)} lb` : `${kg.toFixed(1)} kg`;
}

export function formatRange(km: number, unit: "us" | "metric") {
  return unit === "us" ? `${kmToMiles(km).toFixed(0)} mi` : `${km.toFixed(0)} km`;
}

export function batteryWh(voltageV: number | null, capacityAh: number) {
  return voltageV === null ? null : voltageV * capacityAh;
}
```

```ts
// src/lib/wheelchair/rules-config.ts
export const FINDER_RULES = {
  seatDepth: {
    kneeClearanceMinMm: 30,
    kneeClearanceMaxMm: 50,
    idealClearanceMm: 40,
    shortfallHardLimitMm: 100,
  },
  footrest: { idealToleranceMm: 20, hardToleranceMm: 50 },
  capacity: { cautionRatio: 0.9 },
  airline: { maxRemovableLithiumWh: 300 },
  scoreWeights: { fit: 45, environment: 25, transport: 20, preferences: 10 },
  outputBands: { best: 85, good: 70, potential: 55 },
  maxRecommendations: 3,
} as const;
```

- [ ] **Step 4: Run tests and type checking**

Run: `npm.cmd test -- src/lib/wheelchair/units.test.ts`
Expected: PASS, 2 tests.

Run: `npx.cmd tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit domain foundations**

```powershell
git add src/lib/wheelchair/types.ts src/lib/wheelchair/units.ts src/lib/wheelchair/rules-config.ts src/lib/wheelchair/units.test.ts
git commit -m "feat: define wheelchair finder domain"
```

---

### Task 3: Encode and validate the official wheelchair specifications

**Files:**
- Create: `src/data/wheelchair-specs.ts`
- Create: `src/data/wheelchair-specs.test.ts`
- Create: `docs/product-data/wheelchair-spec-quality.md`

- [ ] **Step 1: Write failing official-data tests**

```ts
// src/data/wheelchair-specs.test.ts
import { describe, expect, it } from "vitest";
import { OFFICIAL_WHEELCHAIR_SPECS, getWheelchairSpec } from "./wheelchair-specs";
import { batteryWh } from "@/lib/wheelchair/units";

describe("official wheelchair specifications", () => {
  it("maps every storefront wheelchair to its official family", () => {
    expect(OFFICIAL_WHEELCHAIR_SPECS).toHaveLength(7);
    expect(getWheelchairSpec("1").officialFamily).toContain("ND03");
    expect(getWheelchairSpec("2").variants[0].variantId).toBe("PA22V100");
    expect(getWheelchairSpec("7").variants.map((v) => v.variantId)).toEqual([
      "PA13A100", "PA13L100", "PA13N100",
    ]);
  });

  it("uses metric source values and derives aviation watt-hours", () => {
    const w03 = getWheelchairSpec("1").variants[0];
    expect(w03.seatWidthMm).toBe(440);
    expect(w03.netWeightWithoutBatteryKg).toBe(15);
    expect(batteryWh(w03.battery.voltageV, w03.battery.capacityAh)).toBe(252);
  });

  it("marks missing and conflicting values instead of guessing", () => {
    const w21 = getWheelchairSpec("2").variants[0];
    const spacious = getWheelchairSpec("6").variants[0];
    expect(w21.source.status.batteryVoltageV).toBe("missing");
    expect(spacious.source.status.cushionWidthMm).toBe("conflicting");
  });
});
```

- [ ] **Step 2: Run the data tests to verify they fail**

Run: `npm.cmd test -- src/data/wheelchair-specs.test.ts`
Expected: FAIL because `wheelchair-specs.ts` does not exist.

- [ ] **Step 3: Add normalized official records**

Create `src/data/wheelchair-specs.ts` with the following complete source rows. Variants that share geometry must still retain their own SKU and source column.

```ts
import type { WheelchairProductSpec, WheelchairVariantSpec } from "@/lib/wheelchair/types";
import { lbToKg, milesToKm } from "@/lib/wheelchair/units";

const dims = (length: number, width: number, height: number) => ({ length, width, height });

const variant = (value: WheelchairVariantSpec): WheelchairVariantSpec => value;

const nd03Base = {
  factoryModel: "ND03",
  maxUserWeightKg: lbToKg(330),
  seatWidthMm: 440,
  seatDepthMm: 420,
  cushionWidthMm: 440,
  cushionDepthMm: 420,
  seatHeightMm: 520,
  armrestSpacingMm: 440,
  seatToFootrestMm: 390,
  overallMm: dims(960, 550, 940),
  foldedMm: dims(340, 540, 840),
  netWeightWithoutBatteryKg: 15,
  batteryWeightKg: 1.21,
  rangeKm: milesToKm(15),
  turningRadiusMm: 950,
  obstacleHeightMm: 40,
  maxSpeedKph: 6,
  frontWheelMm: 180,
  rearWheelMm: 220,
  tireClass: "foam" as const,
  battery: { removable: true, chemistry: "lithium" as const, voltageV: 25.2, capacityAh: 10, manufacturerAirplaneFlag: true },
};

const pa16Base = {
  factoryModel: "XSW001-B (A16)",
  maxUserWeightKg: lbToKg(400),
  seatWidthMm: 500,
  seatDepthMm: 470,
  seatHeightMm: 500,
  armrestSpacingMm: 500,
  seatToFootrestMm: 350,
  overallMm: dims(1040, 660, 970),
  foldedMm: dims(560, 650, 990),
  netWeightWithoutBatteryKg: 29.7,
  turningRadiusMm: 1200,
  obstacleHeightMm: 40,
  maxSpeedKph: 6,
  frontWheelMm: 200,
  rearWheelMm: 330,
  tireClass: "mixed-pneumatic" as const,
};

export const OFFICIAL_WHEELCHAIR_SPECS: WheelchairProductSpec[] = [
  {
    productId: "1",
    storefrontName: "Travel Air W 03",
    officialFamily: "ND03-C/D/E/F",
    variants: [
      ["GI03H102", "I", 20.14], ["GI04H103", "J", 20.14], ["GI05H104", "K", 21.41], ["GI06H105", "L", 21.41],
    ].map(([variantId, column, packedWeightKg]) => variant({
      ...nd03Base,
      variantId: String(variantId),
      source: {
        workbookColumns: String(column),
        raw: {
          loadCapacity: "330 lb", netWeight: "15 kg", seat: "420 D x 440 W mm",
          folded: "340 x 540 x 840 mm", battery: "25.2 V x 10 Ah", packedWeight: `${packedWeightKg} kg`,
        },
        status: {},
        notes: [],
      },
    })),
  },
  {
    productId: "2",
    storefrontName: "Travel Air W 21",
    officialFamily: "HE702 / PA22",
    variants: [variant({
      variantId: "PA22V100",
      factoryModel: "HE702",
      maxUserWeightKg: lbToKg(330),
      seatWidthMm: 460,
      seatDepthMm: 480,
      cushionWidthMm: 420,
      cushionDepthMm: 480,
      seatHeightMm: 480,
      armrestSpacingMm: 450,
      seatToFootrestMm: 320,
      overallMm: dims(1150, 560, 1040),
      foldedMm: dims(390, 550, 793),
      netWeightWithoutBatteryKg: 16.2,
      batteryWeightKg: 1.95,
      rangeKm: milesToKm(15),
      turningRadiusMm: 970,
      obstacleHeightMm: 25,
      maxSpeedKph: 6,
      frontWheelMm: 180,
      rearWheelMm: 250,
      tireClass: "solid",
      battery: { removable: true, chemistry: "lithium", voltageV: null, capacityAh: 10, manufacturerAirplaneFlag: true },
      source: {
        workbookColumns: "P",
        raw: { netWeight: "16.2 kg", seat: "480 D x 460 W mm", folded: "390 x 550 x 793 mm", battery: "10 Ah; voltage absent" },
        status: { batteryVoltageV: "missing" },
        notes: ["Storefront W21 was confirmed by the product owner to be the PA22 model."],
      },
    })],
  },
  {
    productId: "3",
    storefrontName: "Travel Air W 26",
    officialFamily: "L-41 / PA26",
    variants: ["PA26A000", "PA26B000"].map((variantId, index) => variant({
      variantId,
      factoryModel: "L-41",
      maxUserWeightKg: lbToKg(330),
      seatWidthMm: 410,
      seatDepthMm: 460,
      cushionWidthMm: 410,
      cushionDepthMm: 400,
      seatHeightMm: 520,
      armrestSpacingMm: 460,
      seatToFootrestMm: 450,
      overallMm: dims(920, 550, 1000),
      foldedMm: dims(550, 350, 850),
      netWeightWithoutBatteryKg: lbToKg(37),
      batteryWeightKg: 1.21,
      rangeKm: milesToKm(15),
      turningRadiusMm: 900,
      obstacleHeightMm: 25,
      maxSpeedKph: 4,
      frontWheelMm: 152.4,
      rearWheelMm: 254,
      tireClass: "solid",
      battery: { removable: true, chemistry: "lithium", voltageV: null, capacityAh: 6, manufacturerAirplaneFlag: true },
      source: {
        workbookColumns: index === 0 ? "Q" : "R",
        raw: { netWeight: "37 lb", seat: "460 +/-10 D x 410 +/-10 W mm", folded: "550 x 350 x 850 mm", battery: "6 Ah; voltage absent" },
        status: { batteryVoltageV: "missing" },
        notes: [],
      },
    })),
  },
  {
    productId: "4",
    storefrontName: "Power Max 01",
    officialFamily: "YKW01",
    variants: [
      { variantId: "GI01H100", model: "YKW01-A", column: "D", overall: dims(1000, 650, 975), folded: dims(450, 650, 770), netKg: 24.5 },
      { variantId: "GI02H101", model: "YKW01-B", column: "C", overall: dims(1020, 650, 1110), folded: dims(450, 650, 880), netKg: 28 },
    ].map((row) => variant({
      variantId: row.variantId,
      factoryModel: row.model,
      maxUserWeightKg: lbToKg(400),
      seatWidthMm: 480,
      seatDepthMm: 480,
      cushionWidthMm: 460,
      cushionDepthMm: 480,
      seatHeightMm: 500,
      armrestSpacingMm: 480,
      seatToFootrestMm: 350,
      overallMm: row.overall,
      foldedMm: row.folded,
      netWeightWithoutBatteryKg: row.netKg,
      batteryWeightKg: 3.52,
      rangeKm: milesToKm(30),
      turningRadiusMm: 1200,
      obstacleHeightMm: 40,
      maxSpeedKph: 6,
      frontWheelMm: 200,
      rearWheelMm: 315,
      tireClass: "mixed-pneumatic",
      battery: { removable: true, chemistry: "lithium", voltageV: 24, capacityAh: 25, manufacturerAirplaneFlag: false },
      source: {
        workbookColumns: row.column,
        raw: { loadCapacity: "400 lb", seat: "480 D x 480 W mm", battery: "24 V x 25 Ah", range: "30 mile" },
        status: {},
        notes: [],
      },
    })),
  },
  {
    productId: "5",
    storefrontName: "Power Max 16",
    officialFamily: "XSW001-B (A16)",
    variants: [
      { variantId: "PA16H100", column: "E", cushion: [500, 450], batteryKg: 2.2, capacityAh: 20, rangeMi: 25 },
      { variantId: "PA16L100", column: "F", cushion: [485, 445], batteryKg: 3.6, capacityAh: 25, rangeMi: 30 },
      { variantId: "PA16K100", column: "G", cushion: [420, 450], batteryKg: 3.6, capacityAh: 25, rangeMi: 30 },
    ].map((row) => variant({
      ...pa16Base,
      variantId: row.variantId,
      cushionWidthMm: row.cushion[0],
      cushionDepthMm: row.cushion[1],
      batteryWeightKg: row.batteryKg,
      rangeKm: milesToKm(row.rangeMi),
      battery: { removable: true, chemistry: "lithium", voltageV: 24, capacityAh: row.capacityAh, manufacturerAirplaneFlag: false },
      source: {
        workbookColumns: row.column,
        raw: { loadCapacity: "400 lb", seat: "470 D x 500 W mm", cushion: `${row.cushion[1]} D x ${row.cushion[0]} W mm`, range: `${row.rangeMi} mile` },
        status: row.variantId === "PA16K100" ? { cushionWidthMm: "conflicting" } : {},
        notes: row.variantId === "PA16K100" ? ["The cushion width differs materially from the listed 500 mm seat width; show a caution but use the verified seat and armrest dimensions for the hard width rule."] : [],
      },
    })),
  },
  {
    productId: "6",
    storefrontName: "Spacious Pro 15",
    officialFamily: "XSW003-D / PA15",
    variants: ["PA15F100", "PA15B100"].map((variantId, index) => variant({
      variantId,
      factoryModel: "XSW003-D",
      maxUserWeightKg: lbToKg(350),
      seatWidthMm: 550,
      seatDepthMm: 470,
      cushionWidthMm: 460,
      cushionDepthMm: 430,
      seatHeightMm: 470,
      armrestSpacingMm: 550,
      seatToFootrestMm: 350,
      overallMm: dims(1010, 650, 920),
      foldedMm: dims(730, 360, 750),
      netWeightWithoutBatteryKg: 22,
      batteryWeightKg: 8,
      rangeKm: milesToKm(15),
      turningRadiusMm: 1200,
      obstacleHeightMm: 40,
      maxSpeedKph: 6,
      frontWheelMm: 190,
      rearWheelMm: 280,
      tireClass: "foam",
      battery: { removable: true, chemistry: "lead-acid", voltageV: null, capacityAh: 12, manufacturerAirplaneFlag: false },
      source: {
        workbookColumns: index === 0 ? "V" : "W",
        raw: { seat: "470 D x 550 W mm", cushion: "430 D x 460 W mm", folded: "730 x 360 x 750 mm", range: "15 mile" },
        status: { cushionWidthMm: "conflicting" },
        notes: ["The workbook imperial folded-width text is invalid; 360 mm is authoritative.", "The listed cushion is narrower than the seat and armrest spacing; show this as a fit warning."],
      },
    })),
  },
  {
    productId: "7",
    storefrontName: "Basic 13",
    officialFamily: "JL100W-01A / PA13",
    variants: ["PA13A100", "PA13L100", "PA13N100"].map((variantId, index) => variant({
      variantId,
      factoryModel: "JL100W-01A",
      maxUserWeightKg: lbToKg(330),
      seatWidthMm: 480,
      seatDepthMm: 440,
      cushionWidthMm: 440,
      cushionDepthMm: 450,
      seatHeightMm: 500,
      armrestSpacingMm: 480,
      seatToFootrestMm: 380,
      overallMm: dims(1000, 640, 860),
      foldedMm: dims(790, 410, 715),
      netWeightWithoutBatteryKg: 29,
      batteryWeightKg: null,
      rangeKm: milesToKm(15),
      turningRadiusMm: 1200,
      obstacleHeightMm: 40,
      maxSpeedKph: 6,
      frontWheelMm: 180,
      rearWheelMm: 300,
      tireClass: "solid",
      battery: { removable: false, chemistry: "lead-acid", voltageV: null, capacityAh: 12, manufacturerAirplaneFlag: false },
      source: {
        workbookColumns: ["S", "T", "U"][index],
        raw: { netWeight: "29 kg excluding battery", seat: "440 D x 480 W mm", cushion: "450 D x 440 W mm", batteryWeight: "/" },
        status: { batteryWeightKg: "missing" },
        notes: ["The workbook's 18.9 in pedal-to-seat text conflicts with 380 mm; derive 15.0 in from 380 mm."],
      },
    })),
  },
];

export function getWheelchairSpec(productId: string) {
  const product = OFFICIAL_WHEELCHAIR_SPECS.find((item) => item.productId === productId);
  if (!product) throw new Error(`Unknown wheelchair product: ${productId}`);
  return product;
}
```

- [ ] **Step 4: Document the quality decisions**

Create `docs/product-data/wheelchair-spec-quality.md` with a table containing: storefront product, SKU, workbook columns, authoritative metric fields, conflicts, missing critical values, affected rule, and UI treatment. Explicitly record:

- W21/PA22 and W26/PA26 battery voltage missing: no airline-verified result until voltage is supplied.
- A16 turn radius: use `1200 mm`; derive `47.2 in`, not workbook `42.2 in`.
- PA15 folded width: use `360 mm`; derive `14.2 in`, not workbook `154.6 in`.
- PA13 seat-to-footrest: use `380 mm`; derive `15.0 in`, not workbook `18.9 in`.
- PA15 and PA16K cushion-width differences: show a warning and never hide the raw value.
- Basic 13 non-removable battery weight missing: suppress lifting suitability when the user provides a lift limit.

- [ ] **Step 5: Run tests and commit**

Run: `npm.cmd test -- src/data/wheelchair-specs.test.ts`
Expected: PASS, 3 tests.

```powershell
git add src/data/wheelchair-specs.ts src/data/wheelchair-specs.test.ts docs/product-data/wheelchair-spec-quality.md
git commit -m "feat: add verified wheelchair specifications"
```

---

### Task 4: Centralize the storefront catalog and correct public product facts

**Files:**
- Create: `src/data/products.ts`
- Modify: `src/app/products/page.tsx:20-256`
- Create: `src/data/products.test.ts`

- [ ] **Step 1: Write a failing catalog synchronization test**

```ts
// src/data/products.test.ts
import { describe, expect, it } from "vitest";
import { products, wheelchairProducts } from "./products";

describe("central storefront catalog", () => {
  it("preserves all five scooters and seven wheelchairs", () => {
    expect(products.filter((p) => p.category === "scooter")).toHaveLength(5);
    expect(wheelchairProducts).toHaveLength(7);
  });

  it("uses official facts for wheelchair summaries", () => {
    expect(wheelchairProducts.find((p) => p.id === "1")?.weight).toBe("33.1 lb without battery");
    expect(wheelchairProducts.find((p) => p.id === "2")?.range).toBe("15 mi");
    expect(wheelchairProducts.find((p) => p.id === "6")?.seatWidth).toBe("21.7 in");
  });
});
```

- [ ] **Step 2: Run the test to verify the catalog module is missing**

Run: `npm.cmd test -- src/data/products.test.ts`
Expected: FAIL because `src/data/products.ts` does not exist.

- [ ] **Step 3: Extract the existing catalog without changing commercial fields**

Move the `Product` interface and complete `products` array from `src/app/products/page.tsx:20-256` into `src/data/products.ts`. Export both. Preserve the five scooter records, prices, images, colors, reviews, warranties, and Amazon links exactly.

Extend `Product` with:

```ts
export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  category: "scooter" | "wheelchair";
  badge?: string;
  rating: number;
  reviews: number;
  images: string[];
  colors: string[];
  colorNames: string[];
  features: string[];
  weight?: string;
  range?: string;
  seatWidth?: string;
  maxSpeed?: string;
  warranty?: string;
  amazonLink?: string;
}
```

For wheelchair records, replace only the inaccurate specification strings with these official summaries:

| ID | Weight | Range | Seat width | Max speed | Travel label |
| --- | --- | --- | --- | --- | --- |
| 1 | `33.1 lb without battery` | `15 mi` | `17.3 in` | `3.7 mph` | `252 Wh removable lithium battery; confirm with airline` |
| 2 | `35.7 lb without battery` | `15 mi` | `18.1 in` | `3.7 mph` | `Battery voltage pending; airline status unverified` |
| 3 | `37.0 lb without battery` | `15 mi` | `16.1 in` | `2.5 mph` | `Battery voltage pending; airline status unverified` |
| 4 | `54.0–61.7 lb without battery` | `30 mi` | `18.9 in` | `3.7 mph` | `Not an airline-battery match` |
| 5 | `65.5 lb without battery` | `25–30 mi` | `19.7 in` | `3.7 mph` | `Not an airline-battery match` |
| 6 | `48.5 lb without battery` | `15 mi` | `21.7 in` | `3.7 mph` | `Not an airline-battery match` |
| 7 | `63.9 lb without battery` | `15 mi` | `18.9 in` | `3.7 mph` | `Not an airline-battery match` |

Export:

```ts
export const wheelchairProducts = products.filter(
  (product): product is Product => product.category === "wheelchair",
);

export const productById = new Map(products.map((product) => [product.id, product]));
```

- [ ] **Step 4: Replace page-local data with the central import**

At the top of `src/app/products/page.tsx`, add:

```ts
import { products, type Product } from "@/data/products";
```

Delete the former page-local `Product` interface and `products` array. Do not alter filtering, cart IDs, comparison IDs, prices, or image selection.

- [ ] **Step 5: Verify corrected catalog and unchanged storefront behavior**

Run: `npm.cmd test -- src/data/products.test.ts`
Expected: PASS, 2 tests.

Run: `npm.cmd run lint`
Expected: PASS with the baseline image warnings.

- [ ] **Step 6: Commit the catalog extraction**

```powershell
git add src/data/products.ts src/data/products.test.ts src/app/products/page.tsx
git commit -m "refactor: centralize official product catalog"
```

---

### Task 5: Implement hard safety filtering first

**Files:**
- Create: `src/lib/wheelchair/recommend.ts`
- Create: `src/lib/wheelchair/recommend-hard-filters.test.ts`

- [ ] **Step 1: Write failing hard-filter boundary tests**

```ts
// src/lib/wheelchair/recommend-hard-filters.test.ts
import { describe, expect, it } from "vitest";
import { getWheelchairSpec } from "@/data/wheelchair-specs";
import type { FinderAssessment } from "./types";
import { evaluateHardConstraints } from "./recommend";
import { inchesToMm, lbToKg, milesToKm } from "./units";

const assessment: FinderAssessment = {
  mode: "precision",
  unitSystem: "us",
  heightMm: inchesToMm(68),
  weightKg: lbToKg(180),
  bodyBuild: "average",
  hipWidthMm: inchesToMm(17),
  bodySeatDepthMm: inchesToMm(19),
  lowerLegMm: inchesToMm(15.5),
  safety: { pressureInjuryConcern: false, posturalAsymmetry: false, customPositioningNeed: false },
  use: { environment: "mixed", surfaces: ["smooth"], tightSpaces: false, dailyRangeKm: milesToKm(10), airlineTravel: false, priorities: ["fit"] },
};

describe("hard safety filters", () => {
  it("blocks every product for a professional-assessment answer", () => {
    const result = evaluateHardConstraints(
      { ...assessment, safety: { ...assessment.safety, pressureInjuryConcern: true } },
      getWheelchairSpec("1").variants[0],
    );
    expect(result).toContain("professional-assessment");
  });

  it("blocks over-capacity and too-narrow products", () => {
    const variant = getWheelchairSpec("1").variants[0];
    expect(evaluateHardConstraints({ ...assessment, weightKg: lbToKg(331) }, variant)).toContain("over-capacity");
    expect(evaluateHardConstraints({ ...assessment, hipWidthMm: 441 }, variant)).toContain("seat-too-narrow");
  });

  it("blocks seat depth and fixed footrest mismatches at configured boundaries", () => {
    const variant = getWheelchairSpec("1").variants[0];
    expect(evaluateHardConstraints({ ...assessment, bodySeatDepthMm: 440 }, variant)).toContain("seat-too-deep");
    expect(evaluateHardConstraints({ ...assessment, lowerLegMm: 460 }, variant)).toContain("footrest-mismatch");
  });

  it("checks folded storage in any safe orientation", () => {
    const variant = getWheelchairSpec("1").variants[0];
    const fitsRotated = { ...assessment, use: { ...assessment.use, storageMm: { length: 850, width: 550, height: 350 } } };
    const tooSmall = { ...assessment, use: { ...assessment.use, storageMm: { length: 500, width: 500, height: 500 } } };
    expect(evaluateHardConstraints(fitsRotated, variant)).not.toContain("storage-too-small");
    expect(evaluateHardConstraints(tooSmall, variant)).toContain("storage-too-small");
  });

  it("requires known watt-hours for an airline request", () => {
    const airline = { ...assessment, use: { ...assessment.use, airlineTravel: true } };
    expect(evaluateHardConstraints(airline, getWheelchairSpec("1").variants[0])).not.toContain("airline-not-verified");
    expect(evaluateHardConstraints(airline, getWheelchairSpec("2").variants[0])).toContain("airline-not-verified");
  });
});
```

- [ ] **Step 2: Run tests to verify the evaluator is absent**

Run: `npm.cmd test -- src/lib/wheelchair/recommend-hard-filters.test.ts`
Expected: FAIL because `evaluateHardConstraints` is not exported.

- [ ] **Step 3: Implement pure hard-filter functions**

```ts
// src/lib/wheelchair/recommend.ts
import { FINDER_RULES } from "./rules-config";
import type { DimensionsMm, ExclusionCode, FinderAssessment, WheelchairVariantSpec } from "./types";
import { batteryWh } from "./units";

const permutations = (d: DimensionsMm): DimensionsMm[] => [
  { length: d.length, width: d.width, height: d.height },
  { length: d.length, width: d.height, height: d.width },
  { length: d.width, width: d.length, height: d.height },
  { length: d.width, width: d.height, height: d.length },
  { length: d.height, width: d.length, height: d.width },
  { length: d.height, width: d.width, height: d.length },
];

export function fitsStorage(item: DimensionsMm, storage: DimensionsMm) {
  return permutations(item).some(
    (p) => p.length <= storage.length && p.width <= storage.width && p.height <= storage.height,
  );
}

export function liftWeightKg(variant: WheelchairVariantSpec) {
  if (variant.battery.removable) return variant.netWeightWithoutBatteryKg;
  if (variant.batteryWeightKg === null) return null;
  return variant.netWeightWithoutBatteryKg + variant.batteryWeightKg;
}

export function evaluateHardConstraints(
  assessment: FinderAssessment,
  variant: WheelchairVariantSpec,
): ExclusionCode[] {
  const exclusions: ExclusionCode[] = [];
  const safety = assessment.safety;

  if (safety.pressureInjuryConcern || safety.posturalAsymmetry || safety.customPositioningNeed) {
    exclusions.push("professional-assessment");
    return exclusions;
  }

  if (assessment.weightKg > variant.maxUserWeightKg) exclusions.push("over-capacity");

  if (assessment.mode === "precision") {
    if (assessment.hipWidthMm === undefined || assessment.bodySeatDepthMm === undefined || assessment.lowerLegMm === undefined) {
      exclusions.push("critical-data-missing");
      return exclusions;
    }

    const effectiveWidth = Math.min(variant.seatWidthMm, variant.armrestSpacingMm);
    if (assessment.hipWidthMm > effectiveWidth) exclusions.push("seat-too-narrow");

    const clearance = assessment.bodySeatDepthMm - variant.seatDepthMm;
    if (clearance < FINDER_RULES.seatDepth.kneeClearanceMinMm) exclusions.push("seat-too-deep");
    if (clearance > FINDER_RULES.seatDepth.shortfallHardLimitMm) exclusions.push("seat-too-shallow");

    if (Math.abs(assessment.lowerLegMm - variant.seatToFootrestMm) > FINDER_RULES.footrest.hardToleranceMm) {
      exclusions.push("footrest-mismatch");
    }
  }

  if (assessment.use.storageMm && !fitsStorage(variant.foldedMm, assessment.use.storageMm)) {
    exclusions.push("storage-too-small");
  }

  if (assessment.use.maxLiftKg !== undefined) {
    const liftKg = liftWeightKg(variant);
    if (liftKg === null) exclusions.push("lift-data-missing");
    else if (liftKg > assessment.use.maxLiftKg) exclusions.push("too-heavy-to-lift");
  }

  if (assessment.use.airlineTravel) {
    const wh = batteryWh(variant.battery.voltageV, variant.battery.capacityAh);
    const verified = variant.battery.removable
      && variant.battery.chemistry === "lithium"
      && variant.battery.manufacturerAirplaneFlag
      && wh !== null
      && wh <= FINDER_RULES.airline.maxRemovableLithiumWh;
    if (!verified) exclusions.push("airline-not-verified");
  }

  return [...new Set(exclusions)];
}
```

- [ ] **Step 4: Run boundary tests**

Run: `npm.cmd test -- src/lib/wheelchair/recommend-hard-filters.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit hard filters**

```powershell
git add src/lib/wheelchair/recommend.ts src/lib/wheelchair/recommend-hard-filters.test.ts
git commit -m "feat: add wheelchair hard safety filters"
```

---

### Task 6: Add explainable scoring, confidence, and product ranking

**Files:**
- Modify: `src/lib/wheelchair/recommend.ts`
- Create: `src/lib/wheelchair/recommend-ranking.test.ts`

- [ ] **Step 1: Write failing scenario-ranking tests**

```ts
// src/lib/wheelchair/recommend-ranking.test.ts
import { describe, expect, it } from "vitest";
import { recommendWheelchairs } from "./recommend";
import type { FinderAssessment } from "./types";
import { inchesToMm, lbToKg, milesToKm } from "./units";

const base: FinderAssessment = {
  mode: "precision", unitSystem: "us", heightMm: inchesToMm(68), weightKg: lbToKg(180), bodyBuild: "average",
  hipWidthMm: inchesToMm(17), bodySeatDepthMm: inchesToMm(19), lowerLegMm: inchesToMm(15.5),
  safety: { pressureInjuryConcern: false, posturalAsymmetry: false, customPositioningNeed: false },
  use: { environment: "mixed", surfaces: ["smooth"], tightSpaces: false, dailyRangeKm: milesToKm(10), airlineTravel: false, priorities: ["fit"] },
};

describe("wheelchair ranking", () => {
  it("returns at most three unique storefront products", () => {
    const result = recommendWheelchairs(base);
    expect(result.recommendations.length).toBeLessThanOrEqual(3);
    expect(new Set(result.recommendations.map((r) => r.productId)).size).toBe(result.recommendations.length);
  });

  it("ranks W03 first for a verified airline request", () => {
    const result = recommendWheelchairs({ ...base, use: { ...base.use, airlineTravel: true, priorities: ["portability"] } });
    expect(result.recommendations[0].productId).toBe("1");
    expect(result.recommendations.every((r) => r.productId !== "2" && r.productId !== "3")).toBe(true);
  });

  it("keeps a broad user within the verified 550 mm seating option", () => {
    const result = recommendWheelchairs({ ...base, hipWidthMm: 533, use: { ...base.use, priorities: ["roominess"] } });
    expect(result.recommendations[0].productId).toBe("6");
  });

  it("caps quick-mode confidence", () => {
    const quick = { ...base, mode: "quick" as const, hipWidthMm: undefined, bodySeatDepthMm: undefined, lowerLegMm: undefined };
    expect(recommendWheelchairs(quick).recommendations.every((r) => r.confidence === "preliminary")).toBe(true);
  });
});
```

- [ ] **Step 2: Run ranking tests to verify the public recommender is absent**

Run: `npm.cmd test -- src/lib/wheelchair/recommend-ranking.test.ts`
Expected: FAIL because `recommendWheelchairs` does not exist.

- [ ] **Step 3: Implement deterministic scoring and grouping**

Add to `src/lib/wheelchair/recommend.ts`:

```ts
import { OFFICIAL_WHEELCHAIR_SPECS } from "@/data/wheelchair-specs";
import type { Confidence, MatchBand, Recommendation, VariantEvaluation } from "./types";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const closeness = (difference: number, zeroScoreAt: number) => clamp(1 - Math.abs(difference) / zeroScoreAt, 0, 1);

function confidenceFor(assessment: FinderAssessment, variant: WheelchairVariantSpec): Confidence {
  if (assessment.mode === "quick") return "preliminary";
  const critical = ["seatWidthMm", "seatDepthMm", "batteryVoltageV", "batteryWeightKg"];
  const hasIssue = critical.some((field) => variant.source.status[field] === "missing" || variant.source.status[field] === "conflicting");
  return hasIssue ? "moderate" : "high";
}

function bandFor(score: number): MatchBand {
  if (score >= FINDER_RULES.outputBands.best) return "best";
  if (score >= FINDER_RULES.outputBands.good) return "good";
  return "potential";
}

function scoreVariant(assessment: FinderAssessment, productId: string, variant: WheelchairVariantSpec): VariantEvaluation {
  const exclusions = evaluateHardConstraints(assessment, variant);
  if (exclusions.length > 0) {
    return { productId, variantId: variant.variantId, eligible: false, exclusions, score: 0, scoreParts: { fit: 0, environment: 0, transport: 0, preferences: 0 }, confidence: confidenceFor(assessment, variant), reasons: [], warnings: [] };
  }

  let fitRatio = 0.5;
  if (assessment.mode === "precision" && assessment.hipWidthMm && assessment.bodySeatDepthMm && assessment.lowerLegMm) {
    const widthGap = Math.min(variant.seatWidthMm, variant.armrestSpacingMm) - assessment.hipWidthMm;
    const depthClearance = assessment.bodySeatDepthMm - variant.seatDepthMm;
    const legDifference = assessment.lowerLegMm - variant.seatToFootrestMm;
    fitRatio = (closeness(widthGap - 20, 100) + closeness(depthClearance - FINDER_RULES.seatDepth.idealClearanceMm, 60) + closeness(legDifference, FINDER_RULES.footrest.hardToleranceMm)) / 3;
  } else {
    const capacityMargin = (variant.maxUserWeightKg - assessment.weightKg) / variant.maxUserWeightKg;
    const bodyTarget = assessment.bodyBuild === "slim" ? 430 : assessment.bodyBuild === "broad" ? 500 : 460;
    fitRatio = (clamp(capacityMargin / 0.35, 0, 1) + closeness(variant.seatWidthMm - bodyTarget, 140)) / 2;
  }

  const indoorRatio = (closeness(variant.turningRadiusMm - 800, 600) + closeness(variant.overallMm.width - 540, 180)) / 2;
  const outdoorRatio = (clamp(variant.obstacleHeightMm / 40, 0, 1) + clamp(variant.rearWheelMm / 330, 0, 1) + (variant.tireClass === "mixed-pneumatic" ? 1 : 0.65)) / 3;
  const environmentRatio = assessment.use.environment === "indoor" ? indoorRatio : assessment.use.environment === "outdoor" ? outdoorRatio : (indoorRatio + outdoorRatio) / 2;

  const volume = variant.foldedMm.length * variant.foldedMm.width * variant.foldedMm.height;
  const portability = (closeness(variant.netWeightWithoutBatteryKg - 15, 25) + closeness(volume - 150_000_000, 350_000_000)) / 2;
  const transportRatio = assessment.use.airlineTravel ? 1 : portability;
  const rangeRatio = clamp(variant.rangeKm / Math.max(assessment.use.dailyRangeKm, 1), 0, 1);
  const preferenceRatio = assessment.use.priorities.includes("range") ? rangeRatio : assessment.use.priorities.includes("roominess") ? clamp(variant.seatWidthMm / 550, 0, 1) : assessment.use.priorities.includes("rough-terrain") ? outdoorRatio : portability;

  const scoreParts = {
    fit: fitRatio * FINDER_RULES.scoreWeights.fit,
    environment: environmentRatio * FINDER_RULES.scoreWeights.environment,
    transport: transportRatio * FINDER_RULES.scoreWeights.transport,
    preferences: preferenceRatio * FINDER_RULES.scoreWeights.preferences,
  };
  const score = Math.round(Object.values(scoreParts).reduce((sum, value) => sum + value, 0));
  const warnings = Object.entries(variant.source.status)
    .filter(([, status]) => status === "missing" || status === "conflicting")
    .map(([field]) => `Official ${field} data needs confirmation.`);

  return {
    productId,
    variantId: variant.variantId,
    eligible: true,
    exclusions: [],
    score,
    scoreParts,
    confidence: confidenceFor(assessment, variant),
    reasons: [
      `Supports the entered ${assessment.use.environment} use profile.`,
      `Official capacity and seating constraints passed.`,
      `Provides ${Math.round(variant.rangeKm)} km of listed range.`,
    ],
    warnings,
  };
}

export function recommendWheelchairs(assessment: FinderAssessment): {
  recommendations: Recommendation[];
  evaluations: VariantEvaluation[];
} {
  const evaluations = OFFICIAL_WHEELCHAIR_SPECS.flatMap((product) =>
    product.variants.map((variant) => scoreVariant(assessment, product.productId, variant)),
  );

  const bestByProduct = new Map<string, VariantEvaluation>();
  evaluations.filter((evaluation) => evaluation.eligible).forEach((evaluation) => {
    const current = bestByProduct.get(evaluation.productId);
    if (!current || evaluation.score > current.score || (evaluation.score === current.score && evaluation.variantId < current.variantId)) {
      bestByProduct.set(evaluation.productId, evaluation);
    }
  });

  const recommendations = [...bestByProduct.values()]
    .filter((evaluation) => evaluation.score >= FINDER_RULES.outputBands.potential)
    .sort((a, b) => b.score - a.score || a.productId.localeCompare(b.productId))
    .slice(0, FINDER_RULES.maxRecommendations)
    .map((evaluation) => ({
      productId: evaluation.productId,
      variantId: evaluation.variantId,
      score: evaluation.score,
      band: bandFor(evaluation.score),
      confidence: evaluation.confidence,
      reasons: evaluation.reasons,
      warnings: evaluation.warnings,
    }));

  return { recommendations, evaluations };
}
```

- [ ] **Step 4: Run all recommendation tests**

Run: `npm.cmd test -- src/lib/wheelchair/recommend-hard-filters.test.ts src/lib/wheelchair/recommend-ranking.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit scoring and ranking**

```powershell
git add src/lib/wheelchair/recommend.ts src/lib/wheelchair/recommend-ranking.test.ts
git commit -m "feat: rank explainable wheelchair matches"
```

---

### Task 7: Validate assessment input and protect sensitive answers in storage

**Files:**
- Create: `src/lib/wheelchair/assessment-schema.ts`
- Create: `src/lib/wheelchair/assessment-schema.test.ts`
- Create: `src/hooks/useWheelchairAssessment.ts`
- Create: `src/hooks/useWheelchairAssessment.test.tsx`

- [ ] **Step 1: Write failing schema and privacy tests**

```ts
// src/lib/wheelchair/assessment-schema.test.ts
import { describe, expect, it } from "vitest";
import { assessmentSchema, sanitizeForAccount, sanitizeForLocalStorage } from "./assessment-schema";
import { inchesToMm, lbToKg, milesToKm } from "./units";

const valid = {
  mode: "precision", unitSystem: "us", heightMm: inchesToMm(68), weightKg: lbToKg(180), bodyBuild: "average",
  hipWidthMm: inchesToMm(17), bodySeatDepthMm: inchesToMm(19), lowerLegMm: inchesToMm(15.5),
  safety: { pressureInjuryConcern: false, posturalAsymmetry: false, customPositioningNeed: false },
  use: { environment: "mixed", surfaces: ["smooth"], tightSpaces: false, dailyRangeKm: milesToKm(10), airlineTravel: false, priorities: ["fit"] },
};

describe("assessment validation and privacy", () => {
  it("requires precision measurements only in precision mode", () => {
    expect(assessmentSchema.safeParse(valid).success).toBe(true);
    expect(assessmentSchema.safeParse({ ...valid, hipWidthMm: undefined }).success).toBe(false);
    expect(assessmentSchema.safeParse({ ...valid, mode: "quick", hipWidthMm: undefined, bodySeatDepthMm: undefined, lowerLegMm: undefined }).success).toBe(true);
  });

  it("rejects likely unit mistakes with broad non-clinical bounds", () => {
    expect(assessmentSchema.safeParse({ ...valid, weightKg: 900 }).success).toBe(false);
    expect(assessmentSchema.safeParse({ ...valid, hipWidthMm: 40 }).success).toBe(false);
  });

  it("never persists individual safety answers", () => {
    const risky = { ...valid, safety: { ...valid.safety, pressureInjuryConcern: true } };
    expect(JSON.stringify(sanitizeForLocalStorage(risky))).not.toContain("pressureInjuryConcern");
    expect(JSON.stringify(sanitizeForAccount(risky))).not.toContain("posturalAsymmetry");
  });
});
```

- [ ] **Step 2: Run tests to verify the schema is absent**

Run: `npm.cmd test -- src/lib/wheelchair/assessment-schema.test.ts`
Expected: FAIL because `assessment-schema.ts` does not exist.

- [ ] **Step 3: Implement Zod schemas and sanitizers**

```ts
// src/lib/wheelchair/assessment-schema.ts
import { z } from "zod";
import type { FinderAssessment } from "./types";

const dimensionsSchema = z.object({
  length: z.number().min(100).max(3000),
  width: z.number().min(100).max(3000),
  height: z.number().min(100).max(3000),
});

export const useProfileSchema = z.object({
  environment: z.enum(["indoor", "outdoor", "mixed"]),
  surfaces: z.array(z.enum(["smooth", "carpet", "grass", "gravel", "uneven"])).min(1),
  tightSpaces: z.boolean(),
  dailyRangeKm: z.number().min(1).max(100),
  airlineTravel: z.boolean(),
  storageMm: dimensionsSchema.optional(),
  maxLiftKg: z.number().min(2).max(100).optional(),
  priorities: z.array(z.enum(["fit", "portability", "range", "rough-terrain", "roominess"])).min(1).max(3),
});

export const assessmentSchema = z.object({
  mode: z.enum(["quick", "precision"]),
  unitSystem: z.enum(["us", "metric"]),
  heightMm: z.number().min(900).max(2500),
  weightKg: z.number().min(20).max(275),
  bodyBuild: z.enum(["slim", "average", "broad"]),
  hipWidthMm: z.number().min(200).max(760).optional(),
  bodySeatDepthMm: z.number().min(250).max(760).optional(),
  lowerLegMm: z.number().min(250).max(760).optional(),
  safety: z.object({
    pressureInjuryConcern: z.boolean(),
    posturalAsymmetry: z.boolean(),
    customPositioningNeed: z.boolean(),
  }),
  use: useProfileSchema,
}).superRefine((value, context) => {
  if (value.mode === "precision") {
    (["hipWidthMm", "bodySeatDepthMm", "lowerLegMm"] as const).forEach((field) => {
      if (value[field] === undefined) context.addIssue({ code: "custom", path: [field], message: "Required for precision matching" });
    });
  }
});

export type AssessmentInput = z.infer<typeof assessmentSchema>;

export function requiresProfessionalAssessment(assessment: FinderAssessment) {
  return Object.values(assessment.safety).some(Boolean);
}

export function sanitizeForLocalStorage(assessment: FinderAssessment) {
  const { safety: _safety, ...rest } = assessment;
  return rest;
}

export function sanitizeForAccount(assessment: FinderAssessment) {
  return {
    ...sanitizeForLocalStorage(assessment),
    professionalAssessmentRequired: requiresProfessionalAssessment(assessment),
  };
}
```

- [ ] **Step 4: Implement a reducer hook with local resume**

`useWheelchairAssessment.ts` must:

- keep the complete safety answers only in React state;
- write only `sanitizeForLocalStorage(assessment)` under key `goldseason:wheelchair-finder:v1`;
- restore non-sensitive progress on mount and reset safety answers to false;
- expose `assessment`, `step`, `update`, `next`, `back`, `reset`, and `result`;
- call `recommendWheelchairs` only after a valid final assessment;
- remove the storage key on reset.

Write a hook test with `renderHook` that updates a risky safety answer, advances, and asserts the localStorage value contains no safety field.

- [ ] **Step 5: Run schema and hook tests**

Run: `npm.cmd test -- src/lib/wheelchair/assessment-schema.test.ts src/hooks/useWheelchairAssessment.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit assessment state and privacy**

```powershell
git add src/lib/wheelchair/assessment-schema.ts src/lib/wheelchair/assessment-schema.test.ts src/hooks/useWheelchairAssessment.ts src/hooks/useWheelchairAssessment.test.tsx
git commit -m "feat: validate and persist finder progress safely"
```

---

### Task 8: Generate and verify realistic measurement-guide images

**Files:**
- Create: `public/wheelchair-finder/measure-hip-width.png`
- Create: `public/wheelchair-finder/measure-seat-depth.png`
- Create: `public/wheelchair-finder/measure-lower-leg.png`

- [ ] **Step 1: Generate the hip-width guide using the image generation skill**

Prompt:

```text
Photorealistic instructional healthcare photograph in a bright, typical American living room. An adult wheelchair user sits upright in a neutral, comfortable posture on a firm chair while a caregiver uses a rigid measuring tape horizontally across the widest points of the hips. Show both tape endpoints clearly, hands fully visible, no brand logos, no text baked into the image, respectful non-clinical tone, diverse adult subjects, natural daylight, landscape 4:3 composition with clear space on the right for website annotations.
```

Save exactly to `public/wheelchair-finder/measure-hip-width.png`.

- [ ] **Step 2: Generate the body seat-depth guide**

Prompt:

```text
Photorealistic instructional healthcare photograph in a typical American home. Side view of an adult seated upright on a firm chair, hips fully against the backrest, while a caregiver measures from the back of the pelvis along the thigh to the back of the knee. The tape path and both landmarks are visually unambiguous, feet supported, no logos, no embedded text, respectful and realistic, landscape 4:3 composition with room for web callouts.
```

Save exactly to `public/wheelchair-finder/measure-seat-depth.png`.

- [ ] **Step 3: Generate the lower-leg guide**

Prompt:

```text
Photorealistic instructional healthcare photograph in an American home setting. Side view of an adult seated upright with knee near 90 degrees and shoe on, while a caregiver measures vertically from the underside of the thigh at the knee to the bottom of the heel. Make the start and end points clear, show the complete lower leg and measuring tape, no logos, no embedded text, realistic daylight, respectful presentation, landscape 4:3 composition.
```

Save exactly to `public/wheelchair-finder/measure-lower-leg.png`.

- [ ] **Step 4: Visually verify every image**

Use `view_image` on all three files at original detail. Reject and regenerate any image with impossible hands, bent tape paths, ambiguous endpoints, inaccessible contrast, medical branding, or measurements that do not match the written method.

- [ ] **Step 5: Commit verified assets**

```powershell
git add public/wheelchair-finder/measure-hip-width.png public/wheelchair-finder/measure-seat-depth.png public/wheelchair-finder/measure-lower-leg.png
git commit -m "feat: add guided wheelchair measurement photos"
```

---

### Task 9: Build the accessible finder shell, basic step, and safety gate

**Files:**
- Create: `src/app/wheelchair-finder/page.tsx`
- Create: `src/components/wheelchair-finder/WheelchairFinder.tsx`
- Create: `src/components/wheelchair-finder/FinderProgress.tsx`
- Create: `src/components/wheelchair-finder/BasicStep.tsx`
- Create: `src/components/wheelchair-finder/SafetyStep.tsx`
- Create: `src/components/wheelchair-finder/WheelchairFinder.test.tsx`

- [ ] **Step 1: Write a failing interaction test**

```tsx
// src/components/wheelchair-finder/WheelchairFinder.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { WheelchairFinder } from "./WheelchairFinder";

describe("WheelchairFinder", () => {
  it("starts without sign-in and reaches the safety screen", async () => {
    const user = userEvent.setup();
    render(<WheelchairFinder />);
    expect(screen.getByRole("heading", { name: /find my wheelchair/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /start assessment/i }));
    await user.type(screen.getByLabelText(/height/i), "68");
    await user.type(screen.getByLabelText(/weight/i), "180");
    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByRole("heading", { name: /when automated matching is not appropriate/i })).toBeInTheDocument();
  });

  it("stops and explains professional assessment when a safety answer is yes", async () => {
    const user = userEvent.setup();
    render(<WheelchairFinder initialStep="safety" />);
    await user.click(screen.getByLabelText(/pressure injury/i));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByRole("heading", { name: /professional assessment recommended/i })).toBeInTheDocument();
    expect(screen.queryByText(/best match/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the component test to verify the finder is missing**

Run: `npm.cmd test -- src/components/wheelchair-finder/WheelchairFinder.test.tsx`
Expected: FAIL because the finder components do not exist.

- [ ] **Step 3: Create the route and accessible shell**

```tsx
// src/app/wheelchair-finder/page.tsx
import type { Metadata } from "next";
import { WheelchairFinder } from "@/components/wheelchair-finder/WheelchairFinder";

export const metadata: Metadata = {
  title: "Find My Wheelchair | GoldSeason",
  description: "Compare GoldSeason powered wheelchairs using your measurements, travel needs, and everyday environment.",
};

export default function WheelchairFinderPage() {
  return <WheelchairFinder />;
}
```

`WheelchairFinder.tsx` must use `useWheelchairAssessment`, render one semantic `<main>`, maintain focus on the step `<h1>` after transitions, expose an `aria-live="polite"` status, and accept an optional `initialStep` only for deterministic component tests.

`FinderProgress.tsx` must render an ordered list with `aria-current="step"` and the visible text `Step N of 5`.

`BasicStep.tsx` must:

- default to inches and pounds;
- switch displayed values without changing canonical millimetres/kilograms;
- allow Quick and Precision mode selection;
- include labeled number inputs with inline errors and `aria-describedby`;
- explain that Quick results are preliminary.

`SafetyStep.tsx` must:

- use three explicit Yes/No fieldsets;
- avoid diagnostic language;
- say that safety answers are not saved;
- route any Yes answer to `NoMatchState` kind `professional`.

- [ ] **Step 4: Run component, lint, and type checks**

Run: `npm.cmd test -- src/components/wheelchair-finder/WheelchairFinder.test.tsx`
Expected: PASS, 2 tests.

Run: `npx.cmd tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit the first usable finder path**

```powershell
git add src/app/wheelchair-finder/page.tsx src/components/wheelchair-finder src/hooks/useWheelchairAssessment.ts
git commit -m "feat: add finder basics and safety gate"
```

---

### Task 10: Add guided precision measurements and adaptable scenario questions

**Files:**
- Create: `src/components/wheelchair-finder/MeasurementGuide.tsx`
- Create: `src/components/wheelchair-finder/MeasurementStep.tsx`
- Create: `src/components/wheelchair-finder/ScenarioStep.tsx`
- Create: `src/components/wheelchair-finder/MeasurementStep.test.tsx`
- Create: `src/components/wheelchair-finder/ScenarioStep.test.tsx`
- Modify: `src/components/wheelchair-finder/WheelchairFinder.tsx`

- [ ] **Step 1: Write failing measurement and scenario tests**

Test these observable behaviors:

```tsx
it("requires all three precision measurements and opens each guide", async () => {
  render(<MeasurementStep unitSystem="us" values={{}} onChange={() => undefined} onContinue={() => undefined} onBack={() => undefined} />);
  expect(screen.getByRole("img", { name: /measuring hip width/i })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /continue/i }));
  expect(screen.getAllByText(/required for precision matching/i)).toHaveLength(3);
});

it("reveals storage dimensions only when the customer knows them", async () => {
  render(<ScenarioStep value={defaultUseProfile} onChange={() => undefined} onContinue={() => undefined} onBack={() => undefined} />);
  expect(screen.queryByLabelText(/storage length/i)).not.toBeInTheDocument();
  await userEvent.click(screen.getByLabelText(/i know my storage dimensions/i));
  expect(screen.getByLabelText(/storage length/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify the components are absent**

Run: `npm.cmd test -- src/components/wheelchair-finder/MeasurementStep.test.tsx src/components/wheelchair-finder/ScenarioStep.test.tsx`
Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement `MeasurementGuide` and `MeasurementStep`**

`MeasurementGuide` props must be:

```ts
interface MeasurementGuideProps {
  id: "hip-width" | "seat-depth" | "lower-leg";
  title: string;
  imageSrc: string;
  imageAlt: string;
  steps: string[];
  commonErrors: string[];
}
```

Use these exact methods:

- Hip width: sit upright on a firm surface; place two rigid books vertically at the widest hip points; measure the inside distance.
- Body seat depth: sit with pelvis against the back support; measure from the back of the pelvis to the back of the knee; do not subtract clearance in the UI because the engine applies 30–50 mm.
- Lower leg: with shoe on and knee near 90 degrees, measure from the underside of the thigh at the knee to the bottom of the heel.

Use `next/image` for all three guides with `width={960}`, `height={720}`, and responsive `sizes`.

- [ ] **Step 4: Implement the scenario step**

The form must expose:

- one environment choice: indoor, outdoor, or mixed;
- one or more surfaces: smooth, carpet, grass, gravel, uneven;
- tight-space toggle;
- required daily range;
- airline travel toggle with a non-guarantee note;
- optional storage length/width/height;
- optional maximum lifting weight;
- one to three priorities.

Do not ask for diagnoses, age, or caregiver identity. Keep all values canonical inside state.

- [ ] **Step 5: Connect quick and precision branches**

Quick mode skips `MeasurementStep` and sets final confidence to preliminary. Precision mode requires the measurement step. Both modes continue to the same `ScenarioStep` and deterministic result calculation.

- [ ] **Step 6: Run tests and commit**

Run: `npm.cmd test -- src/components/wheelchair-finder/MeasurementStep.test.tsx src/components/wheelchair-finder/ScenarioStep.test.tsx`
Expected: PASS.

```powershell
git add src/components/wheelchair-finder/MeasurementGuide.tsx src/components/wheelchair-finder/MeasurementStep.tsx src/components/wheelchair-finder/ScenarioStep.tsx src/components/wheelchair-finder/MeasurementStep.test.tsx src/components/wheelchair-finder/ScenarioStep.test.tsx src/components/wheelchair-finder/WheelchairFinder.tsx
git commit -m "feat: add guided fit and scenario questions"
```

---

### Task 11: Present explainable results, comparisons, and safe no-match states

**Files:**
- Create: `src/components/wheelchair-finder/FinderResults.tsx`
- Create: `src/components/wheelchair-finder/ProductComparison.tsx`
- Create: `src/components/wheelchair-finder/NoMatchState.tsx`
- Create: `src/components/wheelchair-finder/FinderResults.test.tsx`
- Modify: `src/components/wheelchair-finder/WheelchairFinder.tsx`

- [ ] **Step 1: Write failing result-state tests**

Cover:

- one to three recommendation cards with product name, match band, confidence, reasons, warnings, official variant, comparison checkbox, and purchase link;
- Quick mode never renders `High confidence`;
- a hard-no-match state lists exact failed constraints and never shows `closest match`;
- a soft-conflict state offers only removable preference chips;
- changing a soft preference recomputes without relaxing capacity or seating exclusions.

Use this core assertion:

```tsx
expect(screen.getAllByRole("article", { name: /match/i }).length).toBeLessThanOrEqual(3);
expect(screen.getByText(/official capacity and seating constraints passed/i)).toBeInTheDocument();
expect(screen.queryByText(/guaranteed fit/i)).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the test to verify result components are absent**

Run: `npm.cmd test -- src/components/wheelchair-finder/FinderResults.test.tsx`
Expected: FAIL because the result modules do not exist.

- [ ] **Step 3: Implement result and comparison contracts**

`FinderResults` must receive only:

```ts
interface FinderResultsProps {
  assessment: FinderAssessment;
  recommendations: Recommendation[];
  evaluations: VariantEvaluation[];
  onEditMeasurements(): void;
  onEditScenario(): void;
  onReset(): void;
}
```

Resolve product display data through `productById` and official variant facts through `getWheelchairSpec`. Comparison rows must be: seat width, seat depth, maximum user weight, lift weight, folded size, range, turning radius, obstacle height, and airline verification. Use `formatLength`, `formatWeight`, and `formatRange`; never use hardcoded English conversions in JSX.

Purchase buttons use the existing `amazonLink` when present. If absent, link to `/products#products` and label the action `View product options`.

- [ ] **Step 4: Implement no-match taxonomy**

`NoMatchState` receives `kind`, failed codes, and editable soft preferences. It must render:

- professional: OT/ATP guidance and restart;
- incomplete: direct link back to the missing field;
- hard: required product characteristics without recommending a failing product;
- soft-conflict: buttons to relax only range, portability, terrain, or roominess preferences.

- [ ] **Step 5: Run tests and commit**

Run: `npm.cmd test -- src/components/wheelchair-finder/FinderResults.test.tsx`
Expected: PASS.

```powershell
git add src/components/wheelchair-finder/FinderResults.tsx src/components/wheelchair-finder/ProductComparison.tsx src/components/wheelchair-finder/NoMatchState.tsx src/components/wheelchair-finder/FinderResults.test.tsx src/components/wheelchair-finder/WheelchairFinder.tsx
git commit -m "feat: explain wheelchair recommendations and no-match states"
```

---

### Task 12: Add the Products-page entry and official quick-view facts

**Files:**
- Modify: `src/app/products/page.tsx:349-467,839-925`
- Create: `src/app/products/products-page.test.tsx`

- [ ] **Step 1: Write a failing Products-page test**

Mock animation wrappers and the cart context, then assert:

```tsx
expect(screen.getByRole("link", { name: /find my wheelchair/i })).toHaveAttribute("href", "/wheelchair-finder");
expect(screen.getByText("33.1 lb without battery")).toBeInTheDocument();
expect(screen.queryByText("Ultra Light 19lbs")).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the test to verify the CTA is absent**

Run: `npm.cmd test -- src/app/products/products-page.test.tsx`
Expected: FAIL because the finder link is absent.

- [ ] **Step 3: Add the prominent finder entry**

In the hero action group after `Shop on Amazon`, add:

```tsx
<Button asChild size="lg" className="bg-white text-[#3D3330] hover:bg-[#F5EFE9]">
  <Link href="/wheelchair-finder">Find My Wheelchair</Link>
</Button>
```

Keep `View All Products` as the third action and ensure the mobile stack has no horizontal overflow.

- [ ] **Step 4: Replace quick-view labels with official fields**

For wheelchair records, render `weight`, `range`, and `seatWidth`. Keep speed and warranty. Change the weight label to `Weight without battery` so the number cannot be mistaken for total transport weight. Remove inaccurate marketing feature pills from wheelchair cards and replace them with the central catalog's official `features` values.

- [ ] **Step 5: Run Products tests, lint, and build**

Run: `npm.cmd test -- src/app/products/products-page.test.tsx`
Expected: PASS.

Run: `npm.cmd run lint`
Expected: PASS with no new warnings.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit the storefront integration**

```powershell
git add src/app/products/page.tsx src/app/products/products-page.test.tsx
git commit -m "feat: connect products to wheelchair finder"
```

---

### Task 13: Add additive Prisma persistence with an explicit SQL migration

**Files:**
- Modify: `prisma/schema.prisma:10-22`
- Create: `prisma/migrations/20260805000000_add_wheelchair_finder/migration.sql`

- [ ] **Step 1: Extend the Prisma schema without applying it to production**

Add these relations to `User`:

```prisma
  wheelchairAssessments WheelchairAssessment[]
```

Add:

```prisma
model WheelchairAssessment {
  id                 String   @id @default(cuid())
  userId             String
  label              String?
  assessment         Json
  resultSnapshot     Json
  productDataVersion String
  rulesVersion       String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("wheelchair_assessments")
}

model WheelchairSupportSummary {
  id                 String   @id @default(cuid())
  code               String   @unique
  assessment         Json
  resultSnapshot     Json
  productDataVersion String
  rulesVersion       String
  expiresAt          DateTime
  createdAt          DateTime @default(now())

  @@index([expiresAt])
  @@map("wheelchair_support_summaries")
}

model WheelchairFinderEvent {
  id        String   @id @default(cuid())
  sessionId String
  event     String
  step      String?
  reason    String?
  productId String?
  createdAt DateTime @default(now())

  @@index([event, createdAt])
  @@index([sessionId, createdAt])
  @@map("wheelchair_finder_events")
}
```

- [ ] **Step 2: Add an exact additive migration**

Create SQL that adds only the three new tables, their indexes, and the `wheelchair_assessments_userId_fkey` foreign key with `ON DELETE CASCADE ON UPDATE CASCADE`. Do not alter or recreate `users`, `orders`, `reviews`, or `promo_codes`.

Use PostgreSQL types:

- identifiers and versions: `TEXT`;
- JSON fields: `JSONB`;
- dates: `TIMESTAMP(3)`;
- primary keys: explicit table constraints;
- unique support code index: `CREATE UNIQUE INDEX`.

Use this exact migration:

```sql
CREATE TABLE "wheelchair_assessments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "assessment" JSONB NOT NULL,
    "resultSnapshot" JSONB NOT NULL,
    "productDataVersion" TEXT NOT NULL,
    "rulesVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wheelchair_assessments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "wheelchair_support_summaries" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "assessment" JSONB NOT NULL,
    "resultSnapshot" JSONB NOT NULL,
    "productDataVersion" TEXT NOT NULL,
    "rulesVersion" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wheelchair_support_summaries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "wheelchair_finder_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "step" TEXT,
    "reason" TEXT,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wheelchair_finder_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "wheelchair_assessments_userId_createdAt_idx"
    ON "wheelchair_assessments"("userId", "createdAt");

CREATE UNIQUE INDEX "wheelchair_support_summaries_code_key"
    ON "wheelchair_support_summaries"("code");

CREATE INDEX "wheelchair_support_summaries_expiresAt_idx"
    ON "wheelchair_support_summaries"("expiresAt");

CREATE INDEX "wheelchair_finder_events_event_createdAt_idx"
    ON "wheelchair_finder_events"("event", "createdAt");

CREATE INDEX "wheelchair_finder_events_sessionId_createdAt_idx"
    ON "wheelchair_finder_events"("sessionId", "createdAt");

ALTER TABLE "wheelchair_assessments"
    ADD CONSTRAINT "wheelchair_assessments_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
```

- [ ] **Step 3: Validate and generate locally**

Run: `npx.cmd prisma format`
Expected: schema formatted.

Run: `npx.cmd prisma validate`
Expected: `The schema at prisma/schema.prisma is valid`.

Run: `npx.cmd prisma generate`
Expected: Prisma client generated successfully.

- [ ] **Step 4: Commit schema and migration without touching Neon**

```powershell
git add prisma/schema.prisma prisma/migrations/20260805000000_add_wheelchair_finder/migration.sql
git commit -m "feat: add wheelchair assessment persistence schema"
```

Do not run `prisma db push`, `prisma migrate reset`, or a production migration in this task.

---

### Task 14: Add authenticated saving and the account assessment list

**Files:**
- Create: `src/app/api/wheelchair-assessments/route.ts`
- Create: `src/app/api/wheelchair-assessments/[id]/route.ts`
- Create: `src/app/api/wheelchair-assessments/route.test.ts`
- Create: `src/components/wheelchair-finder/SaveAssessmentButton.tsx`
- Create: `src/components/wheelchair-finder/SavedAssessmentList.tsx`
- Create: `src/app/account/wheelchair-assessments/page.tsx`
- Modify: `src/app/account/page.tsx:19-23,49-61`

- [ ] **Step 1: Write failing Route Handler authorization and sanitization tests**

Mock `getServerSession` and `prisma`. Verify:

- unauthenticated GET and POST return 401;
- POST rejects any payload containing a `safety` object;
- POST stores `productDataVersion` and `rulesVersion` from server constants, not request values;
- GET filters by `session.user.id` and sorts newest first;
- DELETE filters by both `id` and `userId`, returning 404 when no owned row exists.

- [ ] **Step 2: Run route tests to verify handlers are absent**

Run: `npm.cmd test -- src/app/api/wheelchair-assessments/route.test.ts`
Expected: FAIL because the handlers do not exist.

- [ ] **Step 3: Implement strict save payload validation**

Use this server schema:

```ts
import { z } from "zod";
import { useProfileSchema } from "@/lib/wheelchair/assessment-schema";

const saveAssessmentSchema = z.object({
  label: z.string().trim().min(1).max(80).optional(),
  assessment: z.object({
    mode: z.enum(["quick", "precision"]),
    unitSystem: z.enum(["us", "metric"]),
    heightMm: z.number(),
    weightKg: z.number(),
    bodyBuild: z.enum(["slim", "average", "broad"]),
    hipWidthMm: z.number().optional(),
    bodySeatDepthMm: z.number().optional(),
    lowerLegMm: z.number().optional(),
    professionalAssessmentRequired: z.boolean(),
    use: useProfileSchema,
  }).strict(),
  resultSnapshot: z.object({
    recommendations: z.array(z.object({
      productId: z.string(), variantId: z.string(), score: z.number(), band: z.enum(["best", "good", "potential"]), confidence: z.enum(["preliminary", "moderate", "high"]),
    })).max(3),
  }),
}).strict();
```

Recompute the recommendation server-side from the sanitized assessment and reject a snapshot whose product IDs or variant IDs differ. This prevents clients from saving fabricated matches.

- [ ] **Step 4: Add account UI**

`SaveAssessmentButton` shows:

- signed out: `Sign in to save`, linking to `/auth/signin?callbackUrl=/wheelchair-finder`;
- signed in: POST button with pending, success, and retry states.

`/account/wheelchair-assessments` is a force-dynamic server page protected with the same `getServerSession`/`redirect` pattern as `/account`. Render the latest assessment name/date and up to three saved recommendations through `productById`.

`SavedAssessmentList` owns delete confirmation and calls the DELETE route.

Add an `Assessments` count card and `View saved matches` link to `src/app/account/page.tsx`.

- [ ] **Step 5: Run tests, type check, and build**

Run: `npm.cmd test -- src/app/api/wheelchair-assessments/route.test.ts`
Expected: PASS.

Run: `npx.cmd tsc --noEmit`
Expected: PASS.

Run: `npm run build`
Expected: PASS with generated Prisma client.

- [ ] **Step 6: Commit authenticated persistence**

```powershell
git add src/app/api/wheelchair-assessments src/components/wheelchair-finder/SaveAssessmentButton.tsx src/components/wheelchair-finder/SavedAssessmentList.tsx src/app/account/wheelchair-assessments/page.tsx src/app/account/page.tsx
git commit -m "feat: save wheelchair matches to customer accounts"
```

---

### Task 15: Add expiring support summaries and privacy-safe funnel events

**Files:**
- Create: `src/app/api/wheelchair-support-summaries/route.ts`
- Create: `src/app/api/wheelchair-support-summaries/[code]/route.ts`
- Create: `src/app/api/wheelchair-support-summaries/route.test.ts`
- Create: `src/app/api/wheelchair-finder-events/route.ts`
- Create: `src/app/api/wheelchair-finder-events/route.test.ts`
- Create: `src/components/wheelchair-finder/SupportSummaryButton.tsx`
- Create: `src/app/wheelchair-finder/support/[code]/page.tsx`
- Create: `src/lib/wheelchair/analytics.ts`

- [ ] **Step 1: Write failing privacy and expiry tests**

Verify:

- support-summary POST rejects `safety`, email, name, phone, address, free-text medical notes, and more than three recommendations;
- support code is generated server-side from 12 random bytes using base64url and expires in 30 days;
- expired GET returns 410;
- event POST accepts only `finder_started`, `step_completed`, `measurement_help_opened`, `no_match`, `comparison_opened`, `purchase_clicked`, `support_summary_created`, and `finder_completed`;
- event payload accepts only sessionId, step, reason category, and productId;
- measurements and arbitrary context keys return 400.

- [ ] **Step 2: Run route tests to verify handlers are absent**

Run: `npm.cmd test -- src/app/api/wheelchair-support-summaries/route.test.ts src/app/api/wheelchair-finder-events/route.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement support-summary creation and view**

Generate the code with:

```ts
import { randomBytes } from "node:crypto";
const code = randomBytes(12).toString("base64url");
```

Set `expiresAt` to exactly `new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)`. Persist `sanitizeForAccount(assessment)` and a server-recomputed result snapshot. Return `{ code, url: `/wheelchair-finder/support/${code}`, expiresAt }`.

The support page must show measurement and scenario summaries, exact rule version, product data version, ranked products, reasons, and warnings. It must not show or infer safety answers. Add `robots: { index: false, follow: false }` metadata.

- [ ] **Step 4: Implement the event allowlist adapter**

```ts
// src/lib/wheelchair/analytics.ts
export type FinderEventName =
  | "finder_started" | "step_completed" | "measurement_help_opened" | "no_match"
  | "comparison_opened" | "purchase_clicked" | "support_summary_created" | "finder_completed";

export async function trackFinderEvent(
  event: FinderEventName,
  data: { sessionId: string; step?: string; reason?: string; productId?: string },
) {
  await fetch("/api/wheelchair-finder-events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event, ...data }),
    keepalive: true,
  }).catch(() => undefined);
}
```

Generate the anonymous `sessionId` once with `crypto.randomUUID()` and store it separately from measurements. Never send height, weight, hip width, seat depth, lower-leg length, safety answers, names, email, IP-derived fields, or user-agent strings in the event body.

- [ ] **Step 5: Run tests and commit**

Run: `npm.cmd test -- src/app/api/wheelchair-support-summaries/route.test.ts src/app/api/wheelchair-finder-events/route.test.ts`
Expected: PASS.

```powershell
git add src/app/api/wheelchair-support-summaries src/app/api/wheelchair-finder-events src/components/wheelchair-finder/SupportSummaryButton.tsx src/app/wheelchair-finder/support src/lib/wheelchair/analytics.ts
git commit -m "feat: add self-service support summaries and finder metrics"
```

---

### Task 16: Add browser, accessibility, responsive, and final regression verification

**Files:**
- Create: `e2e/wheelchair-finder.spec.ts`
- Create: `e2e/wheelchair-finder-accessibility.spec.ts`
- Modify: finder components only when a failing test identifies a defect

- [ ] **Step 1: Write complete quick, precision, and no-match E2E flows**

`e2e/wheelchair-finder.spec.ts` must cover:

```ts
import { expect, type Page, test } from "@playwright/test";

async function completeBasics(page: Page, mode: "Quick match" | "Precision match") {
  await page.goto("/wheelchair-finder");
  await page.getByRole("button", { name: "Start assessment" }).click();
  await page.getByLabel("Height").fill("68");
  await page.getByLabel("Weight").fill("180");
  await page.getByLabel(mode).check();
  await page.getByRole("button", { name: "Continue" }).click();
}

async function answerSafetyNo(page: Page) {
  await page.getByRole("button", { name: "No pressure injury concern" }).click();
  await page.getByRole("button", { name: "No postural asymmetry" }).click();
  await page.getByRole("button", { name: "No custom positioning need" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
}

async function completeScenario(page: Page, priority: "Fit priority" | "Portability priority") {
  await page.getByLabel("Mixed indoor and outdoor").check();
  await page.getByLabel("Smooth surfaces").check();
  await page.getByLabel("Daily range").fill("10");
  await page.getByLabel(priority).check();
  await page.getByRole("button", { name: "See my matches" }).click();
}

test("quick flow returns preliminary explainable matches", async ({ page }) => {
  await completeBasics(page, "Quick match");
  await answerSafetyNo(page);
  await completeScenario(page, "Fit priority");
  await expect(page.getByText("Preliminary match").first()).toBeVisible();
  await expect(page.getByText("Guaranteed fit")).toHaveCount(0);
});

test("precision airline flow keeps only verified travel candidates", async ({ page }) => {
  await completeBasics(page, "Precision match");
  await answerSafetyNo(page);
  await page.getByLabel("Hip width").fill("17");
  await page.getByLabel("Body seat depth").fill("19");
  await page.getByLabel("Lower-leg length").fill("15.5");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("I need airline travel").check();
  await completeScenario(page, "Portability priority");
  await expect(page.getByRole("heading", { name: "Travel Air W 03" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Travel Air W 21" })).toHaveCount(0);
});

test("a safety flag never displays product recommendations", async ({ page }) => {
  await completeBasics(page, "Quick match");
  await page.getByRole("button", { name: "Yes, pressure injury concern" }).click();
  await page.getByRole("button", { name: "No postural asymmetry" }).click();
  await page.getByRole("button", { name: "No custom positioning need" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Professional assessment recommended" })).toBeVisible();
  await expect(page.getByText("Best match")).toHaveCount(0);
});
```

- [ ] **Step 2: Add accessibility scanning and keyboard-only flow**

```ts
// e2e/wheelchair-finder-accessibility.spec.ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("finder has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto("/wheelchair-finder");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("finder can start and advance with keyboard only", async ({ page }) => {
  await page.goto("/wheelchair-finder");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: /your basics/i })).toBeFocused();
});
```

- [ ] **Step 3: Run unit and component tests**

Run: `npm.cmd test`
Expected: all tests PASS.

- [ ] **Step 4: Run browser tests on desktop and mobile Chrome**

Run: `npm.cmd run test:e2e`
Expected: all finder and accessibility tests PASS in both configured projects.

- [ ] **Step 5: Run final static and production checks**

Run: `npm.cmd run lint`
Expected: PASS with no new warnings.

Run: `npx.cmd tsc --noEmit`
Expected: PASS.

Run: `npx.cmd prisma validate`
Expected: schema valid.

Run: `npm run build`
Expected: PASS and route table includes `/wheelchair-finder`, the three finder API groups, account assessments, and support summary route.

- [ ] **Step 6: Perform a manual visual and content pass**

Verify at 375×812, 768×1024, and 1440×900:

- no clipped measurement instructions;
- 44×44 px minimum touch targets;
- visible focus rings;
- progress and errors announced;
- images match the measurement text;
- comparison table scrolls horizontally only inside its container;
- no recommendation says `guaranteed`, `medical advice`, or `airline approved`;
- all displayed official numbers match the quality document;
- unit switching preserves the underlying value.

- [ ] **Step 7: Commit final verification coverage**

```powershell
git add e2e src docs/product-data
git commit -m "test: verify wheelchair finder end to end"
```

---

### Task 17: Apply the additive migration to a Neon preview branch and deploy a Vercel preview

**Files:**
- No source changes expected unless preview verification finds a defect

- [ ] **Step 1: Create or select a Neon database branch for preview**

Do not use the production connection string. Set the worktree's preview `DATABASE_URL` to the Neon branch connection string and confirm the hostname/database before any migration.

- [ ] **Step 2: Apply only committed migrations to preview**

Run: `npx.cmd prisma migrate deploy`
Expected: `20260805000000_add_wheelchair_finder` applied successfully; existing `users`, `orders`, `reviews`, and `promo_codes` remain intact.

Run a read-only schema inspection and confirm the three new tables and indexes exist.

- [ ] **Step 3: Link the isolated worktree to the correct Vercel project**

Run:

```powershell
npx.cmd vercel link --project brand-website --scope ethan-sakima-project --yes
npx.cmd vercel env pull .env.local --environment=preview --yes
```

Expected: `.vercel/project.json` points to project `brand-website`; `.vercel` and `.env.local` remain ignored.

- [ ] **Step 4: Deploy preview only**

Run: `npx.cmd vercel deploy --yes`
Expected: a READY preview deployment URL. Do not use `--prod`.

- [ ] **Step 5: Verify the preview story**

Run the Playwright suite against the preview URL by overriding `PLAYWRIGHT_BASE_URL` after adding this environment override to `playwright.config.ts`:

```ts
baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100",
```

Expected: quick, precision, no-match, save, support-summary, responsive, and accessibility checks pass.

- [ ] **Step 6: Stop for user approval before production**

Provide the preview URL, data-quality limitations, test results, and migration evidence. Production database migration, production deployment, GitHub push, and merge require explicit user approval after preview review.

---

## Final acceptance checklist

- [ ] Product cards, quick view, comparison, and finder use the same central catalog.
- [ ] All seven powered-wheelchair storefront products map to official variants.
- [ ] Metric-source conflicts are corrected by deriving US values; corrections are documented.
- [ ] Hard capacity, width, depth, footrest, storage, lifting, travel, and professional-assessment rules cannot be overridden by scores.
- [ ] Quick mode is always labeled preliminary.
- [ ] Precision mode uses guided hip, body seat-depth, and lower-leg measurements.
- [ ] No-match states explain the exact reason and never force a closest product.
- [ ] Anonymous progress works without login and excludes safety answers from storage.
- [ ] Account saves exclude individual safety answers and are server-recomputed.
- [ ] Support summaries are explicit, high-entropy, expire after 30 days, and contain no safety answers.
- [ ] Analytics events contain no body measurements, contact information, safety answers, or free text.
- [ ] Desktop/mobile, keyboard, screen-reader semantics, and automated WCAG A/AA checks pass.
- [ ] `npm.cmd test`, `npm.cmd run lint`, `npx.cmd tsc --noEmit`, `npx.cmd prisma validate`, `npm run build`, and preview Playwright checks pass.
- [ ] Production migration and deployment remain gated on explicit approval.
