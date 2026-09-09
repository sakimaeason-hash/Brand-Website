"use client";

import type { SpecificationFieldDefinition } from "@/lib/catalog/types";
import { unitsForFamily } from "@/lib/catalog/units";
import type { ProductFieldError, SpecificationDraft, SpecificationDraftMap } from "./ProductEditorTypes";

function blankValue(field: SpecificationFieldDefinition): SpecificationDraft["value"] {
  if (field.dataType === "BOOLEAN") return false;
  if (field.dataType === "DIMENSIONS") return { length: "", width: "", height: "" };
  return "";
}

function draftFor(field: SpecificationFieldDefinition, value: SpecificationDraftMap): SpecificationDraft {
  return value[field.key] ?? {
    status: "NOT_PROVIDED",
    value: blankValue(field),
    unit: field.defaultDisplayUnit,
    sourceNote: null,
  };
}

export function ProductSpecificationEditor({ fields, value, onChange, errors = [], labelSuffix = "", idPrefix = "spec" }: {
  fields: readonly SpecificationFieldDefinition[];
  value: SpecificationDraftMap;
  onChange: (next: SpecificationDraftMap) => void;
  errors?: readonly ProductFieldError[];
  labelSuffix?: string;
  idPrefix?: string;
}) {
  const activeFields = fields
    .filter((field) => field.status === "ACTIVE")
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const groups = Array.from(new Set(activeFields.map((field) => field.group)));

  function update(field: SpecificationFieldDefinition, patch: Partial<SpecificationDraft>) {
    onChange({ ...value, [field.key]: { ...draftFor(field, value), ...patch } });
  }

  function updateValue(field: SpecificationFieldDefinition, nextValue: SpecificationDraft["value"]) {
    const current = draftFor(field, value);
    update(field, {
      value: nextValue,
      status: current.status === "CONFLICTING" ? "CONFLICTING" : "PROVIDED",
    });
  }

  if (activeFields.length === 0) {
    return <p className="text-sm text-[#6B6B6B]">This category has no specifications for this level.</p>;
  }

  return <div className="space-y-8">
    {groups.map((group) => <section key={group} aria-labelledby={`spec-group-${group.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}>
      <h3 id={`spec-group-${group.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`} className="text-base font-semibold text-[#3D3330]">{group}</h3>
      <div className="mt-3 divide-y divide-[#EEE7E1] border-y border-[#EEE7E1]">
        {activeFields.filter((field) => field.group === group).map((field) => {
          const draft = draftFor(field, value);
          const label = `${field.label}${labelSuffix}`;
          const fieldErrors = errors.filter((error) => error.fieldKey === field.key);
          const units = unitsForFamily(field.unitFamily);
          const dimensions = typeof draft.value === "object" && draft.value !== null
            ? draft.value
            : { length: "", width: "", height: "" };
          const inputClass = "mt-1 w-full rounded border border-[#D4CCC5] bg-white px-3 py-2 text-[#3D3330]";
          const fieldId = `${idPrefix}-${field.key}`;

          return <div key={field.key} className="grid gap-3 py-4 lg:grid-cols-[minmax(13rem,0.8fr)_minmax(16rem,1.4fr)] lg:gap-6">
            <div>
              <p className="text-sm font-semibold text-[#3D3330]">{field.label}{field.requiredForPublish ? <span className="ml-1 text-[#9B4D4D]">*</span> : null}</p>
              {field.helpText && <p className="mt-1 text-xs leading-5 text-[#6B6B6B]">{field.helpText}</p>}
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-medium text-[#5C534E]">Data status
                <select aria-label={`${label} status`} value={draft.status} onChange={(event) => {
                  const status = event.target.value as SpecificationDraft["status"];
                  update(field, { status, value: status === "NOT_PROVIDED" ? null : draft.value ?? blankValue(field) });
                }} className={inputClass}>
                  <option value="PROVIDED">Provided</option>
                  <option value="NOT_PROVIDED">Not provided</option>
                  <option value="CONFLICTING">Conflicting source data</option>
                </select>
              </label>

              {field.dataType === "TEXT" && <label className="block text-sm font-medium text-[#3D3330]">{field.label}
                <input id={fieldId} aria-label={label} type="text" value={typeof draft.value === "string" ? draft.value : ""} onChange={(event) => updateValue(field, event.target.value)} className={inputClass} />
              </label>}

              {field.dataType === "NUMBER" && <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7rem]">
                <label className="block text-sm font-medium text-[#3D3330]">{field.label}
                  <input id={fieldId} aria-label={label} type="text" inputMode="decimal" value={typeof draft.value === "string" ? draft.value : ""} onChange={(event) => updateValue(field, event.target.value)} className={inputClass} />
                </label>
                {units.length > 0 && <label className="block text-sm font-medium text-[#3D3330]">Unit
                  <select aria-label={`${label} unit`} value={draft.unit ?? units[0]} onChange={(event) => update(field, { unit: event.target.value })} className={inputClass}>{units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select>
                </label>}
              </div>}

              {field.dataType === "BOOLEAN" && <label className="flex items-center gap-2 text-sm font-medium text-[#3D3330]">
                <input id={fieldId} aria-label={label} type="checkbox" checked={draft.value === true} onChange={(event) => updateValue(field, event.target.checked)} />
                Yes
              </label>}

              {field.dataType === "SELECT" && <label className="block text-sm font-medium text-[#3D3330]">{field.label}
                <select id={fieldId} aria-label={label} value={typeof draft.value === "string" ? draft.value : ""} onChange={(event) => updateValue(field, event.target.value)} className={inputClass}>
                  <option value="">Select an option</option>
                  {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>}

              {field.dataType === "DIMENSIONS" && <div className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-3">
                  {(["length", "width", "height"] as const).map((axis) => <label key={axis} className="block text-sm font-medium capitalize text-[#3D3330]">{axis}
                    <input id={axis === "length" ? fieldId : undefined} aria-label={`${label} ${axis}`} type="text" inputMode="decimal" value={dimensions[axis]} onChange={(event) => updateValue(field, { ...dimensions, [axis]: event.target.value })} className={inputClass} />
                  </label>)}
                </div>
                {units.length > 0 && <label className="block max-w-32 text-sm font-medium text-[#3D3330]">Unit
                  <select aria-label={`${label} unit`} value={draft.unit ?? units[0]} onChange={(event) => update(field, { unit: event.target.value })} className={inputClass}>{units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select>
                </label>}
              </div>}

              {draft.status === "CONFLICTING" && <label className="block text-sm font-medium text-[#3D3330]">Source note
                <textarea aria-label={`${label} source note`} value={draft.sourceNote ?? ""} onChange={(event) => update(field, { sourceNote: event.target.value })} className={`${inputClass} min-h-20`} />
              </label>}
              {fieldErrors.map((error, index) => <p key={`${error.fieldKey}-${index}`} role="alert" className="text-sm text-[#9B3030]">{error.message}</p>)}
            </div>
          </div>;
        })}
      </div>
    </section>)}
  </div>;
}
