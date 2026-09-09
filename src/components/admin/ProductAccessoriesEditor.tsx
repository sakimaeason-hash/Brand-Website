"use client";

import { ArrowDown, ArrowUp, PackagePlus, Trash2 } from "lucide-react";
import type { AccessoryOption, InBoxDraft, ProductFieldError } from "./ProductEditorTypes";

let clientBoxSequence = 1;

export function ProductAccessoriesEditor({ inBoxItems, onInBoxItemsChange, accessoryProductIds, onAccessoryProductIdsChange, accessories, errors }: {
  inBoxItems: InBoxDraft[];
  onInBoxItemsChange: (next: InBoxDraft[]) => void;
  accessoryProductIds: string[];
  onAccessoryProductIdsChange: (next: string[]) => void;
  accessories: readonly AccessoryOption[];
  errors: readonly ProductFieldError[];
}) {
  function addBoxItem() {
    onInBoxItemsChange([...inBoxItems, { localKey: `client-box-${Date.now()}-${clientBoxSequence++}`, name: "", quantity: "1", note: "", sortOrder: String(inBoxItems.length) }]);
  }

  function updateBoxItem(index: number, patch: Partial<InBoxDraft>) {
    onInBoxItemsChange(inBoxItems.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  function moveBoxItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= inBoxItems.length) return;
    const next = inBoxItems.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onInBoxItemsChange(next.map((item, sortOrder) => ({ ...item, sortOrder: String(sortOrder) })));
  }

  return <div className="space-y-10">
    <section aria-labelledby="in-box-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 id="in-box-heading" className="text-base font-semibold text-[#3D3330]">In the Box</h3><p className="mt-1 text-sm text-[#6B6B6B]">List everything included with this product.</p></div>
        <button type="button" onClick={addBoxItem} className="inline-flex items-center gap-2 rounded border border-[#C8956C] px-3 py-2 text-sm font-semibold text-[#7A4E2D]"><PackagePlus aria-hidden="true" className="h-4 w-4" />Add box item</button>
      </div>
      {inBoxItems.length === 0 ? <p className="mt-4 border-y border-[#EEE7E1] py-5 text-sm text-[#6B6B6B]">No package items added.</p> : <div className="mt-4 space-y-3">
        {inBoxItems.map((item, index) => <fieldset key={item.localKey} className="rounded border border-[#DDD3CB] bg-[#FCFAF8] p-4">
          <legend className="sr-only">Box item {index + 1}</legend>
          <div className="grid gap-3 sm:grid-cols-[minmax(12rem,1fr)_7rem_minmax(12rem,1fr)_auto] sm:items-end">
            <label className="text-sm font-medium text-[#3D3330]">Item name<input aria-label={`Box item name ${index + 1}`} value={item.name} onChange={(event) => updateBoxItem(index, { name: event.target.value })} className="mt-1 w-full rounded border border-[#D4CCC5] bg-white px-3 py-2" /></label>
            <label className="text-sm font-medium text-[#3D3330]">Quantity<input aria-label={`Box item quantity ${index + 1}`} type="text" inputMode="numeric" value={item.quantity} onChange={(event) => updateBoxItem(index, { quantity: event.target.value })} className="mt-1 w-full rounded border border-[#D4CCC5] bg-white px-3 py-2" /></label>
            <label className="text-sm font-medium text-[#3D3330]">Note<input aria-label={`Box item note ${index + 1}`} value={item.note} onChange={(event) => updateBoxItem(index, { note: event.target.value })} className="mt-1 w-full rounded border border-[#D4CCC5] bg-white px-3 py-2" /></label>
            <div className="flex items-center gap-1">
              <button type="button" title="Move item up" aria-label={`Move box item ${index + 1} up`} disabled={index === 0} onClick={() => moveBoxItem(index, -1)} className="rounded p-2 text-[#5C534E] hover:bg-white disabled:opacity-30"><ArrowUp aria-hidden="true" className="h-4 w-4" /></button>
              <button type="button" title="Move item down" aria-label={`Move box item ${index + 1} down`} disabled={index === inBoxItems.length - 1} onClick={() => moveBoxItem(index, 1)} className="rounded p-2 text-[#5C534E] hover:bg-white disabled:opacity-30"><ArrowDown aria-hidden="true" className="h-4 w-4" /></button>
              <button type="button" title="Remove item" aria-label={`Remove box item ${index + 1}`} onClick={() => onInBoxItemsChange(inBoxItems.filter((_, itemIndex) => itemIndex !== index))} className="rounded p-2 text-[#9B3030] hover:bg-red-50"><Trash2 aria-hidden="true" className="h-4 w-4" /></button>
            </div>
          </div>
        </fieldset>)}
      </div>}
      {errors.filter((error) => error.fieldKey === "inBoxItems").map((error, index) => <p key={index} role="alert" className="mt-2 text-sm text-[#9B3030]">{error.message}</p>)}
    </section>

    <section aria-labelledby="compatible-accessories-heading">
      <h3 id="compatible-accessories-heading" className="text-base font-semibold text-[#3D3330]">Compatible Accessories</h3>
      <p className="mt-1 text-sm text-[#6B6B6B]">Only published products in an accessory category can be linked.</p>
      {accessories.length === 0 ? <p className="mt-4 border-y border-[#EEE7E1] py-5 text-sm text-[#6B6B6B]">No published accessories are available.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {accessories.map((accessory) => {
          const checked = accessoryProductIds.includes(accessory.id);
          return <label key={accessory.id} className="flex min-h-20 items-center gap-3 rounded border border-[#DDD3CB] bg-white p-3 text-sm text-[#3D3330]">
            <input type="checkbox" aria-label={`${accessory.name} (${accessory.model})`} checked={checked} onChange={(event) => onAccessoryProductIdsChange(event.target.checked ? [...accessoryProductIds, accessory.id] : accessoryProductIds.filter((id) => id !== accessory.id))} />
            {accessory.imageUrl ? <img src={accessory.imageUrl} alt="" className="h-14 w-14 rounded object-cover" /> : <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded bg-[#F1ECE8] text-xs text-[#6B6B6B]">No image</span>}
            <span className="min-w-0"><span className="block font-semibold">{accessory.name}</span><span className="block text-xs text-[#6B6B6B]">{accessory.model} · ${accessory.price.toFixed(2)}</span></span>
          </label>;
        })}
      </div>}
      {errors.filter((error) => error.fieldKey === "accessoryProductIds").map((error, index) => <p key={index} role="alert" className="mt-2 text-sm text-[#9B3030]">{error.message}</p>)}
    </section>
  </div>;
}
