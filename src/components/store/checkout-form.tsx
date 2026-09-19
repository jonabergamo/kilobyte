"use client"
import Image from "next/image"
import { FormEvent, useState, useTransition } from "react"
import { Lock } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Cart } from "@/lib/cart"
import { checkout } from "@/lib/actions"
import { brl } from "@/lib/pricing"
import { useT, intlTag } from "@/lib/i18n"
import { Row } from "./cart-sheet"

export function CheckoutForm({ cart, name, stripeReady }: { cart: Cart; name: string; stripeReady: boolean }) {
  const { t, locale } = useT()
  const money = (c: number) => brl(c, intlTag[locale])
  const [busy, start] = useTransition()
  const [f, setF] = useState({ name, line1: "", line2: "", city: "", state: "SP", zip: "" })
  const field = (k: keyof typeof f, label: string, extra: Record<string, unknown> = {}) => (
    <div className="space-y-1">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} required={k !== "line2"} {...extra} />
    </div>
  )
  const submit = (e: FormEvent) => {
    e.preventDefault()
    start(async () => {
      const r = await checkout({ ...f, line2: f.line2 || undefined })
      if ("url" in r && r.url) location.assign(r.url)
      else toast.error(t.common.failed)
    })
  }
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <form onSubmit={submit} className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t.checkout.title}</h1>
        <section className="bg-card space-y-3 rounded-xl border p-5">
          <h2 className="font-semibold">{t.checkout.address}</h2>
          {field("name", t.checkout.name)}
          {field("line1", t.checkout.line1)}
          {field("line2", t.checkout.line2)}
          <div className="grid grid-cols-[1fr_80px_120px] gap-3">
            {field("city", t.checkout.city)}
            {field("state", t.checkout.state, { maxLength: 2, className: "uppercase" })}
            {field("zip", t.checkout.zip, { placeholder: "00000-000" })}
          </div>
        </section>
        <p className="text-muted-foreground flex items-center gap-2 text-xs"><Lock className="size-3.5" /> {stripeReady ? t.checkout.testCard : t.checkout.testCard.split(".")[0] + ". Local mode, no Stripe key set, the order will be marked paid directly."}</p>
        <Button size="lg" type="submit" disabled={busy} className="w-full sm:w-auto">{busy ? t.checkout.paying : `${t.checkout.pay} · ${money(cart.totalCents)}`}</Button>
      </form>
      <aside className="bg-card space-y-4 self-start rounded-xl border p-5 text-sm">
        <ul className="space-y-3">
          {cart.lines.map((l) => (
            <li key={l.productId} className="flex items-center gap-3">
              <div className="bg-muted/40 relative size-12 shrink-0 overflow-hidden rounded-md">{l.product.images[0] && <Image src={l.product.images[0].url} alt="" fill sizes="48px" className="object-cover" />}</div>
              <span className="line-clamp-2 flex-1">{l.product.name} <span className="text-muted-foreground">× {l.qty}</span></span>
              <span className="tabular-nums">{money(l.unitCents * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t pt-3">
          <Row label={t.cart.subtotal} value={money(cart.subtotalCents)} />
          {cart.discountCents > 0 && <Row label={`${t.cart.discount} (${cart.coupon?.code})`} value={`- ${money(cart.discountCents)}`} />}
          <Row label={t.cart.shipping} value={cart.shippingCents === 0 ? t.cart.free : money(cart.shippingCents)} />
          <Row label={t.cart.total} value={money(cart.totalCents)} bold />
        </div>
      </aside>
    </div>
  )
}
