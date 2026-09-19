import type { Coupon } from "@/db/schema"

export const FREE_SHIPPING_FROM = 30_000 // R$ 300
export const FLAT_SHIPPING = 2_490

export type Line = { unitCents: number; qty: number }

export const subtotal = (lines: Line[]) => lines.reduce((s, l) => s + l.unitCents * l.qty, 0)

export const unitPrice = (p: { priceCents: number; promoPriceCents: number | null }) =>
  p.promoPriceCents != null && p.promoPriceCents < p.priceCents ? p.promoPriceCents : p.priceCents

export type CouponProblem = "inactive" | "expired" | "min_subtotal"

export function couponProblem(c: Pick<Coupon, "active" | "expiresAt" | "minSubtotalCents">, sub: number, now = new Date()): CouponProblem | null {
  if (!c.active) return "inactive"
  if (c.expiresAt && c.expiresAt < now) return "expired"
  if (sub < c.minSubtotalCents) return "min_subtotal"
  return null
}

export function discount(c: Pick<Coupon, "kind" | "value"> | null, sub: number) {
  if (!c) return 0
  const d = c.kind === "percent" ? Math.round((sub * c.value) / 100) : c.value
  return Math.min(d, sub)
}

export const shipping = (sub: number, disc = 0) => (sub - disc >= FREE_SHIPPING_FROM || sub === 0 ? 0 : FLAT_SHIPPING)

export function quote(lines: Line[], coupon: Pick<Coupon, "kind" | "value"> | null) {
  const sub = subtotal(lines)
  const disc = discount(coupon, sub)
  const ship = shipping(sub, disc)
  return { subtotalCents: sub, discountCents: disc, shippingCents: ship, totalCents: sub - disc + ship }
}

export const brl = (cents: number, locale = "pt-BR") => new Intl.NumberFormat(locale, { style: "currency", currency: "BRL" }).format(cents / 100)
