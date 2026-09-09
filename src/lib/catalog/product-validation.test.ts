import { describe, expect, it } from "vitest";
import { normalizeProductInput, productAggregateInputSchema } from "./product-validation";

const validInput = {
  name: "Travel Air",
  model: "PA22",
  categoryId: "cat-1",
  categoryTemplateVersion: 1,
  price: 899,
  variants: [{ sku: " PA22-a ", specifications: {} }],
  inBoxItems: [],
  accessoryProductIds: [],
};

describe("product aggregate validation", () => {
  it("normalizes SKU values to an uppercase catalog key", () => {
    expect(normalizeProductInput(validInput as never).variants[0].sku).toBe("PA22-A");
  });

  it("rejects duplicate persisted variant ids", () => {
    const parsed = productAggregateInputSchema.safeParse({
      ...validInput,
      variants: [
        { id: "variant-1", sku: "ONE", specifications: {} },
        { id: "variant-1", sku: "TWO", specifications: {} },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects duplicate persisted in-the-box ids", () => {
    const parsed = productAggregateInputSchema.safeParse({
      ...validInput,
      inBoxItems: [
        { id: "box-1", name: "Charger", quantity: 1, note: null },
        { id: "box-1", name: "Tool kit", quantity: 1, note: null },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects client-controlled status fields", () => {
    const parsed = productAggregateInputSchema.safeParse({ ...validInput, status: "PUBLISHED" });
    expect(parsed.success).toBe(false);
  });
});
