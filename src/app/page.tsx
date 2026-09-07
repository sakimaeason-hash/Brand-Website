import HomePageClient from "@/components/HomePageClient";
import { listFeaturedProducts, listPublishedPromotions, listPublishedStories } from "@/lib/content/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, stories, promotions] = await Promise.all([
    listFeaturedProducts(),
    listPublishedStories(),
    listPublishedPromotions(),
  ]);

  return (
    <HomePageClient
      featuredProducts={featuredProducts}
      testimonials={stories}
      promotion={promotions[0]}
    />
  );
}
