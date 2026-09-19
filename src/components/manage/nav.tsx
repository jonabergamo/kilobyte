"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, Boxes, LayoutDashboard, MessageSquare, Package, Tags, Ticket, Users, Warehouse } from "lucide-react"
import { Logo } from "@/components/logo"
import { LangToggle, ThemeToggle } from "@/components/store/toggles"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function ManageNav() {
  const { t } = useT()
  const p = usePathname()
  const items = [
    ["/manage", t.manage.dashboard, LayoutDashboard],
    ["/manage/products", t.manage.products, Package],
    ["/manage/categories", t.manage.categories, Boxes],
    ["/manage/brands", t.manage.brands, Tags],
    ["/manage/orders", t.manage.orders, Warehouse],
    ["/manage/coupons", t.manage.coupons, Ticket],
    ["/manage/reviews", t.manage.reviews, MessageSquare],
    ["/manage/customers", t.manage.customers, Users],
  ] as const
  return (
    <aside className="bg-card flex w-14 shrink-0 flex-col border-r md:w-56">
      <Link href="/manage" className="flex h-14 items-center gap-2 border-b px-3 font-semibold"><Logo size={24} /> <span className="hidden md:inline">{t.manage.title}</span></Link>
      <nav className="flex flex-col gap-0.5 p-2">
        {items.map(([href, label, Icon]) => (
          <Link key={href} href={href} title={label} className={cn("flex items-center gap-2 rounded-md px-2.5 py-2 text-sm", p === href || (href !== "/manage" && p.startsWith(href)) ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
            <Icon className="size-4 shrink-0" /> <span className="hidden md:inline">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1 border-t p-2">
        <div className="flex"><LangToggle /><ThemeToggle /></div>
        <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2 px-2.5 py-2 text-sm"><ArrowLeft className="size-4" /> <span className="hidden md:inline">{t.manage.backToStore}</span></Link>
      </div>
    </aside>
  )
}
