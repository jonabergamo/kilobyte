import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { wishlist } from "@/db/schema"
import { currentUserId } from "@/auth"
import { productWith } from "@/lib/catalog"
import { ProductCard } from "@/components/store/product-card"
import { T } from "@/components/store/t"

export default async function Wishlist() {
  const userId = await currentUserId()
  if (!userId) redirect("/login?next=/account/wishlist")
  const rows = await db.query.wishlist.findMany({ where: eq(wishlist.userId, userId), with: { product: { with: productWith } } })
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight"><T k="account.wishlist" /></h1>
      {rows.length === 0 ? <p className="text-muted-foreground rounded-xl border border-dashed p-8 text-sm"><T k="account.noWishlist" /></p> : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{rows.map((r) => <ProductCard key={r.productId} product={r.product} />)}</div>
      )}
    </div>
  )
}
export const dynamic = "force-dynamic"
