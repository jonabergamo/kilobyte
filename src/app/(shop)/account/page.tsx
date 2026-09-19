import Link from "next/link"
import { redirect } from "next/navigation"
import { currentUserId } from "@/auth"
import { ordersOf } from "@/lib/orders"
import { T } from "@/components/store/t"
import { OrderRow } from "@/components/store/order-bits"

export default async function Orders() {
  const userId = await currentUserId()
  if (!userId) redirect("/login?next=/account")
  const list = await ordersOf(userId)
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight"><T k="account.orders" /></h1>
      {list.length === 0 ? (
        <p className="text-muted-foreground rounded-xl border border-dashed p-8 text-sm"><T k="account.noOrders" /></p>
      ) : (
        <ul className="space-y-2">{list.map((o) => <li key={o.id}><Link href={`/account/orders/${o.number}`}><OrderRow order={o} /></Link></li>)}</ul>
      )}
    </div>
  )
}
export const dynamic = "force-dynamic"
