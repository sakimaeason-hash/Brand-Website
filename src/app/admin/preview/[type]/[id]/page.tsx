import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/authorization";
import { getDraftPreview } from "@/lib/content/repository";

export const metadata = { robots: { index: false, follow: false } };

const previewTypes = ["products", "stories", "promotions"] as const;
type PreviewType = (typeof previewTypes)[number];

function isPreviewType(value: string): value is PreviewType {
  return previewTypes.includes(value as PreviewType);
}

function formatMoney(value: unknown) {
  if (value == null) return "Not set";
  return `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[#9E948A]">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-[#3D3330]">{value == null || value === "" ? "Not provided" : String(value)}</dd>
    </div>
  );
}

function PreviewImages({ images }: { images?: Array<{ id: string; publicUrl: string; altText?: string | null }> }) {
  if (!images?.length) return <p className="text-sm text-[#6B6B6B]">No images uploaded.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {images.map((image, index) => (
        <figure key={image.id} className="overflow-hidden rounded-lg border border-[#E8DDD4] bg-[#FAF8F5]">
          <img src={image.publicUrl} alt={image.altText || `Preview image ${index + 1}`} className="aspect-[4/3] w-full object-contain" />
          <figcaption className="border-t border-[#E8DDD4] px-3 py-2 text-xs text-[#6B6B6B]">Image {index + 1}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export default async function AdminPreviewPage({ params }: { params: { type: string; id: string } }) {
  await requireAdmin();
  if (!isPreviewType(params.type)) notFound();
  const record = await getDraftPreview(params.type, params.id);
  if (!record) notFound();

  if (params.type === "products") {
    const product = record as typeof record & {
      name: string; model: string; tagline?: string | null; description?: string | null;
      price: unknown; originalPrice?: unknown; weightCapacity?: string | null; seatWidth?: string | null;
      range?: string | null; maxSpeed?: string | null; productWeight?: string | null; features: unknown;
      images?: Array<{ id: string; publicUrl: string; altText?: string | null }>;
    };
    const features = Array.isArray(product.features) ? product.features.filter((feature): feature is string => typeof feature === "string") : [];
    return (
      <article className="mx-auto max-w-4xl rounded-xl border border-[#E8DDD4] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 inline-flex rounded-full bg-[#FAE7B8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#6B4F1D]">Draft · Admin only</div>
        <h1 className="text-4xl font-bold text-[#3D3330]">{product.name}</h1>
        <p className="mt-2 text-[#6B6B6B]">Model {product.model} · {product.tagline || "Product preview"}</p>
        <dl className="mt-8 grid gap-5 rounded-xl border border-[#E8DDD4] bg-[#FAF8F5] p-5 sm:grid-cols-2">
          <Field label="Description" value={product.description} />
          <Field label="Price" value={formatMoney(product.price)} />
          <Field label="Original price" value={formatMoney(product.originalPrice)} />
          <Field label="Weight capacity" value={product.weightCapacity} />
          <Field label="Effective seat width" value={product.seatWidth} />
          <Field label="Range" value={product.range} />
          <Field label="Max speed" value={product.maxSpeed} />
          <Field label="Product weight" value={product.productWeight} />
          <Field label="Features" value={features.length ? features.join(" · ") : undefined} />
          <Field label="Status" value={product.status} />
        </dl>
        <section className="mt-8"><h2 className="mb-4 text-xl font-semibold text-[#3D3330]">Images</h2><PreviewImages images={product.images} /></section>
      </article>
    );
  }

  if (params.type === "stories") {
    const story = record as typeof record & {
      displayName: string; location?: string | null; source?: string | null; quote: string; tags: unknown; status: string;
      product?: { name: string } | null; images?: Array<{ id: string; publicUrl: string; altText?: string | null }>;
    };
    const tags = Array.isArray(story.tags) ? story.tags.filter((tag): tag is string => typeof tag === "string") : [];
    return (
      <article className="mx-auto max-w-4xl rounded-xl border border-[#E8DDD4] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 inline-flex rounded-full bg-[#FAE7B8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#6B4F1D]">Draft · Admin only</div>
        <h1 className="text-4xl font-bold text-[#3D3330]">{story.displayName}</h1>
        <dl className="mt-8 grid gap-5 rounded-xl border border-[#E8DDD4] bg-[#FAF8F5] p-5 sm:grid-cols-2">
          <Field label="Location" value={story.location || story.source} />
          <Field label="Product" value={story.product?.name} />
          <Field label="Tags" value={tags.length ? tags.join(" · ") : undefined} />
          <Field label="Status" value={story.status} />
        </dl>
        <blockquote className="mt-8 border-l-4 border-[#C8956C] pl-5 text-lg italic leading-relaxed text-[#5C534E]">{story.quote}</blockquote>
        <section className="mt-8"><h2 className="mb-4 text-xl font-semibold text-[#3D3330]">Images</h2><PreviewImages images={story.images} /></section>
      </article>
    );
  }

  const promotion = record as typeof record & {
    name: string; label?: string | null; bannerImageUrl?: string | null; status: string;
    product?: { name: string } | null; startAt: Date; endAt: Date; salePrice?: unknown; discountPercent?: unknown;
  };
  return (
    <article className="mx-auto max-w-4xl rounded-xl border border-[#E8DDD4] bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 inline-flex rounded-full bg-[#FAE7B8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#6B4F1D]">Draft · Admin only</div>
      <h1 className="text-4xl font-bold text-[#3D3330]">{promotion.name}</h1>
      <dl className="mt-8 grid gap-5 rounded-xl border border-[#E8DDD4] bg-[#FAF8F5] p-5 sm:grid-cols-2">
        <Field label="Label" value={promotion.label} />
        <Field label="Product" value={promotion.product?.name} />
        <Field label="Start (ET)" value={new Date(promotion.startAt).toLocaleString("en-US", { timeZone: "America/New_York" })} />
        <Field label="End (ET)" value={new Date(promotion.endAt).toLocaleString("en-US", { timeZone: "America/New_York" })} />
        <Field label="Sale price" value={formatMoney(promotion.salePrice)} />
        <Field label="Discount" value={promotion.discountPercent == null ? undefined : `${Number(promotion.discountPercent)}%`} />
        <Field label="Status" value={promotion.status} />
      </dl>
      {promotion.bannerImageUrl && <section className="mt-8"><h2 className="mb-4 text-xl font-semibold text-[#3D3330]">Banner image</h2><img src={promotion.bannerImageUrl} alt={`${promotion.name} banner`} className="max-h-80 w-full rounded-lg object-cover" /></section>}
    </article>
  );
}
