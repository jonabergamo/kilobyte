"use client"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Coupon } from "@/db/schema"
import { saveCoupon, toggleCoupon } from "@/lib/manage"
import { brl } from "@/lib/pricing"
import { useT, intlTag } from "@/lib/i18n"

export function CouponsEditor({ rows, stripeReady }: { rows: Coupon[]; stripeReady: boolean }) {
  const { t, locale } = useT()
  const router = useRouter()
  const [busy, start] = useTransition()
  const [f, setF] = useState({ code: "", kind: "percent" as "percent" | "amount", value: "10", min: "0", expires: "" })
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{t.manage.coupons}</h1>
      <form
        className="bg-card grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_120px_120px_140px_160px_auto]"
        onSubmit={(e) => {
          e.preventDefault()
          start(async () => {
            const value = f.kind === "percent" ? Number(f.value) : Math.round(Number(f.value) * 100)
            await saveCoupon({ code: f.code, kind: f.kind, value, minSubtotalCents: Math.round(Number(f.min) * 100), expiresAt: f.expires || null, active: true })
            toast.success(t.manage.saved)
            setF({ code: "", kind: "percent", value: "10", min: "0", expires: "" })
            router.refresh()
          })
        }}
      >
        <div className="space-y-1"><Label>{t.manage.code}</Label><Input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} className="font-mono uppercase" maxLength={30} /></div>
        <div className="space-y-1"><Label>{t.manage.kind}</Label>
          <select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as "percent" | "amount" })} className="bg-background h-9 w-full rounded-md border px-2 text-sm"><option value="percent">{t.manage.percent}</option><option value="amount">{t.manage.amount}</option></select>
        </div>
        <div className="space-y-1"><Label>{t.manage.couponValue}</Label><Input type="number" min={1} step={f.kind === "percent" ? 1 : 0.01} value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} /></div>
        <div className="space-y-1"><Label>{t.manage.minSubtotal}</Label><Input type="number" min={0} step={0.01} value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} /></div>
        <div className="space-y-1"><Label>{t.manage.expires}</Label><Input type="date" value={f.expires} onChange={(e) => setF({ ...f, expires: e.target.value })} /></div>
        <div className="flex items-end"><Button type="submit" disabled={busy || !f.code.trim() || !f.value}>{t.manage.newCoupon}</Button></div>
      </form>
      <div className="bg-card overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader><TableRow><TableHead>{t.manage.code}</TableHead><TableHead>{t.manage.couponValue}</TableHead><TableHead>{t.manage.minSubtotal}</TableHead><TableHead>{t.manage.expires}</TableHead><TableHead>{t.manage.uses}</TableHead><TableHead>{t.manage.stripe}</TableHead><TableHead>{t.manage.active}</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono">{c.code}</TableCell>
                <TableCell>{c.kind === "percent" ? `${c.value}%` : brl(c.value, intlTag[locale])}</TableCell>
                <TableCell>{brl(c.minSubtotalCents, intlTag[locale])}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{c.expiresAt ? c.expiresAt.toLocaleDateString(intlTag[locale]) : "–"}</TableCell>
                <TableCell className="tabular-nums">{c.uses}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{c.stripeCouponId ?? (stripeReady ? "–" : t.manage.noStripe)}</TableCell>
                <TableCell><input type="checkbox" className="size-4" checked={c.active} disabled={busy} onChange={(e) => start(async () => { await toggleCoupon(c.id, e.target.checked); router.refresh() })} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
