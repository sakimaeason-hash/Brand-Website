import { describe, expect, it } from "vitest";
import { validateImage, sanitizeFileName, normalizeOptionalText, MAX_CONTENT_IMAGE_BYTES } from "./validation";

describe("content validation", () => {
  it("accepts supported raster images", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
      expect(() => validateImage(new File([new Uint8Array(10)], "photo.jpg", { type }))).not.toThrow();
    }
  });

  it("rejects unsafe or oversized images", () => {
    expect(() => validateImage(new File([new Uint8Array(10)], "x.svg", { type: "image/svg+xml" }))).toThrow("Unsupported image type");
    expect(() => validateImage(new File([new Uint8Array(MAX_CONTENT_IMAGE_BYTES + 1)], "x.jpg", { type: "image/jpeg" }))).toThrow("Image exceeds 10 MB");
  });

  it("normalizes names and optional fields", () => {
    expect(sanitizeFileName("../My photo?.jpg")).toBe(".._My_photo_.jpg");
    expect(normalizeOptionalText("  ")).toBeNull();
    expect(normalizeOptionalText(" note ")).toBe("note");
  });
});
