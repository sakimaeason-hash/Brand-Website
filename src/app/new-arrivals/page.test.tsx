import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicNewArrivalsContent, PublicProduct } from "@/lib/content/repository";
vi.mock("@/lib/content/repository", () => ({ listNewArrivalsContent: vi.fn() }));
import { listNewArrivalsContent } from "@/lib/content/repository";
import NewArrivalsPage from "./page";

afterEach(cleanup);

const product: PublicProduct = {
  id: "verified-model", name: "Published catalog model", tagline: "Catalog tagline", description: "Description from the product editor",
  category: { id: "c1", name: "Wheelchairs", slug: "wheelchairs", role: "PRODUCT", recommendationProfile: "POWERED_WHEELCHAIR" },
  images: [{ url: "/products/chair.jpg", alt: "Verified product side view" }],
  features: ["Catalog feature"],
  variants: [{ id: "v1", sku: "MODEL-GREY", colorName: "Grey", price: 900, specifications: [] }, { id: "v2", sku: "MODEL-BLACK", price: 1200, specifications: [] }],
  specifications: [], inBoxItems: [], compatibleAccessories: [], isFeatured: false,
};
const content: PublicNewArrivalsContent = {
  products: [product],
  offers: [{ product, promotion: { id: "offer-1", name: "Published seasonal offer", label: "Seasonal promotion", productId: product.id, productName: product.name, startAt: "2026-09-27T12:00:00Z", endAt: "2026-09-29T12:00:00Z", discountPercent: 10 } }],
};

beforeEach(() => { vi.mocked(listNewArrivalsContent).mockResolvedValue(content); });
afterEach(() => vi.restoreAllMocks());

async function renderPage() {
  render(await NewArrivalsPage());
}

describe("new arrivals storefront uses managed content", () => {
  it("uses the site's existing main landmark without nesting another", async () => {
    render(<main>{await NewArrivalsPage()}</main>);
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });
  it("renders the saved catalog product, image and live promotion", async () => {
    await renderPage();
    expect(screen.getAllByText("Published catalog model")).toHaveLength(2);
    expect(screen.getAllByAltText("Verified product side view")).toHaveLength(2);
    expect(screen.getByText("Published seasonal offer")).toBeInTheDocument();
    expect(screen.getByText("10% off the base product price")).toBeInTheDocument();
    expect(screen.getAllByText("From $900.00")).toHaveLength(2);
    const links = screen.getAllByRole("link", { name: /View product options/ });
    expect(links).toHaveLength(2);
    expect(links.every((link) => link.getAttribute("href") === "/products")).toBe(true);
  });

  it("does not present fictional products, bundles, inventory or newsletter discounts", async () => {
    await renderPage();
    expect(screen.queryByText(/GoldSeason Elite X/)).not.toBeInTheDocument();
    expect(screen.queryByText(/SUMMER26|REFER100|Travel Essentials Bundle/)).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /email/i })).not.toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: /Add to Cart/i })).toHaveLength(0);
  });

  it("shows honest empty states after all placements and promotions are removed", async () => {
    vi.mocked(listNewArrivalsContent).mockResolvedValue({ products: [], offers: [] });
    await renderPage();
    expect(screen.getByText("No new arrivals right now")).toBeInTheDocument();
    expect(screen.getByText("No active offers right now")).toBeInTheDocument();
    expect(screen.queryByText("Published catalog model")).not.toBeInTheDocument();
  });

  it("shows a retryable error instead of treating a database failure as an empty catalog", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(listNewArrivalsContent).mockRejectedValue(new Error("private database details"));
    await renderPage();
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn’t load new arrivals and offers");
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute("href", "/new-arrivals");
    expect(screen.queryByText(/private database details/)).not.toBeInTheDocument();
    expect(screen.queryByText("No new arrivals right now")).not.toBeInTheDocument();
  });
});
