import type { Metadata } from "next";
import { NewArrivalsContent } from "@/components/new-arrivals/NewArrivalsContent";
import { listNewArrivalsContent } from "@/lib/content/repository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "New Arrivals & Special Offers | GoldSeason",
  description: "Explore GoldSeason new arrivals and current product offers.",
};

export default async function NewArrivalsPage() {
  try {
    const content = await listNewArrivalsContent();
    return <NewArrivalsContent content={content} />;
  } catch {
    console.error("New arrivals content could not be loaded.");
    return <NewArrivalsContent unavailable />;
  }
}
