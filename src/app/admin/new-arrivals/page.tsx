import Link from "next/link";
import { redirect } from "next/navigation";
import { NewArrivalsManager } from "@/components/admin/NewArrivalsManager";
import { AdminAuthError, requireAdmin } from "@/lib/admin/authorization";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminNewArrivalsPage() {
  try {
    await requireAdmin();
  } catch (error) {
    if (!(error instanceof AdminAuthError)) throw error;
    if (error.status === 401) redirect("/auth/signin?callbackUrl=/admin/new-arrivals");
    return <section><h2 className="text-2xl font-bold text-[#3D3330]">Admin access required</h2><p className="mt-3 text-[#5C534E]">This area is restricted to authorized administrators.</p></section>;
  }
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      model: true,
      status: true,
      isNewArrival: true,
      updatedAt: true,
      categoryRelation: { select: { status: true } },
      variants: { where: { isActive: true }, select: { id: true }, take: 1 },
    },
  });

  return <section>
    <h2 className="text-2xl font-bold text-[#3D3330]">New Arrivals &amp; Offers</h2>
    <p className="mt-3 text-sm leading-relaxed text-[#5C534E]">Only published products with an active category and at least one active SKU appear on the storefront. Adding or removing a selection does not publish, unpublish, or delete the product.</p>
    <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-[#6E4328]">
      <Link href="/admin/promotions" className="underline underline-offset-4">Manage special offers</Link>
      <Link href="/new-arrivals" className="underline underline-offset-4">View storefront</Link>
    </div>
    <NewArrivalsManager products={products.map((product) => ({
      id: product.id,
      name: product.name,
      model: product.model,
      status: product.status,
      isNewArrival: product.isNewArrival,
      updatedAt: product.updatedAt.toISOString(),
      hasActiveCategory: product.categoryRelation?.status === "ACTIVE",
      hasActiveSku: product.variants.length > 0,
    }))} />
  </section>;
}
