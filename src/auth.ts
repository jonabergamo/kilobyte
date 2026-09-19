import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { users } from "@/db/schema"

declare module "next-auth" {
  interface Session {
    user: { id: string; role: "customer" | "manager" } & DefaultSession["user"]
  }
  interface User {
    role?: "customer" | "manager"
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(c) {
        const email = String(c.email ?? "").toLowerCase().trim()
        const user = await db.query.users.findFirst({ where: eq(users.email, email) })
        if (!user || !(await bcrypt.compare(String(c.password ?? ""), user.passwordHash))) return null
        return { id: String(user.id), email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.uid = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.uid as string
      session.user.role = token.role as "customer" | "manager"
      return session
    },
  },
})

// the numeric id the database wants, or null when nobody is signed in
export async function currentUserId() {
  const s = await auth()
  return s?.user?.id ? Number(s.user.id) : null
}

export async function requireManager() {
  const s = await auth()
  if (s?.user?.role !== "manager") throw new Error("managers only")
  return Number(s.user.id)
}
