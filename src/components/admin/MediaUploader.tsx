"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { MAX_CONTENT_IMAGES, validateImage } from "@/lib/content/validation";

export type PendingMedia = {
  id: string;
  preview: string;
  name?: string;
  file?: File;
  persisted?: boolean;
  altText?: string;
  sourceNote?: string;
  error?: string;
};

export function MediaUploader({ value, onChange }: { value: PendingMedia[]; onChange: (items: PendingMedia[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [limitError, setLimitError] = useState("");

  const addFiles = (files: File[]) => {
    setLimitError("");
    if (value.length + files.length > MAX_CONTENT_IMAGES) {
      setLimitError(`A record can contain up to ${MAX_CONTENT_IMAGES} images.`);
    }
    const next = [...value];
    for (const file of files.slice(0, Math.max(0, MAX_CONTENT_IMAGES - value.length))) {
      let error: string | undefined;
      try {
        validateImage(file);
      } catch (validationError) {
        error = validationError instanceof Error ? validationError.message : "Invalid image";
      }
      next.push({
        id: `${file.name}-${file.lastModified}-${next.length}`,
        file,
        name: file.name,
        preview: URL.createObjectURL(file),
        altText: "",
        sourceNote: "",
        error,
      });
    }
    onChange(next);
  };

  const updateItem = (id: string, patch: Partial<PendingMedia>) => {
    onChange(value.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const removeItem = (item: PendingMedia) => {
    if (item.file) URL.revokeObjectURL(item.preview);
    onChange(value.filter((entry) => entry.id !== item.id));
  };

  return (
    <div>
      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center ${dragging ? "border-[#C8956C] bg-[#FAF7F4]" : "border-[#D4CCC5]"}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(Array.from(event.dataTransfer.files)); }}
      >
        <p className="text-sm text-[#5C534E]">Drop product or story images here</p>
        <button type="button" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#C8956C] px-4 py-2 text-sm font-semibold text-white" onClick={() => inputRef.current?.click()}>
          <ImagePlus aria-hidden="true" className="h-4 w-4" />
          Choose images
        </button>
        <input ref={inputRef} className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => addFiles(Array.from(event.target.files ?? []))} />
      </div>
      {limitError && <p role="alert" className="mt-2 text-sm text-red-700">{limitError}</p>}
      {value.length > 0 && (
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((item, index) => {
            const name = item.name || item.file?.name || `Image ${index + 1}`;
            return (
              <li key={item.id} className="rounded-lg border border-[#E8DDD4] bg-white p-3">
                <img src={item.preview} alt={item.altText || name} className="aspect-square w-full rounded object-cover" />
                <p className="mt-2 truncate text-xs text-[#5C534E]">{index + 1}. {name}</p>
                {item.error && <p role="alert" className="mt-1 text-xs text-red-700">{item.error}</p>}
                <label className="mt-3 block text-xs font-medium text-[#3D3330]">
                  Alt text for {name}
                  <input value={item.altText || ""} onChange={(event) => updateItem(item.id, { altText: event.target.value })} className="mt-1 w-full rounded border border-[#D4CCC5] px-2 py-1.5" />
                </label>
                <label className="mt-2 block text-xs font-medium text-[#3D3330]">
                  Source note for {name}
                  <input value={item.sourceNote || ""} onChange={(event) => updateItem(item.id, { sourceNote: event.target.value })} className="mt-1 w-full rounded border border-[#D4CCC5] px-2 py-1.5" />
                </label>
                <div className="mt-3 flex items-center justify-end gap-1">
                  <button type="button" title={`Move ${name} up`} aria-label={`Move ${name} up`} disabled={index === 0} onClick={() => moveItem(index, -1)} className="rounded p-2 text-[#5C534E] hover:bg-[#FAF7F4] disabled:opacity-30"><ArrowUp aria-hidden="true" className="h-4 w-4" /></button>
                  <button type="button" title={`Move ${name} down`} aria-label={`Move ${name} down`} disabled={index === value.length - 1} onClick={() => moveItem(index, 1)} className="rounded p-2 text-[#5C534E] hover:bg-[#FAF7F4] disabled:opacity-30"><ArrowDown aria-hidden="true" className="h-4 w-4" /></button>
                  <button type="button" title="Remove" aria-label="Remove" onClick={() => removeItem(item)} className="rounded p-2 text-red-700 hover:bg-red-50"><Trash2 aria-hidden="true" className="h-4 w-4" /></button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
