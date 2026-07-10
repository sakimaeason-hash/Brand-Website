import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        const attempt = loginAttempts.get(email);
        if (attempt?.count && attempt.count >= MAX_ATTEMPTS) {
          if (Date.now() - attempt.lastAttempt < LOCKOUT_TIME) {
            throw new Error("Too many login attempts. Please try again later.");
          }
          loginAttempts.delete(email);
        }

        const user = await prisma.user.findUnique({ where: { email } });
        const passwordMatches = user
          ? await bcrypt.compare(password, user.password)
          : false;

        if (!user || !passwordMatches) {
          const current = loginAttempts.get(email);
          loginAttempts.set(email, {
            count: (current?.count ?? 0) + 1,
            lastAttempt: Date.now(),
          });
          return null;
        }

        loginAttempts.delete(email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
