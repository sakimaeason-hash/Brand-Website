import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewProductCategoryPage() {
  return <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C8956C]">Catalog</p><h2 className="mt-2 text-3xl font-bold text-[#3D3330]">Create product category</h2><p className="mt-2 mb-8 text-[#5C534E]">Create a reusable template for a product or accessory category.</p><CategoryForm /></div>;
}
