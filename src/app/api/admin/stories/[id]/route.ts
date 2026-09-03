import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/authorization";
import { adminErrorResponse, parseJsonField } from "@/lib/admin/http";
import { storyInputSchema } from "@/lib/content/validation";

export async function GET(_: Request, { params }: { params: { id: string } }) { try { await requireAdmin(); const story = await prisma.customerStory.findUnique({ where: { id: params.id }, include: { images: { orderBy: { sortOrder: "asc" } }, product: true } }); return story ? NextResponse.json(story) : NextResponse.json({ error: "Not found" }, { status: 404 }); } catch (error) { return adminErrorResponse(error); } }

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try { await requireAdmin(); const form = await request.formData(); const action = String(form.get("action") || "save-draft"); const existing = await prisma.customerStory.findUnique({ where: { id: params.id } }); if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 }); if (action === "delete") { if (form.get("confirm") !== "true") return NextResponse.json({ error: "Confirmation required" }, { status: 400 }); await prisma.customerStory.delete({ where: { id: params.id } }); return NextResponse.json({ success: true }); }
    let data: Record<string, unknown> = {}; if (form.has("payload")) { const parsed = storyInputSchema.safeParse({ ...parseJsonField(form, "payload") as Record<string, unknown>, status: "DRAFT" }); if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 }); data = { ...parsed.data, productId: parsed.data.productId || undefined }; }
    data.status = action === "publish" ? "PUBLISHED" : action === "unpublish" ? "UNPUBLISHED" : "DRAFT"; return NextResponse.json(await prisma.customerStory.update({ where: { id: params.id }, data: data as never, include: { images: true } }));
  } catch (error) { return adminErrorResponse(error); }
}
