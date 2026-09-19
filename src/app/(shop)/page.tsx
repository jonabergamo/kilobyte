import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/store/product-card"
import { T } from "@/components/store/t"
import { allBrands, categoryTree, featured, onSale } from "@/lib/catalog"

export default async function Home() {
  const [tree, picks, sale, brandList] = await Promise.all([categoryTree(), featured(), onSale(), allBrands()])
  const hero = picks[0]
  return (
    <div className="space-y-12">
      <section className="bg-brand text-brand-foreground relative grid items-center gap-8 overflow-hidden rounded-3xl p-8 md:grid-cols-2 md:p-12">
        <div className="from-hot/30 pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-radial to-transparent blur-2xl" />
        <div className="relative space-y-5">
          <p className="text-hot text-sm font-semibold tracking-widest uppercase"><T k="tagline" /></p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl"><T k="home.hero" /></h1>
          <p className="text-brand-foreground/75 max-w-md text-lg"><T k="home.heroSub" /></p>
          <div className="flex gap-2">
            <Button size="lg" variant="hot" className="px-5 font-semibold" nativeButton={false} render={<Link href="/search" />}><T k="home.shop" /> <ArrowRight className="size-4" /></Button>
            <Button size="lg" variant="ghost" className="text-brand-foreground hover:bg-white/10 hover:text-brand-foreground" nativeButton={false} render={<Link href="/search?sort=rating" />}><T k="search.sorts.rating" /></Button>
          </div>
        </div>
        {hero?.images[0] && (
          <Link href={`/p/${hero.slug}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
            <Image src={hero.images[0].url} alt={hero.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </Link>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold"><T k="home.categories" /></h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {tree.map((c) => (
            <Link key={c.id} href={`/c/${c.slug}`} className="bg-card rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md">
              <p className="font-medium">{c.name}</p>
              <p className="text-muted-foreground mt-1 text-xs">{c.children.map((k) => k.name).join(" · ")}</p>
            </Link>
          ))}
        </div>
      </section>

      <Rail title="home.featured" items={picks} href="/search?sort=rating" />
      <Rail title="home.onSale" items={sale} href="/search?sort=price_asc" />

      <section>
        <h2 className="mb-4 text-xl font-semibold"><T k="home.brandsTitle" /></h2>
        <div className="flex flex-wrap gap-2">
          {brandList.map((b) => (
            <Link key={b.id} href={`/search?brand=${b.slug}`} className="bg-card hover:text-primary rounded-full px-3 py-1 text-sm shadow-sm">{b.name}</Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function Rail({ title, items, href }: { title: "home.featured" | "home.onSale"; items: Awaited<ReturnType<typeof featured>>; href: string }) {
  if (items.length === 0) return null
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold"><T k={title} /></h2>
        <Link href={href} className="text-primary text-sm font-medium underline-offset-4 hover:underline"><T k="home.shop" /></Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}
