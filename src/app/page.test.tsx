import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/content/repository", () => ({
  listFeaturedProducts: vi.fn(async () => [{ id: "p1" }]),
  listPublishedStories: vi.fn(async () => [{ id: "s1" }]),
  listPublishedPromotions: vi.fn(async () => [{ id: "promo-1" }]),
}));
vi.mock("@/components/HomePageClient", () => ({ default: (props: Record<string, unknown>) => <pre>{JSON.stringify(props)}</pre> }));

import { listFeaturedProducts, listPublishedPromotions, listPublishedStories } from "@/lib/content/repository";
import HomePage from "./page";

describe("home page content repository integration", () => {
  it("passes published featured content and the active promotion to the client", async () => {
    const view = await HomePage();
    expect(listFeaturedProducts).toHaveBeenCalledOnce();
    expect(listPublishedStories).toHaveBeenCalledOnce();
    expect(listPublishedPromotions).toHaveBeenCalledOnce();
    expect(JSON.stringify(view)).toContain("promo-1");
  });
});
