"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { MediaUploader, type PendingMedia } from "./MediaUploader";

type ProductImageInput = {
  id: string;
  publicUrl: string;
  originalName: string;
  altText: string | null;
  sourceNote: string | null;
  sortOrder: number;
};

export type ProductFormData = {
  id: string;
  updatedAt: string;
  name: string;
  model: string;
  category: string;
  tagline: string | null;
  description: string | null;
  price: number;
  originalPrice: number | null;
  amazonLink: string | null;
  weightCapacity: string | null;
  seatWidth: string | null;
  range: string | null;
  maxSpeed: string | null;
  productWeight: string | null;
  features: string[];
  isFeatured: boolean;
  sortOrder: number;
  images: ProductImageInput[];
};

const emptyForm = {
  name: "", model: "", category: "wheelchair", tagline: "", description: "", price: "", originalPrice: "",
  amazonLink: "", weightCapacity: "", seatWidth: "", range: "", maxSpeed: "", productWeight: "",
  features: "", isFeatured: false, sortOrder: "0",
};

function initialForm(record?: ProductFormData) {
  if (!record) return emptyForm;
  return {
    name: record.name,
    model: record.model,
    category: record.category,
    tagline: record.tagline || "",
    description: record.description || "",
    price: String(record.price),
    originalPrice: record.originalPrice == null ? "" : String(record.originalPrice),
    amazonLink: record.amazonLink || "",
    weightCapacity: record.weightCapacity || "",
    seatWidth: record.seatWidth || "",
    range: record.range || "",
    maxSpeed: record.maxSpeed || "",
    productWeight: record.productWeight || "",
    features: record.features.join("\n"),
    isFeatured: record.isFeatured,
    sortOrder: String(record.sortOrder),
  };
}

function initialMedia(record?: ProductFormData): PendingMedia[] {
  return record?.images
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => ({
      id: image.id,
      preview: image.publicUrl,
      name: image.originalName,
      persisted: true,
      altText: image.altText || "",
      sourceNote: image.sourceNote || "",
    })) ?? [];
}

export function ProductForm({ initialData }: { initialData?: ProductFormData }) {
  const router = useRouter();
  const [form, setForm] = useState(() => initialForm(initialData));
  const [images, setImages] = useState<PendingMedia[]>(() => initialMedia(initialData));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key: keyof typeof emptyForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const persisted = images.filter((item) => item.persisted);
      const pending = images.filter((item) => item.file && !item.persisted);
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        amazonLink: form.amazonLink || null,
        features: form.features.split("\n").map((item) => item.trim()).filter(Boolean),
        sortOrder: Number(form.sortOrder),
        images: persisted.map((item, sortOrder) => ({ id: item.id, sortOrder, altText: item.altText || null, sourceNote: item.sourceNote || null })),
      };
      const body = new FormData();
      body.set("payload", JSON.stringify(payload));
      body.set("imageMetadata", JSON.stringify(pending.map((item) => ({ altText: item.altText || null, sourceNote: item.sourceNote || null }))));
      pending.forEach((item) => body.append("images", item.file as File));

      const url = initialData ? `/api/admin/products/${initialData.id}` : "/api/admin/products";
      if (initialData) {
        body.set("action", "save-draft");
        body.set("updatedAt", initialData.updatedAt);
        const keptIds = new Set(persisted.map((item) => item.id));
        body.set("removeImageIds", JSON.stringify(initialData.images.filter((image) => !keptIds.has(image.id)).map((image) => image.id)));
      }
      const response = await fetch(url, { method: initialData ? "PATCH" : "POST", body });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error || "Unable to save draft");
        return;
      }
      setMessage(initialData ? "Changes saved." : "Draft saved.");
      if (initialData) router.refresh();
      else if (typeof result.id === "string") router.push(`/admin/products/${result.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save draft");
    } finally {
      setBusy(false);
    }
  }

  const fields = [
    ["name", "Name"], ["model", "Model"], ["tagline", "Tagline"], ["price", "Current price"],
    ["originalPrice", "Original price"], ["amazonLink", "Purchase link"], ["weightCapacity", "Weight capacity"],
    ["seatWidth", "Effective seat width"], ["range", "Range"], ["maxSpeed", "Max speed"],
    ["productWeight", "Product weight"], ["sortOrder", "Sort order"],
  ] as const;

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.slice(0, 2).map(([key, label]) => <TextField key={key} fieldKey={key} label={label} required form={form} update={update} />)}
        <label className="text-sm font-medium text-[#3D3330]">Category
          <select value={form.category} onChange={(event) => update("category", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2">
            <option value="wheelchair">Wheelchair</option><option value="scooter">Scooter</option>
          </select>
        </label>
        {fields.slice(2).map(([key, label]) => <TextField key={key} fieldKey={key} label={label} required={key === "price"} form={form} update={update} />)}
      </div>
      <label className="block text-sm font-medium text-[#3D3330]">Description<textarea value={form.description} onChange={(event) => update("description", event.target.value)} className="mt-1 min-h-28 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>
      <label className="block text-sm font-medium text-[#3D3330]">Features, one per line<textarea value={form.features} onChange={(event) => update("features", event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>
      <label className="flex items-center gap-2 text-sm text-[#3D3330]"><input type="checkbox" checked={form.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)} /> Feature on homepage</label>
      <MediaUploader value={images} onChange={setImages} />
      <div className="flex flex-wrap items-center gap-4">
        <button disabled={busy || images.some((item) => item.error)} className="inline-flex items-center gap-2 rounded-lg bg-[#C8956C] px-5 py-3 font-semibold text-white disabled:opacity-50"><Save aria-hidden="true" className="h-4 w-4" />{busy ? "Saving..." : initialData ? "Save changes" : "Save draft"}</button>
        {message && <p role="status" className="text-sm text-[#5C534E]">{message}</p>}
      </div>
    </form>
  );
}

function TextField({ fieldKey, label, required, form, update }: {
  fieldKey: keyof typeof emptyForm;
  label: string;
  required?: boolean;
  form: typeof emptyForm;
  update: (key: keyof typeof emptyForm, value: string | boolean) => void;
}) {
  const number = fieldKey === "price" || fieldKey === "originalPrice" || fieldKey === "sortOrder";
  return <label className="text-sm font-medium text-[#3D3330]">{label}<input required={required} type={number ? "number" : fieldKey === "amazonLink" ? "url" : "text"} step={fieldKey === "price" || fieldKey === "originalPrice" ? "0.01" : undefined} value={String(form[fieldKey])} onChange={(event) => update(fieldKey, event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>;
}
