import Stripe from "stripe"

// null when no key is set, so the whole store still runs locally without a stripe account
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3400").replace(/\/$/, "")
