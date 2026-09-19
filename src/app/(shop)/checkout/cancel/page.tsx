import Link from "next/link"
import { Button } from "@/components/ui/button"
import { T } from "@/components/store/t"

export default function Cancel() {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
      <h1 className="text-2xl font-semibold tracking-tight"><T k="checkout.cancelTitle" /></h1>
      <p className="text-muted-foreground"><T k="checkout.cancelBody" /></p>
      <Button nativeButton={false} render={<Link href="/cart" />}><T k="nav.cart" /></Button>
    </div>
  )
}
