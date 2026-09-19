"use server"
import bcrypt from "bcryptjs"
import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { AuthError } from "next-auth"
import { db } from "@/db"
import { orderItems, orders, reviews, users, wishlist } from "@/db/schema"
import { auth, currentUserId, signIn, signOut } from "@/auth"
import { refreshRating } from "@/db/seed"
import { getCart } from "./cart"
import { placeOrder } from "./orders"
import type { Address } from "@/db/schema"

export async function login(email: string, password: string, next = "/") {
  try {
    await signIn("credentials", { email, password, redirectTo: next })
  } catch (e) {
    if (e instanceof AuthError) return { error: "bad" as const }
    throw e
  }
}

export async function register(name: string, email: string, password: string) {
  const clean = email.toLowerCase().trim()
  if (await db.query.users.findFirst({ where: eq(users.email, clean) })) return { error: "taken" as const }
  await db.insert(users).values({ name: name.trim().slice(0, 120), email: clean, passwordHash: await bcrypt.hash(password, 10) })
  await signIn("credentials", { email: clean, password, redirectTo: "/" })
}

export async function logout() {
  await signOut({ redirectTo: "/" })
}

export async function checkout(address: Address) {
  const userId = await currentUserId()
  if (!userId) return { error: "signin" as const }
  const cart = await getCart()
  if (!cart.id || cart.lines.length === 0) return { error: "empty" as const }
  const { url } = await placeOrder(userId, cart, address)
  return { url }
}

export async function toggleWishlist(productId: number) {
  const userId = await currentUserId()
  if (!userId) return { error: "signin" as const }
  const existing = await db.query.wishlist.findFirst({ where: and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)) })
  if (existing) await db.delete(wishlist).where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)))
  else await db.insert(wishlist).values({ userId, productId })
  revalidatePath("/", "layout")
  return { saved: !existing }
}

// only someone who paid for the product gets to review it, once
export async function canReview(productId: number) {
  const userId = await currentUserId()
  if (!userId) return false
  const bought = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(eq(orders.userId, userId), eq(orderItems.productId, productId), inArray(orders.status, ["paid", "packing", "shipped", "delivered"])))
    .limit(1)
  if (!bought.length) return false
  const already = await db.query.reviews.findFirst({ where: and(eq(reviews.userId, userId), eq(reviews.productId, productId)) })
  return !already
}

export async function submitReview(productId: number, rating: number, title: string, body: string) {
  const userId = await currentUserId()
  if (!userId || !(await canReview(productId))) return { error: "forbidden" as const }
  await db.insert(reviews).values({ productId, userId, rating: Math.min(5, Math.max(1, Math.round(rating))), title: title.trim().slice(0, 120), body: body.trim() })
  await refreshRating(productId)
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function updateName(name: string) {
  const userId = await currentUserId()
  if (!userId) return { error: "signin" as const }
  await db.update(users).set({ name: name.trim().slice(0, 120) }).where(eq(users.id, userId))
  return { ok: true }
}

export async function changePassword(current: string, next: string) {
  const userId = await currentUserId()
  if (!userId) return { error: "signin" as const }
  const u = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!u || !(await bcrypt.compare(current, u.passwordHash))) return { error: "wrong" as const }
  await db.update(users).set({ passwordHash: await bcrypt.hash(next, 10) }).where(eq(users.id, userId))
  return { ok: true }
}

export async function sessionUser() {
  const s = await auth()
  return s?.user ?? null
}
