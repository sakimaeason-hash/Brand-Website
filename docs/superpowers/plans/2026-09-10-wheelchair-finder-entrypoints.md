# Wheelchair Finder Entrypoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $subagent-driven-development (recommended) or $executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing wheelchair fit finder easy to discover from desktop navigation, the mobile menu, and the homepage hero.

**Architecture:** Keep `/wheelchair-finder` and all recommendation logic unchanged. Reuse the existing shared `navLinks` data for desktop and mobile navigation, and add one direct Next.js `Link` to the existing homepage hero CTA group. Verify the same destination through focused component tests and responsive browser tests.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Vitest, Testing Library, Playwright

---

## File Structure

- Create `src/components/layout/Header.test.tsx`: verifies that the shared navigation exposes the Finder on desktop and after opening the mobile menu.
- Modify `src/components/layout/Header.tsx`: adds the highlighted Finder navigation item and accessible mobile menu state.
- Create `src/components/HomePageClient.test.tsx`: verifies that the homepage hero exposes a direct Finder CTA.
- Modify `src/components/HomePageClient.tsx`: adds the Finder hero CTA while preserving Amazon and product links.
- Create `e2e/wheelchair-finder-entrypoints.spec.ts`: verifies visible entrypoints, navigation, and horizontal layout on desktop and mobile.

### Task 1: Add The Shared Navigation Entrypoint

**Files:**
- Create: `src/components/layout/Header.test.tsx`
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Write the failing Header test**

Create a Testing Library test that supplies deterministic unauthenticated session and empty cart state, renders `Header`, and checks both navigation modes:

```tsx
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signOut: vi.fn(),
}));

vi.mock("@/context/CartContext", () => ({
  useCart: () => ({ totalItems: 0 }),
}));

import Header from "./Header";

describe("Header wheelchair finder entrypoint", () => {
  beforeEach(() => vi.clearAllMocks());

  it("links to the finder from desktop and mobile navigation", () => {
    render(<Header />);

    const desktopNav = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(within(desktopNav).getByRole("link", { name: "Find Your Fit" }))
      .toHaveAttribute("href", "/wheelchair-finder");

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    const mobileNav = screen.getByRole("navigation", { name: "Mobile navigation" });
    expect(within(mobileNav).getByRole("link", { name: "Find Your Fit" }))
      .toHaveAttribute("href", "/wheelchair-finder");
  });
});
```

- [ ] **Step 2: Run the Header test and verify RED**

Run:

```powershell
npm.cmd test -- src/components/layout/Header.test.tsx
```

Expected: FAIL because the navigation landmarks have no accessible names, the menu button has no accessible name, and `Find Your Fit` does not exist.

- [ ] **Step 3: Implement the minimal shared navigation change**

Add the Finder to the beginning of `navLinks` and allow a featured style:

```tsx
const navLinks = [
  { href: "/wheelchair-finder", label: "Find Your Fit", featured: true },
  { href: "/products", label: "Products" },
  // retain every existing link
];
```

Add `aria-label="Primary navigation"` to the desktop `<nav>` and `aria-label="Mobile navigation"` to the mobile `<nav>`. Add the following state attributes to the existing mobile menu button:

```tsx
aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
aria-expanded={mobileMenuOpen}
aria-controls="mobile-navigation"
```

Add `id="mobile-navigation"` to the mobile menu container. For `featured` links, use the existing warm accent colors, visible focus ring, and compact fixed padding; retain the current plain-link styling for every other item. Reduce desktop navigation gaps responsively so the extra link does not collide with header actions:

```tsx
className="hidden lg:flex items-center gap-4 xl:gap-7"
```

- [ ] **Step 4: Run the Header test and verify GREEN**

Run:

```powershell
npm.cmd test -- src/components/layout/Header.test.tsx
```

Expected: PASS with one Finder link in the desktop landmark and one in the opened mobile landmark.

- [ ] **Step 5: Commit the navigation entrypoint**

```powershell
git add src/components/layout/Header.tsx src/components/layout/Header.test.tsx
git commit -m "feat: expose wheelchair finder in navigation"
```

### Task 2: Add The Homepage Hero Entrypoint

**Files:**
- Create: `src/components/HomePageClient.test.tsx`
- Modify: `src/components/HomePageClient.tsx`

- [ ] **Step 1: Write the failing homepage test**

Render the real homepage client with empty published-content arrays so the test does not require the database, then assert the direct Finder CTA:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePageClient from "./HomePageClient";

describe("homepage wheelchair finder entrypoint", () => {
  it("links to the finder from the hero", () => {
    render(<HomePageClient featuredProducts={[]} testimonials={[]} />);
    expect(screen.getByRole("link", { name: "Find Your Perfect Fit" }))
      .toHaveAttribute("href", "/wheelchair-finder");
  });
});
```

- [ ] **Step 2: Run the homepage test and verify RED**

Run:

```powershell
npm.cmd test -- src/components/HomePageClient.test.tsx
```

Expected: FAIL because no hero link named `Find Your Perfect Fit` exists.

- [ ] **Step 3: Implement the minimal hero CTA**

Add a prominent first CTA in the existing hero action group:

```tsx
<Magnetic>
  <Button
    size="lg"
    className="bg-[#C8956C] text-white hover:brightness-110 text-lg px-8 shadow-warm"
    asChild
  >
    <Link href="/wheelchair-finder">Find Your Perfect Fit</Link>
  </Button>
</Magnetic>
```

Preserve `Shop on Amazon` and `Explore Products`, use `flex-wrap` for the desktop row, and change the two existing buttons to secondary treatments so the Finder is the single primary action. Do not change their URLs or behavior.

- [ ] **Step 4: Run the homepage test and verify GREEN**

Run:

```powershell
npm.cmd test -- src/components/HomePageClient.test.tsx
```

Expected: PASS and the direct link has the correct destination.

- [ ] **Step 5: Run both focused component suites**

Run:

```powershell
npm.cmd test -- src/components/layout/Header.test.tsx src/components/HomePageClient.test.tsx
```

Expected: both test files PASS.

- [ ] **Step 6: Commit the homepage entrypoint**

```powershell
git add src/components/HomePageClient.tsx src/components/HomePageClient.test.tsx
git commit -m "feat: add wheelchair finder hero action"
```

### Task 3: Verify Responsive Discovery And Navigation

**Files:**
- Create: `e2e/wheelchair-finder-entrypoints.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the responsive browser test**

Use the existing desktop and mobile Playwright projects. The test chooses the appropriate visible navigation mode, verifies the hero CTA, follows it, and checks layout width:

```ts
import { expect, test } from "@playwright/test";

test("makes the wheelchair finder discoverable without layout overflow", async ({ page }, testInfo) => {
  await page.goto("/");

  if (testInfo.project.name === "mobile-chrome") {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Find Your Fit" }),
    ).toBeVisible();
  } else {
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" })
        .getByRole("link", { name: "Find Your Fit" }),
    ).toBeVisible();
  }

  const heroLink = page.getByRole("link", { name: "Find Your Perfect Fit" });
  await expect(heroLink).toBeVisible();
  await heroLink.click();
  await expect(page).toHaveURL(/\/wheelchair-finder$/);
  await expect(page.getByRole("radio", { name: /Powered wheelchair/i })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});
```

- [ ] **Step 2: Add a focused E2E script**

Add this script to `package.json` without changing the existing full-suite definitions:

```json
"test:e2e:entrypoints": "playwright test e2e/wheelchair-finder-entrypoints.spec.ts"
```

- [ ] **Step 3: Run the responsive E2E test**

Run:

```powershell
npm.cmd run test:e2e:entrypoints
```

Expected: 2 tests PASS, one for `desktop-chrome` and one for `mobile-chrome`.

- [ ] **Step 4: Run regression checks**

Run:

```powershell
npm.cmd test
npx.cmd tsc --noEmit --incremental false
npm.cmd run lint
npm.cmd run build
git diff --check
```

Expected: all unit tests and type checking pass; lint and production build exit with code 0, allowing only the repository's existing `<img>` performance warnings; `git diff --check` prints no errors.

- [ ] **Step 5: Commit browser coverage**

```powershell
git add e2e/wheelchair-finder-entrypoints.spec.ts package.json
git commit -m "test: cover wheelchair finder entrypoints"
```

### Task 4: Publish And Verify Production

**Files:**
- No source file changes.

- [ ] **Step 1: Confirm repository state**

```powershell
git status --short --branch
git log -4 --oneline
```

Expected: the branch is clean and contains the design, navigation, homepage, and E2E commits.

- [ ] **Step 2: Push the verified branch**

```powershell
git push origin codex/admin-content-management
```

Expected: GitHub accepts the new commits on `codex/admin-content-management`.

- [ ] **Step 3: Deploy the bound production project**

```powershell
npx.cmd vercel deploy --prod --yes --scope ethan-sakima-project --project brand-website
```

Expected: deployment reaches `READY` and aliases to `https://goldseason.vip`.

- [ ] **Step 4: Verify production entrypoints**

Check `https://goldseason.vip/` at desktop and mobile widths. Confirm the respective navigation entry, the hero `Find Your Perfect Fit` CTA, successful navigation to `/wheelchair-finder`, HTTP 200, and no horizontal overflow.
