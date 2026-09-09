import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

import { CategoryForm } from "./CategoryForm";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "cat-2", slug: "shower-chairs" }), { status: 201 }));
});
afterEach(() => cleanup());

describe("CategoryForm", () => {
  it("adds a custom specification field and submits the category DTO", async () => {
    render(<CategoryForm />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Shower Chairs" } });
    fireEvent.click(screen.getByRole("button", { name: "Add field" }));
    expect(screen.getByLabelText("Field key 1")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Field key 1"), { target: { value: "seatMaterial" } });
    fireEvent.change(screen.getByLabelText("Field label 1"), { target: { value: "Seat material" } });
    fireEvent.click(screen.getByRole("button", { name: "Save category" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const request = vi.mocked(fetch).mock.calls[0][1];
    const payload = JSON.parse(String(request?.body));
    expect(payload.fields[0]).toMatchObject({ key: "seatMaterial", label: "Seat material", isProtected: false });
  });

  it("shows protected fields when a wheelchair recommendation profile is selected", () => {
    render(<CategoryForm />);
    fireEvent.change(screen.getByLabelText("Recommendation profile"), { target: { value: "POWERED_WHEELCHAIR" } });
    expect(screen.getByText(/maxUserWeight/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /remove maxUserWeight/i })).not.toBeInTheDocument();
  });

  it("requires confirmation before archiving an existing category", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<CategoryForm initialData={{ id: "cat-1", updatedAt: "2026-09-01T00:00:00.000Z", name: "Powered", slug: "powered", role: "PRODUCT", recommendationProfile: "NONE", description: null, sortOrder: 0, status: "ACTIVE", templateVersion: 1, fields: [], productCount: 0 }} />);
    fireEvent.click(screen.getByRole("button", { name: "Archive category" }));
    expect(fetch).not.toHaveBeenCalled();
  });
});
