"use server"
import { randomBytes } from "node:crypto"
import { and, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { cartItems, carts, coupons, products } from "@/db/schema"
import { currentUserId } from "@/auth"
import { couponProblem, quote, subtotal, unitPrice } from "./pricing"

const COOKIE = "kb.cart"
const COUPON = "kb.coupon"

// the cart follows the browser through a cookie token. on login the guest cart becomes the user's
async function findCart(create: boolean) {
  const jar = await cookies()
  const userId = await currentUserId()
  const token = jar.get(COOKIE)?.value ?? null

  let cart = userId ? await db.query.carts.findFirst({ where: eq(carts.userId, userId) }) : null
  const guest = token ? await db.query.carts.findFirst({ where: eq(carts.token, token) }) : null

  if (userId && guest && guest.userId !== userId) {
    if (!cart) {
      await db.update(carts).set({ userId }).where(eq(carts.id, guest.id))
      cart = { ...guest, userId }
    } else {
      // merge the guest lines into the account cart, then drop the guest cart
      const lines = await db.select().from(cartItems).where(eq(cartItems.cartId, guest.id))
      for (const l of lines) await upsertLine(cart.id, l.productId, l.qty, true)
      await db.delete(carts).where(eq(carts.id, guest.id))
    }
  }
  if (!cart && !userId) cart = guest ?? null
  if (!cart && create) {
    const newToken = token ?? randomBytes(24).toString("hex")
    const [row] = await db.insert(carts).values({ userId, token: userId ? null : newToken }).returning()
    if (!userId) jar.set(COOKIE, newToken, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" })
    cart = row
  }
  return cart
}

async function upsertLine(cartId: number, productId: number, qty: number, add: boolean) {
  const product = await db.query.products.findFirst({ where: eq(products.id, productId) })
  if (!product || !product.active) return
  const existing = await db.query.cartItems.findFirst({ where: and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)) })
  const next = Math.min(product.stock, add ? (existing?.qty ?? 0) + qty : qty)
  if (next <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
  } else if (existing) {
    await db.update(cartItems).set({ qty: next }).where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
  } else {
    await db.insert(cartItems).values({ cartId, productId, qty: next })
  }
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId))
}

export async function getCart() {
  const cart = await findCart(false)
  const jar = await cookies()
  const code = jar.get(COUPON)?.value ?? null
  const lines = cart
    ? await db.query.cartItems.findMany({ where: eq(cartItems.cartId, cart.id), with: { product: { with: { images: true } } } })
    : []
  const priced = lines.map((l) => ({ ...l, unitCents: unitPrice(l.product) }))
  const sub = subtotal(priced)
  let coupon = (code ? await db.query.coupons.findFirst({ where: eq(coupons.code, code) }) : null) ?? null
  if (coupon && couponProblem(coupon, sub)) coupon = null
  return { id: cart?.id ?? null, lines: priced, coupon, ...quote(priced, coupon), count: priced.reduce((n, l) => n + l.qty, 0) }
}
export type Cart = Awaited<ReturnType<typeof getCart>>

export async function addToCart(productId: number, qty = 1) {
  const cart = await findCart(true)
  if (cart) await upsertLine(cart.id, productId, qty, true)
  revalidatePath("/", "layout")
}

export async function setQty(productId: number, qty: number) {
  const cart = await findCart(true)
  if (cart) await upsertLine(cart.id, productId, qty, false)
  revalidatePath("/", "layout")
}

export async function clearCart(cartId: number) {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId))
}

export async function applyCoupon(code: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const clean = code.trim().toUpperCase()
  const coupon = await db.query.coupons.findFirst({ where: eq(coupons.code, clean) })
  if (!coupon) return { ok: false, reason: "unknown" }
  const cart = await getCart()
  const problem = couponProblem(coupon, cart.subtotalCents)
  if (problem) return { ok: false, reason: problem }
  const jar = await cookies()
  jar.set(COUPON, clean, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24, path: "/" })
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function removeCoupon() {
  const jar = await cookies()
  jar.delete(COUPON)
  revalidatePath("/", "layout")
}
