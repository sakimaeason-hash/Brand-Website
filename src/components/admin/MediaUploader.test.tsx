import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MediaUploader } from "./MediaUploader";

describe("MediaUploader", () => {
  it("shows selected images in order and supports removal", () => {
    const onChange = vi.fn();
    const { container } = render(<MediaUploader value={[]} onChange={onChange} />);
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    const first = new File(["one"], "first.jpg", { type: "image/jpeg" });
    const second = new File(["two"], "second.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [first, second] } });
    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ file: first }), expect.objectContaining({ file: second })]));
    render(<MediaUploader value={[{ id: "1", file: first, preview: "blob:1" }]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
