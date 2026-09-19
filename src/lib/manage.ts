"use server"
import { and, asc, desc, eq, gte, ilike, isNull, or, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { brands, categories, coupons, orderItems, orders, productImages, products, reviews, users, type OrderStatus } from "@/db/schema"
import { requireManager } from "@/auth"
import { refreshRating } from "@/db/seed"
import { moveOrder } from "./orders"
import { NEXT } from "./status"
import { stripe } from "./stripe"

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

// ---- dashboard

export async function dashboard() {
  await requireManager()
  const since = new Date(Date.now() - 30 * 86_400_000)
  const paidStatuses = ["paid", "packing", "shipped", "delivered"] as const
  const [sums] = await db
    .select({ revenue: sql<number>`coalesce(sum(${orders.totalCents}), 0)`, count: sql<number>`count(*)` })
    .from(orders)
    .where(and(gte(orders.createdAt, since), sql`${orders.status} in ('paid','packing','shipped','delivered')`))
  const perDay = await db
    .select({ day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`, revenue: sql<number>`sum(${orders.totalCents})`, count: sql<number>`count(*)` })
    .from(orders)
    .where(and(gte(orders.createdAt, since), sql`${orders.status} in ('paid','packing','shipped','delivered')`))
    .groupBy(sql`1`)
    .orderBy(sql`1`)
  const byStatus = await db.select({ status: orders.status, count: sql<number>`count(*)` }).from(orders).groupBy(orders.status)
  const lowStock = await db.query.products.findMany({ where: and(eq(products.active, true), sql`${products.stock} <= 5`), orderBy: asc(products.stock), limit: 8 })
  const latestReviews = await db.query.reviews.findMany({ orderBy: desc(reviews.createdAt), limit: 5, with: { product: { columns: { name: true, slug: true } }, user: { columns: { name: true } } } })
  void paidStatuses
  return {
    revenue: Number(sums.revenue),
    count: Number(sums.count),
    perDay: perDay.map((d) => ({ ...d, revenue: Number(d.revenue), count: Number(d.count) })),
    byStatus: byStatus.map((s) => ({ status: s.status, count: Number(s.count) })),
    lowStock,
    latestReviews,
  }
}

// ---- products

export async function listProducts(q = "") {
  await requireManager()
  return db.query.products.findMany({
    where: q ? or(ilike(products.name, `%${q}%`), ilike(products.slug, `%${q}%`)) : undefined,
    orderBy: desc(products.createdAt),
    with: { images: { orderBy: asc(productImages.position) }, brand: true, category: true },
    limit: 200,
  })
}

export type ProductInput = {
  name: string
  slug?: string
  brandId: number | null
  categoryId: number
  description: string
  specs: Record<string, string>
  priceCents: number
  promoPriceCents: number | null
  stock: number
  active: boolean
  images: string[]
}

export async function saveProduct(id: number | null, input: ProductInput) {
  await requireManager()
  const slug = slugify(input.slug?.trim() || input.name)
  const { images, ...rest } = input
  const values = { ...rest, slug, priceCents: Math.max(0, Math.round(input.priceCents)), promoPriceCents: input.promoPriceCents != null ? Math.round(input.promoPriceCents) : null }
  let productId = id
  if (id) {
    await db.update(products).set(values).where(eq(products.id, id))
  } else {
    const [row] = await db.insert(products).values(values).returning()
    productId = row.id
  }
  await db.delete(productImages).where(eq(productImages.productId, productId!))
  if (images.length) await db.insert(productImages).values(images.filter((u) => u.trim()).map((url, i) => ({ productId: productId!, url: url.trim(), alt: input.name, position: i })))
  revalidatePath("/", "layout")
  return { id: productId!, slug }
}

export async function deleteProduct(id: number) {
  await requireManager()
  const sold = await db.query.orderItems.findFirst({ where: eq(orderItems.productId, id) })
  // a product with orders behind it is only switched off, so history stays whole
  if (sold) await db.update(products).set({ active: false }).where(eq(products.id, id))
  else await db.delete(products).where(eq(products.id, id))
  revalidatePath("/", "layout")
}

// ---- categories and brands

export async function saveCategory(id: number | null, name: string, parentId: number | null, position: number) {
  await requireManager()
  const values = { name: name.trim(), slug: slugify(name), parentId, position }
  if (id) await db.update(categories).set(values).where(eq(categories.id, id))
  else await db.insert(categories).values(values)
  revalidatePath("/", "layout")
}

export async function deleteCategory(id: number) {
  await requireManager()
  const used = await db.query.products.findFirst({ where: eq(products.categoryId, id) })
  const kids = await db.query.categories.findFirst({ where: eq(categories.parentId, id) })
  if (used || kids) return { error: "in_use" as const }
  await db.delete(categories).where(eq(categories.id, id))
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function saveBrand(id: number | null, name: string) {
  await requireManager()
  const values = { name: name.trim(), slug: slugify(name) }
  if (id) await db.update(brands).set(values).where(eq(brands.id, id))
  else await db.insert(brands).values(values)
  revalidatePath("/", "layout")
}

export async function deleteBrand(id: number) {
  await requireManager()
  await db.delete(brands).where(eq(brands.id, id))
  revalidatePath("/", "layout")
}

export async function categoryOptions() {
  return db.select().from(categories).orderBy(asc(categories.parentId), asc(categories.position))
}
export async function topLevel() {
  return db.select().from(categories).where(isNull(categories.parentId)).orderBy(asc(categories.position))
}

// ---- orders

export async function listOrders(status?: OrderStatus) {
  await requireManager()
  return db.query.orders.findMany({ where: status ? eq(orders.status, status) : undefined, orderBy: desc(orders.createdAt), with: { items: true, user: { columns: { name: true, email: true } } }, limit: 200 })
}

export async function advanceOrder(orderId: number, note = "") {
  await requireManager()
  const o = await db.query.orders.findFirst({ where: eq(orders.id, orderId) })
  const next = o && NEXT[o.status]
  if (!next) return { error: "final" as const }
  await moveOrder(orderId, next, note)
  revalidatePath("/", "layout")
  return { status: next }
}

export async function cancelOrder(orderId: number, note = "") {
  await requireManager()
  const o = await db.query.orders.findFirst({ where: eq(orders.id, orderId), with: { items: true } })
  if (!o || o.status === "delivered" || o.status === "cancelled") return { error: "final" as const }
  // paid stock goes back on the shelf
  if (o.status !== "pending") {
    for (const i of o.items) if (i.productId) await db.update(products).set({ stock: sql`${products.stock} + ${i.qty}` }).where(eq(products.id, i.productId))
  }
  await moveOrder(orderId, "cancelled", note)
  revalidatePath("/", "layout")
  return { ok: true }
}

// ---- coupons, mirrored to stripe when a key exists so the hosted checkout applies them too

export async function listCoupons() {
  await requireManager()
  return db.select().from(coupons).orderBy(desc(coupons.id))
}

export async function saveCoupon(input: { code: string; kind: "percent" | "amount"; value: number; minSubtotalCents: number; expiresAt: string | null; active: boolean }) {
  await requireManager()
  const code = input.code.trim().toUpperCase()
  let stripeCouponId: string | null = null
  if (stripe) {
    const c = await stripe.coupons.create(
      input.kind === "percent" ? { percent_off: input.value, duration: "forever", name: code } : { amount_off: input.value, currency: "brl", duration: "forever", name: code },
    )
    stripeCouponId = c.id
  }
  await db
    .insert(coupons)
    .values({ code, kind: input.kind, value: input.value, minSubtotalCents: input.minSubtotalCents, expiresAt: input.expiresAt ? new Date(input.expiresAt) : null, active: input.active, stripeCouponId })
    .onConflictDoUpdate({ target: coupons.code, set: { kind: input.kind, value: input.value, minSubtotalCents: input.minSubtotalCents, expiresAt: input.expiresAt ? new Date(input.expiresAt) : null, active: input.active, stripeCouponId } })
  revalidatePath("/manage/coupons")
}

export async function toggleCoupon(id: number, active: boolean) {
  await requireManager()
  await db.update(coupons).set({ active }).where(eq(coupons.id, id))
  revalidatePath("/manage/coupons")
}

// ---- reviews and customers

export async function listReviews() {
  await requireManager()
  return db.query.reviews.findMany({ orderBy: desc(reviews.createdAt), with: { product: { columns: { name: true, slug: true } }, user: { columns: { name: true, email: true } } }, limit: 200 })
}

export async function setReviewHidden(id: number, hidden: boolean) {
  await requireManager()
  const [r] = await db.update(reviews).set({ hidden }).where(eq(reviews.id, id)).returning()
  await refreshRating(r.productId)
  revalidatePath("/", "layout")
}

export async function listCustomers() {
  await requireManager()
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      orders: sql<number>`count(${orders.id})`,
      spent: sql<number>`coalesce(sum(case when ${orders.status} in ('paid','packing','shipped','delivered') then ${orders.totalCents} else 0 end), 0)`,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt))
    .limit(200)
}
