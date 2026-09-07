import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { prisma } from "@/lib/db";
import { isWithinPromotionWindow, utcToEtInput } from "@/lib/content/timezone";

export const dynamic = "force-dynamic";

type PromotionStatus = "draft" | "scheduled" | "active" | "ended" | "paused";

function derivedStatus(promotion: {
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
  isAutoScheduleEnabled: boolean;
  startAt: Date;
  endAt: Date;
}, now: Date): PromotionStatus {
  if (promotion.status === "DRAFT") return "draft";
  if (promotion.status === "UNPUBLISHED" || !promotion.isAutoScheduleEnabled) return "paused";
  if (now.getTime() < promotion.startAt.getTime()) return "scheduled";
  if (isWithinPromotionWindow(now, promotion.startAt, promotion.endAt)) return "active";
  return "ended";
}

export default async function AdminPromotionsPage() {
  const promotions = await prisma.promotion.findMany({ orderBy: { startAt: "desc" } });
  const now = new Date();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C8956C]">Promotions</p><h2 className="mt-2 text-3xl font-bold text-[#3D3330]">Scheduled campaigns</h2></div>
        <Link href="/admin/promotions/new" className="rounded-lg bg-[#C8956C] px-4 py-2 text-sm font-semibold text-white">New promotion</Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-xl border border-[#E8DDD4] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#E8DDD4] text-[#6B6B6B]"><tr><th className="p-4">Name</th><th className="p-4">Status</th><th className="p-4">Window</th></tr></thead>
          <tbody>{promotions.map((promotion) => {
            const state = derivedStatus(promotion, now);
            return <tr key={promotion.id} className="border-b border-[#F0E9E4]">
              <td className="p-4 font-semibold text-[#3D3330]"><Link href={`/admin/promotions/${promotion.id}`} className="hover:text-[#C8956C]">{promotion.name}</Link></td>
              <td className="p-4"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={promotion.status} /><span className="text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">{state}</span></div></td>
              <td className="p-4 text-[#6B6B6B]">{utcToEtInput(promotion.startAt).replace("T", " ")} – {utcToEtInput(promotion.endAt).replace("T", " ")} ET</td>
            </tr>;
          })}</tbody>
        </table>
        {promotions.length === 0 && <p className="p-8 text-sm text-[#6B6B6B]">No promotions yet.</p>}
      </div>
    </div>
  );
}
