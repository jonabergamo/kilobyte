"use client"
import { FormEvent, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changePassword, updateName } from "@/lib/actions"
import { useT } from "@/lib/i18n"
import { LangToggle, ThemeToggle } from "./toggles"

export function SettingsForms({ name: initial }: { name: string }) {
  const { t } = useT()
  const router = useRouter()
  const [name, setName] = useState(initial)
  const [pw, setPw] = useState({ current: "", next: "" })
  const [busy, start] = useTransition()
  const on = (fn: () => Promise<void>) => (e: FormEvent) => {
    e.preventDefault()
    start(fn)
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{t.account.settings}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <form className="bg-card space-y-3 rounded-xl border p-5" onSubmit={on(async () => { const r = await updateName(name); if ("ok" in r) { toast.success(t.account.saved); router.refresh() } else toast.error(t.common.failed) })}>
          <Label htmlFor="name">{t.account.nameLabel}</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          <Button type="submit" disabled={busy || !name.trim()}>{t.account.save}</Button>
        </form>
        <form className="bg-card space-y-3 rounded-xl border p-5" onSubmit={on(async () => { const r = await changePassword(pw.current, pw.next); if ("ok" in r) { toast.success(t.account.changed); setPw({ current: "", next: "" }) } else toast.error(r.error === "wrong" ? t.account.wrong : t.common.failed) })}>
          <Label htmlFor="cur">{t.account.current}</Label>
          <Input id="cur" type="password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <Label htmlFor="nxt">{t.account.next}</Label>
          <Input id="nxt" type="password" required minLength={8} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          <Button type="submit" disabled={busy || pw.next.length < 8}>{t.account.change}</Button>
        </form>
        <div className="bg-card flex items-center gap-2 rounded-xl border p-5 md:col-span-2"><LangToggle /><ThemeToggle /></div>
      </div>
    </div>
  )
}
