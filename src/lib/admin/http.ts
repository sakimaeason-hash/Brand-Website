import { NextResponse } from "next/server";
import { AdminAuthError } from "./authorization";

export function adminErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError) {
    return NextResponse.json({ error: error.message, code: error.status === 401 ? "AUTHENTICATION_REQUIRED" : "ADMIN_ACCESS_REQUIRED", fields: [] }, { status: error.status });
  }
  if (error && typeof error === "object" && ((error as { status?: unknown }).status === 401 || (error as { status?: unknown }).status === 403)) {
    const status = (error as { status: 401 | 403 }).status;
    return NextResponse.json({ error: (error as { message?: string }).message || "Admin access required", code: status === 401 ? "AUTHENTICATION_REQUIRED" : "ADMIN_ACCESS_REQUIRED", fields: [] }, { status });
  }
  console.error("Admin request failed", error);
  return NextResponse.json({ error: "Admin request failed", code: "INTERNAL_ERROR", fields: [] }, { status: 500 });
}

export function parseJsonField(form: FormData, field: string) {
  const raw = form.get(field);
  if (typeof raw !== "string") throw new Error(`${field} is required`);
  try { return JSON.parse(raw) as unknown; } catch { throw new Error(`${field} must be valid JSON`); }
}
