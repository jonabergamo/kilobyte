"use client"
import Image from "next/image"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Order, OrderEvent, OrderItem, OrderStatus } from "@/db/schema"
import { brl } from "@/lib/pricing"
import { useT, intlTag } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const tone: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  paid: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  packing: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  shipped: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  delivered: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-muted text-muted-foreground",
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useT()
  return <Badge variant="outline" className={cn("border-transparent", tone[status])}>{t.status[status]}</Badge>
}

export function OrderRow({ order: o }: { order: Order & { items: OrderItem[] } }) {
  const { t, locale } = useT()
  return (
    <div className="bg-card hover:bg-muted/60 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm">
      <div className="flex -space-x-2">
        {o.items.slice(0, 3).map((i) => (
          <div key={i.id} className="bg-muted relative size-10 overflow-hidden rounded-md border">{i.imageUrl && <Image src={i.imageUrl} alt="" fill sizes="40px" className="object-cover" />}</div>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono font-medium">{o.number}</p>
        <p className="text-muted-foreground truncate text-xs">{t.account.placed} {o.createdAt.toLocaleDateString(intlTag[locale])} · {o.items.map((i) => i.name).join(", ")}</p>
      </div>
      <StatusBadge status={o.status} />
      <span className="font-semibold tabular-nums">{brl(o.totalCents, intlTag[locale])}</span>
    </div>
  )
}

const FLOW: OrderStatus[] = ["paid", "packing", "shipped", "delivered"]

export function Timeline({ events, status }: { events: OrderEvent[]; status: OrderStatus }) {
  const { t, locale } = useT()
  if (status === "cancelled" || status === "pending") {
    return <StatusBadge status={status} />
  }
  const reached = FLOW.indexOf(status)
  return (
    <ol className="grid grid-cols-4 gap-2">
      {FLOW.map((s, i) => {
        const ev = events.find((e) => e.status === s)
        const done = i <= reached
        return (
          <li key={s} className="space-y-1 text-xs">
            <div className="flex items-center gap-1">
              <span className={cn("flex size-5 items-center justify-center rounded-full border", done ? "bg-emerald-500 border-emerald-500 text-white" : "text-transparent")}><Check className="size-3" /></span>
              <span className={cn("h-px flex-1", i < reached ? "bg-emerald-500" : "bg-border")} />
            </div>
            <p className={cn("font-medium", !done && "text-muted-foreground")}>{t.status[s]}</p>
            {ev && <p className="text-muted-foreground">{ev.at.toLocaleDateString(intlTag[locale])}{ev.note && <><br />{ev.note}</>}</p>}
          </li>
        )
      })}
    </ol>
  )
}
