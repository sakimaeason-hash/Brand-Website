import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

import { ContentActions } from "./ContentActions";

beforeEach(() => vi.clearAllMocks());
afterEach(() => cleanup());

describe("ContentActions", () => {
  it("links to preview and sends the optimistic version when publishing", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "PUBLISHED" }), { status: 200 }),
    );
    render(<ContentActions
      type="products"
      id="p1"
      status="DRAFT"
      updatedAt="2026-08-01T12:00:00.000Z"
    />);

    expect(screen.getByRole("link", { name: "Preview" })).toHaveAttribute("href", "/admin/preview/products/p1");
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(body.get("action")).toBe("publish");
    expect(body.get("updatedAt")).toBe("2026-08-01T12:00:00.000Z");
    expect(refresh).toHaveBeenCalledOnce();
    fetchMock.mockRestore();
  });

  it("requires confirmation and returns to the collection after deletion", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    render(<ContentActions
      type="stories"
      id="s1"
      status="DRAFT"
      updatedAt="2026-08-01T12:00:00.000Z"
    />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(confirm).toHaveBeenCalledOnce();
    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(body.get("action")).toBe("delete");
    expect(body.get("confirm")).toBe("true");
    expect(body.get("updatedAt")).toBe("2026-08-01T12:00:00.000Z");
    expect(push).toHaveBeenCalledWith("/admin/stories");
    fetchMock.mockRestore();
    confirm.mockRestore();
  });
});
