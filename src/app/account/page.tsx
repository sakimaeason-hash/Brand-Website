import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/account");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { orders: true, reviews: true } },
    },
  });

  if (!user) redirect("/auth/signin");

  return (
    <div className="bg-[#FAF8F5] px-4 py-12 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C8956C]">My Account</span>
          <h1 className="mt-3 text-4xl font-bold text-[#3D3330]">Welcome back, {user.name}</h1>
          <p className="mt-3 text-[#6B6B6B]">Manage your GoldSeason account and review your activity.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-2xl border border-[#E8DDD4] bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-xl font-semibold text-[#3D3330]">Profile</h2>
            <dl className="mt-6 space-y-5">
              <div><dt className="text-xs font-semibold uppercase tracking-wider text-[#9E948A]">Name</dt><dd className="mt-1 text-[#3D3330]">{user.name}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wider text-[#9E948A]">Email</dt><dd className="mt-1 text-[#3D3330]">{user.email}</dd></div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-[#9E948A]">Member Since</dt>
                <dd className="mt-1 text-[#3D3330]">{user.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</dd>
              </div>
            </dl>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-[#3D3330] p-6 text-white">
              <p className="text-sm text-white/60">Orders</p>
              <p className="mt-2 text-3xl font-bold">{user._count.orders}</p>
              <Link href="/orders" className="mt-5 inline-block text-sm font-medium text-[#E8D5C4] hover:text-white">View order history →</Link>
            </div>
            <div className="rounded-2xl border border-[#E8DDD4] bg-white p-6">
              <p className="text-sm text-[#6B6B6B]">Reviews</p>
              <p className="mt-2 text-3xl font-bold text-[#3D3330]">{user._count.reviews}</p>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/support" className="inline-flex items-center justify-center rounded-lg bg-[#C8956C] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#8B7355]">Contact Support</Link>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
