import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CartPage from "./page";
import { CartProvider, useCart } from "@/context/CartContext";

const CART_STORAGE_KEY = "goldseason-cart";
const AMAZON_PRODUCT_URL = "https://www.amazon.com/dp/B0TESTSKU1?th=1";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, String(value));
    },
  };
}

function readProductionSources(directory: string): string {
  if (!existsSync(directory)) return "";
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return [readProductionSources(entryPath)];
    if (!/\.[cm]?[jt]sx?$/.test(entry.name) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(entry.name)) return [];
    return [readFileSync(entryPath, "utf8")];
  }).join("\n");
}

function renderCart(items: Array<Record<string, unknown>>) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  return render(
    <CartProvider>
      <CartPage />
    </CartProvider>,
  );
}

function CartPersistenceHarness() {
  const { addItem, items } = useCart();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          addItem({
            id: "pa22-blue",
            name: "Travel Air PA22 Blue",
            price: 899,
            purchaseLink: AMAZON_PRODUCT_URL,
          })
        }
      >
        Add linked product
      </button>
      <output aria-label="Cart state">{JSON.stringify(items)}</output>
    </>
  );
}

describe("Amazon purchase actions in the cart", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createMemoryStorage(),
    });
  });
  afterEach(cleanup);

  it("uses the cart item's exact Amazon product URL", async () => {
    renderCart([
      {
        id: "pa22-blue",
        name: "Travel Air PA22 Blue",
        price: 899,
        quantity: 1,
        purchaseLink: AMAZON_PRODUCT_URL,
      },
    ]);

    const link = await screen.findByRole("link", {
      name: "View Travel Air PA22 Blue on Amazon",
    });
    expect(link).toHaveAttribute("href", AMAZON_PRODUCT_URL);
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("guides a legacy cart item without a purchase URL back to products", async () => {
    renderCart([
      {
        id: "legacy-accessory",
        name: "Legacy Travel Bag",
        price: 79,
        quantity: 1,
      },
    ]);

    expect(
      await screen.findByRole("link", {
        name: "View Legacy Travel Bag in product catalog",
      }),
    ).toHaveAttribute("href", "/products");
    expect(
      screen.queryByRole("link", { name: /proceed to checkout/i }),
    ).not.toBeInTheDocument();
  });

  it("does not add static recommendations without official Amazon URLs", async () => {
    renderCart([{
      id: "pa22-blue",
      name: "Travel Air PA22 Blue",
      price: 899,
      quantity: 1,
      purchaseLink: AMAZON_PRODUCT_URL,
    }]);

    expect(await screen.findByText("You May Also Like")).toBeVisible();
    expect(screen.queryAllByRole("button", { name: "Add" })).toHaveLength(0);
    expect(screen.getAllByRole("link", { name: "View Products" })).toHaveLength(4);
  });

  it("does not treat a non-Amazon purchase URL as an Amazon destination", async () => {
    renderCart([
      {
        id: "untrusted-link",
        name: "Untrusted Link Chair",
        price: 899,
        quantity: 1,
        purchaseLink: "https://amazon.example.com/dp/not-amazon",
      },
    ]);

    expect(
      await screen.findByRole("link", {
        name: "View Untrusted Link Chair in product catalog",
      }),
    ).toHaveAttribute("href", "/products");
    expect(
      screen.queryByRole("link", { name: /view .* on amazon/i }),
    ).not.toBeInTheDocument();
  });

  it("persists a product purchase URL when an item is added", async () => {
    render(
      <CartProvider>
        <CartPersistenceHarness />
      </CartProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add linked product" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Cart state")).toHaveTextContent(
        AMAZON_PRODUCT_URL,
      );
      expect(
        JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]"),
      ).toEqual([
        expect.objectContaining({
          id: "pa22-blue",
          quantity: 1,
          purchaseLink: AMAZON_PRODUCT_URL,
        }),
      ]);
    });
  });

  it("keeps checkout external and does not initiate an onsite payment request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );
    renderCart([{
      id: "pa22-blue",
      name: "Travel Air PA22 Blue",
      price: 899,
      quantity: 1,
      purchaseLink: AMAZON_PRODUCT_URL,
    }]);

    const amazonLink = await screen.findByRole("link", {
      name: "View Travel Air PA22 Blue on Amazon",
    });
    expect(amazonLink).toHaveAttribute("href", AMAZON_PRODUCT_URL);
    expect(amazonLink).toHaveAttribute("target", "_blank");
    expect(screen.queryByRole("button", { name: /checkout|pay now|place order|payment/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /proceed to checkout|pay now|place order/i })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    const packageJson = JSON.parse(readFileSync(path.resolve("package.json"), "utf8"));
    const installedPackages = Object.keys({
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }).join("\n");
    const commerceSources = [
      readFileSync(path.resolve("src/app/cart/page.tsx"), "utf8"),
      readProductionSources(path.resolve("src/app/api")),
      readProductionSources(path.resolve("src/components/products")),
      readFileSync(path.resolve("src/app/new-arrivals/page.tsx"), "utf8"),
    ].join("\n");
    expect(installedPackages).not.toMatch(/stripe/i);
    expect(commerceSources).not.toMatch(/stripe|payment_intent|checkout\.sessions/i);
    fetchMock.mockRestore();
  });
});
