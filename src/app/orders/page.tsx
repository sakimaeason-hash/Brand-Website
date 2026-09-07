import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/orders");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-[#FAF8F5] px-4 py-12 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C8956C]">My Account</span><h1 className="mt-3 text-4xl font-bold text-[#3D3330]">Order History</h1></div>
          <Link href="/account" className="text-sm font-medium text-[#2AAAA0] hover:underline">Back to account</Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-[#E8DDD4] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8D5C4] text-2xl">📦</div>
            <h2 className="mt-5 text-2xl font-semibold text-[#3D3330]">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-md text-[#6B6B6B]">Your GoldSeason orders will appear here after checkout.</p>
            <Link href="/products" className="mt-6 inline-flex rounded-lg bg-[#C8956C] px-6 py-3 font-medium text-white hover:bg-[#8B7355]">Explore Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const itemCount = Array.isArray(order.items) ? order.items.length : 0;
              return (
                <article key={order.id} className="rounded-2xl border border-[#E8DDD4] bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div><p className="text-xs font-semibold uppercase tracking-wider text-[#9E948A]">Order</p><p className="mt-1 font-mono text-sm text-[#3D3330]">{order.id}</p></div>
                    <span className="rounded-full bg-[#E8D5C4] px-3 py-1 text-xs font-semibold text-[#5C534E]">{order.status}</span>
                  </div>
                  <div className="mt-5 grid gap-4 border-t border-[#F0EAE5] pt-5 sm:grid-cols-3">
                    <div><p className="text-xs text-[#9E948A]">Date</p><p className="mt-1 text-sm text-[#3D3330]">{order.createdAt.toLocaleDateString("en-US")}</p></div>
                    <div><p className="text-xs text-[#9E948A]">Items</p><p className="mt-1 text-sm text-[#3D3330]">{itemCount}</p></div>
                    <div><p className="text-xs text-[#9E948A]">Total</p><p className="mt-1 text-sm font-semibold text-[#3D3330]">${order.total.toFixed(2)}</p></div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
