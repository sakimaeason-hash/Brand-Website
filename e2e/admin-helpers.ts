import { expect, type APIRequestContext, type Page } from "@playwright/test";

type ContentType = "products" | "stories" | "promotions";

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for the full admin E2E gate`);
  return value;
}

export function adminCredentials(options: { mutations?: boolean } = {}) {
  if (options.mutations && process.env.E2E_ALLOW_MUTATIONS !== "1") {
    throw new Error("E2E_ALLOW_MUTATIONS=1 is required for content-changing E2E tests");
  }
  return {
    email: requiredEnvironment("E2E_ADMIN_EMAIL"),
    password: requiredEnvironment("E2E_ADMIN_PASSWORD"),
  };
}

export function userCredentials() {
  return {
    email: requiredEnvironment("E2E_USER_EMAIL"),
    password: requiredEnvironment("E2E_USER_PASSWORD"),
  };
}

export async function signIn(page: Page, credentials: { email: string; password: string }, callbackUrl = "/") {
  await page.goto(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe(callbackUrl);
}

export function uniqueLabel(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export async function deleteContent(request: APIRequestContext, type: ContentType, id: string | undefined) {
  if (!id) return;
  const current = await request.get(`/api/admin/${type}/${id}`);
  if (current.status() === 404) return;
  expect(current.ok(), await current.text()).toBe(true);
  const record = await current.json() as { updatedAt: string };
  const response = await request.patch(`/api/admin/${type}/${id}`, {
    multipart: {
      action: "delete",
      confirm: "true",
      updatedAt: record.updatedAt,
    },
  });
  expect(response.ok(), await response.text()).toBe(true);
}
