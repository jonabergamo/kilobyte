"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function AccountNav() {
  const { t } = useT()
  const p = usePathname()
  const items = [
    { href: "/account", label: t.account.orders },
    { href: "/account/wishlist", label: t.account.wishlist },
    { href: "/account/settings", label: t.account.settings },
  ]
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={cn("rounded-md px-3 py-2 text-sm whitespace-nowrap", p === i.href ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>{i.label}</Link>
      ))}
    </nav>
  )
}
