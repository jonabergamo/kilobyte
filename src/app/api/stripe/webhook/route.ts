import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { cancelPending, markPaid } from "@/lib/orders"

// stripe posts here after the customer pays. the signature check is the whole security model
export async function POST(req: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "stripe not configured" }, { status: 503 })
  const sig = req.headers.get("stripe-signature")
  if (!sig) return NextResponse.json({ error: "no signature" }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object
    const cartId = s.metadata?.cart_id ? Number(s.metadata.cart_id) : null
    await markPaid(s.id, typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id ?? null, cartId)
  }
  if (event.type === "checkout.session.expired") await cancelPending(event.data.object.id)

  return NextResponse.json({ received: true })
}
