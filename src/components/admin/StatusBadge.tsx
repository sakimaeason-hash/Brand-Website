export function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED" }) {
  const labels = { DRAFT: "Draft", PUBLISHED: "Published", UNPUBLISHED: "Unpublished" };
  return <span className="inline-flex rounded-full border border-[#D4CCC5] bg-[#FAF7F4] px-2.5 py-1 text-xs font-semibold text-[#5C534E]">{labels[status]}</span>;
}
