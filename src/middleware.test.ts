import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getToken } = vi.hoisted(() => ({ getToken: vi.fn() }));

vi.mock("next-auth/jwt", () => ({ getToken }));

import { middleware } from "./middleware";

describe("admin middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAIL = "goldseasonofficial001@gmail.com";
  });

  it("returns a real 403 response for authenticated non-admin users", async () => {
    getToken.mockResolvedValue({ sub: "user-1", email: "user@example.com", role: "USER" });

    const response = await middleware(new NextRequest("http://localhost/admin/products"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Admin access required" });
  });

  it("returns 403 for a second ADMIN role with a different email", async () => {
    getToken.mockResolvedValue({ sub: "admin-2", email: "other-admin@example.com", role: "ADMIN" });

    const response = await middleware(new NextRequest("http://localhost/admin"));

    expect(response.status).toBe(403);
  });

  it("redirects unauthenticated admin page requests to sign-in", async () => {
    getToken.mockResolvedValue(null);

    const response = await middleware(new NextRequest("http://localhost/admin/products?from=menu"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/signin");
    expect(response.headers.get("location")).toContain("callbackUrl=%2Fadmin%2Fproducts%3Ffrom%3Dmenu");
  });

  it("allows admin requests through", async () => {
    getToken.mockResolvedValue({ sub: "admin-1", email: "goldseasonofficial001@gmail.com", role: "ADMIN" });

    const response = await middleware(new NextRequest("http://localhost/admin"));

    expect(response.status).toBe(200);
  });
});
