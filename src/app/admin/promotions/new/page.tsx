import { prisma } from "@/lib/db";
import { PromotionForm } from "@/components/admin/PromotionForm";

export const dynamic = "force-dynamic";

export default async function NewPromotionPage() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, model: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C8956C]">Promotions</p>
      <h2 className="mt-2 text-3xl font-bold text-[#3D3330]">Create scheduled promotion</h2>
      <p className="mb-8 mt-2 text-[#5C534E]">Use one sale price or one percentage discount, never both.</p>
      <PromotionForm products={products} />
    </div>
  );
}
