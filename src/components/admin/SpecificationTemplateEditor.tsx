"use client";

import { ArrowDown, ArrowUp, Archive, Plus } from "lucide-react";
import { MANUAL_REQUIRED_SEMANTICS, POWERED_REQUIRED_SEMANTICS, SEMANTIC_FIELDS } from "@/lib/catalog/semantic-fields";
import type { UnitFamily } from "@/lib/catalog/types";
import { unitsForFamily } from "@/lib/catalog/units";

export type EditableSpecificationField = {
  id?: string;
  key: string;
  label: string;
  group: string;
  scope: "PRODUCT" | "VARIANT";
  dataType: "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT" | "DIMENSIONS";
  unitFamily: UnitFamily;
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

const unitFamilies: Array<{ value: UnitFamily; label: string }> = [
  { value: "NONE", label: "None" },
  { value: "LENGTH", label: "Length" },
  { value: "WEIGHT", label: "Weight" },
  { value: "DISTANCE", label: "Distance" },
  { value: "SPEED", label: "Speed" },
  { value: "POWER", label: "Power" },
  { value: "VOLTAGE", label: "Voltage" },
  { value: "CAPACITY_AH", label: "Battery capacity" },
  { value: "ENERGY_WH", label: "Battery energy" },
  { value: "ANGLE", label: "Angle" },
];

function protectedFields(profile: string): EditableSpecificationField[] {
  const required = profile === "POWERED_WHEELCHAIR"
    ? POWERED_REQUIRED_SEMANTICS
    : profile === "MANUAL_WHEELCHAIR"
      ? MANUAL_REQUIRED_SEMANTICS
      : [];
  return required.map((entry, index) => {
    const semantic = SEMANTIC_FIELDS[entry.semanticKey];
    return {
      key: entry.semanticKey,
      label: protectedLabels[entry.semanticKey] ?? entry.semanticKey,
      group: entry.role === "ranking" ? "Recommendation data" : "Fit & seating",
      scope: "VARIANT",
      dataType: semantic.dataType,
      unitFamily: semantic.unitFamily,
      defaultDisplayUnit: semantic.canonicalUnit,
      options: [],
      helpText: null,
      minValue: null,
      maxValue: null,
      requiredForPublish: false,
      requiredForRecommendation: true,
      semanticKey: entry.semanticKey,
      isProtected: true,
      status: "ACTIVE",
      sortOrder: index,
    };
  });
}

function optionsFromText(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((option) => option.trim())
    .filter(Boolean);
}

export function SpecificationTemplateEditor({
  profile,
  fields,
  onChange,
}: {
  profile: string;
  fields: EditableSpecificationField[];
  onChange: (fields: EditableSpecificationField[]) => void;
}) {
  const configuredProtected = fields.filter((field) => field.isProtected || field.semanticKey);
  const generatedProtected = protectedFields(profile);
  const generatedKeys = new Set(generatedProtected.map((field) => field.key));
  const protectedPreview = [
    ...generatedProtected.map((field) => configuredProtected.find((candidate) => candidate.key === field.key) ?? field),
    ...configuredProtected.filter((field) => !generatedKeys.has(field.key)),
  ];
  const visibleCustom = fields.filter((field) => !field.isProtected && !field.semanticKey && field.status !== "ARCHIVED");

  function addField() {
    const index = visibleCustom.length + 1;
    onChange([...fields, {
      key: `field${index}`,
      label: `Field ${index}`,
      group: "General",
      scope: "PRODUCT",
      dataType: "TEXT",
      unitFamily: "NONE",
      defaultDisplayUnit: null,
      options: [],
      helpText: null,
      minValue: null,
      maxValue: null,
      status: "ACTIVE",
      isProtected: false,
      sortOrder: fields.length,
    }]);
  }

  function updateField(index: number, changes: Partial<EditableSpecificationField>) {
    const target = visibleCustom[index];
    onChange(fields.map((field) => field === target ? { ...field, ...changes } : field));
  }

  function updateProtectedField(key: string, changes: Partial<Pick<EditableSpecificationField, "label" | "helpText" | "sortOrder">>) {
    onChange(fields.map((field) => field.key === key && (field.isProtected || field.semanticKey) ? { ...field, ...changes } : field));
  }

  function changeDataType(index: number, dataType: EditableSpecificationField["dataType"]) {
    const field = visibleCustom[index];
    if (["TEXT", "BOOLEAN", "SELECT"].includes(dataType)) {
      updateField(index, {
        dataType,
        unitFamily: "NONE",
        defaultDisplayUnit: null,
        minValue: null,
        maxValue: null,
        options: dataType === "SELECT" ? field.options ?? [] : [],
      });
      return;
    }
    if (dataType === "DIMENSIONS") {
      updateField(index, { dataType, unitFamily: "LENGTH", defaultDisplayUnit: "mm", options: [] });
      return;
    }
    updateField(index, { dataType, options: [] });
  }

  function changeUnitFamily(index: number, unitFamily: UnitFamily) {
    const units = unitsForFamily(unitFamily);
    updateField(index, { unitFamily, defaultDisplayUnit: units[0] ?? null });
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

  return <div className="space-y-6">
    {protectedPreview.length > 0 && <section aria-labelledby="protected-template-heading" className="border-b border-[#E8DDD4] pb-6">
      <h3 id="protected-template-heading" className="font-semibold text-[#3D3330]">Protected wheelchair fields</h3>
      <p className="mt-1 text-sm text-[#6B6B6B]">Recommendation semantics stay locked; display labels, help text, and order can be edited.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {protectedPreview.map((field) => {
          const isConfigured = configuredProtected.some((candidate) => candidate.key === field.key);
          return <div key={field.key} className="rounded-lg border border-[#E8DDD4] bg-[#FAF7F4] p-3">
            {isConfigured ? <div className="space-y-3">
              <label className="block text-sm font-medium text-[#3D3330]">Display label
                <input aria-label={`Protected field label ${field.key}`} value={field.label} onChange={(event) => updateProtectedField(field.key, { label: event.target.value })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2" />
              </label>
              <label className="block text-sm font-medium text-[#3D3330]">Help text
                <textarea aria-label={`Protected field help ${field.key}`} value={field.helpText ?? ""} onChange={(event) => updateProtectedField(field.key, { helpText: event.target.value || null })} className="mt-1 min-h-20 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2" />
              </label>
              <label className="block text-sm font-medium text-[#3D3330]">Display order
                <input aria-label={`Protected field order ${field.key}`} type="number" min="0" value={field.sortOrder ?? 0} onChange={(event) => updateProtectedField(field.key, { sortOrder: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2" />
              </label>
            </div> : <span className="block text-sm font-medium text-[#3D3330]">{field.label}</span>}
            <span className="mt-2 block text-xs text-[#6B6B6B]">{field.key} | {field.defaultDisplayUnit ?? "no unit"}</span>
          </div>;
        })}
      </div>
    </section>}

    <section aria-labelledby="custom-template-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="custom-template-heading" className="font-semibold text-[#3D3330]">Custom fields</h3>
          <p className="mt-1 text-sm text-[#6B6B6B]">Add product facts that are specific to this category.</p>
        </div>
        <button type="button" onClick={addField} className="inline-flex items-center gap-2 rounded-md border border-[#C8956C] px-3 py-2 text-sm font-semibold text-[#8B5E3C]" aria-label="Add field">
          <Plus aria-hidden="true" className="h-4 w-4" />Add field
        </button>
      </div>

      <div className="mt-4 space-y-5">
        {visibleCustom.map((field, index) => {
          const displayUnits = unitsForFamily(field.unitFamily);
          return <fieldset key={field.id ?? `${field.key}-${index}`} className="border-b border-[#F0E9E4] pb-5">
            <legend className="sr-only">Custom field {index + 1}</legend>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-medium text-[#3D3330]">Field key {index + 1}<input value={field.key} onChange={(event) => updateField(index, { key: event.target.value })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>
              <label className="text-sm font-medium text-[#3D3330]">Field label {index + 1}<input value={field.label} onChange={(event) => updateField(index, { label: event.target.value })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>
              <label className="text-sm font-medium text-[#3D3330]">Group {index + 1}<input value={field.group} onChange={(event) => updateField(index, { group: event.target.value })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>
              <label className="text-sm font-medium text-[#3D3330]">Scope {index + 1}<select value={field.scope} onChange={(event) => updateField(index, { scope: event.target.value as EditableSpecificationField["scope"] })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2"><option value="PRODUCT">Product</option><option value="VARIANT">SKU</option></select></label>
              <label className="text-sm font-medium text-[#3D3330]">Data type {index + 1}<select value={field.dataType} onChange={(event) => changeDataType(index, event.target.value as EditableSpecificationField["dataType"])} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2"><option value="TEXT">Text</option><option value="NUMBER">Number</option><option value="BOOLEAN">Yes / No</option><option value="SELECT">Options</option><option value="DIMENSIONS">Dimensions</option></select></label>
              <label className="text-sm font-medium text-[#3D3330]">Unit family {index + 1}<select value={field.unitFamily} disabled={["TEXT", "BOOLEAN", "SELECT"].includes(field.dataType)} onChange={(event) => changeUnitFamily(index, event.target.value as UnitFamily)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2 disabled:bg-[#F3F0ED]">{unitFamilies.map((family) => <option key={family.value} value={family.value}>{family.label}</option>)}</select></label>
              {displayUnits.length > 0 && <label className="text-sm font-medium text-[#3D3330]">Display unit {index + 1}<select value={field.defaultDisplayUnit ?? displayUnits[0]} onChange={(event) => updateField(index, { defaultDisplayUnit: event.target.value })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2">{displayUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></label>}
              {field.dataType === "SELECT" && <label className="text-sm font-medium text-[#3D3330] sm:col-span-2">Options {index + 1}<textarea value={(field.options ?? []).join(", ")} onChange={(event) => updateField(index, { options: optionsFromText(event.target.value) })} placeholder="Standard, Heavy duty" className="mt-1 min-h-20 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>}
              <label className="text-sm font-medium text-[#3D3330] sm:col-span-2">Help text {index + 1}<textarea value={field.helpText ?? ""} onChange={(event) => updateField(index, { helpText: event.target.value || null })} className="mt-1 min-h-20 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>
              {["NUMBER", "DIMENSIONS"].includes(field.dataType) && <>
                <label className="text-sm font-medium text-[#3D3330]">Minimum value {index + 1}<input type="number" step="any" value={field.minValue ?? ""} onChange={(event) => updateField(index, { minValue: event.target.value === "" ? null : Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>
                <label className="text-sm font-medium text-[#3D3330]">Maximum value {index + 1}<input type="number" step="any" value={field.maxValue ?? ""} onChange={(event) => updateField(index, { maxValue: event.target.value === "" ? null : Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>
              </>}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-[#3D3330]"><input type="checkbox" checked={field.requiredForPublish ?? false} onChange={(event) => updateField(index, { requiredForPublish: event.target.checked })} />Required to publish</label>
              <div className="flex items-center gap-1">
                <button type="button" title="Move field up" aria-label={`Move ${field.label} up`} onClick={() => moveField(index, -1)} className="rounded-md p-2 text-[#5C534E] hover:bg-[#FAF7F4]"><ArrowUp aria-hidden="true" className="h-4 w-4" /></button>
                <button type="button" title="Move field down" aria-label={`Move ${field.label} down`} onClick={() => moveField(index, 1)} className="rounded-md p-2 text-[#5C534E] hover:bg-[#FAF7F4]"><ArrowDown aria-hidden="true" className="h-4 w-4" /></button>
                <button type="button" title="Archive field" aria-label={`Archive ${field.label}`} onClick={() => archiveField(index)} className="rounded-md p-2 text-[#9B4D4D] hover:bg-[#FFF4F4]"><Archive aria-hidden="true" className="h-4 w-4" /></button>
              </div>
            </div>
          </fieldset>;
        })}
      </div>
    </section>
  </div>;
}
