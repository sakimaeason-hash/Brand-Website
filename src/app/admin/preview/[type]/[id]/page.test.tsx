import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }) }));
vi.mock("@/lib/admin/authorization", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/content/repository", () => ({ getDraftPreview: vi.fn() }));

import { requireAdmin } from "@/lib/admin/authorization";
import { getDraftPreview } from "@/lib/content/repository";
import PreviewPage from "./page";

describe("admin content preview", () => {
  it("requires an administrator and renders all product preview fields and images", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ session: {}, userId: "admin" } as never);
    vi.mocked(getDraftPreview).mockResolvedValue({
      id: "p1",
      name: "Travel Air W 26",
      model: "PA22",
      tagline: "Travel ready",
      description: "A compact chair.",
      price: 699,
      originalPrice: 799,
      weightCapacity: "300 lb",
      seatWidth: "18 in",
      range: "15 mi",
      maxSpeed: "4 mph",
      productWeight: "45 lb",
      features: ["Foldable"],
      status: "DRAFT",
      images: [{ id: "img1", publicUrl: "https://cdn.test/chair.jpg", altText: "Chair" }],
      promotions: [],
    } as never);

    const view = await PreviewPage({ params: { type: "products", id: "p1" } });
    const html = JSON.stringify(view);

    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(getDraftPreview).toHaveBeenCalledWith("products", "p1");
    expect(html).toContain("Travel Air W 26");
    expect(html).toContain("300 lb");
    expect(html).toContain("18 in");
    expect(html).toContain("https://cdn.test/chair.jpg");
  });

  it("returns not found for an unsupported content type", async () => {
    await expect(PreviewPage({ params: { type: "users", id: "u1" } })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(getDraftPreview).not.toHaveBeenCalled();
  });
});
