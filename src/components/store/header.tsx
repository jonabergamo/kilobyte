import Link from "next/link"
import { auth } from "@/auth"
import { getCart } from "@/lib/cart"
import { categoryTree } from "@/lib/catalog"
import { Logo } from "@/components/logo"
import { CartSheet } from "./cart-sheet"
import { HeaderClient } from "./header-client"

export async function Header() {
  const [session, cart, tree] = await Promise.all([auth(), getCart(), categoryTree()])
  return (
    <header className="bg-brand text-brand-foreground sticky top-0 z-30 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Logo size={30} /> <span className="hidden sm:inline">Kilobyte</span>
        </Link>
        <HeaderClient tree={tree} user={session?.user ?? null} />
        <CartSheet cart={cart} />
      </div>
    </header>
  )
}
