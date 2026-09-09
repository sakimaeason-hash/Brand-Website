"use client";

import { Archive, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SpecificationTemplateEditor, type EditableSpecificationField } from "./SpecificationTemplateEditor";

export type CategoryFormData = {
  id: string;
  updatedAt: string;
  name: string;
  slug: string;
  description: string | null;
  role: "PRODUCT" | "ACCESSORY";
  recommendationProfile: "NONE" | "POWERED_WHEELCHAIR" | "MANUAL_WHEELCHAIR";
  status: "ACTIVE" | "ARCHIVED";
  sortOrder: number;
  templateVersion: number;
  productCount: number;
  fields: EditableSpecificationField[];
};

const emptyCategory = { name: "", slug: "", description: "", role: "PRODUCT" as const, recommendationProfile: "NONE" as const, sortOrder: "0", fields: [] as EditableSpecificationField[] };

function specificationFieldPayload(field: EditableSpecificationField, sortOrder: number) {
  return {
    id: field.id,
    key: field.key,
    label: field.label,
    group: field.group,
    scope: field.scope,
    dataType: field.dataType,
    unitFamily: field.unitFamily,
    defaultDisplayUnit: field.defaultDisplayUnit ?? null,
    options: field.options ?? [],
    helpText: field.helpText ?? null,
    minValue: field.minValue ?? null,
    maxValue: field.maxValue ?? null,
    requiredForPublish: field.requiredForPublish ?? false,
    requiredForRecommendation: field.requiredForRecommendation ?? false,
    semanticKey: field.semanticKey ?? null,
    isProtected: field.isProtected ?? false,
    status: field.status ?? "ACTIVE",
    sortOrder: field.sortOrder ?? sortOrder,
  };
}

export function CategoryForm({ initialData }: { initialData?: CategoryFormData }) {
  const router = useRouter();
  const [form, setForm] = useState(() => initialData ? { name: initialData.name, slug: initialData.slug, description: initialData.description ?? "", role: initialData.role, recommendationProfile: initialData.recommendationProfile, sortOrder: String(initialData.sortOrder), fields: initialData.fields } : emptyCategory);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const payload = {
      ...form,
      sortOrder: Number(form.sortOrder),
      description: form.description || null,
      fields: form.fields
        .filter((field) => field.status !== "ARCHIVED")
        .map(specificationFieldPayload),
    };
    try {
      const response = await fetch(initialData ? `/api/admin/product-categories/${initialData.id}` : "/api/admin/product-categories", { method: initialData ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(initialData ? { action: "save", updatedAt: initialData.updatedAt, payload } : payload) });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error || "Unable to save category"); return; }
      setMessage(initialData ? "Changes saved." : "Category created.");
      if (initialData) router.refresh(); else if (typeof result.id === "string") router.push(`/admin/product-categories/${result.id}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save category"); } finally { setBusy(false); }
  }

  async function archive() {
    if (!initialData || !window.confirm("Archive this category? Existing products will remain available for review.")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/product-categories/${initialData.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "archive", updatedAt: initialData.updatedAt }) });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error || "Unable to archive category"); return; }
      setMessage("Category archived.");
      router.refresh();
    } finally { setBusy(false); }
  }

  const update = (key: "name" | "slug" | "description" | "sortOrder" | "role" | "recommendationProfile", value: string) => setForm((current) => ({ ...current, [key]: value } as typeof current));
  const recommendationProfileLocked = Boolean(initialData && initialData.recommendationProfile !== "NONE" && initialData.fields.some((field) => field.isProtected || field.semanticKey));
  return <form onSubmit={submit} className="max-w-5xl space-y-8">
    <section aria-labelledby="category-overview-heading" className="border-b border-[#E8DDD4] pb-8"><h3 id="category-overview-heading" className="text-xl font-semibold text-[#3D3330]">Overview</h3><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-[#3D3330]">Name<input required value={form.name} onChange={(event) => update("name", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label><label className="text-sm font-medium text-[#3D3330]">Slug<input value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="Generated from name" className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label><label className="text-sm font-medium text-[#3D3330]">Role<select value={form.role} onChange={(event) => update("role", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2"><option value="PRODUCT">Product</option><option value="ACCESSORY">Accessory</option></select></label><label className="text-sm font-medium text-[#3D3330]">Recommendation profile<select aria-label="Recommendation profile" value={form.recommendationProfile} disabled={recommendationProfileLocked} onChange={(event) => update("recommendationProfile", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2 disabled:bg-[#F3F0ED]"><option value="NONE">None</option><option value="POWERED_WHEELCHAIR">Powered wheelchair</option><option value="MANUAL_WHEELCHAIR">Manual wheelchair</option></select></label><label className="text-sm font-medium text-[#3D3330] sm:col-span-2">Description<textarea value={form.description} onChange={(event) => update("description", event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label><label className="text-sm font-medium text-[#3D3330]">Sort order<input type="number" min="0" value={form.sortOrder} onChange={(event) => update("sortOrder", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label></div></section>
    <section aria-labelledby="category-template-heading"><h3 id="category-template-heading" className="text-xl font-semibold text-[#3D3330]">Specification template</h3><div className="mt-5"><SpecificationTemplateEditor profile={form.recommendationProfile} fields={form.fields} onChange={(fields) => setForm((current) => ({ ...current, fields }))} /></div></section>
    <div className="flex flex-wrap items-center gap-3"><button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-[#C8956C] px-5 py-3 font-semibold text-white disabled:opacity-50"><Save aria-hidden="true" className="h-4 w-4" />{busy ? "Saving..." : "Save category"}</button>{initialData && <button type="button" disabled={busy || initialData.status === "ARCHIVED"} onClick={archive} className="inline-flex items-center gap-2 rounded-lg border border-[#C95959] px-4 py-3 font-semibold text-[#9B4D4D] disabled:opacity-50"><Archive aria-hidden="true" className="h-4 w-4" />Archive category</button>}{message && <p role="status" className="text-sm text-[#5C534E]">{message}</p>}</div>
  </form>;
}
