"use client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useState } from "react"
import { ChevronDown, Search, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { logout } from "@/lib/actions"
import type { CategoryNode } from "@/lib/catalog"
import { useT } from "@/lib/i18n"
import { LangToggle, ThemeToggle } from "./toggles"

type User = { name?: string | null; role: "customer" | "manager" } | null

export function HeaderClient({ tree, user }: { tree: CategoryNode[]; user: User }) {
  const { t } = useT()
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get("q") ?? "")
  const submit = (e: FormEvent) => {
    e.preventDefault()
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search")
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="hidden md:inline-flex" />}>
          {t.nav.categories} <ChevronDown className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {tree.map((c) => (
            <div key={c.id}>
              <DropdownMenuItem render={<Link href={`/c/${c.slug}`} />} className="font-medium">{c.name}</DropdownMenuItem>
              {c.children.map((k) => (
                <DropdownMenuItem key={k.id} render={<Link href={`/c/${k.slug}`} />} className="text-muted-foreground pl-6">{k.name}</DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <form onSubmit={submit} className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.nav.search} className="pl-9" aria-label={t.nav.search} />
      </form>
      <div className="hidden items-center sm:flex">
        <LangToggle />
        <ThemeToggle />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={t.nav.account} />}>
          <UserRound className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {user ? (
            <>
              <div className="text-muted-foreground truncate px-2 py-1.5 text-xs">{user.name}</div>
              <DropdownMenuItem render={<Link href="/account" />}>{t.account.orders}</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/account/wishlist" />}>{t.nav.wishlist}</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/account/settings" />}>{t.account.settings}</DropdownMenuItem>
              {user.role === "manager" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/manage" />} className="font-medium">{t.nav.manage}</DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>{t.nav.signOut}</DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem render={<Link href="/login" />}>{t.nav.signIn}</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/register" />}>{t.auth.register}</DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator className="sm:hidden" />
          <div className="flex sm:hidden"><LangToggle /><ThemeToggle /></div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
