import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminStoriesPage() {
  const stories = await prisma.customerStory.findMany({
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C8956C]">Customer Stories</p><h2 className="mt-2 text-3xl font-bold text-[#3D3330]">Review library</h2></div>
        <Link href="/admin/stories/new" className="rounded-lg bg-[#C8956C] px-4 py-2 text-sm font-semibold text-white">New story</Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-xl border border-[#E8DDD4] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#E8DDD4] text-[#6B6B6B]"><tr><th className="p-4">Reviewer</th><th className="p-4">Status</th><th className="p-4">Images</th></tr></thead>
          <tbody>{stories.map((story) => <tr key={story.id} className="border-b border-[#F0E9E4]">
            <td className="p-4"><div className="flex items-center gap-3">
              {story.images[0] ? <Image src={story.images[0].publicUrl} alt={story.displayName} width={56} height={56} className="h-14 w-14 rounded-lg object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#FAF7F4] text-lg font-semibold text-[#C8956C]" aria-hidden="true">{story.displayName.charAt(0).toUpperCase()}</div>}
              <Link href={`/admin/stories/${story.id}`} className="font-semibold text-[#3D3330] hover:text-[#C8956C]">{story.displayName}</Link>
            </div></td>
            <td className="p-4"><StatusBadge status={story.status} /></td>
            <td className="p-4 text-[#6B6B6B]">{story.images.length}</td>
          </tr>)}</tbody>
        </table>
        {stories.length === 0 && <p className="p-8 text-sm text-[#6B6B6B]">No stories yet.</p>}
      </div>
    </div>
  );
}
