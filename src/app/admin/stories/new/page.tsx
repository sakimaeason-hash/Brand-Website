import { prisma } from "@/lib/db";
import { StoryForm } from "@/components/admin/StoryForm";

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, model: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C8956C]">Customer Stories</p>
      <h2 className="mt-2 text-3xl font-bold text-[#3D3330]">Add real customer story</h2>
      <p className="mb-8 mt-2 text-[#5C534E]">Images, source and location are optional. Review consent and accuracy before publishing.</p>
      <StoryForm products={products} />
    </div>
  );
}
