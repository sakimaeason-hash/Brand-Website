import type { PublicCategorySummary } from "@/lib/catalog/types";

export function ProductCategoryNav({ categories, activeCategoryId, onChange }: {
  categories: readonly PublicCategorySummary[];
  activeCategoryId: string;
  onChange: (categoryId: string) => void;
}) {
  return <nav aria-label="Product categories" className="flex max-w-full gap-2 overflow-x-auto pb-2">
    <button type="button" aria-pressed={activeCategoryId === "all"} onClick={() => onChange("all")} className={`shrink-0 border-b-2 px-3 py-2 text-sm font-semibold ${activeCategoryId === "all" ? "border-[#A66D45] text-[#6E4328]" : "border-transparent text-[#6B625D]"}`}>All products</button>
    {categories.map((category) => <button key={category.id} type="button" aria-pressed={activeCategoryId === category.id} onClick={() => onChange(category.id)} className={`shrink-0 border-b-2 px-3 py-2 text-sm font-semibold ${activeCategoryId === category.id ? "border-[#A66D45] text-[#6E4328]" : "border-transparent text-[#6B625D]"}`}>{category.name}</button>)}
  </nav>;
}
