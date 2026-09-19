import { notFound } from "next/navigation"
import { requireManager } from "@/auth"
import { orderByNumber } from "@/lib/orders"
import { OrderManage } from "@/components/manage/order-manage"

export default async function ManageOrder({ params }: { params: Promise<{ number: string }> }) {
  await requireManager()
  const { number } = await params
  const o = await orderByNumber(number)
  if (!o) notFound()
  return <OrderManage order={o} />
}
