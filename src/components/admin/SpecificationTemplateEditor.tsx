"use client";

import { ArrowDown, ArrowUp, Archive, Plus } from "lucide-react";
import { POWERED_REQUIRED_SEMANTICS, MANUAL_REQUIRED_SEMANTICS, SEMANTIC_FIELDS } from "@/lib/catalog/semantic-fields";

export type EditableSpecificationField = {
  id?: string;
  key: string;
  label: string;
  group: string;
  scope: "PRODUCT" | "VARIANT";
  dataType: "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT" | "DIMENSIONS";
  unitFamily: string;
  defaultDisplayUnit?: string | null;
  options?: string[];
  helpText?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  requiredForPublish?: boolean;
  requiredForRecommendation?: boolean;
  semanticKey?: string | null;
  isProtected?: boolean;
  status?: "ACTIVE" | "ARCHIVED";
  sortOrder?: number;
};

const protectedLabels: Record<string, string> = {
  maxUserWeight: "Maximum user weight",
  effectiveSeatWidth: "Effective seat width",
  seatDepth: "Seat depth",
  seatHeight: "Seat height",
  seatToFootrest: "Seat-to-footrest vertical distance",
};

function protectedFields(profile: string): EditableSpecificationField[] {
  const required = profile === "POWERED_WHEELCHAIR" ? POWERED_REQUIRED_SEMANTICS : profile === "MANUAL_WHEELCHAIR" ? MANUAL_REQUIRED_SEMANTICS : [];
  return required.map((entry, index) => ({
    ...(() => {
      const semantic = SEMANTIC_FIELDS[entry.semanticKey];
      return { dataType: semantic.dataType, unitFamily: semantic.unitFamily, defaultDisplayUnit: semantic.canonicalUnit };
    })(),
    key: entry.semanticKey,
    label: protectedLabels[entry.semanticKey] ?? entry.semanticKey,
    group: entry.role === "ranking" ? "Recommendation data" : "Fit & seating",
    scope: "VARIANT",
    options: [],
    requiredForRecommendation: true,
    semanticKey: entry.semanticKey,
    isProtected: true,
    status: "ACTIVE",
    sortOrder: index,
  }));
}

export function SpecificationTemplateEditor({ profile, fields, onChange }: { profile: string; fields: EditableSpecificationField[]; onChange: (fields: EditableSpecificationField[]) => void }) {
  const protectedPreview = protectedFields(profile);
  const visibleCustom = fields.filter((field) => !field.isProtected && !field.semanticKey && field.status !== "ARCHIVED");

  function addField() {
    const index = visibleCustom.length + 1;
    onChange([...fields, { key: `field${index}`, label: `Field ${index}`, group: "General", scope: "PRODUCT", dataType: "TEXT", unitFamily: "NONE", options: [], status: "ACTIVE", isProtected: false, sortOrder: fields.length }]);
  }

  function updateField(index: number, changes: Partial<EditableSpecificationField>) {
    const target = visibleCustom[index];
    onChange(fields.map((field) => field === target ? { ...field, ...changes } : field));
  }

  function moveField(index: number, direction: -1 | 1) {
    const next = [...visibleCustom];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const customOrder = new Map(next.map((field, fieldIndex) => [field, fieldIndex]));
    onChange(fields.map((field) => customOrder.has(field) ? { ...field, sortOrder: customOrder.get(field) } : field));
  }

  function archiveField(index: number) {
    const target = visibleCustom[index];
    onChange(fields.filter((field) => field !== target));
  }

  return <div className="space-y-5">
    {protectedPreview.length > 0 && <section aria-labelledby="protected-template-heading" className="border-b border-[#E8DDD4] pb-5"><h3 id="protected-template-heading" className="font-semibold text-[#3D3330]">Protected wheelchair fields</h3><p className="mt-1 text-sm text-[#6B6B6B]">These fit fields are managed by the recommendation rules.</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{protectedPreview.map((field) => <div key={field.key} className="rounded-lg border border-[#E8DDD4] bg-[#FAF7F4] px-3 py-2"><span className="block text-sm font-medium text-[#3D3330]">{field.label}</span><span className="text-xs text-[#6B6B6B]">{field.key} · {field.defaultDisplayUnit ?? "no unit"}</span></div>)}</div></section>}
    <section aria-labelledby="custom-template-heading"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 id="custom-template-heading" className="font-semibold text-[#3D3330]">Custom fields</h3><p className="mt-1 text-sm text-[#6B6B6B]">Add product facts that are specific to this category.</p></div><button type="button" onClick={addField} className="inline-flex items-center gap-2 rounded-md border border-[#C8956C] px-3 py-2 text-sm font-semibold text-[#8B5E3C]" aria-label="Add field"><Plus aria-hidden="true" className="h-4 w-4" />Add field</button></div><div className="mt-4 space-y-4">{visibleCustom.map((field, index) => <fieldset key={field.id ?? `${field.key}-${index}`} className="border-b border-[#F0E9E4] pb-5"><legend className="sr-only">Custom field {index + 1}</legend><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><label className="text-sm font-medium text-[#3D3330]">Field key {index + 1}<input value={field.key} onChange={(event) => updateField(index, { key: event.target.value })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label><label className="text-sm font-medium text-[#3D3330]">Field label {index + 1}<input value={field.label} onChange={(event) => updateField(index, { label: event.target.value })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label><label className="text-sm font-medium text-[#3D3330]">Group<input value={field.group} onChange={(event) => updateField(index, { group: event.target.value })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label><label className="text-sm font-medium text-[#3D3330]">Scope<select value={field.scope} onChange={(event) => updateField(index, { scope: event.target.value as EditableSpecificationField["scope"] })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2"><option value="PRODUCT">Product</option><option value="VARIANT">SKU</option></select></label><label className="text-sm font-medium text-[#3D3330]">Data type<select value={field.dataType} onChange={(event) => updateField(index, { dataType: event.target.value as EditableSpecificationField["dataType"] })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2"><option value="TEXT">Text</option><option value="NUMBER">Number</option><option value="BOOLEAN">Yes / No</option><option value="SELECT">Options</option><option value="DIMENSIONS">Dimensions</option></select></label><label className="text-sm font-medium text-[#3D3330]">Unit family<select value={field.unitFamily} onChange={(event) => updateField(index, { unitFamily: event.target.value })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2"><option value="NONE">None</option><option value="LENGTH">Length</option><option value="WEIGHT">Weight</option><option value="DISTANCE">Distance</option><option value="SPEED">Speed</option><option value="POWER">Power</option><option value="VOLTAGE">Voltage</option><option value="CAPACITY_AH">Battery capacity</option><option value="ENERGY_WH">Battery energy</option><option value="ANGLE">Angle</option></select></label></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm text-[#3D3330]"><input type="checkbox" checked={field.requiredForPublish ?? false} onChange={(event) => updateField(index, { requiredForPublish: event.target.checked })} />Required to publish</label><div className="flex items-center gap-1"><button type="button" title="Move field up" aria-label={`Move ${field.label} up`} onClick={() => moveField(index, -1)} className="rounded-md p-2 text-[#5C534E] hover:bg-[#FAF7F4]"><ArrowUp aria-hidden="true" className="h-4 w-4" /></button><button type="button" title="Move field down" aria-label={`Move ${field.label} down`} onClick={() => moveField(index, 1)} className="rounded-md p-2 text-[#5C534E] hover:bg-[#FAF7F4]"><ArrowDown aria-hidden="true" className="h-4 w-4" /></button><button type="button" title="Archive field" aria-label={`Archive ${field.label}`} onClick={() => archiveField(index)} className="rounded-md p-2 text-[#9B4D4D] hover:bg-[#FFF4F4]"><Archive aria-hidden="true" className="h-4 w-4" /></button></div></div></fieldset>)}</div></section>
  </div>;
}
