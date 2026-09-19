"use client"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge, Timeline } from "@/components/store/order-bits"
import { Money } from "@/components/store/money"
import type { orderByNumber } from "@/lib/orders"
import { NEXT } from "@/lib/orders"
import { advanceOrder, cancelOrder } from "@/lib/manage"
import { useT } from "@/lib/i18n"

export function OrderManage({ order: o }: { order: NonNullable<Awaited<ReturnType<typeof orderByNumber>>> }) {
  const { t } = useT()
  const router = useRouter()
  const [note, setNote] = useState("")
  const [busy, start] = useTransition()
  const next = NEXT[o.status]
  const can = o.status !== "delivered" && o.status !== "cancelled"
  return (
    <>
      <div>
        <Link href="/manage/orders" className="text-muted-foreground inline-flex items-center gap-1 text-sm hover:underline"><ArrowLeft className="size-3.5" /> {t.manage.orders}</Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold tracking-tight">{o.number}</h1>
          <StatusBadge status={o.status} />
          <span className="text-muted-foreground text-sm">{o.user.name} · {o.user.email}</span>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="bg-card rounded-xl border p-5"><Timeline events={o.events} status={o.status} /></section>
          <section className="bg-card rounded-xl border">
            <ul className="divide-y">
              {o.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 p-4 text-sm">
                  <div className="bg-muted relative size-12 shrink-0 overflow-hidden rounded">{i.imageUrl && <Image src={i.imageUrl} alt="" fill sizes="48px" className="object-cover" />}</div>
                  <span className="flex-1">{i.name} <span className="text-muted-foreground">× {i.qty}</span></span>
                  <Money cents={i.unitCents * i.qty} />
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t p-4 font-semibold"><span>{t.manage.total}</span><Money cents={o.totalCents} /></div>
          </section>
        </div>
        <div className="space-y-4">
          {can && (
            <section className="bg-card space-y-3 rounded-xl border p-5">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.manage.note} maxLength={300} />
              {next && (
                <Button className="w-full" disabled={busy} onClick={() => start(async () => { const r = await advanceOrder(o.id, note); if ("status" in r) { toast.success(t.manage.statusChanged); setNote(""); router.refresh() } else toast.error(t.common.failed) })}>
                  {t.manage.advance} {t.status[next]}
                </Button>
              )}
              <Button variant="outline" className="text-destructive w-full" disabled={busy} onClick={() => confirm(t.manage.cancel + "?") && start(async () => { await cancelOrder(o.id, note); toast.success(t.manage.statusChanged); router.refresh() })}>
                {t.manage.cancel}
              </Button>
            </section>
          )}
          <section className="bg-card rounded-xl border p-4 text-sm">
            <p className="font-medium">{o.address.name}</p>
            <p>{o.address.line1}{o.address.line2 && `, ${o.address.line2}`}</p>
            <p>{o.address.city}, {o.address.state} · {o.address.zip}</p>
            {o.stripeSessionId && <p className="text-muted-foreground mt-2 truncate font-mono text-xs">{o.stripeSessionId}</p>}
          </section>
        </div>
      </div>
    </>
  )
}
