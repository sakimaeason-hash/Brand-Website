import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import HomePageClient from "./HomePageClient";

describe("homepage wheelchair finder entrypoint", () => {
  beforeAll(() => {
    vi.stubGlobal(
      "IntersectionObserver",
      class IntersectionObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterAll(() => vi.unstubAllGlobals());

  it("links to the finder from the hero", () => {
    render(<HomePageClient featuredProducts={[]} testimonials={[]} />);

    expect(
      screen.getByRole("link", { name: "Find Your Perfect Fit" }),
    ).toHaveAttribute("href", "/wheelchair-finder");
  });
});
