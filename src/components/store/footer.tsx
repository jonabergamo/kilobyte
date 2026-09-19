"use client"
import Link from "next/link"
import { Code2 } from "lucide-react"
import { useT } from "@/lib/i18n"
import { Logo } from "@/components/logo"

export const LINKS = { portfolio: "https://jonathanbergamo.vercel.app", repo: "https://github.com/jonabergamo/kilobyte" }

export function Footer() {
  const { t } = useT()
  return (
    <footer className="bg-brand text-brand-foreground/75 mt-16">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm sm:grid-cols-3 sm:px-6">
        <div className="space-y-2">
          <Link href="/" className="text-brand-foreground flex items-center gap-2 font-semibold"><Logo size={24} /> Kilobyte</Link>
          <p>{t.footer.help}</p>
        </div>
        <div className="space-y-1">
          <p className="text-brand-foreground font-medium">{t.credit.by}</p>
          <p>{t.credit.body}</p>
        </div>
        <div className="flex flex-col gap-1 sm:items-end">
          <a href={LINKS.portfolio} target="_blank" rel="noreferrer" className="hover:text-brand-foreground">{t.credit.portfolio}</a>
          <a href={LINKS.repo} target="_blank" rel="noreferrer" className="hover:text-brand-foreground flex items-center gap-1"><Code2 className="size-3.5" /> {t.credit.code}</a>
        </div>
      </div>
    </footer>
  )
}
