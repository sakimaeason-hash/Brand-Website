import { expect, test } from "@playwright/test";

test("makes the wheelchair finder discoverable without layout overflow", async ({ page }, testInfo) => {
  await page.goto("/");

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
  }

  const heroLink = page.getByRole("link", { name: "Find Your Perfect Fit" });
  await expect(heroLink).toBeVisible();
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
