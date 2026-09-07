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

  it("edits metadata and reorders existing images", () => {
    const onChange = vi.fn();
    const value = [
      { id: "1", preview: "/one.jpg", name: "one.jpg", persisted: true, altText: "", sourceNote: "" },
      { id: "2", preview: "/two.jpg", name: "two.jpg", persisted: true, altText: "", sourceNote: "" },
    ];
    render(<MediaUploader value={value} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Alt text for one.jpg"), { target: { value: "Front view" } });
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: "1", altText: "Front view" }),
      expect.objectContaining({ id: "2" }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Move two.jpg up" }));
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: "2" }),
      expect.objectContaining({ id: "1" }),
    ]);
  });
});
