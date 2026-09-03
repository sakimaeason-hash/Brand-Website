"use client";
import { useState } from "react";

export function ContentActions({ type, id, status }: { type: "products" | "stories" | "promotions"; id: string; status: string }) {
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function action(name: "publish" | "unpublish") { setBusy(true); const form = new FormData(); form.set("action", name); const response = await fetch(`/api/admin/${type}/${id}`, { method: "PATCH", body: form }); const result = await response.json(); setMessage(response.ok ? `${name === "publish" ? "Published" : "Unpublished"}.` : result.error || "Action failed"); setBusy(false); }
  return <div className="mt-6 flex flex-wrap items-center gap-3"><button type="button" disabled={busy || status === "PUBLISHED"} onClick={() => action("publish")} className="rounded-lg bg-[#C8956C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Publish</button><button type="button" disabled={busy || status === "UNPUBLISHED"} onClick={() => action("unpublish")} className="rounded-lg border border-[#D4CCC5] px-4 py-2 text-sm font-semibold text-[#3D3330] disabled:opacity-50">Unpublish</button>{message && <p role="status" className="text-sm text-[#5C534E]">{message}</p>}</div>;
}
