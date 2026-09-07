import { describe, expect, it, vi } from "vitest";
import { promoteSoleAdmin } from "./promote";

describe("promoteSoleAdmin", () => {
  it("demotes every other administrator before promoting the configured account", async () => {
    const updateMany = vi.fn(async () => ({ count: 2 }));
    const update = vi.fn(async () => ({ id: "u1", email: "goldseasonofficial001@gmail.com", role: "ADMIN" }));
    const client = {
      $transaction: vi.fn(async (work: (tx: { user: { updateMany: typeof updateMany; update: typeof update } }) => unknown) => work({ user: { updateMany, update } })),
    };

    await expect(promoteSoleAdmin(client as never, " GoldSeasonOfficial001@gmail.com ")).resolves.toMatchObject({
      email: "goldseasonofficial001@gmail.com",
      role: "ADMIN",
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: { role: "ADMIN", email: { not: "goldseasonofficial001@gmail.com" } },
      data: { role: "USER" },
    });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      where: { email: "goldseasonofficial001@gmail.com" },
      data: { role: "ADMIN" },
    }));
    expect(updateMany.mock.invocationCallOrder[0]).toBeLessThan(update.mock.invocationCallOrder[0]);
  });
});
