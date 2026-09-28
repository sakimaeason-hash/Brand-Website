// Local component fixtures only. Never imports a database or creates real content.
import fs from "node:fs/promises";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { NewArrivalsContent } from "../src/components/new-arrivals/NewArrivalsContent";
import { NewArrivalsManager } from "../src/components/admin/NewArrivalsManager";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { PublicProduct, PublicNewArrivalsContent } from "../src/lib/content/repository";

const offline = process.argv.includes("--offline");
const base = offline ? "https://local-preview.test" : "http://127.0.0.1:3211";
const out = path.resolve("test-results/new-arrivals-ui");
const product: PublicProduct = {
  id: "local-fixture-only", name: "Travel Air — a long product name for local layout testing", tagline: "Local visual test data — not a published offer",
  category: { id: "c1", name: "Wheelchairs", slug: "wheelchairs", role: "PRODUCT", recommendationProfile: "POWERED_WHEELCHAIR" },
  images: [{ url: "/products/Travel%20Air%20W%2003C.png", alt: "Travel Air wheelchair product view" }],
  variants: [{ id: "v1", sku: "TEST-ONLY-1", price: 799, specifications: [] }, { id: "v2", sku: "TEST-ONLY-2", price: 999, specifications: [] }],
  features: [], specifications: [], inBoxItems: [], compatibleAccessories: [], isFeatured: false,
};
const content: PublicNewArrivalsContent = {
  products: [product, { ...product, id: "fixture-2", name: "Second local layout fixture" }],
  offers: [{ product, promotion: { id: "fixture-offer", name: "Local offer layout test", productId: product.id, productName: product.name, startAt: "2026-09-27T00:00:00Z", endAt: "2026-10-01T00:00:00Z", discountPercent: 10 } }],
};

async function main() {
  await fs.mkdir(out, { recursive: true });
  const css = await fs.readFile(path.join(out, "preview.css"), "utf8");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const checks: string[] = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (offline && url.origin === base) {
        if (url.pathname === "/") return route.fulfill({ contentType: "text/html", body: "<!doctype html><html lang='en'><head><title>Local preview</title></head><body></body></html>" });
        const publicRoot = path.resolve("public");
        const file = path.resolve(publicRoot, `.${decodeURIComponent(url.pathname)}`);
        if (!file.startsWith(publicRoot + path.sep)) return route.abort();
        try { return route.fulfill({ body: await fs.readFile(file), contentType: file.endsWith(".png") ? "image/png" : "image/jpeg" }); }
        catch { return route.abort(); }
      }
      return url.origin === base || url.protocol === "data:" ? route.continue() : route.abort();
    });
    if (offline) await page.goto(base);
    else {
      await page.goto(`${base}/new-arrivals`);
      await expect(page.getByRole("alert").filter({ hasText: "We couldn’t load new arrivals and offers" })).toBeVisible();
      checks.push("Real local page: database-unavailable state, no static fallback");
      await page.screenshot({ path: path.join(out, "server-unavailable.png"), fullPage: true });
    }

    const states = [
      ["content", <main><NewArrivalsContent content={content} /></main>],
      ["empty", <main><NewArrivalsContent content={{ products: [], offers: [] }} /></main>],
      ["unavailable", <main><NewArrivalsContent unavailable /></main>],
      ["admin", <AppRouterContext.Provider value={{ back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {} }}>
        <main className="mx-auto max-w-5xl bg-[#FAF7F4] p-6 text-[#3D3330]">
          <h1 className="text-2xl font-bold">New Arrivals &amp; Offers</h1>
          <p className="mt-4">Local layout preview — controls are inactive in this static check.</p>
          <NewArrivalsManager products={[
            { id: "fixture-1", name: product.name, model: "TEST-1", status: "PUBLISHED", isNewArrival: true, updatedAt: "2026-09-28T00:00:00.000Z", hasActiveCategory: true, hasActiveSku: true },
            { id: "fixture-2", name: "Draft product fixture", model: "TEST-2", status: "DRAFT", isNewArrival: false, updatedAt: "2026-09-28T00:00:00.000Z", hasActiveCategory: true, hasActiveSku: true },
          ]} />
        </main>
      </AppRouterContext.Provider>],
    ] as const;
    for (const [name, element] of states) {
      const markup = renderToStaticMarkup(element);
      for (const [device, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]] as const) {
        await page.setViewportSize({ width, height });
        await page.setContent(`<!doctype html><html lang="en"><head><base href="${base}/"><title>Local component check</title><style>${css}</style></head><body>${markup}</body></html>`);
        await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete));
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        const brokenImages = await page.locator("img").evaluateAll((images) => images.filter((image) => !(image as HTMLImageElement).naturalWidth).length);
        expect(brokenImages).toBe(0);
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        expect(results.violations, JSON.stringify(results.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target }) => target) })))).toEqual([]);
        await page.screenshot({ path: path.join(out, `${name}-${device}.png`), fullPage: true });
        await page.locator("html").evaluate((element) => { element.style.fontSize = "200%"; });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        checks.push(`${name} / ${device}: no overflow, images loaded, WCAG scan clean, 200% text reflow`);
      }
    }
    await fs.writeFile(path.join(out, "results.json"), JSON.stringify({ checkedAt: new Date().toISOString(), checks }, null, 2));
    console.log(JSON.stringify({ checks: checks.length, results: checks, output: out }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
