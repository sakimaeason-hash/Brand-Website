import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { adminCredentials, deleteContent, signIn, uniqueLabel } from "./admin-helpers";

const hasMutationGate =
  process.env.E2E_ALLOW_MUTATIONS === "1" &&
  Boolean(process.env.E2E_ADMIN_EMAIL?.trim()) &&
  Boolean(process.env.E2E_ADMIN_PASSWORD?.trim());

function uniqueSku(prefix: string) {
  return uniqueLabel(prefix).toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 64);
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    contentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
}

async function createAccessory(page: Page, name: string, sku: string) {
  await page.goto("/admin/products/new");
  await page.getByLabel("Name", { exact: true }).fill(name);
  await page.getByLabel("Model", { exact: true }).fill("E2E-ACCESSORY");
  await page.getByLabel("Category").selectOption({ label: "Accessories" });
  await page.getByLabel("Current price").fill("49.99");
  await page.getByLabel("Amazon purchase link").fill("https://www.amazon.com/dp/e2e-accessory");
  await page.getByRole("tab", { name: /SKUs/i }).click();
  await page.getByLabel("SKU 1").fill(sku);
  await page.getByRole("tab", { name: "Media" }).click();
  await page.locator('input[type="file"]').setInputFiles(
    path.resolve("public/products/Basic 13A.png"),
  );
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/\/admin\/products\/[^/]+$/);
  const id = new URL(page.url()).pathname.split("/").pop();
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Published.", { exact: true })).toBeVisible();
  return id;
}

async function fillVariantCommerce(page: Page, skuNumber: number, input: {
  label: string;
  colorName: string;
  price: string;
  purchaseLink: string;
}) {
  await page.getByLabel(`Display label for SKU ${skuNumber}`).fill(input.label);
  await page.getByLabel(`Color name for SKU ${skuNumber}`).fill(input.colorName);
  await page.getByLabel(`Use product default price for SKU ${skuNumber}`).uncheck();
  await page.getByLabel(`Price override for SKU ${skuNumber}`).fill(input.price);
  await page.getByLabel(`Use product default Amazon link for SKU ${skuNumber}`).uncheck();
  await page.getByLabel(`Amazon link override for SKU ${skuNumber}`).fill(input.purchaseLink);
}

async function fillPoweredSku(
  page: Page,
  skuNumber: number,
  options: { includeWidth: boolean },
) {
  const suffix = `for SKU ${skuNumber}`;
  await page.getByLabel(`Maximum user weight ${suffix}`).fill("150");
  if (options.includeWidth) {
    await page.getByLabel(`Effective seat width ${suffix}`).fill("500");
  }
  await page.getByLabel(`Seat depth ${suffix}`).fill("450");
  await page.getByLabel(`Seat height ${suffix}`).fill("500");
  await page
    .getByLabel(`Seat-to-footrest vertical distance ${suffix}`)
    .fill("400");
  for (const [label, values] of [
    ["Overall dimensions", ["1000", "650", "1000"]],
    ["Folded dimensions", ["700", "350", "800"]],
  ] as const) {
    for (const [axis, value] of ["length", "width", "height"].map(
      (axis, index) => [axis, values[index]] as const,
    )) {
      await page.getByLabel(`${label} ${suffix} ${axis}`).fill(value);
    }
  }
  await page.getByLabel(`Net weight without battery ${suffix}`).fill("25");
  await page.getByLabel(`Range ${suffix}`).fill("30");
  await page.getByLabel(`Turning radius ${suffix}`).fill("900");
  await page.getByLabel(`Obstacle height ${suffix}`).fill("40");
  await page.getByLabel(`Rear wheel diameter ${suffix}`).fill("300");
  await page.getByLabel(`Tire type ${suffix}`).selectOption("solid");
}

async function fillManualSku(page: Page, skuNumber: number) {
  const suffix = `for SKU ${skuNumber}`;
  await page.getByLabel(`Maximum user weight ${suffix}`).fill("150");
  await page.getByLabel(`Effective seat width ${suffix}`).fill("500");
  await page.getByLabel(`Seat depth ${suffix}`).fill("450");
  await page.getByLabel(`Seat height ${suffix}`).fill("500");
  await page.getByLabel(`Seat-to-footrest vertical distance ${suffix}`).fill("400");
  for (const [label, values] of [
    ["Overall dimensions", ["1050", "650", "950"]],
    ["Folded dimensions", ["800", "300", "750"]],
  ] as const) {
    for (const [axis, value] of ["length", "width", "height"].map(
      (axis, index) => [axis, values[index]] as const,
    )) {
      await page.getByLabel(`${label} ${suffix} ${axis}`).fill(value);
    }
  }
  await page.getByLabel(`Product weight ${suffix}`).fill("18");
  await page.getByLabel(`Propulsion type ${suffix}`).selectOption("self-propelled");
  await page.getByLabel(`Front wheel diameter ${suffix}`).fill("200");
  await page.getByLabel(`Rear wheel diameter ${suffix}`).fill("600");
  await page.getByLabel(`Tire type ${suffix}`).selectOption("solid");
}

async function completePoweredFinder(
  page: Page,
  input: { weightLb: string; hipWidthIn: string },
) {
  await page.goto("/wheelchair-finder");
  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByRole("radio", { name: /Powered wheelchair/i }).check();
  await page.getByLabel("Height (in)").fill("68");
  await page.getByLabel("Weight (lb)").fill(input.weightLb);
  await page.getByRole("radio", { name: /Precision fit/i }).check();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("heading", { name: "A quick safety check" })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  const measurements = page.getByLabel("Your measurement (in)");
  await measurements.nth(0).fill(input.hipWidthIn);
  await measurements.nth(1).fill("18");
  await measurements.nth(2).fill("16");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("heading", { name: "Where will you use it?" })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Your fit screen" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
}

async function completeManualFinder(page: Page) {
  await page.goto("/wheelchair-finder");
  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByRole("radio", { name: /Manual wheelchair/i }).check();
  await page.getByLabel("Height (in)").fill("68");
  await page.getByLabel("Weight (lb)").fill("180");
  await page.getByRole("radio", { name: /Precision fit/i }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  const measurements = page.getByLabel("Your measurement (in)");
  await measurements.nth(0).fill("18");
  await measurements.nth(1).fill("20");
  await measurements.nth(2).fill("16");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("checkbox", { name: "Self-propulsion" })).toBeVisible();
  await page.getByRole("checkbox", { name: "Self-propulsion" }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Your fit screen" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
}

test.describe("dynamic product catalog administration", () => {
  test.skip(
    !hasMutationGate,
    "Requires E2E_ALLOW_MUTATIONS=1 and isolated admin credentials",
  );

  test("creates and archives an administrator-defined product category", async ({ page }) => {
    const name = uniqueLabel("E2E Shower Seating");
    await signIn(page, adminCredentials({ mutations: true }), "/admin/product-categories/new");
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Slug").fill(name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    await page.getByRole("button", { name: "Add field" }).click();
    await page.getByLabel("Field key 1").fill("frameMaterial");
    await page.getByLabel("Field label 1").fill("Frame material");
    await page.getByRole("button", { name: "Save category" }).click();
    await expect(page).toHaveURL(/\/admin\/product-categories\/[^/]+$/);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Archive category" }).click();
    await expect(page.getByText("Category archived.", { exact: true })).toBeVisible();
  });

  test("publishes two verified SKUs with package contents and a compatible accessory", async ({ page }) => {
    const accessoryName = uniqueLabel("E2E Accessory");
    const productName = uniqueLabel("E2E Dynamic Chair");
    const accessorySku = uniqueSku("E2E-ACCESSORY");
    const skuA = uniqueSku("E2E-DYNAMIC-A");
    const skuB = uniqueSku("E2E-DYNAMIC-B");
    const amazonA = `https://www.amazon.com/dp/${skuA}`;
    const amazonB = `https://www.amazon.com/dp/${skuB}`;
    let accessoryId: string | undefined;
    let productId: string | undefined;
    await signIn(page, adminCredentials({ mutations: true }), "/admin");
    try {
      accessoryId = await createAccessory(page, accessoryName, accessorySku);

      await page.goto("/admin/products/new");
      await page.getByLabel("Name", { exact: true }).fill(productName);
      await page.getByLabel("Model", { exact: true }).fill("E2E-DYNAMIC");
      await page.getByLabel("Category").selectOption({ label: "Powered Wheelchairs" });
      await page.getByLabel("Current price").fill("1299.99");
      await page.getByLabel("Amazon purchase link").fill("https://www.amazon.com/dp/e2e-wheelchair");

      await page.getByRole("tab", { name: /SKUs/i }).click();
      await page.getByLabel("SKU 1").fill(skuA);
      await fillVariantCommerce(page, 1, {
        label: "Standard fit",
        colorName: "Graphite",
        price: "1199.11",
        purchaseLink: amazonA,
      });
      await fillPoweredSku(page, 1, { includeWidth: true });
      await page.getByRole("button", { name: "Add SKU" }).click();
      await page.getByLabel("SKU 2").fill(skuB);
      await fillVariantCommerce(page, 2, {
        label: "Wide fit",
        colorName: "Ocean",
        price: "1399.22",
        purchaseLink: amazonB,
      });
      await fillPoweredSku(page, 2, { includeWidth: false });
      await expectNoHorizontalOverflow(page);

      await page.getByRole("tab", { name: "Accessories" }).click();
      await page.getByRole("button", { name: "Add box item" }).click();
      await page.getByLabel("Box item name 1").fill("Charger");
      await page.getByLabel(new RegExp(accessoryName)).check();

      await page.getByRole("tab", { name: "Media" }).click();
      await page.locator('input[type="file"]').setInputFiles(
        path.resolve("public/products/Power Max 01A.png"),
      );
      await page.getByRole("button", { name: "Save draft" }).click();
      await expect(page).toHaveURL(/\/admin\/products\/[^/]+$/);
      productId = new URL(page.url()).pathname.split("/").pop();

      const saved = await page.request.get(`/api/admin/products/${productId}`);
      expect(saved.ok(), await saved.text()).toBe(true);
      const savedProduct = await saved.json();
      expect(savedProduct.variants).toHaveLength(2);
      expect(savedProduct.inBoxItems).toEqual([
        expect.objectContaining({ name: "Charger", quantity: 1 }),
      ]);
      expect(savedProduct.compatibleAccessories).toEqual([
        expect.objectContaining({ accessoryProductId: accessoryId }),
      ]);

      await page.getByRole("button", { name: "Publish" }).click();
      await expect(page.getByRole("tab", { name: /SKUs/i })).toHaveAttribute("aria-selected", "true");
      const missingWidth = page.getByLabel("Effective seat width for SKU 2");
      await expect(missingWidth).toBeFocused();
      await expect(page.getByText(/Effective seat width.*required/i)).toBeVisible();
      await missingWidth.fill("500");
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(page.getByText("Changes saved.", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Publish" }).click();
      await expect(page.getByText("Published.", { exact: true })).toBeVisible();

      await page.goto("/products");
      const card = page.getByRole("article").filter({ hasText: productName });
      await expect(card.getByText("Powered Wheelchairs", { exact: true })).toBeVisible();
      await expect(card.getByLabel(`Buy ${skuA} on Amazon`)).toHaveAttribute("href", amazonA);
      await expect(card.getByText("$1199.11", { exact: true })).toBeVisible();
      await card.getByRole("button", { name: "View details" }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText(productName, { exact: true })).toBeVisible();
      await expect(dialog.getByText("Charger", { exact: true })).toBeVisible();
      await expect(dialog.getByText(accessoryName, { exact: true })).toBeVisible();
      await expect(dialog.getByText("Maximum user weight", { exact: true })).toBeVisible();
      await expect(dialog.getByLabel(`Buy ${skuA} on Amazon`)).toHaveAttribute("href", amazonA);
      const detailPanel = page.getByTestId("product-detail-panel");
      const beforeSwitch = await detailPanel.boundingBox();
      await dialog.getByRole("button", { name: `Select Ocean SKU ${skuB}` }).click();
      await expect(dialog.getByLabel(`Buy ${skuB} on Amazon`)).toHaveAttribute("href", amazonB);
      await expect(dialog.getByText("$1399.22", { exact: true })).toBeVisible();
      const afterSwitch = await detailPanel.boundingBox();
      expect(beforeSwitch).not.toBeNull();
      expect(afterSwitch).not.toBeNull();
      expect(Math.abs((beforeSwitch?.x ?? 0) - (afterSwitch?.x ?? 0))).toBeLessThanOrEqual(1);
      expect(Math.abs((beforeSwitch?.width ?? 0) - (afterSwitch?.width ?? 0))).toBeLessThanOrEqual(1);
      await expectNoHorizontalOverflow(page);
      await dialog.getByRole("button", { name: "Close product details" }).click();

      await completePoweredFinder(page, { weightLb: "180", hipWidthIn: "19" });
      await expect(page.getByText(productName, { exact: true }).first()).toBeVisible();

      await completePoweredFinder(page, { weightLb: "400", hipWidthIn: "19" });
      await expect(
        page.getByRole("heading", {
          name: /No wheelchair matches the required weight capacity and effective seat width/i,
        }),
      ).toBeVisible();
      await expect(page.getByText(productName, { exact: true })).not.toBeVisible();

      await completePoweredFinder(page, { weightLb: "180", hipWidthIn: "21" });
      await expect(
        page.getByRole("heading", {
          name: /No wheelchair matches the required weight capacity and effective seat width/i,
        }),
      ).toBeVisible();
      await expect(page.getByText(productName, { exact: true })).not.toBeVisible();
    } finally {
      await deleteContent(page.context().request, "products", productId);
      await deleteContent(page.context().request, "products", accessoryId);
    }
  });

  test("publishes a manual wheelchair and returns it as a manual Finder candidate", async ({ page }) => {
    const productName = uniqueLabel("E2E Manual Chair");
    const sku = uniqueSku("E2E-MANUAL");
    let productId: string | undefined;
    await signIn(page, adminCredentials({ mutations: true }), "/admin/products/new");
    try {
      await page.getByLabel("Name", { exact: true }).fill(productName);
      await page.getByLabel("Model", { exact: true }).fill("E2E-MANUAL");
      await page.getByLabel("Category").selectOption({ label: "Manual Wheelchairs" });
      await page.getByLabel("Current price").fill("699.99");
      await page.getByLabel("Amazon purchase link").fill(`https://www.amazon.com/dp/${sku}`);
      await page.getByRole("tab", { name: /SKUs/i }).click();
      await page.getByLabel("SKU 1").fill(sku);
      await page.getByLabel("Display label for SKU 1").fill("Self-propelled");
      await fillManualSku(page, 1);
      await expectNoHorizontalOverflow(page);
      await page.getByRole("tab", { name: "Media" }).click();
      await page.locator('input[type="file"]').setInputFiles(
        path.resolve("public/products/Basic 13A.png"),
      );
      await page.getByRole("button", { name: "Save draft" }).click();
      await expect(page).toHaveURL(/\/admin\/products\/[^/]+$/);
      productId = new URL(page.url()).pathname.split("/").pop();
      await page.getByRole("button", { name: "Publish" }).click();
      await expect(page.getByText("Published.", { exact: true })).toBeVisible();

      await completeManualFinder(page);
      await expect(page.getByText(productName, { exact: true }).first()).toBeVisible();
      await expect(page.getByText(`SKU: ${sku}`, { exact: true })).toBeVisible();
    } finally {
      await deleteContent(page.context().request, "products", productId);
    }
  });
});
