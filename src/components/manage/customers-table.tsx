"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { listCustomers } from "@/lib/manage"
import { brl } from "@/lib/pricing"
import { useT, intlTag } from "@/lib/i18n"

export function CustomersTable({ rows }: { rows: Awaited<ReturnType<typeof listCustomers>> }) {
  const { t, locale } = useT()
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{t.manage.customers}</h1>
      <div className="bg-card overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader><TableRow><TableHead>{t.manage.name}</TableHead><TableHead>{t.manage.joined}</TableHead><TableHead className="text-right">{t.manage.ordersCount}</TableHead><TableHead className="text-right">{t.manage.spent}</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell><p className="font-medium">{c.name} {c.role === "manager" && <Badge variant="outline" className="ml-1">{t.banner.manager}</Badge>}</p><p className="text-muted-foreground text-xs">{c.email}</p></TableCell>
                <TableCell className="text-muted-foreground text-sm">{c.createdAt.toLocaleDateString(intlTag[locale])}</TableCell>
                <TableCell className="text-right tabular-nums">{Number(c.orders)}</TableCell>
                <TableCell className="text-right tabular-nums">{brl(Number(c.spent), intlTag[locale])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
