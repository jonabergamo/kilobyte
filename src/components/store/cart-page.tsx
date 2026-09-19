"use client"
import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { applyCoupon, removeCoupon, type Cart } from "@/lib/cart"
import { brl, FREE_SHIPPING_FROM } from "@/lib/pricing"
import { useT, intlTag } from "@/lib/i18n"
import { Line, Row } from "./cart-sheet"

export function CartPage({ cart }: { cart: Cart }) {
  const { t, locale } = useT()
  const money = (c: number) => brl(c, intlTag[locale])
  const [code, setCode] = useState("")
  const [busy, start] = useTransition()
  const missing = FREE_SHIPPING_FROM - (cart.subtotalCents - cart.discountCents)
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">{t.cart.title} <span className="text-muted-foreground text-base font-normal">· {t.cart.items(cart.count)}</span></h1>
        <ul className="divide-y rounded-xl border px-4">
          {cart.lines.map((l) => <div key={l.productId} className="py-4"><Line line={l} /></div>)}
        </ul>
      </div>
      <aside className="bg-card space-y-4 self-start rounded-xl border p-5 text-sm lg:sticky lg:top-20">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            start(async () => {
              const r = await applyCoupon(code)
              if (r.ok) { toast.success(t.cart.couponOk(code.toUpperCase())); setCode("") }
              else toast.error(t.cart.couponBad[r.reason] ?? t.common.failed)
            })
          }}
        >
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={t.cart.coupon} className="font-mono uppercase" />
          <Button type="submit" variant="outline" disabled={busy || !code.trim()}>{t.cart.apply}</Button>
        </form>
        {cart.coupon && (
          <p className="flex items-center justify-between rounded-md bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:text-emerald-400">
            <span className="font-mono">{cart.coupon.code}</span>
            <button type="button" className="text-xs underline-offset-4 hover:underline" onClick={() => start(() => removeCoupon())}>{t.cart.remove}</button>
          </p>
        )}
        <div className="space-y-2 border-t pt-4">
          <Row label={t.cart.subtotal} value={money(cart.subtotalCents)} />
          {cart.discountCents > 0 && <Row label={t.cart.discount} value={`- ${money(cart.discountCents)}`} />}
          <Row label={t.cart.shipping} value={cart.shippingCents === 0 ? t.cart.free : money(cart.shippingCents)} />
          {missing > 0 && cart.shippingCents > 0 && <p className="text-muted-foreground text-xs">{t.cart.freeShippingHint(money(missing))}</p>}
          <Row label={t.cart.total} value={money(cart.totalCents)} bold />
        </div>
        <Button className="w-full" size="lg" nativeButton={false} render={<Link href="/checkout" />}>{t.cart.checkout}</Button>
        <Link href="/search" className="text-muted-foreground block text-center text-xs underline-offset-4 hover:underline">{t.cart.keepShopping}</Link>
      </aside>
    </div>
  )
}
