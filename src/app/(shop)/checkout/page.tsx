import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getCart } from "@/lib/cart"
import { CheckoutForm } from "@/components/store/checkout-form"

export default async function Checkout() {
  const session = await auth()
  if (!session?.user) redirect("/login?next=/checkout")
  const cart = await getCart()
  if (cart.lines.length === 0) redirect("/cart")
  return <CheckoutForm cart={cart} name={session.user.name ?? ""} stripeReady={!!process.env.STRIPE_SECRET_KEY} />
}
export const dynamic = "force-dynamic"
void Link
