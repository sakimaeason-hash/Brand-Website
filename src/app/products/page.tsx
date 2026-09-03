import ProductsCatalog from "@/components/products/ProductsCatalog";
import { listPublishedProducts } from "@/lib/content/repository";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listPublishedProducts();
  return <ProductsCatalog initialProducts={products} />;
}
