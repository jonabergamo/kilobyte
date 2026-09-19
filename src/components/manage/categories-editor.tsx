"use client"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Category } from "@/db/schema"
import { deleteCategory, saveCategory } from "@/lib/manage"
import { useT } from "@/lib/i18n"

export function CategoriesEditor({ rows }: { rows: Category[] }) {
  const { t } = useT()
  const router = useRouter()
  const [busy, start] = useTransition()
  const [edit, setEdit] = useState<{ id: number | null; name: string; parentId: number | null; position: number } | null>(null)
  const tops = rows.filter((c) => !c.parentId).sort((a, b) => a.position - b.position)
  const save = () =>
    edit &&
    start(async () => {
      await saveCategory(edit.id, edit.name, edit.parentId, edit.position)
      toast.success(t.manage.saved)
      setEdit(null)
      router.refresh()
    })
  const remove = (id: number) =>
    confirm(t.common.confirmDelete) &&
    start(async () => {
      const r = await deleteCategory(id)
      if ("error" in r) toast.error(t.common.failed)
      else { toast.success(t.manage.deleted); router.refresh() }
    })
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{t.manage.categories}</h1>
        <Button onClick={() => setEdit({ id: null, name: "", parentId: null, position: tops.length })}><Plus className="size-4" /> {t.manage.newCategory}</Button>
      </div>
      {edit && (
        <form className="bg-card grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_200px_100px_auto]" onSubmit={(e) => { e.preventDefault(); save() }}>
          <div className="space-y-1"><Label>{t.manage.name}</Label><Input autoFocus value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
          <div className="space-y-1">
            <Label>{t.manage.parent}</Label>
            <select value={edit.parentId ?? ""} onChange={(e) => setEdit({ ...edit, parentId: e.target.value ? Number(e.target.value) : null })} className="bg-background h-9 w-full rounded-md border px-2 text-sm">
              <option value="">{t.manage.noParent}</option>
              {tops.filter((c) => c.id !== edit.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1"><Label>{t.manage.position}</Label><Input type="number" value={edit.position} onChange={(e) => setEdit({ ...edit, position: Number(e.target.value) })} /></div>
          <div className="flex items-end gap-2"><Button type="submit" disabled={busy || !edit.name.trim()}>{t.manage.save}</Button><Button type="button" variant="ghost" onClick={() => setEdit(null)}>{t.common.cancel}</Button></div>
        </form>
      )}
      <ul className="bg-card divide-y rounded-xl border">
        {tops.map((c) => (
          <li key={c.id} className="p-3">
            <Row c={c} onEdit={() => setEdit({ id: c.id, name: c.name, parentId: c.parentId, position: c.position })} onDelete={() => remove(c.id)} />
            <ul className="mt-1 ml-6 space-y-1">
              {rows.filter((k) => k.parentId === c.id).sort((a, b) => a.position - b.position).map((k) => (
                <li key={k.id}><Row c={k} onEdit={() => setEdit({ id: k.id, name: k.name, parentId: k.parentId, position: k.position })} onDelete={() => remove(k.id)} /></li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  )
}

function Row({ c, onEdit, onDelete }: { c: Category; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={c.parentId ? "text-muted-foreground" : "font-medium"}>{c.name}</span>
      <span className="text-muted-foreground font-mono text-xs">/{c.slug}</span>
      <span className="flex-1" />
      <Button size="icon" variant="ghost" className="size-7" onClick={onEdit}><Pencil className="size-3.5" /></Button>
      <Button size="icon" variant="ghost" className="size-7" onClick={onDelete}><Trash2 className="size-3.5" /></Button>
    </div>
  )
}
