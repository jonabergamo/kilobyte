"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Stars } from "@/components/store/stars"
import type { listReviews } from "@/lib/manage"
import { setReviewHidden } from "@/lib/manage"
import { useT } from "@/lib/i18n"

export function ReviewsTable({ rows }: { rows: Awaited<ReturnType<typeof listReviews>> }) {
  const { t } = useT()
  const router = useRouter()
  const [busy, start] = useTransition()
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{t.manage.reviews}</h1>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className={`bg-card rounded-xl border p-4 text-sm ${r.hidden ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-center gap-2">
              <Stars ratingX100={r.rating * 100} />
              <span className="font-medium">{r.title}</span>
              {r.hidden && <Badge variant="outline">{t.manage.hidden}</Badge>}
              <span className="flex-1" />
              <Button size="sm" variant="outline" disabled={busy} onClick={() => start(async () => { await setReviewHidden(r.id, !r.hidden); router.refresh() })}>{r.hidden ? t.manage.unhide : t.manage.hide}</Button>
            </div>
            {r.body && <p className="text-muted-foreground mt-1">{r.body}</p>}
            <p className="text-muted-foreground mt-2 text-xs">{t.manage.product} <Link href={`/p/${r.product.slug}`} className="hover:underline">{r.product.name}</Link> · {t.manage.by} {r.user.name} ({r.user.email}) · {r.createdAt.toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </>
  )
}
