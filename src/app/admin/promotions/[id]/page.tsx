import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ContentActions } from "@/components/admin/ContentActions";
import { PromotionForm, type PromotionFormData } from "@/components/admin/PromotionForm";

export default async function AdminPromotionDetail({ params }: { params: { id: string } }) {
  const [promotion, products] = await Promise.all([
    prisma.promotion.findUnique({ where: { id: params.id }, include: { product: true } }),
    prisma.product.findMany({
      select: { id: true, name: true, model: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);
  if (!promotion) notFound();

  const initialData: PromotionFormData = {
    id: promotion.id,
    updatedAt: promotion.updatedAt.toISOString(),
    name: promotion.name,
    productId: promotion.productId,
    startAt: promotion.startAt.toISOString(),
    endAt: promotion.endAt.toISOString(),
    salePrice: promotion.salePrice == null ? null : Number(promotion.salePrice),
    discountPercent: promotion.discountPercent == null ? null : Number(promotion.discountPercent),
    label: promotion.label,
    bannerImageUrl: promotion.bannerImageUrl,
    isAutoScheduleEnabled: promotion.isAutoScheduleEnabled,
  };

  return (
    <article>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C8956C]">Promotion</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h2 className="text-3xl font-bold text-[#3D3330]">Edit {promotion.name}</h2>
        <StatusBadge status={promotion.status} />
      </div>
      <p className="mb-8 mt-2 text-[#5C534E]">Schedule and price this promotion in America/New_York Eastern Time.</p>
      <PromotionForm initialData={initialData} products={products} />
      <ContentActions type="promotions" id={promotion.id} status={promotion.status} updatedAt={promotion.updatedAt.toISOString()} />
    </article>
  );
}
