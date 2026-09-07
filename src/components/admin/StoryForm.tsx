"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { MediaUploader, type PendingMedia } from "./MediaUploader";

const allowedTags = ["Travel", "Comfort", "Support", "New User", "Family", "Independence"] as const;
type StoryTag = (typeof allowedTags)[number];
type ProductOption = { id: string; name: string; model: string };

export type StoryFormData = {
  id: string;
  updatedAt: string;
  displayName: string;
  location: string | null;
  quote: string;
  productId: string | null;
  source: string | null;
  tags: StoryTag[];
  isFeatured: boolean;
  sortOrder: number;
  images: Array<{ id: string; publicUrl: string; originalName: string; altText: string | null; sourceNote: string | null; sortOrder: number }>;
};

function initialMedia(record?: StoryFormData): PendingMedia[] {
  return record?.images.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((image) => ({
    id: image.id,
    preview: image.publicUrl,
    name: image.originalName,
    persisted: true,
    altText: image.altText || "",
    sourceNote: image.sourceNote || "",
  })) ?? [];
}

export function StoryForm({ initialData, products = [] }: { initialData?: StoryFormData; products?: ProductOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState(() => ({
    displayName: initialData?.displayName || "",
    location: initialData?.location || "",
    quote: initialData?.quote || "",
    productId: initialData?.productId || "",
    source: initialData?.source || "",
    tags: initialData?.tags ?? (["Travel", "Comfort"] as StoryTag[]),
    isFeatured: initialData?.isFeatured ?? false,
    sortOrder: String(initialData?.sortOrder ?? 0),
  }));
  const [images, setImages] = useState<PendingMedia[]>(() => initialMedia(initialData));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key: keyof typeof form, value: string | boolean | StoryTag[]) => setForm((current) => ({ ...current, [key]: value }));

  const toggleTag = (tag: StoryTag) => {
    update("tags", form.tags.includes(tag) ? form.tags.filter((value) => value !== tag) : [...form.tags, tag]);
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const persisted = images.filter((item) => item.persisted);
      const pending = images.filter((item) => item.file && !item.persisted);
      const payload = {
        ...form,
        productId: form.productId || null,
        location: form.location || null,
        source: form.source || null,
        sortOrder: Number(form.sortOrder),
        images: persisted.map((item, sortOrder) => ({ id: item.id, sortOrder, altText: item.altText || null, sourceNote: item.sourceNote || null })),
      };
      const body = new FormData();
      body.set("payload", JSON.stringify(payload));
      body.set("imageMetadata", JSON.stringify(pending.map((item) => ({ altText: item.altText || null, sourceNote: item.sourceNote || null }))));
      pending.forEach((item) => body.append("images", item.file as File));
      const url = initialData ? `/api/admin/stories/${initialData.id}` : "/api/admin/stories";
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
      else if (typeof result.id === "string") router.push(`/admin/stories/${result.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save draft");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-[#3D3330]">Display name<input required value={form.displayName} onChange={(event) => update("displayName", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>
        <label className="text-sm font-medium text-[#3D3330]">Location<input value={form.location} onChange={(event) => update("location", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>
        <label className="text-sm font-medium text-[#3D3330]">Source<input value={form.source} onChange={(event) => update("source", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>
        <label className="text-sm font-medium text-[#3D3330]">Product
          <select value={form.productId} onChange={(event) => update("productId", event.target.value)} className="mt-1 w-full rounded-lg border border-[#D4CCC5] bg-white px-3 py-2">
            <option value="">No linked product</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.model})</option>)}
          </select>
        </label>
      </div>
      <label className="block text-sm font-medium text-[#3D3330]">Quote<textarea required value={form.quote} onChange={(event) => update("quote", event.target.value)} className="mt-1 min-h-40 w-full rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>
      <fieldset><legend className="text-sm font-medium text-[#3D3330]">Tags</legend><div className="mt-2 flex flex-wrap gap-3">{allowedTags.map((tag) => <label key={tag} className="flex items-center gap-2 text-sm text-[#5C534E]"><input type="checkbox" checked={form.tags.includes(tag)} onChange={() => toggleTag(tag)} />{tag}</label>)}</div></fieldset>
      <label className="block text-sm font-medium text-[#3D3330]">Sort order<input type="number" value={form.sortOrder} onChange={(event) => update("sortOrder", event.target.value)} className="mt-1 w-full max-w-40 rounded-lg border border-[#D4CCC5] px-3 py-2" /></label>
      <label className="flex items-center gap-2 text-sm text-[#3D3330]"><input type="checkbox" checked={form.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)} /> Feature this story</label>
      <MediaUploader value={images} onChange={setImages} />
      <div className="flex flex-wrap items-center gap-4"><button disabled={busy || images.some((item) => item.error)} className="inline-flex items-center gap-2 rounded-lg bg-[#C8956C] px-5 py-3 font-semibold text-white disabled:opacity-50"><Save aria-hidden="true" className="h-4 w-4" />{busy ? "Saving..." : initialData ? "Save changes" : "Save draft"}</button>{message && <p role="status" className="text-sm text-[#5C534E]">{message}</p>}</div>
    </form>
  );
}
