import { NextResponse } from "next/server";
import { AdminAuthError } from "./authorization";

export function adminErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error("Admin request failed", error);
  return NextResponse.json({ error: "Admin request failed" }, { status: 500 });
}

export function parseJsonField(form: FormData, field: string) {
  const raw = form.get(field);
  if (typeof raw !== "string") throw new Error(`${field} is required`);
  try { return JSON.parse(raw) as unknown; } catch { throw new Error(`${field} must be valid JSON`); }
}
