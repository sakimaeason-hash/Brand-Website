"use client";

import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StatusBadge } from "./StatusBadge";

export type NewArrivalProduct = {
  id: string;
  name: string;
  model: string;
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
  isNewArrival: boolean;
  updatedAt: string;
  hasActiveCategory: boolean;
  hasActiveSku: boolean;
};

function visibility(product: NewArrivalProduct) {
  if (!product.isNewArrival) return "Not selected";
  if (product.status !== "PUBLISHED") return "Awaiting publication";
  if (!product.hasActiveCategory) return "Inactive or missing category";
  if (!product.hasActiveSku) return "No active SKU";
  return "Visible";
}

export function NewArrivalsManager({ products }: { products: readonly NewArrivalProduct[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(products);
  const [busyId, setBusyId] = useState<string | null>(null);
  const saving = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setRows((current) => products.map((incoming) => {
      const local = current.find((item) => item.id === incoming.id);
      return local && Date.parse(local.updatedAt) > Date.parse(incoming.updatedAt) ? local : incoming;
    }));
  }, [products]);

  async function toggle(product: NewArrivalProduct) {
    if (saving.current) return;
    saving.current = true;
    setBusyId(product.id);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/products/${product.id}/new-arrival`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isNewArrival: !product.isNewArrival, updatedAt: product.updatedAt }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(typeof result.error === "string" ? result.error : "Unable to update New Arrivals. Please try again.");
        if (response.status === 409 || response.status === 404) router.refresh();
        return;
      }
      if (result.id !== product.id || typeof result.isNewArrival !== "boolean" || !Number.isFinite(Date.parse(result.updatedAt))) {
        throw new Error("Invalid update response");
      }
      setRows((current) => current.map((item) => item.id === result.id && Date.parse(item.updatedAt) <= Date.parse(result.updatedAt)
        ? { ...item, isNewArrival: result.isNewArrival, updatedAt: result.updatedAt }
        : item));
      setMessage(`${product.name} ${result.isNewArrival ? "added to" : "removed from"} New Arrivals.`);
      router.refresh();
    } catch {
      setError("Unable to update New Arrivals. Please try again.");
    } finally {
      saving.current = false;
      setBusyId(null);
    }
  }

  return <div className="mt-6">
    {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="mb-4 text-sm text-[#5C534E]">{message}</p>}
    <div className="overflow-x-auto border-y border-[#E8DDD4]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[#E8DDD4] text-[#6B625D]"><tr>
          <th scope="col" className="p-3">Product</th>
          <th scope="col" className="p-3">Status</th>
          <th scope="col" className="p-3">New Arrivals</th>
          <th scope="col" className="p-3">Action</th>
        </tr></thead>
        <tbody>{rows.map((product) => <tr key={product.id} className="border-b border-[#E8DDD4] last:border-b-0">
          <td className="min-w-36 p-3"><Link href={`/admin/products/${product.id}`} className="font-semibold text-[#3D3330] underline underline-offset-4 hover:text-[#A66D45]">{product.name}</Link><p className="mt-1 break-words text-[#6B625D]">{product.model}</p></td>
          <td className="p-3"><StatusBadge status={product.status} /></td>
          <td className="p-3"><span className="font-medium text-[#3D3330]">{visibility(product)}</span></td>
          <td className="p-3"><button type="button" disabled={busyId !== null} aria-busy={busyId === product.id} aria-label={`${product.isNewArrival ? "Remove" : "Add"} ${product.name} ${product.isNewArrival ? "from" : "to"} New Arrivals`} onClick={() => toggle(product)} className="inline-flex min-h-11 min-w-24 items-center justify-center gap-2 rounded border border-[#D4CCC5] bg-white px-3 py-2 font-semibold text-[#3D3330] hover:bg-[#FAF7F4] disabled:opacity-50">
            {product.isNewArrival ? <Minus aria-hidden="true" className="h-4 w-4 shrink-0" /> : <Plus aria-hidden="true" className="h-4 w-4 shrink-0" />}
            {busyId === product.id ? "Saving..." : product.isNewArrival ? "Remove" : "Add"}
          </button></td>
        </tr>)}</tbody>
      </table>
      {rows.length === 0 && <p className="p-6 text-sm text-[#6B625D]">No products yet.</p>}
    </div>
  </div>;
}
