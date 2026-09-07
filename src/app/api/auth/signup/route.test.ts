import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique, create, hash } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  hash: vi.fn(async () => "hashed-password"),
}));

vi.mock("@/lib/db", () => ({ prisma: { user: { findUnique, create } } }));
vi.mock("bcryptjs", () => ({ default: { hash } }));

import { POST } from "./route";

describe("signup API role assignment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAIL = "goldseasonofficial001@gmail.com";
    findUnique.mockResolvedValue(null);
    create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ id: "u1", ...data }));
  });

  it("always creates a public signup as USER, including the configured admin email", async () => {
    const request = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Gold Season",
        email: "GoldSeasonOfficial001@gmail.com",
        password: "SecurePass1",
        role: "ADMIN",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        email: "goldseasonofficial001@gmail.com",
        role: "USER",
      }),
    }));
  });
});
