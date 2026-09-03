import { notFound } from "next/navigation";
import { getDraftPreview } from "@/lib/content/repository";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminPreviewPage({ params }: { params: { type: string; id: string } }) {
  if (!(["products", "stories", "promotions"] as string[]).includes(params.type)) notFound();
  const record = await getDraftPreview(params.type as "products" | "stories" | "promotions", params.id);
  if (!record) notFound();
  const title = "name" in record ? record.name : "displayName" in record ? record.displayName : "Promotion preview";
  return <article className="mx-auto max-w-3xl rounded-xl border border-[#E8DDD4] bg-white p-8 shadow-sm"><div className="mb-6 inline-flex rounded-full bg-[#FAE7B8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#6B4F1D]">Draft · Admin only</div><h1 className="text-4xl font-bold text-[#3D3330]">{title}</h1>{"quote" in record && <blockquote className="mt-6 border-l-4 border-[#C8956C] pl-5 text-lg italic text-[#5C534E]">{record.quote}</blockquote>}{"description" in record && record.description && <p className="mt-6 leading-relaxed text-[#5C534E]">{record.description}</p>}</article>;
}
