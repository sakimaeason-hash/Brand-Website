import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

import { ProductForm } from "./ProductForm";

beforeEach(() => vi.clearAllMocks());

describe("ProductForm", () => {
  it("saves an edited draft with optimistic version and removed image ids", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "p1" }), { status: 200 }),
    );
    render(<ProductForm initialData={{
      id: "p1", updatedAt: "2026-08-01T12:00:00.000Z", name: "Travel Air", model: "PA22",
      category: "wheelchair", tagline: "Travel", description: "Compact", price: 899, originalPrice: null,
      amazonLink: "", weightCapacity: "300 lb", seatWidth: "18 in", range: "15 mi", maxSpeed: "4 mph",
      productWeight: "40 lb", features: ["Foldable"], isFeatured: true, sortOrder: 1,
      images: [{ id: "img1", publicUrl: "/products/chair.jpg", originalName: "chair.jpg", altText: "Chair", sourceNote: "Official", sortOrder: 0 }],
    }} />);

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Travel Air Updated" } });
    fireEvent.submit(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/products/p1");
    const request = fetchMock.mock.calls[0][1];
    expect(request?.method).toBe("PATCH");
    const body = request?.body as FormData;
    expect(body.get("action")).toBe("save-draft");
    expect(body.get("updatedAt")).toBe("2026-08-01T12:00:00.000Z");
    expect(JSON.parse(String(body.get("removeImageIds")))).toEqual(["img1"]);
    expect(JSON.parse(String(body.get("payload"))).name).toBe("Travel Air Updated");
    fetchMock.mockRestore();
  });
});
