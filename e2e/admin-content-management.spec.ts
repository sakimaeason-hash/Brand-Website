import path from "node:path";
import { test, expect } from "@playwright/test";
import { adminCredentials, deleteContent, signIn, uniqueLabel } from "./admin-helpers";

test("admin content navigation exposes products, stories and promotions", async ({ page }) => {
  await signIn(page, adminCredentials(), "/admin");
  const navigation = page.getByRole("navigation", { name: "Admin navigation" });
  await expect(navigation.getByRole("link", { name: "Products", exact: true })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Customer Stories", exact: true })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Promotions", exact: true })).toBeVisible();
});

test("admin creates, previews and publishes a product with ordered images", async ({ page }) => {
  const credentials = adminCredentials({ mutations: true });
  const name = uniqueLabel("E2E Product");
  let productId: string | undefined;

  await signIn(page, credentials, "/admin/products/new");
  try {
    await page.getByLabel("Name", { exact: true }).fill(name);
    await page.getByLabel("Model", { exact: true }).fill("E2E-MODEL");
    await page.getByLabel("Current price").fill("1234.56");
    await page.getByLabel("Weight capacity").fill("350 lb");
    await page.getByLabel("Effective seat width").fill("19 in");
    await page.locator('input[type="file"]').setInputFiles([
      path.resolve("public/products/Basic 13A.png"),
      path.resolve("public/products/Power Max 01A.png"),
    ]);
    await page.getByLabel("Alt text for Basic 13A.png").fill("Basic chair second");
    await page.getByLabel("Alt text for Power Max 01A.png").fill("Power chair first");
    await page.getByRole("button", { name: "Move Power Max 01A.png up" }).click();
    await expect(page.locator("ol > li").nth(0)).toContainText("Power Max 01A.png");
    await expect(page.locator("ol > li").nth(1)).toContainText("Basic 13A.png");

    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page).toHaveURL(/\/admin\/products\/[^/]+$/);
    productId = new URL(page.url()).pathname.split("/").pop();
    await expect(page.getByText("DRAFT", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Preview" }).click();
    await expect(page.getByRole("heading", { name })).toBeVisible();
    const previewImages = page.locator("article section img");
    await expect(previewImages.nth(0)).toHaveAttribute("alt", "Power chair first");
    await expect(previewImages.nth(1)).toHaveAttribute("alt", "Basic chair second");

    await page.goto(`/admin/products/${productId}`);
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Published.", { exact: true })).toBeVisible();
    await page.goto("/products");
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  } finally {
    await deleteContent(page.context().request, "products", productId);
  }
});

test("admin creates and publishes a customer story with ordered images", async ({ page }) => {
  const credentials = adminCredentials({ mutations: true });
  const displayName = uniqueLabel("E2E Customer");
  let storyId: string | undefined;

  await signIn(page, credentials, "/admin/stories/new");
  try {
    await page.getByLabel("Display name").fill(displayName);
    await page.getByLabel("Location").fill("Austin, Texas");
    await page.getByLabel("Quote").fill("This is an isolated E2E customer story used to verify publishing.");
    await page.locator('input[type="file"]').setInputFiles([
      path.resolve("public/stories/Eddy Simon.jpg"),
      path.resolve("public/stories/Michele Guess.jpg"),
    ]);
    await page.getByLabel("Alt text for Eddy Simon.jpg").fill("Eddy second");
    await page.getByLabel("Alt text for Michele Guess.jpg").fill("Michele first");
    await page.getByRole("button", { name: "Move Michele Guess.jpg up" }).click();
    await expect(page.locator("ol > li").nth(0)).toContainText("Michele Guess.jpg");

    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page).toHaveURL(/\/admin\/stories\/[^/]+$/);
    storyId = new URL(page.url()).pathname.split("/").pop();
    await page.getByRole("link", { name: "Preview" }).click();
    const previewImages = page.locator("article section img");
    await expect(previewImages.nth(0)).toHaveAttribute("alt", "Michele first");
    await expect(previewImages.nth(1)).toHaveAttribute("alt", "Eddy second");

    await page.goto(`/admin/stories/${storyId}`);
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Published.", { exact: true })).toBeVisible();
    await page.goto("/stories");
    await expect(page.getByText(displayName, { exact: true })).toBeVisible();
  } finally {
    await deleteContent(page.context().request, "stories", storyId);
  }
});
