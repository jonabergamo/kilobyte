import Link from "next/link"
import { getCart } from "@/lib/cart"
import { CartPage } from "@/components/store/cart-page"
import { T } from "@/components/store/t"
import { Button } from "@/components/ui/button"

export default async function Cart() {
  const cart = await getCart()
  if (cart.lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed p-10">
        <p className="text-muted-foreground"><T k="cart.empty" /></p>
        <Button render={<Link href="/search" />}><T k="cart.keepShopping" /></Button>
      </div>
    )
  }
  return <CartPage cart={cart} />
}
