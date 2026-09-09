import type { PublicSpecificationGroup } from "@/lib/catalog/types";

export function ProductSpecifications({ groups }: { groups: readonly PublicSpecificationGroup[] }) {
  if (groups.length === 0) return <p className="text-sm text-[#6B625D]">No additional specifications are published.</p>;
  return <div className="space-y-6">
    {groups.map((group) => <section key={group.name} aria-labelledby={`public-spec-${group.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}>
      <h4 id={`public-spec-${group.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`} className="text-sm font-semibold text-[#3D3330]">{group.name}</h4>
      <dl className="mt-2 divide-y divide-[#EEE7E1] border-y border-[#EEE7E1]">
        {group.items.map((item) => <div key={item.key} className="grid grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] gap-4 py-2.5 text-sm">
          <dt className="text-[#6B625D]">{item.label}</dt>
          <dd className="text-right font-medium text-[#3D3330]">{item.displayValue}</dd>
        </div>)}
      </dl>
    </section>)}
  </div>;
}
