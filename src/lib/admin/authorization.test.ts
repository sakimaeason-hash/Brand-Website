import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { requireAdmin, AdminAuthError } from "./authorization";

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAIL = "goldseasonofficial001@gmail.com";
  });

  it("rejects unauthenticated requests with 401", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
  });

  it("rejects USER with 403", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "USER", email: "user@example.com" } as never);
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });

  it("rejects a second ADMIN role that does not use the configured email", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "a2", email: "other-admin@example.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "ADMIN", email: "other-admin@example.com" } as never);
    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });

  it("returns the session and user id for ADMIN", async () => {
    const session = { user: { id: "a1", email: "goldseasonofficial001@gmail.com" } };
    vi.mocked(getServerSession).mockResolvedValue(session as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "ADMIN", email: "goldseasonofficial001@gmail.com" } as never);
    await expect(requireAdmin()).resolves.toEqual({ session, userId: "a1" });
  });

  it("exposes a status-bearing auth error", () => {
    expect(new AdminAuthError("no", 401)).toMatchObject({ message: "no", status: 401 });
  });
});
