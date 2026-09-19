"use client"
import { brl } from "@/lib/pricing"
import { useT, intlTag } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function Price({ cents, promo, className, big = false }: { cents: number; promo?: number | null; className?: string; big?: boolean }) {
  const { locale, t } = useT()
  const sale = promo != null && promo < cents
  const pct = sale ? Math.round((1 - promo / cents) * 100) : 0
  return (
    <span className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-semibold tabular-nums", big ? "text-3xl" : "text-lg")}>{brl(sale ? promo : cents, intlTag[locale])}</span>
      {sale && (
        <>
          <span className="text-muted-foreground text-sm line-through tabular-nums">{brl(cents, intlTag[locale])}</span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">{t.product.off(pct)}</span>
        </>
      )}
    </span>
  )
}
