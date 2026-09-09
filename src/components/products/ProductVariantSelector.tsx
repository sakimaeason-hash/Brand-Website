import type { PublicProductVariant } from "@/lib/catalog/types";

export function ProductVariantSelector({ variants, selectedId, onChange }: {
  variants: readonly PublicProductVariant[];
  selectedId: string;
  onChange: (variantId: string) => void;
}) {
  if (variants.length <= 1) return variants[0] ? <p className="text-xs text-[#6B625D]">SKU {variants[0].sku}</p> : null;
  return <div>
    <p className="text-xs font-semibold uppercase text-[#6B625D]">Choose SKU</p>
    <div className="mt-2 flex flex-wrap gap-2">
      {variants.map((variant) => {
        const name = variant.colorName || variant.label || variant.sku;
        return <button key={variant.id} type="button" aria-label={`Select ${name} SKU ${variant.sku}`} aria-pressed={selectedId === variant.id} title={`${name} · ${variant.sku}`} onClick={() => onChange(variant.id)} className={`flex min-h-9 items-center gap-2 rounded border px-2.5 py-1.5 text-xs font-medium ${selectedId === variant.id ? "border-[#A66D45] bg-[#F8EFE8] text-[#6E4328]" : "border-[#D8CFC8] bg-white text-[#4F4742]"}`}>
          {variant.colorHex && <span aria-hidden="true" className="h-4 w-4 rounded-full border border-black/15" style={{ backgroundColor: variant.colorHex }} />}
          {name}
        </button>;
      })}
    </div>
  </div>;
}
