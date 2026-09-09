import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SpecificationFieldDefinition } from "@/lib/catalog/types";
import { ProductAccessoriesEditor } from "./ProductAccessoriesEditor";
import { ProductSpecificationEditor } from "./ProductSpecificationEditor";
import { ProductVariantEditor } from "./ProductVariantEditor";
import type { InBoxDraft, SpecificationDraftMap, VariantDraft } from "./ProductEditorTypes";

afterEach(() => cleanup());

const fields: SpecificationFieldDefinition[] = [
  { key: "notes", label: "Notes", group: "General", scope: "PRODUCT", dataType: "TEXT", unitFamily: "NONE", defaultDisplayUnit: null, options: [], helpText: null, minValue: null, maxValue: null, requiredForPublish: false, requiredForRecommendation: false, semanticKey: null, isProtected: false, status: "ACTIVE", sortOrder: 0 },
  { key: "capacity", label: "Capacity", group: "General", scope: "PRODUCT", dataType: "NUMBER", unitFamily: "WEIGHT", defaultDisplayUnit: "lb", options: [], helpText: "Use verified data.", minValue: 1, maxValue: null, requiredForPublish: true, requiredForRecommendation: false, semanticKey: null, isProtected: false, status: "ACTIVE", sortOrder: 1 },
  { key: "foldable", label: "Foldable", group: "General", scope: "PRODUCT", dataType: "BOOLEAN", unitFamily: "NONE", defaultDisplayUnit: null, options: [], helpText: null, minValue: null, maxValue: null, requiredForPublish: false, requiredForRecommendation: false, semanticKey: null, isProtected: false, status: "ACTIVE", sortOrder: 2 },
  { key: "finish", label: "Finish", group: "Appearance", scope: "PRODUCT", dataType: "SELECT", unitFamily: "NONE", defaultDisplayUnit: null, options: ["Matte", "Gloss"], helpText: null, minValue: null, maxValue: null, requiredForPublish: false, requiredForRecommendation: false, semanticKey: null, isProtected: false, status: "ACTIVE", sortOrder: 3 },
  { key: "dimensions", label: "Dimensions", group: "Size", scope: "PRODUCT", dataType: "DIMENSIONS", unitFamily: "LENGTH", defaultDisplayUnit: "in", options: [], helpText: null, minValue: null, maxValue: null, requiredForPublish: false, requiredForRecommendation: false, semanticKey: null, isProtected: false, status: "ACTIVE", sortOrder: 4 },
];

describe("ProductSpecificationEditor", () => {
  it("renders every template data type and records conflicting source notes", () => {
    let value: SpecificationDraftMap = {};
    const onChange = vi.fn((next: SpecificationDraftMap) => { value = next; });
    const { rerender } = render(<ProductSpecificationEditor fields={fields} value={value} onChange={onChange} />);

    expect(screen.getByLabelText("Capacity")).toHaveAttribute("inputmode", "decimal");
    expect(screen.getByLabelText("Foldable")).toHaveAttribute("type", "checkbox");
    expect(screen.getByLabelText("Finish")).toHaveRole("combobox");
    expect(screen.getByLabelText("Dimensions length")).toHaveAttribute("type", "text");

    fireEvent.change(screen.getByLabelText("Capacity status"), { target: { value: "CONFLICTING" } });
    rerender(<ProductSpecificationEditor fields={fields} value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Capacity source note"), { target: { value: "Two official sheets disagree" } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      capacity: expect.objectContaining({ status: "CONFLICTING", sourceNote: "Two official sheets disagree" }),
    }));
  });
});

describe("ProductVariantEditor", () => {
  it("enables independent SKU price and Amazon link overrides", () => {
    const variant: VariantDraft = {
      localKey: "client-1", sku: "PA22-A", factoryModel: "PA22", label: "Black", colorName: "Black", colorHex: "#111111",
      priceOverride: "", originalPriceOverride: "", purchaseLinkOverride: "", overridePrice: false, overrideOriginalPrice: false,
      overridePurchaseLink: false, specifications: {}, isActive: true, sortOrder: "0",
    };
    const onChange = vi.fn();
    render(<ProductVariantEditor variants={[variant]} fields={[]} errors={[]} onChange={onChange} />);

    expect(screen.queryByLabelText("Price override for SKU 1")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Use product default price for SKU 1"));
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ overridePrice: true })]);
    fireEvent.click(screen.getByLabelText("Use product default Amazon link for SKU 1"));
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ overridePurchaseLink: true })]);
  });
});

describe("ProductAccessoriesEditor", () => {
  it("adds package items and selects only supplied published accessories", () => {
    let inBoxItems: InBoxDraft[] = [];
    let accessoryProductIds: string[] = [];
    const setInBoxItems = vi.fn((next: InBoxDraft[]) => { inBoxItems = next; });
    const setAccessoryProductIds = vi.fn((next: string[]) => { accessoryProductIds = next; });
    const { rerender } = render(<ProductAccessoriesEditor inBoxItems={inBoxItems} onInBoxItemsChange={setInBoxItems} accessoryProductIds={accessoryProductIds} onAccessoryProductIdsChange={setAccessoryProductIds} accessories={[{ id: "a1", name: "Travel bag", model: "BAG-1", price: 79, status: "PUBLISHED", imageUrl: null }]} errors={[]} />);

    fireEvent.click(screen.getByRole("button", { name: "Add box item" }));
    expect(setInBoxItems).toHaveBeenCalledWith([expect.objectContaining({ quantity: "1" })]);
    rerender(<ProductAccessoriesEditor inBoxItems={inBoxItems} onInBoxItemsChange={setInBoxItems} accessoryProductIds={accessoryProductIds} onAccessoryProductIdsChange={setAccessoryProductIds} accessories={[{ id: "a1", name: "Travel bag", model: "BAG-1", price: 79, status: "PUBLISHED", imageUrl: null }]} errors={[]} />);
    fireEvent.click(screen.getByRole("checkbox", { name: /Travel bag/ }));
    expect(setAccessoryProductIds).toHaveBeenCalledWith(["a1"]);
  });
});
