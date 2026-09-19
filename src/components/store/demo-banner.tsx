"use client"
import { useSyncExternalStore } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { LINKS } from "./footer"

const listeners = new Set<() => void>()
const read = () => {
  try {
    return localStorage.getItem("kb.banner") === "off"
  } catch {
    return false
  }
}

export function DemoBanner() {
  const { t } = useT()
  const off = useSyncExternalStore((fn) => { listeners.add(fn); return () => listeners.delete(fn) }, read, () => true)
  if (off) return null
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 sm:px-6">
        <p className="min-w-60 flex-1"><span className="font-medium">{t.banner.title}</span> {t.banner.body}</p>
        <a href={LINKS.repo} target="_blank" rel="noreferrer" className="font-medium underline-offset-4 hover:underline">{t.banner.code}</a>
        <a href={LINKS.portfolio} target="_blank" rel="noreferrer" className="font-medium underline-offset-4 hover:underline">{t.banner.more}</a>
        <Button size="icon" variant="ghost" className="size-7" aria-label={t.banner.close} onClick={() => { try { localStorage.setItem("kb.banner", "off") } catch {} ; listeners.forEach((fn) => fn()) }}>
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
