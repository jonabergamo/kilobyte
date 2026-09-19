import { relations } from "drizzle-orm"
import { boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, serial, smallint, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"

// every amount is integer cents in BRL. no floats touch money

export const roleEnum = pgEnum("role", ["customer", "manager"])
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "packing", "shipped", "delivered", "cancelled"])
export const couponKindEnum = pgEnum("coupon_kind", ["percent", "amount"])

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("customer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    parentId: integer("parent_id"),
    position: smallint("position").notNull().default(0),
  },
  (t) => [index("categories_parent_idx").on(t.parentId)],
)

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
})

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    name: varchar("name", { length: 200 }).notNull(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "set null" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    description: text("description").notNull().default(""),
    specs: jsonb("specs").$type<Record<string, string>>().notNull().default({}),
    priceCents: integer("price_cents").notNull(),
    promoPriceCents: integer("promo_price_cents"),
    stock: integer("stock").notNull().default(0),
    ratingAvg: integer("rating_avg_x100").notNull().default(0), // 0..500, avoids a float column
    ratingCount: integer("rating_count").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("products_category_idx").on(t.categoryId), index("products_brand_idx").on(t.brandId)],
)

export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 200 }).notNull().default(""),
  position: smallint("position").notNull().default(0),
})

// a cart belongs to a user, or to a browser through the token cookie until they log in
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).unique(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const cartItems = pgTable(
  "cart_items",
  {
    cartId: integer("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    qty: smallint("qty").notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.cartId, t.productId] })],
)

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 30 }).notNull().unique(),
  kind: couponKindEnum("kind").notNull(),
  value: integer("value").notNull(), // percent 1..100, or cents
  minSubtotalCents: integer("min_subtotal_cents").notNull().default(0),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  stripeCouponId: varchar("stripe_coupon_id", { length: 60 }),
  uses: integer("uses").notNull().default(0),
})

export type Address = { name: string; line1: string; line2?: string; city: string; state: string; zip: string }

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    number: varchar("number", { length: 20 }).notNull().unique(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull().default("pending"),
    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").notNull().default(0),
    shippingCents: integer("shipping_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    couponId: integer("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
    stripeSessionId: varchar("stripe_session_id", { length: 120 }),
    stripePaymentIntent: varchar("stripe_payment_intent", { length: 120 }),
    address: jsonb("address").$type<Address>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (t) => [index("orders_user_idx").on(t.userId), uniqueIndex("orders_session_idx").on(t.stripeSessionId)],
)

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  name: varchar("name", { length: 200 }).notNull(), // snapshot, products get renamed
  imageUrl: text("image_url"),
  unitCents: integer("unit_cents").notNull(),
  qty: smallint("qty").notNull(),
})

export const orderEvents = pgTable("order_events", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  note: varchar("note", { length: 300 }).notNull().default(""),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
})

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderId: integer("order_id").references(() => orders.id, { onDelete: "set null" }),
    rating: smallint("rating").notNull(),
    title: varchar("title", { length: 120 }).notNull(),
    body: text("body").notNull().default(""),
    hidden: boolean("hidden").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("reviews_once_idx").on(t.productId, t.userId)],
)

export const wishlist = pgTable(
  "wishlist",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
)

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  reviews: many(reviews),
}))
export const productImagesRelations = relations(productImages, ({ one }) => ({ product: one(products, { fields: [productImages.productId], references: [products.id] }) }))
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: "tree" }),
  children: many(categories, { relationName: "tree" }),
  products: many(products),
}))
export const cartsRelations = relations(carts, ({ many }) => ({ items: many(cartItems) }))
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}))
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  coupon: one(coupons, { fields: [orders.couponId], references: [coupons.id] }),
  items: many(orderItems),
  events: many(orderEvents),
}))
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}))
export const orderEventsRelations = relations(orderEvents, ({ one }) => ({ order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }) }))
export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}))
export const wishlistRelations = relations(wishlist, ({ one }) => ({ product: one(products, { fields: [wishlist.productId], references: [products.id] }) }))

export type Product = typeof products.$inferSelect
export type ProductImage = typeof productImages.$inferSelect
export type Category = typeof categories.$inferSelect
export type Brand = typeof brands.$inferSelect
export type Coupon = typeof coupons.$inferSelect
export type Order = typeof orders.$inferSelect
export type OrderItem = typeof orderItems.$inferSelect
export type OrderEvent = typeof orderEvents.$inferSelect
export type Review = typeof reviews.$inferSelect
export type User = typeof users.$inferSelect
export type OrderStatus = Order["status"]
