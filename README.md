# Kilobyte

An electronics store that works end to end. Browse laptops, components and peripherals, filter and sort, add to cart as a guest, apply a coupon, pay through Stripe Checkout, and follow the order from paid to delivered. Behind it a manager area runs the catalogue, orders, coupons and reviews. Everything is in Stripe test mode, so nothing charges a real card.

I built the first version in 2023 as a college project, a Django API and a Next 13 front end called Informática that had a cart and a checkout button that only decremented stock. In 2026 I kept the repo, renamed it and rebuilt it as a real store.

Demo at https://kilobyte.vercel.app. One click logins for a customer and for the manager on the sign in page. Pay with card `4242 4242 4242 4242`, any future date, any CVC.

## How it works

One Next.js 16 app on Vercel. Server components read straight from Postgres through Drizzle, server actions write, and the few client pieces that need it (the cart drawer, the manager tables) use TanStack Query. Auth.js with email and password and a `role` in the session, `manager` or `customer`. Postgres on Neon.

Money is integer cents everywhere and the maths lives in `src/lib/pricing.ts` as pure functions with tests. Shipping is a flat R$ 24,90 and free above R$ 300, after the discount.

The cart follows the browser with a cookie token. Sign in and it becomes your cart, merged with whatever your account already had.

Checkout writes the order first, in `pending`, with a snapshot of names and prices, then creates a Stripe Checkout Session for exactly that and sends you to Stripe. Stripe calls the webhook at `/api/stripe/webhook` when the payment goes through. The webhook verifies the signature, marks the order paid, takes the stock, counts the coupon use and empties the cart. The success page polls until that happened, because Stripe redirects you back before its webhook may have arrived. If the session expires the order is cancelled and nothing was ever reserved, stock only moves on payment.

Coupons the manager creates are mirrored as Stripe coupons, so the discount shows on Stripe's page too. Without a Stripe key the store still runs, the checkout skips Stripe and marks the order paid on the success page, which is how the local demo and the tests work.

Managers move orders `paid → packing → shipped → delivered`, with a note the customer sees on the timeline, or cancel and put the stock back. Reviews are allowed once per product for customers who paid for it, and a manager can hide one.

## Running it

Node 22 with pnpm, Docker for the database.

```bash
docker compose up -d
cp .env.example .env.local
pnpm install
pnpm db:migrate && pnpm seed
pnpm dev
```

The store is on http://localhost:3000. `pnpm test` runs the pricing tests, `pnpm lint` and `pnpm typecheck` do what they say. Stripe is optional locally. To use it, put `STRIPE_SECRET_KEY` in `.env.local` and forward webhooks with the Stripe CLI, `stripe listen --forward-to localhost:3000/api/stripe/webhook`, then copy the signing secret it prints into `STRIPE_WEBHOOK_SECRET`.

## The demo store

`pnpm seed` builds the catalogue, fifty products across fourteen categories and twelve brands with real looking specs and prices in BRL, three coupons, a demo customer with three orders at different points of the flow, two reviews and a wishlist, plus the demo manager. Logins are `cliente@kilobyte.app` and `gerente@kilobyte.app` with the password in `DEMO_PASSWORD`, `kilobyte123` by default. On Vercel a cron hits `/api/cron/reset-demo` every morning and reseeds, so what strangers did the day before is gone. Accounts real people registered are kept.

## Deploying

Import the repo into Vercel, add a Neon database and set `DATABASE_URL`, `AUTH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`, `DEMO_PASSWORD` and `CRON_SECRET`. Run `pnpm db:migrate` and `pnpm seed` once against the Neon URL. In the Stripe dashboard add a webhook endpoint at `https://<your-domain>/api/stripe/webhook` for `checkout.session.completed` and `checkout.session.expired`, and paste its signing secret. `vercel.json` carries the cron.

## What's missing

No product variants, one price per product. Payments are Stripe only and test mode only. There is no email, so no order confirmations land in an inbox. Images are URLs, there is no upload. Search is `ilike` over name, description and specs, which is fine for fifty products and would want Postgres full text search past a few thousand.
