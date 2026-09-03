"use client";

import { useRef, useState } from "react";
import { MAX_CONTENT_IMAGES, validateImage } from "@/lib/content/validation";

export type PendingMedia = { id: string; file: File; preview: string; error?: string };

export function MediaUploader({ value, onChange }: { value: PendingMedia[]; onChange: (items: PendingMedia[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const addFiles = (files: File[]) => {
    const next = [...value];
    for (const file of files) {
      if (next.length >= MAX_CONTENT_IMAGES) break;
      let error: string | undefined;
      try { validateImage(file); } catch (e) { error = e instanceof Error ? e.message : "Invalid image"; }
      next.push({ id: `${file.name}-${file.lastModified}-${next.length}`, file, preview: URL.createObjectURL(file), error });
    }
    onChange(next);
  };
  return <div>
    <div className={`rounded-xl border-2 border-dashed p-6 text-center ${dragging ? "border-[#C8956C] bg-[#FAF7F4]" : "border-[#D4CCC5]"}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); }}>
      <p className="text-sm text-[#5C534E]">Drop product or story images here</p>
      <button type="button" className="mt-3 rounded-lg bg-[#C8956C] px-4 py-2 text-sm font-semibold text-white" onClick={() => inputRef.current?.click()}>Choose images</button>
      <input ref={inputRef} className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => addFiles(Array.from(e.target.files ?? []))} />
    </div>
    {value.length > 0 && <ol className="mt-4 grid gap-3 sm:grid-cols-3">
      {value.map((item, index) => <li key={item.id} className="rounded-lg border border-[#E8DDD4] bg-white p-2">
        <img src={item.preview} alt={item.file.name} className="aspect-square w-full rounded object-cover" />
        <p className="mt-2 truncate text-xs text-[#5C534E]">{index + 1}. {item.file.name}</p>
        {item.error && <p role="alert" className="mt-1 text-xs text-red-700">{item.error}</p>}
        <button type="button" className="mt-2 text-xs font-semibold text-red-700" onClick={() => onChange(value.filter((entry) => entry.id !== item.id))}>Remove</button>
      </li>)}
    </ol>}
  </div>;
}
