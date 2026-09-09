import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/authorization";
import { adminErrorResponse } from "@/lib/admin/http";
import { archiveCategory, CatalogServiceError, updateCategory } from "@/lib/catalog/category-service";
import { categoryInputSchema } from "@/lib/catalog/category-validation";

type Params = { params: { id: string } };

function serviceError(error: unknown) {
  if (error instanceof CatalogServiceError) {
    return NextResponse.json({ error: error.message, code: error.code, fields: error.fields }, { status: error.status });
  }
  return null;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    let body: Record<string, unknown>;
    try {
      const raw = await request.json();
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return NextResponse.json({ error: "Request body must be an object", code: "VALIDATION_ERROR", fields: [] }, { status: 400 });
      body = raw as Record<string, unknown>;
    } catch { return NextResponse.json({ error: "Request body must be valid JSON", code: "VALIDATION_ERROR", fields: [] }, { status: 400 }); }
    const updatedAt = body.updatedAt;
    if (typeof updatedAt !== "string") return NextResponse.json({ error: "updatedAt is required", code: "VALIDATION_ERROR", fields: [] }, { status: 400 });
    if (body.action === "archive") return NextResponse.json(await archiveCategory(params.id, updatedAt));
    if (body.action !== undefined && body.action !== "save") return NextResponse.json({ error: "Unsupported category action", code: "VALIDATION_ERROR", fields: [] }, { status: 400 });
    const { action: _action, updatedAt: _updatedAt, payload, ...flatPayload } = body;
    const parsed = categoryInputSchema.safeParse(payload ?? flatPayload);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message, code: "VALIDATION_ERROR", fields: parsed.error.errors }, { status: 400 });
    return NextResponse.json(await updateCategory(params.id, parsed.data, updatedAt));
  } catch (error) {
    return serviceError(error) ?? adminErrorResponse(error);
  }
}
