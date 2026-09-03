import Link from "next/link";

export function AdminNav() {
  return <aside className="w-full border-b border-[#E8DDD4] bg-white lg:min-h-[calc(100vh-5rem)] lg:w-56 lg:border-b-0 lg:border-r">
    <nav aria-label="Admin navigation" className="flex gap-2 overflow-x-auto p-4 lg:flex-col">
      <Link className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-[#3D3330] hover:bg-[#FAF7F4]" href="/admin">Overview</Link>
      <Link className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-[#3D3330] hover:bg-[#FAF7F4]" href="/admin/products">Products</Link>
      <Link className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-[#3D3330] hover:bg-[#FAF7F4]" href="/admin/stories">Customer Stories</Link>
      <Link className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-[#3D3330] hover:bg-[#FAF7F4]" href="/admin/promotions">Promotions</Link>
    </nav>
  </aside>;
}
