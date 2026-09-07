import { test, expect } from "@playwright/test";
import { utcToEtInput } from "../src/lib/content/timezone";
import { adminCredentials, deleteContent, signIn, uniqueLabel } from "./admin-helpers";

test("promotion editor uses Eastern Time labels", async ({ page }) => {
  await signIn(page, adminCredentials(), "/admin/promotions/new");
  await expect(page.getByText(/eastern time|ET/i)).toBeVisible();
});

test("promotion editor rejects a nonexistent spring-forward time", async ({ page }) => {
  await signIn(page, adminCredentials(), "/admin/promotions/new");
  await page.getByLabel("Promotion name").fill(uniqueLabel("DST Gap"));
  await page.getByLabel("Product").selectOption({ index: 1 });
  await page.getByLabel("Start (ET)").fill("2026-03-08T02:30");
  await page.getByLabel("End (ET)").fill("2026-03-08T04:30");
  await page.getByLabel("Sale price").fill("1.23");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByRole("status")).toContainText("does not exist");
});

test("active promotion shows its label and price, then disappears after its window ends", async ({ page }) => {
  const credentials = adminCredentials({ mutations: true });
  const name = uniqueLabel("E2E Promotion");
  const label = uniqueLabel("E2E Sale");
  let promotionId: string | undefined;

  await signIn(page, credentials, "/admin/promotions/new");
  try {
    await page.getByLabel("Promotion name").fill(name);
    await page.getByLabel("Product").selectOption({ index: 1 });
    await page.getByLabel("Start (ET)").fill(utcToEtInput(new Date(Date.now() - 60 * 60_000)));
    await page.getByLabel("End (ET)").fill(utcToEtInput(new Date(Date.now() + 60 * 60_000)));
    await page.getByLabel("Sale price").fill("1.23");
    await page.getByLabel("Label").fill(label);
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page).toHaveURL(/\/admin\/promotions\/[^/]+$/);
    promotionId = new URL(page.url()).pathname.split("/").pop();

    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Published.", { exact: true })).toBeVisible();
    await page.goto("/");
    await expect(page.getByText(label, { exact: true })).toBeVisible();
    await page.goto("/products");
    await expect(page.getByText("$1.23", { exact: true })).toBeVisible();

    await page.goto(`/admin/promotions/${promotionId}`);
    await page.getByLabel("Start (ET)").fill(utcToEtInput(new Date(Date.now() - 2 * 60 * 60_000)));
    await page.getByLabel("End (ET)").fill(utcToEtInput(new Date(Date.now() - 60 * 60_000)));
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toHaveText("Changes saved.");
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Published.", { exact: true })).toBeVisible();
    await page.goto("/");
    await expect(page.getByText(label, { exact: true })).toHaveCount(0);
  } finally {
    await deleteContent(page.context().request, "promotions", promotionId);
  }
});
