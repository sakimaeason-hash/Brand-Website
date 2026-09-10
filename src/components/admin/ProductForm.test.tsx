import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

import { ProductForm } from "./ProductForm";

const categories = [{
  id: "cat-powered",
  name: "Powered Wheelchairs",
  slug: "powered-wheelchairs",
  role: "PRODUCT",
  recommendationProfile: "POWERED_WHEELCHAIR",
  templateVersion: 2,
  fields: [
    { key: "finish", label: "Finish", group: "Appearance", scope: "PRODUCT", dataType: "SELECT", unitFamily: "NONE", defaultDisplayUnit: null, options: ["Matte", "Gloss"], helpText: null, minValue: null, maxValue: null, requiredForPublish: false, requiredForRecommendation: false, semanticKey: null, isProtected: false, status: "ACTIVE", sortOrder: 0 },
    { key: "maxUserWeight", label: "Maximum user weight", group: "Fit", scope: "VARIANT", dataType: "NUMBER", unitFamily: "WEIGHT", defaultDisplayUnit: "lb", options: [], helpText: "Use the verified capacity.", minValue: 1, maxValue: null, requiredForPublish: true, requiredForRecommendation: true, semanticKey: "maxUserWeight", isProtected: true, status: "ACTIVE", sortOrder: 1 },
    { key: "effectiveSeatWidth", label: "Effective seat width", group: "Fit", scope: "VARIANT", dataType: "NUMBER", unitFamily: "LENGTH", defaultDisplayUnit: "in", options: [], helpText: null, minValue: 1, maxValue: null, requiredForPublish: true, requiredForRecommendation: true, semanticKey: "effectiveSeatWidth", isProtected: true, status: "ACTIVE", sortOrder: 2 },
  ],
}] as const;

const accessories = [{ id: "accessory-1", name: "Travel bag", model: "BAG-1", price: 79, status: "PUBLISHED", imageUrl: "/products/bag.jpg" }] as const;

const initialData = {
  id: "p1",
  updatedAt: "2026-08-01T12:00:00.000Z",
  name: "Travel Air",
  model: "PA22",
  category: "wheelchair",
  categoryId: "cat-powered",
  categoryTemplateVersion: 2,
  tagline: "Travel",
  description: "Compact",
  price: 899,
  originalPrice: null,
  amazonLink: "https://www.amazon.com/dp/test",
  weightCapacity: null,
  seatWidth: null,
  range: null,
  maxSpeed: null,
  productWeight: null,
  features: ["Foldable"],
  isFeatured: true,
  sortOrder: 1,
  specifications: { finish: { status: "PROVIDED", value: "Matte" } },
  variants: [{ id: "v1", sku: "PA22-A", factoryModel: "PA22", label: "Standard", colorName: "Black", colorHex: "#111111", priceOverride: null, originalPriceOverride: null, purchaseLinkOverride: null, specifications: { maxUserWeight: { status: "PROVIDED", value: 300, inputValue: 300, inputUnit: "lb", normalizedValue: 136.0777, normalizedUnit: "kg" } }, isActive: true, sortOrder: 0 }],
  inBoxItems: [{ id: "box-1", name: "Charger", quantity: 1, note: null, sortOrder: 0 }],
  accessoryProductIds: ["accessory-1"],
  images: [{ id: "img1", publicUrl: "/products/chair.jpg", originalName: "chair.jpg", altText: "Chair", sourceNote: "Official", sortOrder: 0 }],
};

beforeEach(() => vi.clearAllMocks());
afterEach(() => cleanup());

describe("ProductForm", () => {
  it("renders five accessible tabs and allows direct numeric entry for specifications", () => {
    render(<ProductForm categories={categories as never} accessories={accessories as never} />);

    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Overview", "Specifications", "SKUs (1)", "Accessories", "Media",
    ]);
    fireEvent.click(screen.getByRole("tab", { name: "SKUs (1)" }));
    const input = screen.getByLabelText("Maximum user weight for SKU 1");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("inputmode", "decimal");
    fireEvent.change(input, { target: { value: "325" } });
    expect(input).toHaveValue("325");
  });

  it("adds SKUs and includes dynamic product data in the save payload", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "p2" }), { status: 201 }));
    render(<ProductForm categories={categories as never} accessories={accessories as never} />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "New Chair" } });
    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "NC-1" } });
    fireEvent.change(screen.getByLabelText("Current price"), { target: { value: "999" } });
    fireEvent.click(screen.getByRole("tab", { name: "SKUs (1)" }));
    fireEvent.change(screen.getByLabelText("SKU 1"), { target: { value: "NC-RED" } });
    fireEvent.click(screen.getByRole("button", { name: "Add SKU" }));
    expect(screen.getByRole("tab", { name: "SKUs (2)" })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^SKU \d+$/)).toHaveLength(2);
    fireEvent.change(screen.getByLabelText("SKU 2"), { target: { value: "NC-BLUE" } });
    fireEvent.click(screen.getByRole("tab", { name: "Accessories" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Travel bag/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add box item" }));
    fireEvent.change(screen.getByLabelText("Box item name 1"), { target: { value: "Charger" } });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    const payload = JSON.parse(String(body.get("payload")));
    expect(payload).toMatchObject({
      categoryId: "cat-powered",
      categoryTemplateVersion: 2,
      variants: [{ sku: "NC-RED" }, { sku: "NC-BLUE" }],
      inBoxItems: [{ name: "Charger", quantity: 1 }],
      accessoryProductIds: ["accessory-1"],
    });
    fetchMock.mockRestore();
  });

  it("opens the matching tab and displays field errors returned by the server", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      error: "Publish validation failed",
      code: "PUBLISH_VALIDATION",
      fields: [{ tab: "variants", variantId: "v1", fieldKey: "maxUserWeight", message: "Maximum user weight is required" }],
    }), { status: 400 }));
    render(<ProductForm initialData={initialData as never} categories={categories as never} accessories={accessories as never} />);

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(screen.getByRole("tab", { name: "SKUs (1)" })).toHaveAttribute("aria-selected", "true"));
    const panel = screen.getByRole("tabpanel", { name: "SKUs (1)" });
    expect(within(panel).getByText("Maximum user weight is required")).toBeInTheDocument();
    fetchMock.mockRestore();
  });

  it("shows and focuses a server error for a SKU identity field", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      error: "SKU already exists",
      code: "SKU_CONFLICT",
      fields: [{ tab: "variants", variantId: "v1", fieldKey: "sku", message: "This SKU is already in use" }],
    }), { status: 409 }));
    render(<ProductForm initialData={initialData as never} categories={categories as never} accessories={accessories as never} />);

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    const error = await screen.findByText("This SKU is already in use");
    expect(error).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("SKU 1")).toHaveFocus());
    fetchMock.mockRestore();
  });

  it("opens and focuses the exact SKU field after publish validation fails", async () => {
    const secondVariant = {
      ...initialData.variants[0],
      id: "v2",
      sku: "PA22-B",
      label: "Wide",
      specifications: {},
      sortOrder: 1,
    };
    const data = { ...initialData, variants: [...initialData.variants, secondVariant] };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      error: "Publish validation failed",
      code: "PUBLISH_VALIDATION",
      fields: [{
        tab: "variants",
        variantId: "v2",
        fieldKey: "effectiveSeatWidth",
        message: "Effective seat width is required",
      }],
    }), { status: 400 }));
    render(
      <ProductForm
        initialData={data as never}
        categories={categories as never}
        accessories={accessories as never}
        actionStatus="DRAFT"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => expect(screen.getByRole("tab", { name: "SKUs (2)" })).toHaveAttribute("aria-selected", "true"));
    expect(screen.getByText("Effective seat width is required")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Publish validation failed");
    await waitFor(() => expect(screen.getByLabelText("Effective seat width for SKU 2")).toHaveFocus());
    fetchMock.mockRestore();
  });

  it("saves an edited draft with optimistic version and removed image ids", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "p1" }), { status: 200 }));
    render(<ProductForm initialData={initialData as never} categories={categories as never} accessories={accessories as never} />);
    fireEvent.click(screen.getByRole("tab", { name: "Media" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    fireEvent.click(screen.getByRole("tab", { name: "Overview" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Travel Air Updated" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const request = fetchMock.mock.calls[0][1];
    const body = request?.body as FormData;
    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/products/p1");
    expect(request?.method).toBe("PATCH");
    expect(body.get("action")).toBe("save-draft");
    expect(body.get("updatedAt")).toBe("2026-08-01T12:00:00.000Z");
    expect(JSON.parse(String(body.get("removeImageIds")))).toEqual(["img1"]);
    expect(JSON.parse(String(body.get("payload"))).name).toBe("Travel Air Updated");
    fetchMock.mockRestore();
  });

  it("publishes with the updated optimistic version after saving", async () => {
    const nextUpdatedAt = "2026-08-01T12:05:00.000Z";
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "p1", updatedAt: nextUpdatedAt }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "p1", status: "PUBLISHED" }), { status: 200 }));
    render(
      <ProductForm
        initialData={initialData as never}
        categories={categories as never}
        accessories={accessories as never}
        actionStatus="DRAFT"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByText("Changes saved.", { exact: true });
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const publishBody = fetchMock.mock.calls[1][1]?.body as FormData;
    expect(publishBody.get("action")).toBe("publish");
    expect(publishBody.get("updatedAt")).toBe(nextUpdatedAt);
    fetchMock.mockRestore();
  });
});
