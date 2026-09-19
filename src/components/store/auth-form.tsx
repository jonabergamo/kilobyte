"use client"
import Link from "next/link"
import { FormEvent, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, register } from "@/lib/actions"
import { useT } from "@/lib/i18n"

const DEMO_PW = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "kilobyte123"

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const { t } = useT()
  const [f, setF] = useState({ name: "", email: "", password: "" })
  const [busy, start] = useTransition()
  const go = (email: string, password: string) =>
    start(async () => {
      const r = mode === "login" || email.endsWith("@kilobyte.app") ? await login(email, password, next) : await register(f.name, email, password)
      if (r?.error) toast.error(r.error === "taken" ? t.auth.taken : t.auth.bad)
    })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    go(f.email, f.password)
  }
  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-bold">{mode === "login" ? t.auth.welcome : t.auth.register}</h1>
      </div>
      <form className="bg-card space-y-4 rounded-xl border p-6" onSubmit={submit}>
        {mode === "register" && (
          <div className="space-y-1">
            <Label htmlFor="name">{t.auth.name}</Label>
            <Input id="name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={120} />
          </div>
        )}
        <div className="space-y-1">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input id="email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">{t.auth.password}</Label>
          <Input id="password" type="password" required minLength={8} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        </div>
        <Button className="w-full" type="submit" disabled={busy}>{mode === "login" ? t.auth.signIn : t.auth.register}</Button>
        <p className="text-muted-foreground text-center text-sm">
          {mode === "login" ? t.auth.noAccount : t.auth.haveAccount}{" "}
          <Link href={mode === "login" ? "/register" : "/login"} className="text-foreground underline-offset-4 hover:underline">{mode === "login" ? t.auth.register : t.auth.signIn}</Link>
        </p>
      </form>
      <div className="bg-muted/40 space-y-3 rounded-xl border p-4 text-sm">
        <p className="text-muted-foreground">{t.auth.demoHint}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" disabled={busy} onClick={() => go("cliente@kilobyte.app", DEMO_PW)}>{t.auth.demoCustomer}</Button>
          <Button variant="outline" disabled={busy} onClick={() => go("gerente@kilobyte.app", DEMO_PW)}>{t.auth.demoManager}</Button>
        </div>
      </div>
    </div>
  )
}
