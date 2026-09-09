"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { SpecificationFieldDefinition } from "@/lib/catalog/types";
import type { ProductFieldError, VariantDraft } from "./ProductEditorTypes";
import { ProductSpecificationEditor } from "./ProductSpecificationEditor";

let clientVariantSequence = 1;

export function createBlankVariant(sortOrder = 0): VariantDraft {
  const localKey = `client-${Date.now()}-${clientVariantSequence++}`;
  return {
    localKey,
    sku: "",
    factoryModel: "",
    label: "",
    colorName: "",
    colorHex: "",
    priceOverride: "",
    originalPriceOverride: "",
    purchaseLinkOverride: "",
    overridePrice: false,
    overrideOriginalPrice: false,
    overridePurchaseLink: false,
    specifications: {},
    isActive: true,
    sortOrder: String(sortOrder),
  };
}

export function ProductVariantEditor({ variants, fields, errors, onChange }: {
  variants: VariantDraft[];
  fields: readonly SpecificationFieldDefinition[];
  errors: readonly ProductFieldError[];
  onChange: (next: VariantDraft[]) => void;
}) {
  function update(index: number, patch: Partial<VariantDraft>) {
    onChange(variants.map((variant, variantIndex) => variantIndex === index ? { ...variant, ...patch } : variant));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= variants.length) return;
    const next = variants.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((variant, sortOrder) => ({ ...variant, sortOrder: String(sortOrder) })));
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-[#6B6B6B]">Each SKU can have its own color, price, Amazon link, and verified specifications.</p>
      <button type="button" onClick={() => onChange([...variants, createBlankVariant(variants.length)])} className="inline-flex items-center gap-2 rounded border border-[#C8956C] px-3 py-2 text-sm font-semibold text-[#7A4E2D]">
        <Plus aria-hidden="true" className="h-4 w-4" />Add SKU
      </button>
    </div>

    {variants.map((variant, index) => {
      const skuNumber = index + 1;
      const variantErrors = errors.filter((error) => !error.variantId || error.variantId === variant.id || error.variantId === variant.localKey);
      const specificationKeys = new Set(fields.map((field) => field.key));
      const identityErrors = variantErrors.filter((error) => !specificationKeys.has(error.fieldKey));
      const inputClass = "mt-1 w-full rounded border border-[#D4CCC5] bg-white px-3 py-2 text-[#3D3330]";
      return <fieldset key={variant.localKey} className="rounded border border-[#DDD3CB] bg-[#FCFAF8] p-4 sm:p-5">
        <legend className="px-2 text-base font-semibold text-[#3D3330]">SKU {skuNumber}</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-[#3D3330]">SKU code<input id={`variant-${variant.id ?? variant.localKey}-sku`} aria-label={`SKU ${skuNumber}`} value={variant.sku} onChange={(event) => update(index, { sku: event.target.value })} className={inputClass} /></label>
          <label className="text-sm font-medium text-[#3D3330]">Factory model<input aria-label={`Factory model for SKU ${skuNumber}`} value={variant.factoryModel} onChange={(event) => update(index, { factoryModel: event.target.value })} className={inputClass} /></label>
          <label className="text-sm font-medium text-[#3D3330]">Display label<input aria-label={`Display label for SKU ${skuNumber}`} value={variant.label} onChange={(event) => update(index, { label: event.target.value })} className={inputClass} /></label>
          <label className="text-sm font-medium text-[#3D3330]">Color name<input aria-label={`Color name for SKU ${skuNumber}`} value={variant.colorName} onChange={(event) => update(index, { colorName: event.target.value })} className={inputClass} /></label>
          <label className="text-sm font-medium text-[#3D3330]">Color
            <span className="mt-1 flex h-10 items-center gap-2 rounded border border-[#D4CCC5] bg-white px-2">
              <input aria-label={`Color swatch for SKU ${skuNumber}`} type="color" value={/^#[0-9a-f]{6}$/i.test(variant.colorHex) ? variant.colorHex : "#000000"} onChange={(event) => update(index, { colorHex: event.target.value })} className="h-7 w-9 border-0 bg-transparent p-0" />
              <input aria-label={`Color hex for SKU ${skuNumber}`} value={variant.colorHex} placeholder="#000000" onChange={(event) => update(index, { colorHex: event.target.value })} className="min-w-0 flex-1 border-0 p-0 outline-none" />
            </span>
          </label>
          <label className="text-sm font-medium text-[#3D3330]">Sort order<input aria-label={`Sort order for SKU ${skuNumber}`} type="text" inputMode="numeric" value={variant.sortOrder} onChange={(event) => update(index, { sortOrder: event.target.value })} className={inputClass} /></label>
        </div>
        {identityErrors.map((error, errorIndex) => <p key={`${error.fieldKey}-${errorIndex}`} role="alert" className="mt-2 text-sm text-[#9B3030]">{error.message}</p>)}

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <OverrideField label="price" skuNumber={skuNumber} enabled={variant.overridePrice} onEnabled={(enabled) => update(index, { overridePrice: enabled })}>
            <input aria-label={`Price override for SKU ${skuNumber}`} type="text" inputMode="decimal" value={variant.priceOverride} onChange={(event) => update(index, { priceOverride: event.target.value })} className={inputClass} />
          </OverrideField>
          <OverrideField label="original price" skuNumber={skuNumber} enabled={variant.overrideOriginalPrice} onEnabled={(enabled) => update(index, { overrideOriginalPrice: enabled })}>
            <input aria-label={`Original price override for SKU ${skuNumber}`} type="text" inputMode="decimal" value={variant.originalPriceOverride} onChange={(event) => update(index, { originalPriceOverride: event.target.value })} className={inputClass} />
          </OverrideField>
          <OverrideField label="Amazon link" skuNumber={skuNumber} enabled={variant.overridePurchaseLink} onEnabled={(enabled) => update(index, { overridePurchaseLink: enabled })}>
            <input aria-label={`Amazon link override for SKU ${skuNumber}`} type="url" value={variant.purchaseLinkOverride} onChange={(event) => update(index, { purchaseLinkOverride: event.target.value })} className={inputClass} />
          </OverrideField>
        </div>

        <div className="mt-5 border-t border-[#E5DCD5] pt-5">
          <ProductSpecificationEditor fields={fields} value={variant.specifications} onChange={(specifications) => update(index, { specifications })} errors={variantErrors} labelSuffix={` for SKU ${skuNumber}`} idPrefix={`variant-${variant.id ?? variant.localKey}`} />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5DCD5] pt-4">
          <label className="flex items-center gap-2 text-sm text-[#3D3330]"><input type="checkbox" checked={variant.isActive} onChange={(event) => update(index, { isActive: event.target.checked })} />Active SKU</label>
          <div className="flex items-center gap-1">
            <button type="button" title="Move SKU up" aria-label={`Move SKU ${skuNumber} up`} disabled={index === 0} onClick={() => move(index, -1)} className="rounded p-2 text-[#5C534E] hover:bg-white disabled:opacity-30"><ArrowUp aria-hidden="true" className="h-4 w-4" /></button>
            <button type="button" title="Move SKU down" aria-label={`Move SKU ${skuNumber} down`} disabled={index === variants.length - 1} onClick={() => move(index, 1)} className="rounded p-2 text-[#5C534E] hover:bg-white disabled:opacity-30"><ArrowDown aria-hidden="true" className="h-4 w-4" /></button>
            {variants.length > 1 && <button type="button" title="Remove SKU" aria-label={`Remove SKU ${skuNumber}`} onClick={() => onChange(variants.filter((_, variantIndex) => variantIndex !== index))} className="rounded p-2 text-[#9B3030] hover:bg-red-50"><Trash2 aria-hidden="true" className="h-4 w-4" /></button>}
          </div>
        </div>
      </fieldset>;
    })}
  </div>;
}

function OverrideField({ label, skuNumber, enabled, onEnabled, children }: {
  label: string;
  skuNumber: number;
  enabled: boolean;
  onEnabled: (enabled: boolean) => void;
  children: React.ReactNode;
}) {
  return <div>
    <label className="flex items-center gap-2 text-xs font-medium text-[#5C534E]">
      <input aria-label={`Use product default ${label} for SKU ${skuNumber}`} type="checkbox" checked={!enabled} onChange={(event) => onEnabled(!event.target.checked)} />
      Use product default
    </label>
    {enabled && <div className="mt-2">{children}</div>}
  </div>;
}
