import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { SearchResults } from "@/components/store/search-results"

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params
  const cat = await db.query.categories.findFirst({ where: eq(categories.slug, slug) })
  if (!cat) notFound()
  return <SearchResults params={{ ...(await searchParams), category: slug }} heading={cat.name} />
}
