import { expect, test, type Page } from "@playwright/test";
import { adminCredentials, signIn, userCredentials } from "./admin-helpers";

const hasE2ECredentials = [
  "E2E_ADMIN_EMAIL",
  "E2E_ADMIN_PASSWORD",
  "E2E_USER_EMAIL",
  "E2E_USER_PASSWORD",
].every((name) => Boolean(process.env[name]?.trim()));

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    contentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
}

test.describe("dynamic wheelchair finder", () => {
  test("supports powered and manual assessment inputs", async ({ page }) => {
    await page.goto("/wheelchair-finder");
    await expect(page.getByRole("radio", { name: /Powered wheelchair/i })).toBeChecked();
    await expect(page.getByRole("radio", { name: /Manual wheelchair/i })).toBeVisible();

    const weight = page.getByLabel("Weight (lb)");
    await expect(weight).toHaveAttribute("type", "text");
    await expect(weight).toHaveAttribute("inputmode", "decimal");
    await weight.fill("205.7");
    await expect(weight).toHaveValue("205.7");
    await expectNoHorizontalOverflow(page);

    await page.getByRole("radio", { name: /Manual wheelchair/i }).click();
    await expect(page.getByRole("radio", { name: /Manual wheelchair/i })).toBeChecked();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("checkbox", { name: "Self-propulsion" })).toBeVisible();
    await expect(page.getByText(/Typical daily range/i)).not.toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Battery range" })).not.toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test.describe("catalog authorization", () => {
    test.skip(!hasE2ECredentials, "Requires isolated Preview/test database credentials");

    test("does not expose admin navigation to a regular user", async ({ page }) => {
      await signIn(page, userCredentials(), "/");
      await expect(page.getByRole("link", { name: /admin/i })).not.toBeVisible();
      const response = await page.request.get("/api/admin/product-categories");
      expect([401, 403]).toContain(response.status());
    });

    test("admin can see product category administration", async ({ page }) => {
      await signIn(page, adminCredentials(), "/admin");
      await expect(
        page.getByRole("navigation", { name: "Admin navigation" }).getByRole("link", {
          name: /Product Categories/i,
        }),
      ).toBeVisible();
    });
  });
});
