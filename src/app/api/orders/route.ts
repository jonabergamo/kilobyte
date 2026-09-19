import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { currentUserId } from "@/auth"
import { markPaid } from "@/lib/orders"
import { stripe } from "@/lib/stripe"

// the success page polls this until the webhook has flipped the order to paid.
// if the webhook is late we ask stripe about the session ourselves.
// without a stripe key (local dev) the poll itself completes the fake payment
export async function GET(req: Request) {
  const userId = await currentUserId()
  const sessionId = new URL(req.url).searchParams.get("session_id")
  if (!userId || !sessionId) return NextResponse.json({ error: "bad request" }, { status: 400 })
  let order = await db.query.orders.findFirst({ where: eq(orders.stripeSessionId, sessionId) })
  if (!order || order.userId !== userId) return NextResponse.json({ error: "not found" }, { status: 404 })
  if (order.status === "pending") {
    if (!stripe) await markPaid(sessionId, null, null)
    else {
      const s = await stripe.checkout.sessions.retrieve(sessionId)
      if (s.payment_status === "paid") {
        const cartId = s.metadata?.cart_id ? Number(s.metadata.cart_id) : null
        await markPaid(sessionId, typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id ?? null, cartId)
      }
    }
    order = (await db.query.orders.findFirst({ where: eq(orders.id, order.id) }))!
  }
  return NextResponse.json({ number: order.number, status: order.status })
}
