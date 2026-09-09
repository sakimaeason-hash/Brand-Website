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
    const body = await request.json() as Record<string, unknown>;
    const updatedAt = body.updatedAt;
    if (typeof updatedAt !== "string") return NextResponse.json({ error: "updatedAt is required", code: "VALIDATION_ERROR", fields: [] }, { status: 400 });
    if (body.action === "archive") return NextResponse.json(await archiveCategory(params.id, updatedAt));
    const parsed = categoryInputSchema.safeParse(body.payload ?? body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message, code: "VALIDATION_ERROR", fields: parsed.error.errors }, { status: 400 });
    return NextResponse.json(await updateCategory(params.id, parsed.data, updatedAt));
  } catch (error) {
    return serviceError(error) ?? adminErrorResponse(error);
  }
}
