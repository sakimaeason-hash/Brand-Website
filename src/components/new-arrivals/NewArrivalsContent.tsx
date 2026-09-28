import Image from "next/image";
import Link from "next/link";
import type { PublicNewArrivalsContent, PublicProduct, PublicPromotion } from "@/lib/content/repository";

const actionClass = "inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B5738]";
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const offerDate = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });

export function NewArrivalsContent({ content, unavailable = false }: {
  content?: PublicNewArrivalsContent;
  unavailable?: boolean;
}) {
  return <div className="bg-[#FAF7F4] text-[#3D3330]">
    <header className="bg-[#5C534E] px-5 py-16 text-center text-white sm:px-6 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-normal text-[#E8D5C4]">GoldSeason</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">New Arrivals<br /><span className="text-[#E8D5C4]">&amp; Special Offers</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#F3EAE3]">Explore new additions to our mobility collection and current product offers.</p>
        {!unavailable && <nav aria-label="On this page" className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="#new-products" className={`${actionClass} bg-white text-[#70472F] hover:bg-[#F3EAE3] focus-visible:outline-white`}>Explore new arrivals</a>
          <a href="#promotions" className={`${actionClass} border border-[#D4CCC5] text-white hover:bg-white/10 focus-visible:outline-white`}>View special offers</a>
        </nav>}
      </div>
    </header>

    {unavailable ? <section className="mx-auto max-w-3xl px-5 py-20 text-center">
      <div role="alert"><h2 className="text-2xl font-bold">We couldn’t load new arrivals and offers</h2><p className="mt-3 text-lg text-[#5C534E]">Please try again shortly. Product information is temporarily unavailable.</p></div>
      <a href="/new-arrivals" className={`${actionClass} mt-6 bg-[#8B5738] text-white hover:bg-[#70472F]`}>Try again</a>
    </section> : <>
      <section id="new-products" aria-labelledby="new-products-title" className="scroll-mt-24 bg-white px-5 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-[#8B5738]">Discover the collection</p>
          <h2 id="new-products-title" className="mt-2 text-3xl font-bold sm:text-4xl">New arrivals</h2>
          {content?.products.length ? <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {content.products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div> : <EmptyState title="No new arrivals right now" description="Explore our current products, or check back for new additions." />}
        </div>
      </section>
      <section id="promotions" aria-labelledby="promotions-title" className="scroll-mt-24 px-5 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-[#8B5738]">Current promotions</p>
          <h2 id="promotions-title" className="mt-2 text-3xl font-bold sm:text-4xl">Special offers</h2>
          {content?.offers.length ? <>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#5C534E]">Offers apply to the listed base product price. Independently priced SKUs may differ. Confirm your selected SKU and the final price on Amazon before purchasing.</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{content.offers.map(({ promotion, product }) => <ProductCard key={promotion.id} product={product} promotion={promotion} />)}</div>
          </> : <EmptyState title="No active offers right now" description="Any new promotions will appear here once they are available." />}
        </div>
      </section>
    </>}

    <section className="border-t border-[#D4CCC5] px-5 py-12 text-center sm:px-6">
      <h2 className="text-2xl font-bold">Find the right fit for your day</h2>
      <p className="mt-3 text-lg text-[#5C534E]">Compare product options, specifications, and accessories in our catalog.</p>
      <Link href="/products" className={`${actionClass} mt-6 bg-[#8B5738] text-white hover:bg-[#70472F]`}>Browse all products</Link>
    </section>
  </div>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="mt-8 border-y border-[#D4CCC5] py-10"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 text-base leading-relaxed text-[#5C534E]">{description}</p></div>;
}

function ProductCard({ product, promotion }: { product: PublicProduct; promotion?: PublicPromotion }) {
  const image = product.images[0];
  const prices = product.variants.map((variant) => variant.price).filter(Number.isFinite);
  const minimumPrice = prices.length ? Math.min(...prices) : undefined;
  const priceVaries = new Set(prices).size > 1;
  return <article aria-label={promotion?.name ?? product.name} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#D4CCC5] bg-white">
    {image ? <Image unoptimized src={image.url} alt={image.alt} width={640} height={480} className="aspect-[4/3] w-full object-contain p-5" /> : <p className="px-6 pt-6 text-sm text-[#5C534E]">Product image unavailable</p>}
    <div className="flex flex-1 flex-col break-words p-6">
      <p className="text-sm font-semibold text-[#8B5738]">{promotion?.label || (promotion ? "Special offer" : "New arrival")}</p>
      <h3 className="mt-2 text-2xl font-bold">{promotion?.name ?? product.name}</h3>
      {promotion && <p className="mt-2 text-lg font-semibold">{product.name}</p>}
      {product.tagline && <p className="mt-3 text-base leading-relaxed text-[#5C534E]">{product.tagline}</p>}
      {promotion?.discountPercent != null && <p className="mt-4 font-semibold text-[#70472F]">{promotion.discountPercent}% off the base product price</p>}
      {promotion?.salePrice != null && <p className="mt-4 font-semibold text-[#70472F]">Base promotional price: {usd.format(promotion.salePrice)}</p>}
      {minimumPrice != null && <p className="mt-4 text-2xl font-bold">{priceVaries ? "From " : ""}{usd.format(minimumPrice)}</p>}
      <p className="mt-1 text-sm text-[#5C534E]">USD · Choose your SKU to confirm pricing.</p>
      {promotion && <p className="mt-4 text-sm leading-relaxed text-[#5C534E]">Ends <time dateTime={promotion.endAt}>{offerDate.format(new Date(promotion.endAt))}</time></p>}
      <div className="mt-auto pt-6"><Link href="/products" aria-label={`View product options for ${product.name}`} className={`${actionClass} w-full bg-[#8B5738] text-center text-base text-white hover:bg-[#70472F]`}>View product options</Link></div>
    </div>
  </article>;
}
