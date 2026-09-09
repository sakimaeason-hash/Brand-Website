"use client";

import { ExternalLink, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { PublicCategorySummary, PublicProduct } from "@/lib/catalog/types";
import { ProductAccessories } from "./ProductAccessories";
import { ProductCategoryNav } from "./ProductCategoryNav";
import { ProductSpecifications } from "./ProductSpecifications";
import { ProductVariantSelector } from "./ProductVariantSelector";

type SortMode = "featured" | "price-low" | "price-high" | "name";

function uniqueCategories(products: readonly PublicProduct[]): PublicCategorySummary[] {
  return Array.from(new Map(products.map((product) => [product.category.id, product.category])).values());
}

export default function ProductsCatalog({ initialProducts = [], categories }: {
  initialProducts?: readonly PublicProduct[];
  categories?: readonly PublicCategorySummary[];
}) {
  const publicCategories = categories ?? uniqueCategories(initialProducts);
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [selectedVariantIds, setSelectedVariantIds] = useState<Record<string, string>>({});
  const [detailProductId, setDetailProductId] = useState<string | null>(null);

  const visibleProducts = useMemo(() => {
    const result = initialProducts.filter((product) => activeCategoryId === "all" || product.category.id === activeCategoryId).slice();
    if (sortMode === "price-low") result.sort((a, b) => (a.variants[0]?.price ?? Infinity) - (b.variants[0]?.price ?? Infinity));
    if (sortMode === "price-high") result.sort((a, b) => (b.variants[0]?.price ?? -Infinity) - (a.variants[0]?.price ?? -Infinity));
    if (sortMode === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortMode === "featured") result.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    return result;
  }, [activeCategoryId, initialProducts, sortMode]);

  const productItems = visibleProducts.filter((product) => product.category.role === "PRODUCT");
  const accessoryItems = visibleProducts.filter((product) => product.category.role === "ACCESSORY");
  const detailProduct = initialProducts.find((product) => product.id === detailProductId) ?? null;

  function selectedVariant(product: PublicProduct) {
    return product.variants.find((variant) => variant.id === selectedVariantIds[product.id]) ?? product.variants[0];
  }

  return <main className="min-h-screen bg-[#F8F6F3] text-[#302B28]">
    <header className="border-b border-[#DED7D1] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-[#8C5936]">GoldSeason</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Mobility Products</h1>
        <p className="mt-3 max-w-2xl text-[#635B56]">Compare published models and choose the exact SKU before continuing to Amazon.</p>
      </div>
    </header>

    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 border-b border-[#DED7D1] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <ProductCategoryNav categories={publicCategories} activeCategoryId={activeCategoryId} onChange={setActiveCategoryId} />
        <label className="flex shrink-0 items-center gap-2 text-sm font-medium text-[#514A45]">
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />Sort
          <select aria-label="Sort products" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="rounded border border-[#CDC4BD] bg-white px-3 py-2">
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      {visibleProducts.length === 0 && <div className="py-20 text-center"><h2 className="text-xl font-semibold">No published products</h2><p className="mt-2 text-sm text-[#6B625D]">Please check back after the catalog is updated.</p></div>}

      {productItems.length > 0 && <CatalogSection title="Products" products={productItems} selectedVariant={selectedVariant} onVariantChange={(productId, variantId) => setSelectedVariantIds((current) => ({ ...current, [productId]: variantId }))} onDetails={setDetailProductId} />}
      {accessoryItems.length > 0 && <CatalogSection title="Accessories" products={accessoryItems} selectedVariant={selectedVariant} onVariantChange={(productId, variantId) => setSelectedVariantIds((current) => ({ ...current, [productId]: variantId }))} onDetails={setDetailProductId} />}
    </div>

    {detailProduct && (() => {
      const variant = selectedVariant(detailProduct);
      if (!variant) return null;
      return <div role="dialog" aria-modal="true" aria-labelledby="product-detail-title" className="fixed inset-0 z-50 overflow-y-auto bg-black/55 p-4 sm:p-8">
        <div className="mx-auto max-w-4xl rounded bg-white shadow-xl">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#DED7D1] bg-white p-5">
            <div><p className="text-xs font-semibold uppercase text-[#8C5936]">{detailProduct.category.name}</p><h2 id="product-detail-title" className="mt-1 text-2xl font-bold">{detailProduct.name}</h2></div>
            <button type="button" title="Close product details" aria-label="Close product details" onClick={() => setDetailProductId(null)} className="rounded p-2 text-[#514A45] hover:bg-[#F3EFEC]"><X aria-hidden="true" className="h-5 w-5" /></button>
          </div>
          <div className="grid gap-8 p-5 md:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.2fr)]">
            <div>{detailProduct.images[0] ? <img src={detailProduct.images[0].url} alt={detailProduct.images[0].alt} className="aspect-square w-full rounded object-cover" /> : <div className="grid aspect-square place-items-center rounded bg-[#EFEAE6] text-sm text-[#6B625D]">Image coming soon</div>}</div>
            <div>
              {detailProduct.description && <p className="text-sm leading-6 text-[#5E5651]">{detailProduct.description}</p>}
              <div className="mt-5"><ProductVariantSelector variants={detailProduct.variants} selectedId={variant.id} onChange={(variantId) => setSelectedVariantIds((current) => ({ ...current, [detailProduct.id]: variantId }))} /></div>
              <PriceAndPurchase product={detailProduct} variant={variant} />
              {detailProduct.features.length > 0 && <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-[#514A45]">{detailProduct.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>}
            </div>
          </div>
          <div className="space-y-10 border-t border-[#DED7D1] p-5">
            <ProductSpecifications groups={[...detailProduct.specifications, ...variant.specifications]} />
            <ProductAccessories inBoxItems={detailProduct.inBoxItems} accessories={detailProduct.compatibleAccessories} />
          </div>
        </div>
      </div>;
    })()}
  </main>;
}

function CatalogSection({ title, products, selectedVariant, onVariantChange, onDetails }: {
  title: string;
  products: readonly PublicProduct[];
  selectedVariant: (product: PublicProduct) => PublicProduct["variants"][number] | undefined;
  onVariantChange: (productId: string, variantId: string) => void;
  onDetails: (productId: string) => void;
}) {
  return <section aria-labelledby={`catalog-${title.toLowerCase()}`} className="py-10">
    <div className="flex items-end justify-between gap-4"><h2 id={`catalog-${title.toLowerCase()}`} className="text-2xl font-bold">{title}</h2><p className="text-sm text-[#6B625D]">{products.length} {products.length === 1 ? "item" : "items"}</p></div>
    <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const variant = selectedVariant(product);
        if (!variant) return null;
        const image = product.images[0];
        return <article key={product.id} className="overflow-hidden rounded border border-[#D8CFC8] bg-white shadow-sm">
          {image ? <img src={image.url} alt={image.alt} className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center bg-[#EFEAE6] text-sm text-[#6B625D]">Image coming soon</div>}
          <div className="p-5">
            <p className="text-xs font-semibold uppercase text-[#8C5936]">{product.category.name}</p>
            <h3 className="mt-1 text-xl font-bold">{product.name}</h3>
            {product.tagline && <p className="mt-1 text-sm text-[#6B625D]">{product.tagline}</p>}
            <div className="mt-4"><ProductVariantSelector variants={product.variants} selectedId={variant.id} onChange={(variantId) => onVariantChange(product.id, variantId)} /></div>
            <PriceAndPurchase product={product} variant={variant} />
            <button type="button" onClick={() => onDetails(product.id)} className="mt-3 w-full rounded border border-[#A66D45] px-4 py-2.5 text-sm font-semibold text-[#75482C] hover:bg-[#FBF5F0]">View details</button>
          </div>
        </article>;
      })}
    </div>
  </section>;
}

function PriceAndPurchase({ product, variant }: {
  product: PublicProduct;
  variant: PublicProduct["variants"][number];
}) {
  return <div className="mt-5">
    <div className="flex items-baseline gap-2"><span className="text-2xl font-bold">${variant.price.toFixed(2)}</span>{variant.originalPrice != null && variant.originalPrice > variant.price && <span className="text-sm text-[#7C746F] line-through">${variant.originalPrice.toFixed(2)}</span>}</div>
    {variant.purchaseLink ? <a href={variant.purchaseLink} target="_blank" rel="noopener noreferrer" aria-label={`Buy ${variant.sku} on Amazon`} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded bg-[#A66D45] px-4 py-3 text-sm font-semibold text-white hover:bg-[#8D5935]">Buy on Amazon<ExternalLink aria-hidden="true" className="h-4 w-4" /></a> : <a href={`/contact?product=${encodeURIComponent(product.id)}&sku=${encodeURIComponent(variant.sku)}`} className="mt-3 inline-flex w-full items-center justify-center rounded bg-[#4D4743] px-4 py-3 text-sm font-semibold text-white">Contact us</a>}
  </div>;
}
