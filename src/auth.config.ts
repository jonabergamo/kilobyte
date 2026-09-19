import type { NextAuthConfig } from "next-auth"

// the part of the auth setup the middleware can run on the edge. no database in here
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
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
} satisfies NextAuthConfig
