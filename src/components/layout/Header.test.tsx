import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signOut: vi.fn(),
}));

vi.mock("@/context/CartContext", () => ({
  useCart: () => ({ totalItems: 0 }),
}));

import Header from "./Header";

describe("Header wheelchair finder entrypoint", () => {
  beforeEach(() => vi.clearAllMocks());

  it("links to the finder from desktop and mobile navigation", () => {
    render(<Header />);

    const desktopNav = screen.getByRole("navigation", {
      name: "Primary navigation",
    });
    expect(
      within(desktopNav).getByRole("link", { name: "Find Your Fit" }),
    ).toHaveAttribute("href", "/wheelchair-finder");

    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );
    const mobileNav = screen.getByRole("navigation", {
      name: "Mobile navigation",
    });
    expect(
      within(mobileNav).getByRole("link", { name: "Find Your Fit" }),
    ).toHaveAttribute("href", "/wheelchair-finder");
  });
});
