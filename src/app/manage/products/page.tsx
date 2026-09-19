import { listProducts } from "@/lib/manage"
import { ProductsTable } from "@/components/manage/products-table"

export default async function Products({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const rows = await listProducts(q ?? "")
  return <ProductsTable rows={rows} q={q ?? ""} />
}
