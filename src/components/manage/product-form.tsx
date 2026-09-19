"use client"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Brand, Category, Product, ProductImage } from "@/db/schema"
import { deleteProduct, saveProduct, type ProductInput } from "@/lib/manage"
import { useT } from "@/lib/i18n"

type Full = Product & { images: ProductImage[] }

export function ProductForm({ product, categories, brands }: { product: Full | null; categories: Category[]; brands: Brand[] }) {
  const { t } = useT()
  const router = useRouter()
  const [busy, start] = useTransition()
  const [f, setF] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    brandId: product?.brandId ?? null,
    categoryId: product?.categoryId ?? categories.find((c) => c.parentId)?.id ?? categories[0]?.id ?? 0,
    description: product?.description ?? "",
    price: product ? (product.priceCents / 100).toFixed(2) : "",
    promo: product?.promoPriceCents != null ? (product.promoPriceCents / 100).toFixed(2) : "",
    stock: product?.stock ?? 0,
    active: product?.active ?? true,
    images: product?.images.map((i) => i.url) ?? [""],
    specs: Object.entries(product?.specs ?? {}).length ? Object.entries(product!.specs) : [["", ""]],
  })
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF({ ...f, [k]: v })

  const submit = () =>
    start(async () => {
      const input: ProductInput = {
        name: f.name,
        slug: f.slug,
        brandId: f.brandId,
        categoryId: f.categoryId,
        description: f.description,
        specs: Object.fromEntries(f.specs.filter(([k, v]) => k.trim() && v.trim())),
        priceCents: Math.round(Number(f.price) * 100),
        promoPriceCents: f.promo.trim() ? Math.round(Number(f.promo) * 100) : null,
        stock: Number(f.stock),
        active: f.active,
        images: f.images.filter((u) => u.trim()),
      }
      try {
        const r = await saveProduct(product?.id ?? null, input)
        toast.success(t.manage.saved)
        if (!product) router.replace(`/manage/products/${r.id}`)
        else router.refresh()
      } catch {
        toast.error(t.common.failed)
      }
    })

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/manage/products" className="text-muted-foreground inline-flex items-center gap-1 text-sm hover:underline"><ArrowLeft className="size-3.5" /> {t.manage.products}</Link>
          <h1 className="text-2xl font-semibold tracking-tight">{product ? t.manage.editProduct : t.manage.newProduct}</h1>
        </div>
        <div className="flex gap-2">
          {product && (
            <Button variant="ghost" className="text-destructive" disabled={busy} onClick={() => confirm(t.common.confirmDelete) && start(async () => { await deleteProduct(product.id); toast.success(t.manage.deleted); router.replace("/manage/products") })}>
              <Trash2 className="size-4" /> {t.manage.delete}
            </Button>
          )}
          <Button disabled={busy || !f.name.trim() || !f.price} onClick={submit}>{t.manage.save}</Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="bg-card space-y-3 rounded-xl border p-5">
            <Field label={t.manage.name}><Input value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={200} /></Field>
            <Field label={t.manage.slug}><Input value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" className="font-mono" /></Field>
            <Field label={t.manage.description}><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={4} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.search.category}>
                <select value={f.categoryId} onChange={(e) => set("categoryId", Number(e.target.value))} className="bg-background h-9 w-full rounded-md border px-2 text-sm">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.parentId ? "  " : ""}{c.name}</option>)}
                </select>
              </Field>
              <Field label={t.search.brand}>
                <select value={f.brandId ?? ""} onChange={(e) => set("brandId", e.target.value ? Number(e.target.value) : null)} className="bg-background h-9 w-full rounded-md border px-2 text-sm">
                  <option value="">–</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
            </div>
          </section>
          <section className="bg-card space-y-3 rounded-xl border p-5">
            <div className="flex items-center justify-between"><Label>{t.manage.specs}</Label><Button size="sm" variant="outline" type="button" onClick={() => set("specs", [...f.specs, ["", ""]])}><Plus className="size-3.5" /> {t.manage.addSpec}</Button></div>
            {f.specs.map(([k, v], i) => (
              <div key={i} className="flex gap-2">
                <Input value={k} placeholder={t.manage.key} onChange={(e) => set("specs", f.specs.map((s, j) => (j === i ? [e.target.value, s[1]] : s)))} className="w-1/3" />
                <Input value={v} placeholder={t.manage.value} onChange={(e) => set("specs", f.specs.map((s, j) => (j === i ? [s[0], e.target.value] : s)))} />
                <Button size="icon" variant="ghost" type="button" onClick={() => set("specs", f.specs.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
              </div>
            ))}
          </section>
        </div>
        <div className="space-y-4">
          <section className="bg-card space-y-3 rounded-xl border p-5">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.manage.price}><Input type="number" step="0.01" min={0} value={f.price} onChange={(e) => set("price", e.target.value)} /></Field>
              <Field label={t.manage.promo}><Input type="number" step="0.01" min={0} value={f.promo} onChange={(e) => set("promo", e.target.value)} /></Field>
              <Field label={t.manage.stock}><Input type="number" min={0} value={f.stock} onChange={(e) => set("stock", Number(e.target.value))} /></Field>
              <Field label={t.manage.active}>
                <label className="flex h-9 items-center gap-2 text-sm"><input type="checkbox" className="size-4" checked={f.active} onChange={(e) => set("active", e.target.checked)} /> {f.active ? t.common.yes : t.common.no}</label>
              </Field>
            </div>
          </section>
          <section className="bg-card space-y-3 rounded-xl border p-5">
            <div className="flex items-center justify-between"><Label>{t.manage.images}</Label><Button size="sm" variant="outline" type="button" onClick={() => set("images", [...f.images, ""])}><Plus className="size-3.5" /> {t.manage.addImage}</Button></div>
            {f.images.map((u, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="bg-muted relative size-10 shrink-0 overflow-hidden rounded">{u.trim() && <Image src={u} alt="" fill sizes="40px" className="object-cover" unoptimized />}</div>
                <Input value={u} placeholder="https://" onChange={(e) => set("images", f.images.map((x, j) => (j === i ? e.target.value : x)))} className="font-mono text-xs" />
                <Button size="icon" variant="ghost" type="button" onClick={() => set("images", f.images.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
