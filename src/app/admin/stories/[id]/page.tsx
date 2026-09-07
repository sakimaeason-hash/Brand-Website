import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ContentActions } from "@/components/admin/ContentActions";
import { StoryForm, type StoryFormData } from "@/components/admin/StoryForm";

const storyTags = ["Travel", "Comfort", "Support", "New User", "Family", "Independence"] as const;

function isStoryTag(value: unknown): value is StoryFormData["tags"][number] {
  return typeof value === "string" && (storyTags as readonly string[]).includes(value);
}

export default async function AdminStoryDetail({ params }: { params: { id: string } }) {
  const [story, products] = await Promise.all([
    prisma.customerStory.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { sortOrder: "asc" } }, product: true },
    }),
    prisma.product.findMany({
      select: { id: true, name: true, model: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);
  if (!story) notFound();

  const initialData: StoryFormData = {
    id: story.id,
    updatedAt: story.updatedAt.toISOString(),
    displayName: story.displayName,
    location: story.location,
    quote: story.quote,
    productId: story.productId,
    source: story.source,
    tags: Array.isArray(story.tags) ? story.tags.filter(isStoryTag) : [],
    isFeatured: story.isFeatured,
    sortOrder: story.sortOrder,
    images: story.images.map((image) => ({
      id: image.id,
      publicUrl: image.publicUrl,
      originalName: image.originalName,
      altText: image.altText,
      sourceNote: image.sourceNote,
      sortOrder: image.sortOrder,
    })),
  };

  return (
    <article>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C8956C]">Customer Story</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h2 className="text-3xl font-bold text-[#3D3330]">Edit {story.displayName}</h2>
        <StatusBadge status={story.status} />
      </div>
      <p className="mb-8 mt-2 text-[#5C534E]">Update the quote, source details, product link and customer images.</p>
      <StoryForm initialData={initialData} products={products} />
      <ContentActions type="stories" id={story.id} status={story.status} updatedAt={story.updatedAt.toISOString()} />
    </article>
  );
}
