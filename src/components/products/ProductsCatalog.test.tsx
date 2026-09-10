import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ProductsCatalog from "./ProductsCatalog";
import type { PublicProduct } from "@/lib/catalog/types";
import { CartProvider, useCart } from "@/context/CartContext";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, String(value)); },
  };
}

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: createMemoryStorage(),
  });
});
afterEach(cleanup);

const categories = [
  { id: "powered", name: "Powered Wheelchairs", slug: "powered-wheelchairs", role: "PRODUCT" as const, recommendationProfile: "POWERED_WHEELCHAIR" as const },
  { id: "shower", name: "Shower Chairs", slug: "shower-chairs", role: "PRODUCT" as const, recommendationProfile: "NONE" as const },
  { id: "accessories", name: "Accessories", slug: "accessories", role: "ACCESSORY" as const, recommendationProfile: "NONE" as const },
];

function product(overrides: Partial<PublicProduct> = {}): PublicProduct {
  return {
    id: "p1",
    name: "Travel Air W 26",
    tagline: "Travel ready",
    description: "Compact powered wheelchair",
    category: categories[0],
    images: [{ url: "/chair.jpg", alt: "Travel Air W 26" }],
    features: ["Foldable"],
    variants: [
      { id: "v1", sku: "PA26-RED", factoryModel: "PA26", label: "Red", colorName: "Red", colorHex: "#AA0000", price: 899, originalPrice: 999, purchaseLink: "https://www.amazon.com/dp/red", specifications: [] },
      { id: "v2", sku: "PA26-BLUE", factoryModel: "PA26", label: "Blue", colorName: "Blue", colorHex: "#0000AA", price: 799, purchaseLink: "https://www.amazon.com/dp/blue", specifications: [] },
    ],
    specifications: [],
    inBoxItems: [{ name: "Charger", quantity: 1 }],
    compatibleAccessories: [],
    isFeatured: true,
    ...overrides,
  };
}

function CartState() {
  const { items } = useCart();
  return <output aria-label="Cart state">{JSON.stringify(items)}</output>;
}

function renderCatalog(products: readonly PublicProduct[], catalogCategories = categories) {
  return render(
    <CartProvider>
      <ProductsCatalog initialProducts={products} categories={catalogCategories} />
      <CartState />
    </CartProvider>,
  );
}

describe("ProductsCatalog", () => {
  it("uses dynamic category names and keeps accessories in their own section", () => {
    renderCatalog([product(), product({ id: "p2", name: "Shower Seat", category: categories[1] }), product({ id: "a1", name: "Travel bag", category: categories[2] })]);
    expect(screen.getByRole("button", { name: "Powered Wheelchairs" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Shower Chairs" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Accessories" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Shower Chairs" }));
    expect(screen.getByText("Shower Seat")).toBeInTheDocument();
    expect(screen.queryByText("Travel Air W 26")).not.toBeInTheDocument();
  });

  it("updates price and Amazon destination when a SKU is selected", () => {
    renderCatalog([product()]);
    expect(screen.getByRole("link", { name: /Buy PA26-RED on Amazon/i })).toHaveAttribute("href", "https://www.amazon.com/dp/red");
    fireEvent.click(screen.getByRole("button", { name: "Select Blue SKU PA26-BLUE" }));
    expect(screen.getByText("$799.00")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Buy PA26-BLUE on Amazon/i })).toHaveAttribute("href", "https://www.amazon.com/dp/blue");
  });

  it("adds the selected SKU to the cart with its exact Amazon destination", async () => {
    renderCatalog([product()]);
    fireEvent.click(screen.getByRole("button", { name: "Select Blue SKU PA26-BLUE" }));
    fireEvent.click(screen.getByRole("button", { name: "Add PA26-BLUE to cart" }));

    await waitFor(() => expect(JSON.parse(screen.getByLabelText("Cart state").textContent ?? "[]")).toEqual([
      expect.objectContaining({
        id: "p1:v2",
        purchaseLink: "https://www.amazon.com/dp/blue",
      }),
    ]));
  });

  it("exposes the actual product detail panel for layout stability checks", () => {
    renderCatalog([product()]);
    fireEvent.click(screen.getByRole("button", { name: "View details" }));
    expect(screen.getByTestId("product-detail-panel")).toBeInTheDocument();
  });

  it("does not label a non-Amazon purchase URL as an Amazon checkout", () => {
    renderCatalog([product({
      variants: [{
        ...product().variants[0],
        purchaseLink: "https://example.com/not-amazon",
      }],
    })]);

    expect(screen.queryByRole("link", { name: /Buy .* on Amazon/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact?product=p1&sku=PA26-RED");
  });
});
