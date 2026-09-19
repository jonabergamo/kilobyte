import Link from "next/link"
import { notFound } from "next/navigation"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import { wishlist } from "@/db/schema"
import { currentUserId } from "@/auth"
import { productBySlug, related } from "@/lib/catalog"
import { canReview } from "@/lib/actions"
import { ProductCard } from "@/components/store/product-card"
import { Price } from "@/components/store/price"
import { Stars } from "@/components/store/stars"
import { T } from "@/components/store/t"
import { BuyBox, ReviewForm, Gallery } from "@/components/store/product-client"

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await productBySlug(slug)
  if (!p) notFound()
  const userId = await currentUserId()
  const [more, saved, reviewable] = await Promise.all([
    related(p.categoryId, p.id),
    userId ? db.query.wishlist.findFirst({ where: and(eq(wishlist.userId, userId), eq(wishlist.productId, p.id)) }) : null,
    canReview(p.id),
  ])
  return (
    <div className="space-y-12">
      <nav className="text-muted-foreground text-sm">
        <Link href="/search" className="hover:underline"><T k="home.shop" /></Link> / <Link href={`/c/${p.category.slug}`} className="hover:underline">{p.category.name}</Link>
      </nav>
      <div className="grid gap-8 lg:grid-cols-2">
        <Gallery images={p.images} name={p.name} />
        <div className="space-y-5">
          <div>
            {p.brand && <Link href={`/search?brand=${p.brand.slug}`} className="text-muted-foreground text-sm hover:underline">{p.brand.name}</Link>}
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{p.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <Stars ratingX100={p.ratingAvg} count={p.ratingCount} size={16} />
              <span className="text-muted-foreground text-xs">
                <T k="product.sku" /> #{p.id}
              </span>
            </div>
          </div>
          <Price cents={p.priceCents} promo={p.promoPriceCents} big />
          <BuyBox productId={p.id} stock={p.stock} saved={!!saved} signedIn={!!userId} />
          <p className="text-muted-foreground leading-relaxed">{p.description}</p>
          <div>
            <h2 className="mb-2 font-semibold"><T k="product.specs" /></h2>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(p.specs).map(([k, v]) => (
                  <tr key={k} className="border-b last:border-0">
                    <th className="text-muted-foreground w-40 py-2 pr-4 text-left font-normal">{k}</th>
                    <td className="py-2">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold"><T k="product.reviews" /> {p.ratingCount > 0 && <span className="text-muted-foreground text-base font-normal">({p.ratingCount})</span>}</h2>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <ul className="space-y-4">
            {p.reviews.length === 0 && <li className="text-muted-foreground text-sm"><T k="product.noReviews" /></li>}
            {p.reviews.map((r) => (
              <li key={r.id} className="bg-card rounded-xl border p-4">
                <div className="flex items-center justify-between gap-2">
                  <Stars ratingX100={r.rating * 100} />
                  <span className="text-muted-foreground text-xs">{r.user.name} · {r.createdAt.toLocaleDateString()}</span>
                </div>
                <p className="mt-2 font-medium">{r.title}</p>
                {r.body && <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{r.body}</p>}
              </li>
            ))}
          </ul>
          <ReviewForm productId={p.id} allowed={reviewable} />
        </div>
      </section>

      {more.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold"><T k="product.related" /></h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{more.map((m) => <ProductCard key={m.id} product={m} />)}</div>
        </section>
      )}
    </div>
  )
}
