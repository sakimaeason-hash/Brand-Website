export function configuredAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
}

export function isConfiguredAdminEmail(email: string | null | undefined) {
  const configured = configuredAdminEmail();
  return Boolean(configured && email?.trim().toLowerCase() === configured);
}
