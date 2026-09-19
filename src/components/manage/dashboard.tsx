"use client"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/store/order-bits"
import { Stars } from "@/components/store/stars"
import type { dashboard } from "@/lib/manage"
import { brl } from "@/lib/pricing"
import { useT, intlTag } from "@/lib/i18n"
import type { OrderStatus } from "@/db/schema"

export function Dashboard({ data }: { data: Awaited<ReturnType<typeof dashboard>> }) {
  const { t, locale } = useT()
  const money = (c: number) => brl(c, intlTag[locale])
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{t.manage.dashboard}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat title={t.manage.revenue30} value={money(data.revenue)} />
        <Stat title={t.manage.orders30} value={String(data.count)} />
        <Stat title={t.manage.avgTicket} value={data.count ? money(Math.round(data.revenue / data.count)) : "–"} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{t.manage.perDay}</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.perDay} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 100)}`} width={48} />
                <Tooltip formatter={(v) => money(Number(v))} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{t.manage.byStatus}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.byStatus.map((s) => (
              <Link key={s.status} href={`/manage/orders?status=${s.status}`} className="flex items-center justify-between">
                <StatusBadge status={s.status as OrderStatus} />
                <span className="font-semibold tabular-nums">{s.count}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{t.manage.lowStock}</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {data.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <Link href={`/manage/products/${p.id}`} className="truncate hover:underline">{p.name}</Link>
                  <span className={`font-mono ${p.stock === 0 ? "text-destructive" : "text-amber-600"}`}>{p.stock}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{t.manage.latestReviews}</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {data.latestReviews.map((r) => (
                <li key={r.id} className="space-y-0.5 py-2">
                  <div className="flex items-center justify-between"><Stars ratingX100={r.rating * 100} /><span className="text-muted-foreground text-xs">{r.user.name}</span></div>
                  <p className="font-medium">{r.title}</p>
                  <Link href={`/p/${r.product.slug}`} className="text-muted-foreground text-xs hover:underline">{r.product.name}</Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-1"><CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle></CardHeader>
      <CardContent><span className="text-3xl font-semibold tabular-nums">{value}</span></CardContent>
    </Card>
  )
}
