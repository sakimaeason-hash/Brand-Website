import { redirect } from "next/navigation";
import { AdminAuthError, requireAdmin } from "@/lib/admin/authorization";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError && error.status === 401) redirect("/auth/signin?callbackUrl=/admin");
    return <main className="mx-auto max-w-2xl px-6 py-20"><h1 className="text-3xl font-bold text-[#3D3330]">Admin access required</h1><p className="mt-3 text-[#5C534E]">This area is restricted to authorized administrators.</p></main>;
  }
  return <div className="min-h-screen bg-[#FAF8F5]"><div className="border-b border-[#E8DDD4] bg-white px-6 py-5"><div className="mx-auto max-w-7xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8956C]">GoldSeason</p><h1 className="mt-1 text-2xl font-bold text-[#3D3330]">Content Administration</h1></div></div><div className="mx-auto flex max-w-7xl flex-col lg:flex-row"><AdminNav /><main className="min-w-0 flex-1 p-6 lg:p-10">{children}</main></div></div>;
}
