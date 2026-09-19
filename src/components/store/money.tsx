"use client"
import { brl } from "@/lib/pricing"
import { useT, intlTag } from "@/lib/i18n"

export function Money({ cents, className }: { cents: number; className?: string }) {
  const { locale } = useT()
  return <span className={`tabular-nums ${className ?? ""}`}>{brl(cents, intlTag[locale])}</span>
}
