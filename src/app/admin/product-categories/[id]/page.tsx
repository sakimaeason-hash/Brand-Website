import { notFound } from "next/navigation";
import { CategoryForm, type CategoryFormData } from "@/components/admin/CategoryForm";
import { listAdminCategories } from "@/lib/catalog/category-service";

export const dynamic = "force-dynamic";

export default async function EditProductCategoryPage({ params }: { params: { id: string } }) {
  const categories = await listAdminCategories();
  const category = categories.find((item: any) => item.id === params.id) as any;
  if (!category) notFound();
  const initialData: CategoryFormData = {
    id: category.id,
    updatedAt: category.updatedAt.toISOString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    role: category.role,
    recommendationProfile: category.recommendationProfile,
    status: category.status,
    sortOrder: category.sortOrder,
    templateVersion: category.templateVersion,
    productCount: category._count?.products ?? 0,
    fields: category.fields.map((field: any) => ({ ...field, options: Array.isArray(field.options) ? field.options : [], minValue: field.minValue == null ? null : Number(field.minValue), maxValue: field.maxValue == null ? null : Number(field.maxValue) })),
  };
  return <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C8956C]">Catalog</p><h2 className="mt-2 text-3xl font-bold text-[#3D3330]">Edit {category.name}</h2><p className="mt-2 mb-8 text-[#5C534E]">Template version {category.templateVersion} · {initialData.productCount} product{initialData.productCount === 1 ? "" : "s"}</p><CategoryForm initialData={initialData} /></div>;
}
