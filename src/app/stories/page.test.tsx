import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { transformSync } from "rolldown/experimental";
import { createElement } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ComponentType } from "react";

type StoryWithOptionalImage = {
  name: string;
  image?: string;
};

const expectedStoryImages = [
  { name: "Hadji Reyes", image: "/stories/Hadji Reyes.jpg" },
  { name: "Eddy Simon", image: "/stories/Eddy Simon.jpg" },
  { name: "Michele Guess", image: "/stories/Michele Guess.jpg" },
  { name: "SmashOhh", image: "/stories/SmashOhh.jpg" },
];

type StoriesPageModule = {
  default: ComponentType;
  STORIES?: readonly StoryWithOptionalImage[];
};

const animationTestStubs = `
  const React = require("react");
  const motion = new Proxy({}, {
    get: (_target, tag) => ({
      children,
      initial,
      animate,
      transition,
      whileHover,
      whileTap,
      ...props
    }) => React.createElement(tag, props, children),
  });
  const RevealOnScroll = ({ children }) =>
    React.createElement(React.Fragment, null, children);
  const HoverScale = ({ children }) =>
    React.createElement(React.Fragment, null, children);
`;

function loadStoriesPage(): StoriesPageModule {
  const source = readFileSync(join(process.cwd(), "src/app/stories/page.tsx"), "utf8")
    .replace(
      /import \{ useState \} from "react";\r?\n/,
      'const { useState } = require("react");\n',
    )
    .replace(/import \{ motion \} from "framer-motion";\r?\n/, animationTestStubs)
    .replace(
      /import \{ RevealOnScroll, HoverScale \} from "@\/components\/animations";\r?\n/,
      "",
    )
    .replace("export type Story", "type Story")
    .replace("export const STORIES", "const STORIES")
    .replace("export function StoryCard", "function StoryCard")
    .replace("export default function StoriesPage", "function StoriesPage")
    .concat(
      "\nmodule.exports = { default: StoriesPage, STORIES: typeof STORIES === 'undefined' ? undefined : STORIES, StoryCard: typeof StoryCard === 'undefined' ? undefined : StoryCard };\n",
    );
  const result = transformSync("src/app/stories/page.tsx", source, {
    jsx: {
      pragma: "React.createElement",
      pragmaFrag: "React.Fragment",
      runtime: "classic",
    },
    lang: "tsx",
    sourceType: "commonjs",
    target: "es2020",
  });

  if (result.errors.length > 0) {
    throw result.errors[0];
  }

  const module = { exports: {} };

  new Function("require", "module", "exports", result.code)(
    createRequire(import.meta.url),
    module,
    module.exports,
  );

  return module.exports as StoriesPageModule;
}

const storiesPage = loadStoriesPage();
const StoriesPage = storiesPage.default;

afterEach(cleanup);

function getStories() {
  return storiesPage.STORIES;
}

describe("customer stories", () => {
  it("exports only the four verified customer photo mappings", () => {
    const stories = getStories();

    expect(stories).toBeDefined();
    expect(
      stories
        ?.filter((story) => story.image)
        .map(({ name, image }) => ({ name, image })),
    ).toEqual(expectedStoryImages);
  });

  it("renders every verified photo with descriptive alt text in a 4:3 media container", () => {
    render(createElement(StoriesPage));

    for (const story of expectedStoryImages) {
      const image = screen.getByAltText(
        `${story.name} using a GoldSeason wheelchair`,
      );

      expect(image).toHaveAttribute("src", story.image);
      expect(image.parentElement).toHaveClass("aspect-[4/3]");
    }
  });

  it("renders Stephanie without a media area and with her initial fallback", () => {
    render(createElement(StoriesPage));

    const stephanieCard = screen
      .getByText("Stephanie Freeman")
      .closest(".editorial-card") as HTMLElement | null;

    expect(stephanieCard).not.toBeNull();
    expect(within(stephanieCard!).queryByRole("img")).not.toBeInTheDocument();
    expect(
      Array.from(stephanieCard!.querySelectorAll("div")).some((element) =>
        element.classList.contains("aspect-[4/3]"),
      ),
    ).toBe(false);
    expect(screen.getByLabelText("Stephanie Freeman initial")).toHaveTextContent("S");
  });

  it("removes both Hadji images and falls back to his initial when the main photo fails", () => {
    render(createElement(StoriesPage));

    const hadji = expectedStoryImages[0];
    const mainImage = screen.getByAltText(
      `${hadji.name} using a GoldSeason wheelchair`,
    );

    fireEvent.error(mainImage);

    expect(
      screen.queryByAltText(`${hadji.name} using a GoldSeason wheelchair`),
    ).not.toBeInTheDocument();
    expect(
      Array.from(document.querySelectorAll("img")).filter(
        (image) => image.getAttribute("src") === hadji.image,
      ),
    ).toHaveLength(0);
    expect(screen.getByLabelText("Hadji Reyes initial")).toHaveTextContent("H");
  });
});
