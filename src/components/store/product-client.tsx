"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { addToCart } from "@/lib/cart"
import { submitReview, toggleWishlist } from "@/lib/actions"
import { useT } from "@/lib/i18n"
import type { ProductImage } from "@/db/schema"
import { cn } from "@/lib/utils"

export function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [i, setI] = useState(0)
  const cur = images[i] ?? images[0]
  return (
    <div className="space-y-2">
      <div className="bg-card relative aspect-square overflow-hidden rounded-2xl shadow-sm">
        {cur && <Image src={cur.url} alt={cur.alt || name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((im, k) => (
            <button key={im.id} type="button" onClick={() => setI(k)} className={cn("bg-card relative size-16 overflow-hidden rounded-md shadow-sm", k === i && "ring-primary ring-2")}>
              <Image src={im.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function BuyBox({ productId, stock, saved, signedIn }: { productId: number; stock: number; saved: boolean; signedIn: boolean }) {
  const { t } = useT()
  const router = useRouter()
  const [qty, setQty] = useState(1)
  const [busy, start] = useTransition()
  const [isSaved, setSaved] = useState(saved)
  const out = stock <= 0
  return (
    <div className="space-y-3">
      <p className={cn("text-sm font-medium", out ? "text-destructive" : stock <= 5 ? "text-hot" : "text-good")}>
        {out ? t.product.outOfStock : stock <= 5 ? t.product.lowStock(stock) : t.product.inStock}
      </p>
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center rounded-md border">
          <Button size="icon" variant="ghost" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)} aria-label="-"><Minus className="size-4" /></Button>
          <span className="w-8 text-center tabular-nums">{qty}</span>
          <Button size="icon" variant="ghost" disabled={qty >= stock} onClick={() => setQty((q) => q + 1)} aria-label="+"><Plus className="size-4" /></Button>
        </div>
        <Button size="lg" variant="hot" className="px-5 font-semibold" disabled={out || busy} onClick={() => start(async () => { await addToCart(productId, qty); toast.success(t.product.added) })}>
          <ShoppingCart className="size-4" /> {t.product.addToCart}
        </Button>
        <Button
          size="lg"
          variant="outline"
          disabled={busy}
          aria-label={isSaved ? t.product.unwishlist : t.product.wishlist}
          onClick={() =>
            start(async () => {
              if (!signedIn) return router.push("/login?next=" + location.pathname)
              const r = await toggleWishlist(productId)
              if ("saved" in r) {
                setSaved(!!r.saved)
                toast.success(r.saved ? t.product.wishlisted : t.product.unwishlist)
              }
            })
          }
        >
          <Heart className={cn("size-4", isSaved && "fill-current text-hot")} />
        </Button>
      </div>
    </div>
  )
}

export function ReviewForm({ productId, allowed }: { productId: number; allowed: boolean }) {
  const { t } = useT()
  const router = useRouter()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [busy, start] = useTransition()
  if (!allowed) return <p className="text-muted-foreground bg-card self-start rounded-xl p-4 text-sm shadow-sm">{t.product.reviewHint}</p>
  return (
    <form
      className="bg-card space-y-3 self-start rounded-xl p-4 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          const r = await submitReview(productId, rating, title, body)
          if ("ok" in r) {
            toast.success(t.product.reviewed)
            router.refresh()
          } else toast.error(t.common.failed)
        })
      }}
    >
      <p className="font-medium">{t.product.writeReview}</p>
      <div className="flex gap-1" role="radiogroup" aria-label={t.product.rating}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={n === rating} onClick={() => setRating(n)}>
            <Star className={cn("size-6", n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
          </button>
        ))}
      </div>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.product.title} required maxLength={120} />
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={t.product.body} rows={3} />
      <Button type="submit" disabled={busy || !title.trim()}>{t.product.send}</Button>
    </form>
  )
}
