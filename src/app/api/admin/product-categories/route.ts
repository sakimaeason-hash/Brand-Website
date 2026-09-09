import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/authorization";
import { adminErrorResponse } from "@/lib/admin/http";
import {
  CatalogServiceError,
  createCategory,
  listAdminCategories,
} from "@/lib/catalog/category-service";
import { categoryInputSchema } from "@/lib/catalog/category-validation";

function serviceError(error: unknown) {
  if (error instanceof CatalogServiceError) {
    return NextResponse.json({ error: error.message, code: error.code, fields: error.fields }, { status: error.status });
  }
  return null;
}

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await listAdminCategories());
  } catch (error) {
    return serviceError(error) ?? adminErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const raw = await request.json();
    const parsed = categoryInputSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message, code: "VALIDATION_ERROR", fields: parsed.error.errors }, { status: 400 });
    return NextResponse.json(await createCategory(parsed.data), { status: 201 });
  } catch (error) {
    return serviceError(error) ?? adminErrorResponse(error);
  }
}
