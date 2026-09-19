import { and, asc, desc, eq, gte, ilike, inArray, isNull, lte, or, sql, type SQL } from "drizzle-orm"
import { db } from "@/db"
import { brands, categories, productImages, products, reviews, type Category } from "@/db/schema"

export type CategoryNode = Category & { children: Category[] }

export async function categoryTree(): Promise<CategoryNode[]> {
  const all = await db.select().from(categories).orderBy(asc(categories.position), asc(categories.name))
  return all.filter((c) => !c.parentId).map((c) => ({ ...c, children: all.filter((k) => k.parentId === c.id) }))
}

// a parent category includes its children when listing products
export async function categoryIds(slug: string) {
  const all = await db.select({ id: categories.id, slug: categories.slug, parentId: categories.parentId }).from(categories)
  const root = all.find((c) => c.slug === slug)
  if (!root) return null
  return [root.id, ...all.filter((c) => c.parentId === root.id).map((c) => c.id)]
}

export const productWith = { images: { orderBy: asc(productImages.position) }, brand: true, category: true } as const

export type Sort = "relevance" | "price_asc" | "price_desc" | "rating" | "newest"
export type SearchParams = { q?: string; category?: string; brand?: string; min?: number; max?: number; inStock?: boolean; sort?: Sort; page?: number; perPage?: number }

const effective = sql<number>`coalesce(least(${products.promoPriceCents}, ${products.priceCents}), ${products.priceCents})`

export async function searchProducts(p: SearchParams) {
  const where: SQL[] = [eq(products.active, true)]
  if (p.q) {
    const like = `%${p.q.trim()}%`
    where.push(or(ilike(products.name, like), ilike(products.description, like), sql`${products.specs}::text ilike ${like}`)!)
  }
  if (p.category) {
    const ids = await categoryIds(p.category)
    where.push(ids ? inArray(products.categoryId, ids) : sql`false`)
  }
  if (p.brand) where.push(eq(brands.slug, p.brand))
  if (p.min != null) where.push(gte(effective, p.min))
  if (p.max != null) where.push(lte(effective, p.max))
  if (p.inStock) where.push(sql`${products.stock} > 0`)

  const order =
    p.sort === "price_asc" ? [asc(effective)]
    : p.sort === "price_desc" ? [desc(effective)]
    : p.sort === "rating" ? [desc(products.ratingAvg), desc(products.ratingCount)]
    : p.sort === "newest" ? [desc(products.createdAt)]
    : [desc(sql`${products.stock} > 0`), desc(products.ratingCount), asc(products.name)]

  const perPage = p.perPage ?? 24
  const page = Math.max(1, p.page ?? 1)
  const base = db.select({ id: products.id }).from(products).leftJoin(brands, eq(products.brandId, brands.id)).where(and(...where))
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(base.as("m"))
  const ids = await base.orderBy(...order).limit(perPage).offset((page - 1) * perPage)
  const rows = ids.length ? await db.query.products.findMany({ where: inArray(products.id, ids.map((r) => r.id)), with: productWith }) : []
  const byId = new Map(rows.map((r) => [r.id, r]))
  return { items: ids.map((r) => byId.get(r.id)!), total: Number(count), page, perPage }
}

export const productBySlug = (slug: string) =>
  db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.active, true)),
    with: { ...productWith, reviews: { where: eq(reviews.hidden, false), orderBy: desc(reviews.createdAt), with: { user: { columns: { name: true } } } } },
  })

export const featured = () =>
  db.query.products.findMany({ where: and(eq(products.active, true), sql`${products.stock} > 0`), orderBy: [desc(products.ratingCount), desc(products.ratingAvg)], limit: 8, with: productWith })

export const onSale = () =>
  db.query.products.findMany({ where: and(eq(products.active, true), sql`${products.promoPriceCents} < ${products.priceCents}`), orderBy: desc(sql`${products.priceCents} - ${products.promoPriceCents}`), limit: 8, with: productWith })

export const related = (categoryId: number, exceptId: number) =>
  db.query.products.findMany({ where: and(eq(products.active, true), eq(products.categoryId, categoryId), sql`${products.id} <> ${exceptId}`), limit: 4, with: productWith })

export const allBrands = () => db.select().from(brands).orderBy(asc(brands.name))
export const topCategories = () => db.select().from(categories).where(isNull(categories.parentId)).orderBy(asc(categories.position))

export type ProductCard = Awaited<ReturnType<typeof featured>>[number]
