"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/store/order-bits"
import type { listOrders } from "@/lib/manage"
import { brl } from "@/lib/pricing"
import { useT, intlTag } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const STATUSES = ["", "pending", "paid", "packing", "shipped", "delivered", "cancelled"]

export function OrdersTable({ rows, status }: { rows: Awaited<ReturnType<typeof listOrders>>; status: string }) {
  const { t, locale } = useT()
  const router = useRouter()
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{t.manage.orders}</h1>
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <Link key={s} href={s ? `/manage/orders?status=${s}` : "/manage/orders"} className={cn("rounded-full border px-3 py-1 text-xs", status === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}>{s ? t.status[s] : t.manage.all}</Link>
        ))}
      </div>
      <div className="bg-card overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.manage.orderNo}</TableHead>
              <TableHead>{t.manage.customer}</TableHead>
              <TableHead>{t.manage.date}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">{t.manage.total}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((o) => (
              <TableRow key={o.id} className="cursor-pointer" onClick={() => router.push(`/manage/orders/${o.number}`)}>
                <TableCell className="font-mono">{o.number}</TableCell>
                <TableCell><p>{o.user.name}</p><p className="text-muted-foreground text-xs">{o.user.email}</p></TableCell>
                <TableCell className="text-muted-foreground text-sm">{o.createdAt.toLocaleString(intlTag[locale])}</TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{brl(o.totalCents, intlTag[locale])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
