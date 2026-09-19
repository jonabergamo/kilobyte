import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { products } from "@/db/schema"
import { allBrands } from "@/lib/catalog"
import { categoryOptions } from "@/lib/manage"
import { ProductForm } from "@/components/manage/product-form"

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [cats, brs] = await Promise.all([categoryOptions(), allBrands()])
  if (id === "new") return <ProductForm product={null} categories={cats} brands={brs} />
  const p = await db.query.products.findFirst({ where: eq(products.id, Number(id)), with: { images: true } })
  if (!p) notFound()
  return <ProductForm product={p} categories={cats} brands={brs} />
}
