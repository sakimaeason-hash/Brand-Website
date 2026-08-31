import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => tag,
    },
  ),
}));

vi.mock("@/components/animations", () => ({
  RevealOnScroll: ({ children }: { children: ReactNode }) => children,
  HoverScale: ({ children }: { children: ReactNode }) => children,
}));

import StoriesPage from "./page";

const expectedStoryImages = [
  { name: "Hadji Reyes", image: "/stories/Hadji Reyes.jpg" },
  { name: "Eddy Simon", image: "/stories/Eddy Simon.jpg" },
  { name: "Michele Guess", image: "/stories/Michele Guess.jpg" },
  { name: "SmashOhh", image: "/stories/SmashOhh.jpg" },
];

afterEach(cleanup);

function getCard(name: string) {
  const card = screen.getByText(name).closest(".editorial-card");

  if (!(card instanceof HTMLElement)) {
    throw new Error(`Missing card for ${name}`);
  }

  return card;
}

function expectInitialFallback(card: HTMLElement, initial: string) {
  const fallback = card.querySelector<HTMLElement>("[aria-hidden='true']");

  expect(fallback).toHaveTextContent(initial);
}

describe("customer stories", () => {
  it("renders only the four verified customer photo mappings", () => {
    render(<StoriesPage />);

    expect(
      screen.getAllByRole("img").map((image) => ({
        name: image.getAttribute("alt")?.replace(" using a GoldSeason wheelchair", ""),
        image: image.getAttribute("src"),
      })),
    ).toEqual(expectedStoryImages);
  });

  it("renders every verified customer photo with the expected media treatment", () => {
    render(<StoriesPage />);

    for (const story of expectedStoryImages) {
      const mainImage = screen.getByAltText(
        `${story.name} using a GoldSeason wheelchair`,
      );
      const card = getCard(story.name);
      const thumbnail = within(card).getByAltText("");

      expect(mainImage).toHaveAttribute("src", story.image);
      expect(mainImage).toHaveClass("w-full", "h-full", "object-cover");
      expect(mainImage.parentElement).toHaveClass("aspect-[4/3]");
      expect(thumbnail).toHaveAttribute("src", story.image);
      expect(thumbnail).toHaveAttribute("alt", "");
      expect(thumbnail).toHaveClass("object-cover");
    }
  });

  it("renders Stephanie without a media area and with her hidden initial fallback", () => {
    render(<StoriesPage />);

    const stephanieCard = getCard("Stephanie Freeman");

    expect(within(stephanieCard).queryByRole("img")).not.toBeInTheDocument();
    expect(
      Array.from(stephanieCard.querySelectorAll("div")).some((element) =>
        element.classList.contains("aspect-[4/3]"),
      ),
    ).toBe(false);
    expectInitialFallback(stephanieCard, "S");
  });

  it("removes both Hadji images and renders his initial when the main photo fails", () => {
    render(<StoriesPage />);

    const hadjiCard = getCard("Hadji Reyes");
    fireEvent.error(
      within(hadjiCard).getByAltText(
        "Hadji Reyes using a GoldSeason wheelchair",
      ),
    );

    expect(
      within(hadjiCard).queryByAltText(
        "Hadji Reyes using a GoldSeason wheelchair",
      ),
    ).not.toBeInTheDocument();
    expect(within(hadjiCard).queryByAltText("")).not.toBeInTheDocument();
    expectInitialFallback(hadjiCard, "H");
  });

  it("removes both Hadji images and renders his initial when the thumbnail fails", () => {
    render(<StoriesPage />);

    const hadjiCard = getCard("Hadji Reyes");
    fireEvent.error(within(hadjiCard).getByAltText(""));

    expect(
      within(hadjiCard).queryByAltText(
        "Hadji Reyes using a GoldSeason wheelchair",
      ),
    ).not.toBeInTheDocument();
    expect(within(hadjiCard).queryByAltText("")).not.toBeInTheDocument();
    expectInitialFallback(hadjiCard, "H");
  });
});

describe("featured customer story", () => {
  it("uses a text-led Eleanor story without unverified photo placeholders", () => {
    render(<StoriesPage />);

    const title = screen.getByRole("heading", {
      name: '"I Regained My Independence at 75"',
    });
    const featuredSection = title.closest("section");

    if (!(featuredSection instanceof HTMLElement)) {
      throw new Error("Missing featured story section");
    }

    expect(title).toBeInTheDocument();
    expect(within(featuredSection).getByText("Eleanor Watson")).toBeInTheDocument();
    expect(
      within(featuredSection).getByText("Seattle, WA · Goldseason Power Max01 A"),
    ).toBeInTheDocument();
    expect(within(featuredSection).queryByText("Eleanor 1")).not.toBeInTheDocument();
    expect(within(featuredSection).queryByText("Eleanor 2")).not.toBeInTheDocument();
    expect(within(featuredSection).queryByRole("img")).not.toBeInTheDocument();
  });
});
