"use client"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Brand } from "@/db/schema"
import type { CategoryNode, Sort } from "@/lib/catalog"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

function useSetParam() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  return (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(sp.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    next.delete("page")
    router.push(`${pathname}?${next.toString()}`)
  }
}

export function Filters({ tree, brands, params }: { tree: CategoryNode[]; brands: Brand[]; params: Record<string, string | undefined> }) {
  const { t } = useT()
  const set = useSetParam()
  const pathname = usePathname()
  const onCategoryPage = pathname.startsWith("/c/")
  const active = Object.keys(params).some((k) => ["brand", "min", "max", "inStock"].includes(k) && params[k])
  return (
    <aside className="space-y-6 text-sm lg:sticky lg:top-20 lg:self-start">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{t.search.filters}</h2>
        {active && <button type="button" className="text-muted-foreground text-xs underline-offset-4 hover:underline" onClick={() => set({ brand: undefined, min: undefined, max: undefined, inStock: undefined })}>{t.search.clear}</button>}
      </div>
      {!onCategoryPage && (
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">{t.search.category}</p>
          <ul className="space-y-1">
            {tree.map((c) => (
              <li key={c.id}>
                <Link href={`/c/${c.slug}`} className="font-medium hover:underline">{c.name}</Link>
                <ul className="ml-3 mt-0.5 space-y-0.5">
                  {c.children.map((k) => <li key={k.id}><Link href={`/c/${k.slug}`} className="text-muted-foreground hover:text-foreground">{k.name}</Link></li>)}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">{t.search.brand}</p>
        <div className="flex flex-wrap gap-1.5">
          {brands.map((b) => (
            <button key={b.id} type="button" onClick={() => set({ brand: params.brand === b.slug ? undefined : b.slug })} className={cn("rounded-full border px-2.5 py-0.5 text-xs", params.brand === b.slug ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}>{b.name}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">{t.search.price}</p>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            set({ min: String(f.get("min") || ""), max: String(f.get("max") || "") })
          }}
        >
          <Input name="min" type="number" min={0} placeholder={t.search.min} defaultValue={params.min ?? ""} className="h-8" />
          <Input name="max" type="number" min={0} placeholder={t.search.max} defaultValue={params.max ?? ""} className="h-8" />
          <Button size="sm" variant="outline" type="submit">OK</Button>
        </form>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={params.inStock === "1"} onChange={(e) => set({ inStock: e.target.checked ? "1" : undefined })} className="size-4" />
        <Label>{t.search.inStock}</Label>
      </label>
    </aside>
  )
}

export function SortSelect({ value }: { value: Sort }) {
  const { t } = useT()
  const set = useSetParam()
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{t.search.sort}</span>
      <select value={value} onChange={(e) => set({ sort: e.target.value })} className="bg-background h-9 rounded-md border px-2 text-sm">
        {Object.entries(t.search.sorts).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
      </select>
    </label>
  )
}

export function ResultsHeading({ heading, q, total }: { heading?: string; q?: string; total: number }) {
  const { t } = useT()
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{heading ?? t.search.title(q ?? "")}</h1>
      <p className="text-muted-foreground text-sm">{t.search.results(total)}</p>
    </div>
  )
}

export function Pager({ page, perPage, total }: { page: number; perPage: number; total: number }) {
  const pages = Math.ceil(total / perPage)
  const sp = useSearchParams()
  const pathname = usePathname()
  if (pages <= 1) return null
  const href = (p: number) => {
    const next = new URLSearchParams(sp.toString())
    next.set("page", String(p))
    return `${pathname}?${next}`
  }
  return (
    <nav className="flex justify-center gap-1 pt-4">
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Link key={p} href={href(p)} className={cn("flex size-9 items-center justify-center rounded-md border text-sm", p === page ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}>{p}</Link>
      ))}
    </nav>
  )
}
