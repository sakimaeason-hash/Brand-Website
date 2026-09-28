import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/authorization";
import { adminErrorResponse } from "@/lib/admin/http";
import { prisma } from "@/lib/db";

const requestSchema = z.object({
  isNewArrival: z.boolean(),
  updatedAt: z.string().refine((value) => {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) && date.toISOString() === value;
  }),
}).strict();

function errorResponse(error: string, code: string, status: number) {
  return NextResponse.json({ error, code }, { status });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Request body must be valid JSON.", "VALIDATION_ERROR", 400);
    }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) return errorResponse("isNewArrival and an ISO updatedAt are required.", "VALIDATION_ERROR", 400);

    const expected = new Date(parsed.data.updatedAt);
    const updatedAt = new Date(Math.max(Date.now(), expected.getTime() + 1));
    const result = await prisma.product.updateMany({
      where: { id: params.id, updatedAt: expected },
      data: { isNewArrival: parsed.data.isNewArrival, updatedAt },
    });
    if (result.count !== 1) {
      const existing = await prisma.product.findUnique({ where: { id: params.id }, select: { id: true } });
      return existing
        ? errorResponse("Product changed elsewhere. Refresh and try again.", "CONCURRENT_UPDATE", 409)
        : errorResponse("Product not found.", "NOT_FOUND", 404);
    }

    revalidatePath("/new-arrivals");
    revalidatePath("/admin/new-arrivals");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${params.id}`);
    return NextResponse.json({ id: params.id, isNewArrival: parsed.data.isNewArrival, updatedAt: updatedAt.toISOString() });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
