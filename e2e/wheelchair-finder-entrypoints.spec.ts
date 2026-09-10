import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("makes the wheelchair finder discoverable without layout overflow", async ({ page }, testInfo) => {
  await page.goto("/");

  const homeDimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(homeDimensions.content).toBeLessThanOrEqual(homeDimensions.viewport + 1);

  if (testInfo.project.name === "mobile-chrome") {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(
      page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Find Your Fit" }),
    ).toBeVisible();
  } else {
    await expect(
      page
        .getByRole("navigation", { name: "Primary navigation" })
        .getByRole("link", { name: "Find Your Fit" }),
    ).toBeVisible();

    for (const width of [1024, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const primaryNavigation = page.getByRole("navigation", {
        name: "Primary navigation",
      });
      const navigationBox = await primaryNavigation.boundingBox();
      const searchBox = await page.getByRole("button", { name: "Search" }).boundingBox();
      const navigationWidth = await primaryNavigation.evaluate((element) => ({
        client: element.clientWidth,
        scroll: element.scrollWidth,
      }));

      expect(navigationBox).not.toBeNull();
      expect(searchBox).not.toBeNull();
      expect(navigationWidth.scroll).toBeLessThanOrEqual(navigationWidth.client);
      expect(navigationBox!.x + navigationBox!.width).toBeLessThanOrEqual(searchBox!.x - 8);
    }
  }

  const heroLink = page.getByRole("link", { name: "Find Your Perfect Fit" });
  await expect(heroLink).toBeVisible();
  await page.waitForTimeout(700);

  const accessibilityScan = await new AxeBuilder({ page })
    .include('a[href="/wheelchair-finder"]')
    .withRules(["color-contrast"])
    .analyze();
  expect(accessibilityScan.violations).toEqual([]);

  await heroLink.click();

  await expect(page).toHaveURL(/\/wheelchair-finder$/);
  await expect(
    page.getByRole("radio", { name: /Powered wheelchair/i }),
  ).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});
