"use client"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Brand } from "@/db/schema"
import { deleteBrand, saveBrand } from "@/lib/manage"
import { useT } from "@/lib/i18n"

export function BrandsEditor({ rows }: { rows: Brand[] }) {
  const { t } = useT()
  const router = useRouter()
  const [name, setName] = useState("")
  const [busy, start] = useTransition()
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{t.manage.brands}</h1>
      <form className="flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); start(async () => { await saveBrand(null, name); setName(""); toast.success(t.manage.saved); router.refresh() }) }}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.manage.newBrand} />
        <Button type="submit" disabled={busy || !name.trim()}><Plus className="size-4" /> {t.manage.save}</Button>
      </form>
      <ul className="bg-card grid divide-y rounded-xl border sm:grid-cols-2 sm:divide-y-0">
        {rows.map((b) => (
          <li key={b.id} className="flex items-center justify-between px-4 py-2 text-sm">
            <span>{b.name} <span className="text-muted-foreground font-mono text-xs">/{b.slug}</span></span>
            <Button size="icon" variant="ghost" className="size-7" onClick={() => confirm(t.common.confirmDelete) && start(async () => { await deleteBrand(b.id); router.refresh() })}><Trash2 className="size-3.5" /></Button>
          </li>
        ))}
      </ul>
    </>
  )
}
