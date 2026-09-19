import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { orderByNumber } from "@/lib/orders"
import { Money } from "@/components/store/money"
import { StatusBadge, Timeline } from "@/components/store/order-bits"
import { T } from "@/components/store/t"

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")
  const o = await orderByNumber(number)
  if (!o || (o.userId !== Number(session.user.id) && session.user.role !== "manager")) notFound()
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-semibold tracking-tight">{o.number}</h1>
        <StatusBadge status={o.status} />
        <span className="text-muted-foreground text-sm">{o.createdAt.toLocaleString()}</span>
      </div>
      <section className="bg-card rounded-xl border p-5">
        <h2 className="mb-3 font-semibold"><T k="account.timeline" /></h2>
        <Timeline events={o.events} status={o.status} />
      </section>
      <div className="grid gap-4 md:grid-cols-[1fr_300px]">
        <section className="bg-card rounded-xl border">
          <ul className="divide-y">
            {o.items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 p-4 text-sm">
                <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-md">{i.imageUrl && <Image src={i.imageUrl} alt="" fill sizes="56px" className="object-cover" />}</div>
                <span className="flex-1">{i.productId ? <Link href={`/search?q=${encodeURIComponent(i.name)}`} className="hover:underline">{i.name}</Link> : i.name} <span className="text-muted-foreground">× {i.qty}</span></span>
                <Money cents={i.unitCents * i.qty} />
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t p-4 text-sm">
            <div className="text-muted-foreground flex justify-between"><span><T k="cart.subtotal" /></span><Money cents={o.subtotalCents} /></div>
            {o.discountCents > 0 && <div className="text-muted-foreground flex justify-between"><span><T k="cart.discount" /> {o.coupon && `(${o.coupon.code})`}</span><span>- <Money cents={o.discountCents} /></span></div>}
            <div className="text-muted-foreground flex justify-between"><span><T k="cart.shipping" /></span>{o.shippingCents === 0 ? <T k="cart.free" /> : <Money cents={o.shippingCents} />}</div>
            <div className="flex justify-between font-semibold"><span><T k="cart.total" /></span><Money cents={o.totalCents} /></div>
          </div>
        </section>
        <section className="bg-card rounded-xl border p-4 text-sm">
          <h2 className="mb-2 font-semibold"><T k="account.shipTo" /></h2>
          <p>{o.address.name}</p>
          <p>{o.address.line1}{o.address.line2 && `, ${o.address.line2}`}</p>
          <p>{o.address.city}, {o.address.state} · {o.address.zip}</p>
        </section>
      </div>
    </div>
  )
}
