import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

const { auth } = NextAuth(authConfig)

// /manage is for managers, /account for anyone signed in. everything else is public
export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role
  if (pathname.startsWith("/manage") && role !== "manager") {
    return NextResponse.redirect(new URL(role ? "/" : `/login?next=${pathname}`, req.url))
  }
  if (pathname.startsWith("/account") && !req.auth) {
    return NextResponse.redirect(new URL(`/login?next=${pathname}`, req.url))
  }
  return NextResponse.next()
})

export const config = { matcher: ["/manage/:path*", "/account/:path*"] }
