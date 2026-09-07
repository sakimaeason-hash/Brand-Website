import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

import { StoryForm } from "./StoryForm";

beforeEach(() => vi.clearAllMocks());

describe("StoryForm", () => {
  it("updates an existing story and preserves ordered image metadata", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "s1" }), { status: 200 }),
    );
    render(<StoryForm initialData={{
      id: "s1", updatedAt: "2026-08-01T12:00:00.000Z", displayName: "Alex", location: "Texas",
      quote: "Great chair", productId: "p1", source: "Amazon", tags: ["Travel"], isFeatured: false,
      sortOrder: 2, images: [{ id: "img1", publicUrl: "/stories/alex.jpg", originalName: "alex.jpg", altText: "Alex", sourceNote: "Amazon", sortOrder: 0 }],
    }} products={[{ id: "p1", name: "Travel Air", model: "PA22" }]} />);

    fireEvent.change(screen.getByLabelText("Alt text for alex.jpg"), { target: { value: "Alex outdoors" } });
    fireEvent.submit(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const request = fetchMock.mock.calls[0][1];
    const body = request?.body as FormData;
    expect(body.get("updatedAt")).toBe("2026-08-01T12:00:00.000Z");
    expect(JSON.parse(String(body.get("payload"))).images).toEqual([
      { id: "img1", sortOrder: 0, altText: "Alex outdoors", sourceNote: "Amazon" },
    ]);
    fetchMock.mockRestore();
  });
});
