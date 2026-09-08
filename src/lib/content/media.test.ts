import { describe, expect, it } from "vitest";
import { parseImageMetadata, shouldRemoveFromContentStorage } from "./media";

describe("content media metadata", () => {
  it("normalizes optional metadata and requires one entry per uploaded file", () => {
    expect(parseImageMetadata(JSON.stringify([{ altText: " Front view ", sourceNote: "" }]), 1)).toEqual([
      { altText: "Front view", sourceNote: null },
    ]);
    expect(() => parseImageMetadata("[]", 1)).toThrow("match uploaded images");
  });

  it("does not attempt to delete repository public assets from Blob", () => {
    expect(shouldRemoveFromContentStorage("/products/chair.jpg")).toBe(false);
    expect(shouldRemoveFromContentStorage("/stories/alex.jpg")).toBe(false);
    expect(shouldRemoveFromContentStorage("products/p1/123e4567-e89b-12d3-a456-426614174000-0-chair.jpg")).toBe(true);
  });

  it("recognizes Vercel Blob paths as managed content storage", () => {
    expect(shouldRemoveFromContentStorage("https://abc.public.blob.vercel-storage.com/products/p1/123e4567-e89b-12d3-a456-426614174000-0-image.jpg")).toBe(true);
  });
});
