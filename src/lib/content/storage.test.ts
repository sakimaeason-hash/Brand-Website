import { beforeEach, describe, expect, it, vi } from "vitest";

const { put, del } = vi.hoisted(() => ({ put: vi.fn(), del: vi.fn() }));

vi.mock("@vercel/blob", () => ({ put, del }));

import { removeContentImage, uploadContentImage } from "./storage";

describe("content image storage", () => {
  beforeEach(() => {
    put.mockReset();
    del.mockReset();
  });

  it("uploads validated content images to Vercel Blob as public files", async () => {
    put.mockResolvedValue({ url: "https://abc.public.blob.vercel-storage.com/products/p1/image.jpg" });
    const file = new File([new Uint8Array([1, 2, 3])], "chair.jpg", { type: "image/jpeg" });

    const result = await uploadContentImage("products", "p1", file, 0);

    expect(put).toHaveBeenCalledWith(
      expect.stringMatching(/^products\/p1\/[a-f0-9-]+-0-chair\.jpg$/),
      file,
      { access: "public", addRandomSuffix: false, contentType: "image/jpeg" },
    );
    expect(result).toEqual({
      storagePath: "https://abc.public.blob.vercel-storage.com/products/p1/image.jpg",
      publicUrl: "https://abc.public.blob.vercel-storage.com/products/p1/image.jpg",
      originalName: "chair.jpg",
    });
  });

  it("deletes only managed Vercel Blob URLs", async () => {
    const url = "https://abc.public.blob.vercel-storage.com/stories/s1/123e4567-e89b-12d3-a456-426614174000-0-image.jpg";

    await removeContentImage(url);

    expect(del).toHaveBeenCalledWith(url);
  });
});
