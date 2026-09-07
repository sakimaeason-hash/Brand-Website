import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/animations", () => ({
  RevealOnScroll: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  HoverScale: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import StoriesCatalog from "./StoriesCatalog";

describe("StoriesCatalog database results", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => [] })));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("does not restore static stories after the API returns an empty published list", async () => {
    render(<StoriesCatalog />);

    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/content/stories"));
    await waitFor(() => expect(screen.queryByText("Hadji Reyes")).not.toBeInTheDocument());
    expect(screen.getByText("No customer stories are published yet.")).toBeVisible();
  });

  it("treats a server-provided empty list as authoritative", () => {
    render(<StoriesCatalog initialStories={[]} />);

    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByText("Hadji Reyes")).not.toBeInTheDocument();
    expect(screen.getByText("No customer stories are published yet.")).toBeVisible();
  });
});
