import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ProductsCatalog from "./ProductsCatalog";
import type { PublicProduct } from "@/lib/catalog/types";

afterEach(() => cleanup());

const categories = [
  { id: "powered", name: "Powered Wheelchairs", slug: "powered-wheelchairs", role: "PRODUCT" as const },
  { id: "shower", name: "Shower Chairs", slug: "shower-chairs", role: "PRODUCT" as const },
  { id: "accessories", name: "Accessories", slug: "accessories", role: "ACCESSORY" as const },
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

describe("ProductsCatalog", () => {
  it("uses dynamic category names and keeps accessories in their own section", () => {
    render(<ProductsCatalog initialProducts={[product(), product({ id: "p2", name: "Shower Seat", category: categories[1] }), product({ id: "a1", name: "Travel bag", category: categories[2] })]} categories={categories} />);
    expect(screen.getByRole("button", { name: "Powered Wheelchairs" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Shower Chairs" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Accessories" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Shower Chairs" }));
    expect(screen.getByText("Shower Seat")).toBeInTheDocument();
    expect(screen.queryByText("Travel Air W 26")).not.toBeInTheDocument();
  });

  it("updates price and Amazon destination when a SKU is selected", () => {
    render(<ProductsCatalog initialProducts={[product()]} categories={categories} />);
    expect(screen.getByRole("link", { name: /Buy PA26-RED on Amazon/i })).toHaveAttribute("href", "https://www.amazon.com/dp/red");
    fireEvent.click(screen.getByRole("button", { name: "Select Blue SKU PA26-BLUE" }));
    expect(screen.getByText("$799.00")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Buy PA26-BLUE on Amazon/i })).toHaveAttribute("href", "https://www.amazon.com/dp/blue");
  });
});
