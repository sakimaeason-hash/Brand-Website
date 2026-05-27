import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

// Rate limiting for login attempts
const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {}
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const attempt = loginAttempts[credentials.email]

        if (attempt && attempt.count >= MAX_ATTEMPTS) {
          const timeSinceLastAttempt = Date.now() - attempt.lastAttempt
          if (timeSinceLastAttempt < LOCKOUT_TIME) {
            throw new Error("Too many login attempts. Please try again later.")
          }
          delete loginAttempts[credentials.email]
        }

        // Authenticate against database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (user) {
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (isValidPassword) {
            delete loginAttempts[credentials.email]
            return {
              id: user.id,
              email: user.email,
              name: user.name,
            }
          }
        }

        // Track failed attempt
        if (attempt) {
          attempt.count += 1
          attempt.lastAttempt = Date.now()
        } else {
          loginAttempts[credentials.email] = { count: 1, lastAttempt: Date.now() }
        }

        return null
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }