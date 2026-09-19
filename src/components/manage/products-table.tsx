"use client"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { listProducts } from "@/lib/manage"
import { brl } from "@/lib/pricing"
import { useT, intlTag } from "@/lib/i18n"

export function ProductsTable({ rows, q }: { rows: Awaited<ReturnType<typeof listProducts>>; q: string }) {
  const { t, locale } = useT()
  const router = useRouter()
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{t.manage.products} <span className="text-muted-foreground text-base font-normal">({rows.length})</span></h1>
        <div className="flex gap-2">
          <Input defaultValue={q} placeholder={t.manage.search} className="w-56" onKeyDown={(e) => e.key === "Enter" && router.push(`/manage/products?q=${encodeURIComponent(e.currentTarget.value)}`)} />
          <Button nativeButton={false} render={<Link href="/manage/products/new" />}><Plus className="size-4" /> {t.manage.newProduct}</Button>
        </div>
      </div>
      <div className="bg-card overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>{t.manage.name}</TableHead>
              <TableHead>{t.search.category}</TableHead>
              <TableHead className="text-right">{t.manage.price}</TableHead>
              <TableHead className="text-right">{t.manage.stock}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => router.push(`/manage/products/${p.id}`)}>
                <TableCell><div className="bg-muted relative size-9 overflow-hidden rounded">{p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="36px" className="object-cover" />}</div></TableCell>
                <TableCell>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-muted-foreground text-xs">{p.brand?.name} · {p.slug}</p>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{p.category.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {brl(p.promoPriceCents ?? p.priceCents, intlTag[locale])}
                  {p.promoPriceCents != null && <span className="text-muted-foreground block text-xs line-through">{brl(p.priceCents, intlTag[locale])}</span>}
                </TableCell>
                <TableCell className={`text-right font-mono ${p.stock === 0 ? "text-destructive" : p.stock <= 5 ? "text-amber-600" : ""}`}>{p.stock}</TableCell>
                <TableCell>{!p.active && <Badge variant="outline">{t.manage.inactive}</Badge>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
