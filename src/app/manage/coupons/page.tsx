import { listCoupons } from "@/lib/manage"
import { CouponsEditor } from "@/components/manage/coupons-editor"

export default async function Coupons() {
  return <CouponsEditor rows={await listCoupons()} stripeReady={!!process.env.STRIPE_SECRET_KEY} />
}
