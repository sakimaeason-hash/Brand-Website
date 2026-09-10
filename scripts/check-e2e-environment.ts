const REQUIRED_CREDENTIALS = [
  "E2E_ADMIN_EMAIL",
  "E2E_ADMIN_PASSWORD",
  "E2E_USER_EMAIL",
  "E2E_USER_PASSWORD",
] as const;

type E2EEnvironment = Record<string, string | undefined>;

export function missingFullE2EEnvironment(environment: E2EEnvironment) {
  return REQUIRED_CREDENTIALS.filter((name) => !environment[name]?.trim());
}

export function assertFullE2EEnvironment(environment: E2EEnvironment) {
  if (environment.E2E_ALLOW_MUTATIONS !== "1") {
    throw new Error(
      "E2E_ALLOW_MUTATIONS=1 is required to confirm an isolated, mutation-safe E2E environment.",
    );
  }
  const missing = missingFullE2EEnvironment(environment);
  if (missing.length > 0) {
    throw new Error(`Missing full E2E credentials: ${missing.join(", ")}`);
  }
}

if (process.argv[1] && /check-e2e-environment\.(?:ts|js)$/.test(process.argv[1])) {
  try {
    assertFullE2EEnvironment(process.env);
    console.log("Full E2E environment preflight passed.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Full E2E environment preflight failed.");
    process.exitCode = 1;
  }
}
