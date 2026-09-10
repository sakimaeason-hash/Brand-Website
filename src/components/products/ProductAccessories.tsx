import type { PublicAccessorySummary } from "@/lib/catalog/types";
import { getAmazonPurchaseLink } from "@/lib/amazon-links";

export function ProductAccessories({ inBoxItems, accessories }: {
  inBoxItems: readonly { name: string; quantity: number; note?: string }[];
  accessories: readonly PublicAccessorySummary[];
}) {
  return <div className="grid gap-8 md:grid-cols-2">
    <section aria-labelledby="public-in-box-heading">
      <h4 id="public-in-box-heading" className="text-sm font-semibold text-[#3D3330]">In the Box</h4>
      {inBoxItems.length ? <ul className="mt-2 divide-y divide-[#EEE7E1] border-y border-[#EEE7E1]">{inBoxItems.map((item, index) => <li key={`${item.name}-${index}`} className="flex justify-between gap-4 py-2.5 text-sm"><span>{item.name}{item.note ? <span className="block text-xs text-[#6B625D]">{item.note}</span> : null}</span><span className="font-medium">×{item.quantity}</span></li>)}</ul> : <p className="mt-2 text-sm text-[#6B625D]">Package contents are not listed yet.</p>}
    </section>
    <section aria-labelledby="public-accessories-heading">
      <h4 id="public-accessories-heading" className="text-sm font-semibold text-[#3D3330]">Compatible Accessories</h4>
      {accessories.length ? <ul className="mt-2 space-y-3">{accessories.map((accessory) => {
        const amazonPurchaseLink = getAmazonPurchaseLink(accessory.purchaseLink);
        return <li key={accessory.id} className="flex items-center gap-3 border-b border-[#EEE7E1] pb-3">
          {accessory.image ? <img src={accessory.image.url} alt={accessory.image.alt} className="h-12 w-12 rounded object-cover" /> : <span aria-hidden="true" className="h-12 w-12 rounded bg-[#F1ECE8]" />}
          <span className="min-w-0 flex-1 text-sm"><span className="block font-medium text-[#3D3330]">{accessory.name}</span><span className="text-xs text-[#6B625D]">{accessory.model} · ${accessory.price.toFixed(2)}</span></span>
          {amazonPurchaseLink && <a href={amazonPurchaseLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#7A4E2D]">Amazon</a>}
        </li>;
      })}</ul> : <p className="mt-2 text-sm text-[#6B625D]">No compatible accessories are published.</p>}
    </section>
  </div>;
}
