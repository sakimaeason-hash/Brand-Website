import { test, expect } from "@playwright/test";
import { adminCredentials, signIn, userCredentials } from "./admin-helpers";

test("redirects unauthenticated users away from the admin area", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/auth\/signin\?callbackUrl=%2Fadmin/);
});

test("admin credentials can reach the content workspace", async ({ page }) => {
  await signIn(page, adminCredentials(), "/admin");
  await expect(page.getByText("Content Administration")).toBeVisible();
});

test("regular users cannot see or directly access administration", async ({ page }) => {
  await signIn(page, userCredentials());
  await page.locator("header button:has(div)").click();
  await expect(page.getByRole("link", { name: "Admin", exact: true })).toHaveCount(0);

  const pageResponse = await page.goto("/admin");
  expect(pageResponse?.status()).toBe(403);
  await expect(page.getByText("Admin access required")).toBeVisible();

  const apiResponse = await page.request.get("/api/admin/products");
  expect(apiResponse.status()).toBe(403);
  await expect(apiResponse.json()).resolves.toEqual({ error: "Admin access required" });
});
