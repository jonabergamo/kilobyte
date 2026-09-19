import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "@/db"
import { cartItems, carts, coupons, orderEvents, orderItems, orders, products, type Address, type OrderStatus } from "@/db/schema"
import { stripe, siteUrl } from "./stripe"
import { NEXT } from "./status"
import type { Cart } from "./cart"

export { NEXT } from "./status"

async function nextNumber() {
  const year = new Date().getFullYear()
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(orders)
  return `KB-${year}-${String(Number(n) + 1001).padStart(6, "0")}`
}

// the order is written first with a price snapshot, stripe gets a session for exactly that
export async function placeOrder(userId: number, cart: Cart, address: Address) {
  if (!cart.id || cart.lines.length === 0) throw new Error("empty cart")
  const [order] = await db
    .insert(orders)
    .values({
      number: await nextNumber(),
      userId,
      subtotalCents: cart.subtotalCents,
      discountCents: cart.discountCents,
      shippingCents: cart.shippingCents,
      totalCents: cart.totalCents,
      couponId: cart.coupon?.id ?? null,
      address,
    })
    .returning()
  await db.insert(orderItems).values(
    cart.lines.map((l) => ({ orderId: order.id, productId: l.product.id, name: l.product.name, imageUrl: l.product.images[0]?.url ?? null, unitCents: l.unitCents, qty: l.qty })),
  )
  await db.insert(orderEvents).values({ orderId: order.id, status: "pending", note: "" })

  if (!stripe) {
    // no stripe key locally: pretend the hosted page exists and land on success with a fake session id
    const fake = `cs_test_local_${order.id}`
    await db.update(orders).set({ stripeSessionId: fake }).where(eq(orders.id, order.id))
    return { order, url: `${siteUrl()}/checkout/success?session_id=${fake}&local=1` }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: String(order.id),
    customer_email: undefined,
    currency: "brl",
    line_items: [
      ...cart.lines.map((l) => ({
        quantity: l.qty,
        price_data: { currency: "brl", unit_amount: l.unitCents, product_data: { name: l.product.name, images: l.product.images[0] ? [l.product.images[0].url] : [] } },
      })),
      ...(cart.shippingCents ? [{ quantity: 1, price_data: { currency: "brl", unit_amount: cart.shippingCents, product_data: { name: "Shipping" } } }] : []),
    ],
    discounts: cart.coupon?.stripeCouponId ? [{ coupon: cart.coupon.stripeCouponId }] : undefined,
    metadata: { order_id: String(order.id), cart_id: String(cart.id) },
    success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/checkout/cancel?order=${order.number}`,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
  })
  await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id))
  return { order, url: session.url! }
}

// called by the webhook, and by the local fake success page. safe to run twice
export async function markPaid(sessionId: string, paymentIntent: string | null, cartId?: number | null) {
  const order = await db.query.orders.findFirst({ where: eq(orders.stripeSessionId, sessionId), with: { items: true } })
  if (!order || order.status !== "pending") return order
  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: "paid", paidAt: new Date(), stripePaymentIntent: paymentIntent }).where(eq(orders.id, order.id))
    await tx.insert(orderEvents).values({ orderId: order.id, status: "paid", note: "" })
    for (const item of order.items) {
      if (item.productId) await tx.update(products).set({ stock: sql`greatest(${products.stock} - ${item.qty}, 0)` }).where(eq(products.id, item.productId))
    }
    if (order.couponId) await tx.update(coupons).set({ uses: sql`${coupons.uses} + 1` }).where(eq(coupons.id, order.couponId))
    // the cart that paid, or failing that whatever cart the buyer owns now
    const cart = cartId ?? (await tx.query.carts.findFirst({ where: eq(carts.userId, order.userId) }))?.id
    if (cart) await tx.delete(cartItems).where(eq(cartItems.cartId, cart))
  })
  return { ...order, status: "paid" as const }
}

export async function cancelPending(sessionId: string) {
  const order = await db.query.orders.findFirst({ where: and(eq(orders.stripeSessionId, sessionId), eq(orders.status, "pending")) })
  if (!order) return
  await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, order.id))
  await db.insert(orderEvents).values({ orderId: order.id, status: "cancelled", note: "checkout expired" })
}

export async function moveOrder(orderId: number, status: OrderStatus, note = "") {
  await db.update(orders).set({ status }).where(eq(orders.id, orderId))
  await db.insert(orderEvents).values({ orderId, status, note })
}

export const ordersOf = (userId: number) => db.query.orders.findMany({ where: eq(orders.userId, userId), orderBy: desc(orders.createdAt), with: { items: true } })
export const orderByNumber = (number: string) => db.query.orders.findFirst({ where: eq(orders.number, number), with: { items: true, events: true, user: true, coupon: true } })
