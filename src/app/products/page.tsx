import ProductsCatalog from "@/components/products/ProductsCatalog";
import { listPublicCategories, listPublishedProducts } from "@/lib/content/repository";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([listPublishedProducts(), listPublicCategories()]);
  return <ProductsCatalog initialProducts={products} categories={categories} />;
}
