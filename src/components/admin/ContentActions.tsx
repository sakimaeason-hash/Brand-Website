"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Send, Trash2, Undo2 } from "lucide-react";

type ContentType = "products" | "stories" | "promotions";
type Action = "publish" | "unpublish" | "delete";

export type ContentActionError = {
  message: string;
  fields: unknown[];
};

export function ContentActions({
  type,
  id,
  status,
  updatedAt,
  onActionError,
}: {
  type: ContentType;
  id: string;
  status: string;
  updatedAt: string;
  onActionError?: (error: ContentActionError) => void;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function runAction(action: Action) {
    if (action === "delete" && !window.confirm("Delete this item permanently? This cannot be undone.")) return;

    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("action", action);
      form.set("updatedAt", updatedAt);
      if (action === "delete") form.set("confirm", "true");

      const response = await fetch(`/api/admin/${type}/${id}`, { method: "PATCH", body: form });
      const result = await response.json();
      if (!response.ok) {
        const error = {
          message: typeof result?.error === "string" ? result.error : "Action failed",
          fields: Array.isArray(result?.fields) ? result.fields : [],
        };
        if (onActionError) onActionError(error);
        else setMessage(error.message);
        return;
      }

      if (action === "delete") {
        router.push(`/admin/${type}`);
        return;
      }

      setMessage(action === "publish" ? "Published." : "Unpublished.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 border-t border-[#E8DDD4] pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/admin/preview/${type}/${id}`} className="inline-flex items-center gap-2 rounded-lg border border-[#D4CCC5] bg-white px-4 py-2 text-sm font-semibold text-[#3D3330]">
          <Eye aria-hidden="true" className="h-4 w-4" /> Preview
        </Link>
        <button type="button" disabled={busy || status === "PUBLISHED"} onClick={() => runAction("publish")} className="inline-flex items-center gap-2 rounded-lg bg-[#C8956C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          <Send aria-hidden="true" className="h-4 w-4" /> Publish
        </button>
        <button type="button" disabled={busy || status === "UNPUBLISHED"} onClick={() => runAction("unpublish")} className="inline-flex items-center gap-2 rounded-lg border border-[#D4CCC5] bg-white px-4 py-2 text-sm font-semibold text-[#3D3330] disabled:opacity-50">
          <Undo2 aria-hidden="true" className="h-4 w-4" /> Unpublish
        </button>
        <button type="button" disabled={busy} onClick={() => runAction("delete")} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">
          <Trash2 aria-hidden="true" className="h-4 w-4" /> Delete
        </button>
      </div>
      {message && <p role="status" className="mt-3 text-sm text-[#5C534E]">{message}</p>}
    </div>
  );
}
