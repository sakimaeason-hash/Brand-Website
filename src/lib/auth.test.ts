import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: { user: { findUnique: vi.fn() } } }));

import { authOptions } from "./auth";

describe("admin role in JWT sessions", () => {
  it("keeps ADMIN only for the configured administrator email", async () => {
    process.env.ADMIN_EMAIL = "goldseasonofficial001@gmail.com";
    const jwt = authOptions.callbacks?.jwt;
    if (!jwt) throw new Error("Missing jwt callback");

    const configured = await jwt({
      token: { email: "goldseasonofficial001@gmail.com" },
      user: { id: "a1", email: "goldseasonofficial001@gmail.com", role: "ADMIN" },
    } as never);
    const other = await jwt({
      token: { email: "other-admin@example.com" },
      user: { id: "a2", email: "other-admin@example.com", role: "ADMIN" },
    } as never);

    expect(configured.role).toBe("ADMIN");
    expect(other.role).toBe("USER");
  });
});
