"use client"
import Image from "next/image"
import Link from "next/link"
import { useTransition } from "react"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { setQty, type Cart } from "@/lib/cart"
import { brl } from "@/lib/pricing"
import { useT, intlTag } from "@/lib/i18n"
import { onBrand } from "./header-client"

export function CartSheet({ cart }: { cart: Cart }) {
  const { t, locale } = useT()
  const money = (c: number) => brl(c, intlTag[locale])
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" className={`${onBrand} relative`} aria-label={t.nav.cart} />}>
        <ShoppingCart className="size-5" />
        {cart.count > 0 && <span className="bg-hot text-hot-foreground absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full text-[10px] font-semibold">{cart.count}</span>}
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t.cart.title} · {t.cart.items(cart.count)}</SheetTitle>
        </SheetHeader>
        {cart.lines.length === 0 ? (
          <p className="text-muted-foreground px-4 text-sm">{t.cart.empty}</p>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-4">
              {cart.lines.map((l) => <Line key={l.productId} line={l} />)}
            </ul>
            <div className="space-y-2 border-t p-4 text-sm">
              <Row label={t.cart.subtotal} value={money(cart.subtotalCents)} />
              {cart.discountCents > 0 && <Row label={t.cart.discount} value={`- ${money(cart.discountCents)}`} />}
              <Row label={t.cart.shipping} value={cart.shippingCents === 0 ? t.cart.free : money(cart.shippingCents)} />
              <Row label={t.cart.total} value={money(cart.totalCents)} bold />
              <Button className="mt-2 w-full" size="lg" nativeButton={false} render={<Link href="/cart" />}>{t.cart.checkout}</Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export function Line({ line: l }: { line: Cart["lines"][number] }) {
  const { t, locale } = useT()
  const [busy, start] = useTransition()
  const img = l.product.images[0]
  return (
    <li className="flex gap-3">
      <Link href={`/p/${l.product.slug}`} className="bg-muted/40 relative size-16 shrink-0 overflow-hidden rounded-md">
        {img && <Image src={img.url} alt={l.product.name} fill sizes="64px" className="object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/p/${l.product.slug}`} className="line-clamp-2 text-sm font-medium hover:underline">{l.product.name}</Link>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" className="size-7" disabled={busy} onClick={() => start(() => setQty(l.productId, l.qty - 1))} aria-label="-"><Minus className="size-3" /></Button>
            <span className="w-6 text-center text-sm tabular-nums">{l.qty}</span>
            <Button size="icon" variant="outline" className="size-7" disabled={busy || l.qty >= l.product.stock} onClick={() => start(() => setQty(l.productId, l.qty + 1))} aria-label="+"><Plus className="size-3" /></Button>
            <Button size="icon" variant="ghost" className="size-7" disabled={busy} onClick={() => start(() => setQty(l.productId, 0))} aria-label={t.cart.remove}><Trash2 className="size-3" /></Button>
          </div>
          <span className="text-sm font-medium tabular-nums">{brl(l.unitCents * l.qty, intlTag[locale])}</span>
        </div>
      </div>
    </li>
  )
}

export function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-semibold" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}
