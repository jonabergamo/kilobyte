"use client"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"

// stripe redirects here before its webhook may have reached us. poll until the order is paid
export function SuccessPoll({ sessionId }: { sessionId: string }) {
  const { t } = useT()
  const q = useQuery({
    queryKey: ["order-status", sessionId],
    queryFn: async () => {
      const r = await fetch(`/api/orders?session_id=${encodeURIComponent(sessionId)}`)
      if (!r.ok) throw new Error("not yet")
      return (await r.json()) as { number: string; status: string }
    },
    refetchInterval: (query) => (query.state.data?.status === "paid" ? false : 1500),
    retry: 20,
    retryDelay: 1500,
  })
  const paid = q.data?.status === "paid"
  const router = useRouter()
  // the header was rendered before the payment settled, so the cart badge needs a refresh
  useEffect(() => {
    if (paid) router.refresh()
  }, [paid, router])
  return (
    <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
      {paid ? <CheckCircle2 className="mx-auto size-14 text-emerald-500" /> : <Loader2 className="text-muted-foreground mx-auto size-12 animate-spin" />}
      <h1 className="text-2xl font-semibold tracking-tight">{t.checkout.successTitle}</h1>
      <p className="text-muted-foreground">{paid ? t.checkout.paid : t.checkout.waiting}</p>
      {q.data && (
        <p className="font-mono text-sm">{t.checkout.orderNumber} {q.data.number}</p>
      )}
      <div className="flex justify-center gap-2">
        {q.data && <Button nativeButton={false} render={<Link href={`/account/orders/${q.data.number}`} />}>{t.checkout.viewOrder}</Button>}
        <Button variant="outline" nativeButton={false} render={<Link href="/search" />}>{t.cart.keepShopping}</Button>
      </div>
    </div>
  )
}
