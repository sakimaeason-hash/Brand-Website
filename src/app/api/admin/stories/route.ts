import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/authorization";
import { adminErrorResponse, parseJsonField } from "@/lib/admin/http";
import { storyInputSchema, MAX_CONTENT_IMAGES } from "@/lib/content/validation";
import { uploadContentImage } from "@/lib/content/storage";

export async function GET() { try { await requireAdmin(); return NextResponse.json(await prisma.customerStory.findMany({ include: { images: { orderBy: { sortOrder: "asc" } }, product: true }, orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] })); } catch (error) { return adminErrorResponse(error); } }

export async function POST(request: Request) {
  try {
    await requireAdmin(); const form = await request.formData(); const parsed = storyInputSchema.safeParse({ ...parseJsonField(form, "payload") as Record<string, unknown>, status: "DRAFT" });
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0); if (files.length > MAX_CONTENT_IMAGES) return NextResponse.json({ error: "Too many images" }, { status: 400 });
    const story = await prisma.customerStory.create({ data: { ...parsed.data, tags: parsed.data.tags, productId: parsed.data.productId || undefined, status: "DRAFT" } });
    try { for (let index = 0; index < files.length; index += 1) { const file = files[index]; const media = await uploadContentImage("stories", story.id, file, index); await prisma.storyImage.create({ data: { storyId: story.id, ...media, sortOrder: index } }); } } catch (error) { console.error("Story image upload failed", error); await prisma.customerStory.delete({ where: { id: story.id } }); return NextResponse.json({ error: "Image upload failed" }, { status: 502 }); }
    return NextResponse.json(await prisma.customerStory.findUnique({ where: { id: story.id }, include: { images: true } }), { status: 201 });
  } catch (error) { return adminErrorResponse(error); }
}
