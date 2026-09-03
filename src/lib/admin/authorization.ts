import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export class AdminAuthError extends Error {
  constructor(message: string, public readonly status: 401 | 403) {
    super(message);
    this.name = "AdminAuthError";
  }
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new AdminAuthError("Authentication required", 401);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role !== "ADMIN") throw new AdminAuthError("Admin access required", 403);
  return { session, userId };
}

export const requireAdmin = getAdminSession;
