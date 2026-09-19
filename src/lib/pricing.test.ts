import { describe, expect, it } from "vitest"
import { couponProblem, discount, quote, shipping, unitPrice } from "./pricing"

describe("pricing", () => {
  it("prefers a promo price only when it is lower", () => {
    expect(unitPrice({ priceCents: 1000, promoPriceCents: 800 })).toBe(800)
    expect(unitPrice({ priceCents: 1000, promoPriceCents: 1200 })).toBe(1000)
    expect(unitPrice({ priceCents: 1000, promoPriceCents: null })).toBe(1000)
  })

  it("rounds percent discounts and caps amount discounts at the subtotal", () => {
    expect(discount({ kind: "percent", value: 15 }, 9999)).toBe(1500)
    expect(discount({ kind: "amount", value: 5000 }, 3000)).toBe(3000)
    expect(discount(null, 3000)).toBe(0)
  })

  it("ships free above the threshold, after the discount", () => {
    expect(shipping(30_000)).toBe(0)
    expect(shipping(29_999)).toBe(2490)
    expect(shipping(31_000, 2_000)).toBe(2490)
    expect(shipping(0)).toBe(0)
  })

  it("quotes a cart end to end", () => {
    const q = quote([{ unitCents: 15_000, qty: 2 }, { unitCents: 4_990, qty: 1 }], { kind: "percent", value: 10 })
    expect(q).toEqual({ subtotalCents: 34_990, discountCents: 3_499, shippingCents: 0, totalCents: 31_491 })
  })

  it("explains why a coupon does not apply", () => {
    const base = { active: true, expiresAt: null, minSubtotalCents: 10_000 }
    expect(couponProblem(base, 20_000)).toBeNull()
    expect(couponProblem({ ...base, active: false }, 20_000)).toBe("inactive")
    expect(couponProblem({ ...base, expiresAt: new Date("2020-01-01") }, 20_000)).toBe("expired")
    expect(couponProblem(base, 5_000)).toBe("min_subtotal")
  })
})
