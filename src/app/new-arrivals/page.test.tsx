import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider } from "@/context/CartContext";
import NewArrivalsPage from "./page";

vi.mock("@/components/animations", () => ({
  RevealOnScroll: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  HoverScale: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/CountdownTimer", () => ({
  CountdownTimer: () => <span>Countdown</span>,
}));

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

describe("New arrivals purchase boundaries", () => {
  it("does not add unverified static bundles to the cart", () => {
    render(
      <CartProvider>
        <NewArrivalsPage />
      </CartProvider>,
    );

    expect(screen.queryAllByRole("button", { name: "Add to Cart" })).toHaveLength(0);
    const catalogLinks = screen.getAllByRole("link", { name: "Choose products" });
    expect(catalogLinks).toHaveLength(3);
    for (const link of catalogLinks) expect(link).toHaveAttribute("href", "/products");
  });
});
