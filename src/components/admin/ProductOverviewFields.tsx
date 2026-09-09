import type { ProductCategoryOption } from "./ProductEditorTypes";

export type ProductOverviewDraft = {
  name: string;
  model: string;
  categoryId: string;
  tagline: string;
  description: string;
  price: string;
  originalPrice: string;
  amazonLink: string;
  features: string;
  isFeatured: boolean;
  sortOrder: string;
};

export function ProductOverviewFields({ value, categories, onChange, onCategoryChange }: {
  value: ProductOverviewDraft;
  categories: readonly ProductCategoryOption[];
  onChange: (next: ProductOverviewDraft) => void;
  onCategoryChange: (categoryId: string) => void;
}) {
  const update = <K extends keyof ProductOverviewDraft>(key: K, next: ProductOverviewDraft[K]) => onChange({ ...value, [key]: next });
  const inputClass = "mt-1 w-full rounded border border-[#D4CCC5] bg-white px-3 py-2 text-[#3D3330]";
  return <div className="grid gap-5 sm:grid-cols-2">
    <label className="text-sm font-medium text-[#3D3330]">Name<input required value={value.name} onChange={(event) => update("name", event.target.value)} className={inputClass} /></label>
    <label className="text-sm font-medium text-[#3D3330]">Model<input required value={value.model} onChange={(event) => update("model", event.target.value)} className={inputClass} /></label>
    <label className="text-sm font-medium text-[#3D3330]">Category<select required value={value.categoryId} onChange={(event) => onCategoryChange(event.target.value)} className={inputClass}><option value="" disabled>Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
    <label className="text-sm font-medium text-[#3D3330]">Tagline<input value={value.tagline} onChange={(event) => update("tagline", event.target.value)} className={inputClass} /></label>
    <label className="text-sm font-medium text-[#3D3330]">Current price<input required type="text" inputMode="decimal" value={value.price} onChange={(event) => update("price", event.target.value)} className={inputClass} /></label>
    <label className="text-sm font-medium text-[#3D3330]">Original price<input type="text" inputMode="decimal" value={value.originalPrice} onChange={(event) => update("originalPrice", event.target.value)} className={inputClass} /></label>
    <label className="text-sm font-medium text-[#3D3330] sm:col-span-2">Amazon purchase link<input type="url" value={value.amazonLink} onChange={(event) => update("amazonLink", event.target.value)} className={inputClass} /></label>
    <label className="text-sm font-medium text-[#3D3330] sm:col-span-2">Description<textarea value={value.description} onChange={(event) => update("description", event.target.value)} className={`${inputClass} min-h-28`} /></label>
    <label className="text-sm font-medium text-[#3D3330] sm:col-span-2">Features, one per line<textarea value={value.features} onChange={(event) => update("features", event.target.value)} className={`${inputClass} min-h-24`} /></label>
    <label className="text-sm font-medium text-[#3D3330]">Sort order<input type="text" inputMode="numeric" value={value.sortOrder} onChange={(event) => update("sortOrder", event.target.value)} className={inputClass} /></label>
    <label className="flex items-center gap-2 self-end pb-2 text-sm text-[#3D3330]"><input type="checkbox" checked={value.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)} />Feature on homepage</label>
  </div>;
}
