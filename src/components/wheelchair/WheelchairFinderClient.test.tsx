import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WheelchairFinderClient } from "./WheelchairFinderClient";

describe("WheelchairFinderClient", () => {
  afterEach(cleanup);

  it("lets the user select a manual wheelchair on the first page", () => {
    render(<WheelchairFinderClient candidates={[]} />);

    const powered = screen.getByRole("radio", { name: /powered wheelchair/i });
    const manual = screen.getByRole("radio", { name: /manual wheelchair/i });
    expect(powered).toBeChecked();

    fireEvent.click(manual);

    expect(manual).toBeChecked();
    expect(powered).not.toBeChecked();
  });

  it("shows manual priorities without powered range controls", () => {
    render(<WheelchairFinderClient candidates={[]} />);
    fireEvent.click(screen.getByRole("radio", { name: /manual wheelchair/i }));

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("checkbox", { name: "Self-propulsion" })).toBeInTheDocument();
    expect(screen.queryByText(/typical daily range/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Battery range" })).not.toBeInTheDocument();
  });
});
