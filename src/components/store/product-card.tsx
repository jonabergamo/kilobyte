"use client"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { addToCart } from "@/lib/cart"
import { FREE_SHIPPING_FROM, unitPrice } from "@/lib/pricing"
import { useT } from "@/lib/i18n"
import type { ProductCard as P } from "@/lib/catalog"
import { Price } from "./price"
import { Stars } from "./stars"

export function ProductCard({ product: p }: { product: P }) {
  const { t } = useT()
  const [busy, start] = useTransition()
  const out = p.stock <= 0
  const freeShip = unitPrice(p) >= FREE_SHIPPING_FROM
  return (
    <div className="group bg-card flex flex-col overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/p/${p.slug}`} className="relative aspect-square overflow-hidden bg-white">
        {p.images[0] && <Image src={p.images[0].url} alt={p.images[0].alt || p.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />}
        {out && <span className="bg-foreground/80 text-background absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-medium">{t.product.outOfStock}</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="text-muted-foreground text-xs">{p.brand?.name}</span>
        <Link href={`/p/${p.slug}`} className="line-clamp-2 text-sm font-medium leading-snug hover:underline">{p.name}</Link>
        {p.ratingCount > 0 && <Stars ratingX100={p.ratingAvg} count={p.ratingCount} />}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <Price cents={p.priceCents} promo={p.promoPriceCents} />
            {freeShip && !out && <p className="text-good text-xs font-semibold">{t.product.freeShipping}</p>}
          </div>
          <Button
            size="icon"
            aria-label={t.product.addToCart}
            disabled={out || busy}
            onClick={() => start(async () => { await addToCart(p.id); toast.success(t.product.added) })}
          >
            <ShoppingCart className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
