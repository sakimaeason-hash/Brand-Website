import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

import { PromotionForm } from "./PromotionForm";

beforeEach(() => vi.clearAllMocks());
afterEach(() => cleanup());

describe("PromotionForm", () => {
  it("serializes datetime-local values as Eastern Time instead of browser local time", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "promo-1" }), { status: 201 }),
    );
    render(<PromotionForm products={[{ id: "p1", name: "Travel Air", model: "PA22" }]} />);

    fireEvent.change(screen.getByLabelText("Promotion name"), { target: { value: "Summer sale" } });
    fireEvent.change(screen.getByLabelText("Product"), { target: { value: "p1" } });
    fireEvent.change(screen.getByLabelText("Start (ET)"), { target: { value: "2026-07-01T12:00" } });
    fireEvent.change(screen.getByLabelText("End (ET)"), { target: { value: "2026-07-02T12:00" } });
    fireEvent.change(screen.getByLabelText("Sale price"), { target: { value: "799" } });
    fireEvent.submit(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const request = fetchMock.mock.calls[0][1];
    const body = request?.body as FormData;
    const payload = JSON.parse(String(body.get("payload")));
    expect(payload.startAt).toBe("2026-07-01T16:00:00.000Z");
    expect(payload.endAt).toBe("2026-07-02T16:00:00.000Z");
    fetchMock.mockRestore();
  });

  it("updates an existing promotion with its optimistic version", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "promo-1" }), { status: 200 }),
    );
    render(<PromotionForm
      products={[{ id: "p1", name: "Travel Air", model: "PA22" }]}
      initialData={{
        id: "promo-1",
        updatedAt: "2026-08-01T12:00:00.000Z",
        name: "Summer sale",
        productId: "p1",
        startAt: "2026-07-01T16:00:00.000Z",
        endAt: "2026-07-02T16:00:00.000Z",
        salePrice: 799,
        discountPercent: null,
        label: "Summer",
        bannerImageUrl: null,
        isAutoScheduleEnabled: true,
      }}
    />);

    expect(screen.getByLabelText("Start (ET)")).toHaveValue("2026-07-01T12:00");
    fireEvent.change(screen.getByLabelText("Sale price"), { target: { value: "749" } });
    fireEvent.submit(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/promotions/promo-1");
    const request = fetchMock.mock.calls[0][1];
    expect(request?.method).toBe("PATCH");
    const body = request?.body as FormData;
    expect(body.get("action")).toBe("save-draft");
    expect(body.get("updatedAt")).toBe("2026-08-01T12:00:00.000Z");
    expect(JSON.parse(String(body.get("payload"))).salePrice).toBe(749);
    fetchMock.mockRestore();
  });
});
