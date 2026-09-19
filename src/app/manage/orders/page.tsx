import { listOrders } from "@/lib/manage"
import { OrdersTable } from "@/components/manage/orders-table"
import type { OrderStatus } from "@/db/schema"

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const rows = await listOrders(status as OrderStatus | undefined)
  return <OrdersTable rows={rows} status={status ?? ""} />
}
