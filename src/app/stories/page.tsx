import StoriesCatalog from "@/components/stories/StoriesCatalog";
import { listPublishedStories } from "@/lib/content/repository";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const stories = await listPublishedStories();
  return <StoriesCatalog initialStories={stories} />;
}
