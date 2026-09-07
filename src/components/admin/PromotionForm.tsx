"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { etInputToUtc, utcToEtInput } from "@/lib/content/timezone";

export type PromotionProductOption = {
  id: string;
  name: string;
  model: string;
};

export type PromotionFormData = {
  id: string;
  updatedAt: string;
  name: string;
  productId: string;
  startAt: string;
  endAt: string;
  salePrice: number | null;
  discountPercent: number | null;
  label: string | null;
  bannerImageUrl: string | null;
  isAutoScheduleEnabled: boolean;
};

function initialForm(record?: PromotionFormData) {
  return {
    name: record?.name || "",
    productId: record?.productId || "",
    startAt: record ? utcToEtInput(new Date(record.startAt)) : "",
    endAt: record ? utcToEtInput(new Date(record.endAt)) : "",
    salePrice: record?.salePrice == null ? "" : String(record.salePrice),
    discountPercent: record?.discountPercent == null ? "" : String(record.discountPercent),
    label: record?.label || "",
    bannerImageUrl: record?.bannerImageUrl || "",
    isAutoScheduleEnabled: record?.isAutoScheduleEnabled ?? true,
  };
}

export function PromotionForm({
  initialData,
  products = [],
}: {
  initialData?: PromotionFormData;
  products?: PromotionProductOption[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(() => initialForm(initialData));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const body = new FormData();
      body.set("payload", JSON.stringify({
        ...form,
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        discountPercent: form.discountPercent ? Number(form.discountPercent) : null,
        label: form.label || null,
        bannerImageUrl: form.bannerImageUrl || null,
        startAt: etInputToUtc(form.startAt).toISOString(),
        endAt: etInputToUtc(form.endAt).toISOString(),
      }));

      const url = initialData ? `/api/admin/promotions/${initialData.id}` : "/api/admin/promotions";
      if (initialData) {
        body.set("action", "save-draft");
        body.set("updatedAt", initialData.updatedAt);
      }

      const response = await fetch(url, { method: initialData ? "PATCH" : "POST", body });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Unable to save promotion");
        return;
      }

      setMessage(initialData ? "Changes saved." : "Draft saved.");
      if (initialData) router.refresh();
      else if (typeof result.id === "string") router.push(`/admin/promotions/${result.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save promotion");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-5">
      <p className="rounded-lg bg-[#FAF7F4] p-3 text-sm text-[#5C534E]">
        Times are entered in America/New_York Eastern Time (ET) and stored as UTC.
      </p>
      <label className="block text-sm font-medium text-[#3D3330]">
        Promotion name
        <input required value={form.name} onChange={(event) => update("name", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" />
      </label>
      <label className="block text-sm font-medium text-[#3D3330]">
        Product
        <select required value={form.productId} onChange={(event) => update("productId", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2">
          <option value="">Select a product</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.model})</option>)}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-[#3D3330]">
          Start (ET)
          <input required type="datetime-local" value={form.startAt} onChange={(event) => update("startAt", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-[#3D3330]">
          End (ET)
          <input required type="datetime-local" value={form.endAt} onChange={(event) => update("endAt", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-[#3D3330]">
          Sale price
          <input type="number" min="0" step="0.01" value={form.salePrice} onChange={(event) => update("salePrice", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-[#3D3330]">
          Discount percent
          <input type="number" min="0" max="100" step="0.01" value={form.discountPercent} onChange={(event) => update("discountPercent", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" />
        </label>
      </div>
      <label className="block text-sm font-medium text-[#3D3330]">
        Label
        <input value={form.label} onChange={(event) => update("label", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" />
      </label>
      <label className="block text-sm font-medium text-[#3D3330]">
        Banner image URL
        <input type="url" value={form.bannerImageUrl} onChange={(event) => update("bannerImageUrl", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 text-sm text-[#3D3330]">
        <input type="checkbox" checked={form.isAutoScheduleEnabled} onChange={(event) => update("isAutoScheduleEnabled", event.target.checked)} />
        Automatically activate within the scheduled window
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-[#C8956C] px-5 py-3 font-semibold text-white disabled:opacity-50">
          <Save aria-hidden="true" className="h-4 w-4" />
          {busy ? "Saving..." : initialData ? "Save changes" : "Save draft"}
        </button>
        {message && <p role="status" className="text-sm text-[#5C534E]">{message}</p>}
      </div>
    </form>
  );
}
