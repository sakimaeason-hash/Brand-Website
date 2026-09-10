import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { assertFullE2EEnvironment, missingFullE2EEnvironment } from "../scripts/check-e2e-environment";

const completeEnvironment = {
  E2E_ALLOW_MUTATIONS: "1",
  E2E_ADMIN_EMAIL: "admin@example.com",
  E2E_ADMIN_PASSWORD: "admin-password",
  E2E_USER_EMAIL: "user@example.com",
  E2E_USER_PASSWORD: "user-password",
};

describe("full E2E environment preflight", () => {
  it("accepts an explicitly enabled isolated test environment", () => {
    expect(missingFullE2EEnvironment(completeEnvironment)).toEqual([]);
    expect(() => assertFullE2EEnvironment(completeEnvironment)).not.toThrow();
  });

  it("reports every missing credential instead of allowing skipped core tests", () => {
    expect(missingFullE2EEnvironment({ E2E_ALLOW_MUTATIONS: "1" })).toEqual([
      "E2E_ADMIN_EMAIL",
      "E2E_ADMIN_PASSWORD",
      "E2E_USER_EMAIL",
      "E2E_USER_PASSWORD",
    ]);
  });

  it("requires the mutation gate to be exactly enabled", () => {
    const disabled = { ...completeEnvironment, E2E_ALLOW_MUTATIONS: "0" };
    expect(() => assertFullE2EEnvironment(disabled)).toThrow(
      /E2E_ALLOW_MUTATIONS=1/,
    );
  });

  it("runs every catalog, content, permission, and promotion browser regression", () => {
    const packageJson = JSON.parse(readFileSync(path.resolve("package.json"), "utf8"));
    const command = String(packageJson.scripts["test:e2e:full"]);
    for (const spec of [
      "e2e/admin-product-catalog.spec.ts",
      "e2e/dynamic-wheelchair-finder.spec.ts",
      "e2e/admin-content-management.spec.ts",
      "e2e/admin-content-permissions.spec.ts",
      "e2e/promotion-timezone.spec.ts",
    ]) {
      expect(command).toContain(spec);
    }
  });
});
