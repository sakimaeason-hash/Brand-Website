import { describe, expect, it, vi, beforeEach } from "vitest";

const { requireAdmin, storyFindUnique, storyUpdate, storyDelete, storyImageDelete, storyImageUpdate, removeContentImage } = vi.hoisted(() => ({
  requireAdmin: vi.fn(), storyFindUnique: vi.fn(), storyUpdate: vi.fn(), storyDelete: vi.fn(),
  storyImageDelete: vi.fn(), storyImageUpdate: vi.fn(), removeContentImage: vi.fn(),
}));

vi.mock("@/lib/admin/authorization", () => ({ requireAdmin }));
vi.mock("@/lib/db", () => ({
  prisma: {
    customerStory: { findUnique: storyFindUnique, update: storyUpdate, delete: storyDelete },
    storyImage: { delete: storyImageDelete, update: storyImageUpdate },
  },
}));
vi.mock("@/lib/content/storage", () => ({ removeContentImage }));

import { PATCH } from "./[id]/route";

const updatedAt = new Date("2026-08-01T12:00:00.000Z");
const story = () => ({
  id: "s1", displayName: "Alex", location: null, quote: "Great chair", productId: null,
  source: null, tags: [], status: "DRAFT", isFeatured: false, sortOrder: 0,
  updatedAt, images: [],
});

function form(fields: Record<string, string>) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  return body;
}

beforeEach(() => {
  vi.clearAllMocks();
  requireAdmin.mockResolvedValue({ userId: "admin" });
  storyFindUnique.mockResolvedValue(story());
  storyUpdate.mockResolvedValue(story());
  removeContentImage.mockResolvedValue(undefined);
});

describe("admin story item route", () => {
  it("returns 409 when updatedAt does not match", async () => {
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "save-draft", updatedAt: "2026-08-01T12:00:01.000Z" }),
    }), { params: { id: "s1" } });

    expect(response.status).toBe(409);
    expect(storyUpdate).not.toHaveBeenCalled();
  });

  it("revalidates display name and quote before publishing", async () => {
    storyFindUnique.mockResolvedValue({ ...story(), displayName: "", quote: "" });
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "publish", updatedAt: updatedAt.toISOString() }),
    }), { params: { id: "s1" } });

    expect(response.status).toBe(400);
    expect(storyUpdate).not.toHaveBeenCalled();
  });

  it("deletes a removed image from Storage before its database row", async () => {
    const existing = {
      ...story(),
      images: [{ id: "img1", storagePath: "stories/s1/abc-0-story.jpg", sortOrder: 0 }],
    };
    storyFindUnique.mockResolvedValue(existing);
    const payload = { updatedAt: updatedAt.toISOString(), images: [] };
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "save-draft", payload: JSON.stringify(payload) }),
    }), { params: { id: "s1" } });

    expect(response.status).toBe(200);
    expect(removeContentImage).toHaveBeenCalledWith("stories/s1/abc-0-story.jpg");
    expect(storyImageDelete).toHaveBeenCalledWith({ where: { id: "img1" } });
  });

  it("keeps the story when Storage deletion fails", async () => {
    storyFindUnique.mockResolvedValue({
      ...story(),
      images: [{ id: "img1", storagePath: "stories/s1/abc-0-story.jpg" }],
    });
    removeContentImage.mockRejectedValueOnce(new Error("Storage unavailable"));
    const response = await PATCH(new Request("http://test", {
      method: "PATCH",
      body: form({ action: "delete", confirm: "true", updatedAt: updatedAt.toISOString() }),
    }), { params: { id: "s1" } });

    expect(response.status).toBe(502);
    expect(storyDelete).not.toHaveBeenCalled();
  });
});
