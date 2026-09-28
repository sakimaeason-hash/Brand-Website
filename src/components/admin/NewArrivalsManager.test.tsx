import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NewArrivalsManager, type NewArrivalProduct } from "./NewArrivalsManager";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

const version = "2026-09-28T00:00:00.000Z";
const nextVersion = "2026-09-28T00:01:00.000Z";
const product = (overrides: Partial<NewArrivalProduct> = {}): NewArrivalProduct => ({
  id: "p1", name: "Travel Air", model: "PA22", status: "PUBLISHED", isNewArrival: false,
  updatedAt: version, hasActiveCategory: true, hasActiveSku: true, ...overrides,
});
function response(isNewArrival: boolean, updatedAt = nextVersion) {
  return new Response(JSON.stringify({ id: "p1", isNewArrival, updatedAt }), { status: 200 });
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("NewArrivalsManager", () => {
  it.each([true, false])("updates membership to %s only after the server accepts the change", async (isNewArrival) => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(response(isNewArrival));
    render(<NewArrivalsManager products={[product({ isNewArrival: !isNewArrival })]} />);
    fireEvent.click(screen.getByRole("button", { name: isNewArrival ? "Add Travel Air to New Arrivals" : "Remove Travel Air from New Arrivals" }));
    await screen.findByRole("button", { name: isNewArrival ? "Remove Travel Air from New Arrivals" : "Add Travel Air to New Arrivals" });
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/products/p1/new-arrival", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isNewArrival, updatedAt: version }),
    });
    expect(screen.getByText(isNewArrival ? "Visible" : "Not selected", { exact: true })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Travel Air" })).toHaveAttribute("href", "/admin/products/p1");
    expect(refresh).toHaveBeenCalledOnce();
  });

  it.each([false, true])("keeps the prior membership %s after a rejected update", async (isNewArrival) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ error: "Product changed elsewhere. Refresh and try again.", code: "CONCURRENT_UPDATE" }), { status: 409 }));
    render(<NewArrivalsManager products={[product({ isNewArrival })]} />);
    const label = isNewArrival ? "Remove Travel Air from New Arrivals" : "Add Travel Air to New Arrivals";
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Product changed elsewhere");
    expect(screen.getByRole("button", { name: label })).toBeEnabled();
    expect(screen.getByText(isNewArrival ? "Visible" : "Not selected", { exact: true })).toBeInTheDocument();
  });

  it("blocks duplicate requests while saving and keeps the prior marker until success", async () => {
    let resolve!: (value: Response) => void;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise((done) => { resolve = done; }));
    render(<NewArrivalsManager products={[product()]} />);
    const button = screen.getByRole("button", { name: "Add Travel Air to New Arrivals" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(button).toBeDisabled();
    expect(screen.getByText("Not selected", { exact: true })).toBeInTheDocument();
    await act(async () => resolve(response(true)));
    expect(screen.getByText("Visible", { exact: true })).toBeInTheDocument();
  });

  it("handles network failures without clearing the stored selection", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    render(<NewArrivalsManager products={[product({ isNewArrival: true })]} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove Travel Air from New Arrivals" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to update New Arrivals");
    expect(screen.getByText("Visible", { exact: true })).toBeInTheDocument();
  });

  it("uses the saved version on the next toggle and ignores older refreshed props", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(true)).mockResolvedValueOnce(response(false, "2026-09-28T00:02:00.000Z"));
    const { rerender } = render(<NewArrivalsManager products={[product()]} />);
    fireEvent.click(screen.getByRole("button", { name: "Add Travel Air to New Arrivals" }));
    await screen.findByRole("button", { name: "Remove Travel Air from New Arrivals" });
    rerender(<NewArrivalsManager products={[product()]} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove Travel Air from New Arrivals" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({ isNewArrival: false, updatedAt: nextVersion });
  });

  it("reconciles newer server props including eligibility and membership changes", () => {
    const { rerender } = render(<NewArrivalsManager products={[product()]} />);
    rerender(<NewArrivalsManager products={[product({ isNewArrival: true, updatedAt: nextVersion, status: "DRAFT" })]} />);
    expect(screen.getByRole("button", { name: "Remove Travel Air from New Arrivals" })).toBeInTheDocument();
    expect(screen.getByText("Awaiting publication", { exact: true })).toBeInTheDocument();
    expect(screen.queryByText("Visible", { exact: true })).not.toBeInTheDocument();
  });

  it.each([
    { status: "DRAFT" as const, expected: "Awaiting publication" },
    { hasActiveCategory: false, expected: "Inactive or missing category" },
    { hasActiveSku: false, expected: "No active SKU" },
  ])("does not claim selected but ineligible products are visible: $expected", ({ expected, ...overrides }) => {
    render(<NewArrivalsManager products={[product({ isNewArrival: true, ...overrides })]} />);
    expect(screen.getByText(expected, { exact: true })).toBeInTheDocument();
    expect(screen.queryByText("Visible", { exact: true })).not.toBeInTheDocument();
  });

  it("shows an empty catalog without a destructive action", () => {
    render(<NewArrivalsManager products={[]} />);
    expect(screen.getByText("No products yet.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });
});
