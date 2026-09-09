import { ProductForm } from "@/components/admin/ProductForm";
import { loadProductEditorOptions } from "@/lib/catalog/admin-product-editor";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { categories, accessories } = await loadProductEditorOptions();
  return <div>
    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C8956C]">Products</p>
    <h2 className="mt-2 text-3xl font-bold text-[#3D3330]">Create product draft</h2>
    <p className="mb-8 mt-2 text-[#5C534E]">Add product information, SKUs, verified specifications, accessories, and media.</p>
    <ProductForm categories={categories} accessories={accessories} />
  </div>;
}
