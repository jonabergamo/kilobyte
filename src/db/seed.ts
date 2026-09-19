import "dotenv/config"
import bcrypt from "bcryptjs"
import { eq, inArray, sql } from "drizzle-orm"
import { db } from "./index"
import { brands, carts, categories, coupons, orderEvents, orderItems, orders, productImages, products, reviews, users, wishlist } from "./schema"
import { quote } from "@/lib/pricing"

// the demo store. runs on an empty database and again on a full one, where it only
// puts back what the demo owns and leaves accounts real people created alone

const DEMO = "@kilobyte.app"
export const DEMO_CUSTOMER = `cliente${DEMO}`
export const DEMO_MANAGER = `gerente${DEMO}`

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`

const CATS: [string, string[]][] = [
  ["Computers", ["Laptops", "Desktops"]],
  ["Components", ["Graphics cards", "Processors", "Memory", "Storage"]],
  ["Peripherals", ["Keyboards", "Mice", "Monitors", "Headsets"]],
  ["Audio", ["Speakers", "Earbuds"]],
  ["Networking", ["Routers", "Adapters"]],
]

const BRANDS = ["Lenovo", "Dell", "ASUS", "Logitech", "Kingston", "Samsung", "NVIDIA", "AMD", "Sony", "TP-Link", "Corsair", "JBL"]

// [category, brand, name, price, promo, stock, image id, specs]
type P = [string, string, string, number, number | null, number, string, Record<string, string>]
const PRODUCTS: P[] = [
  ["Laptops", "Lenovo", "IdeaPad Slim 5 14 Ryzen 7 16GB 512GB", 449900, 399900, 12, "1496181133206-80ce9b88a853", { CPU: "AMD Ryzen 7 7730U", RAM: "16 GB LPDDR4x", Storage: "512 GB NVMe", Display: '14" 1920x1200 IPS', Weight: "1.46 kg" }],
  ["Laptops", "Dell", "Inspiron 15 3520 i5 8GB 256GB", 329900, null, 8, "1588872657578-7efd1f1555ed", { CPU: "Intel Core i5 1235U", RAM: "8 GB DDR4", Storage: "256 GB NVMe", Display: '15.6" FHD 120 Hz' }],
  ["Laptops", "ASUS", "Vivobook 16 i7 16GB 1TB", 569900, 519900, 5, "1593642632823-8f785ba67e45", { CPU: "Intel Core i7 1355U", RAM: "16 GB DDR4", Storage: "1 TB NVMe", Display: '16" WUXGA' }],
  ["Laptops", "ASUS", "ROG Zephyrus G14 RTX 4060", 1199900, null, 3, "1603302576837-37561b2e2302", { CPU: "AMD Ryzen 9 8945HS", GPU: "RTX 4060 8 GB", RAM: "16 GB DDR5", Display: '14" OLED 120 Hz' }],
  ["Laptops", "Lenovo", "ThinkPad E14 Gen 5 i5 16GB", 599900, 549900, 6, "1541807084-5c52b6b3adef", { CPU: "Intel Core i5 1335U", RAM: "16 GB DDR4", Storage: "512 GB NVMe", Keyboard: "Backlit, spill resistant" }],
  ["Laptops", "Samsung", "Galaxy Book4 i5 8GB 512GB", 429900, null, 0, "1517336714731-489689fd1ca8", { CPU: "Intel Core i5 1335U", RAM: "8 GB", Storage: "512 GB", Display: '15.6" FHD' }],
  ["Desktops", "Dell", "OptiPlex 7010 SFF i5 16GB 512GB", 519900, null, 4, "1547082299-de196ea013d6", { CPU: "Intel Core i5 13500", RAM: "16 GB DDR5", Storage: "512 GB NVMe", Form: "Small form factor" }],
  ["Desktops", "Lenovo", "IdeaCentre Gaming 5 RTX 4060 Ti", 799900, 749900, 3, "1587202372775-e229f172b9d7", { CPU: "Intel Core i7 13700F", GPU: "RTX 4060 Ti 8 GB", RAM: "16 GB DDR5", Storage: "1 TB NVMe" }],
  ["Desktops", "ASUS", "ExpertCenter D5 Mini Tower i3", 289900, null, 7, "1591488320449-011701bb6704", { CPU: "Intel Core i3 13100", RAM: "8 GB", Storage: "256 GB NVMe" }],
  ["Graphics cards", "NVIDIA", "GeForce RTX 4070 SUPER 12GB", 479900, 459900, 6, "1591405351990-4726e331f141", { Memory: "12 GB GDDR6X", Boost: "2.48 GHz", Power: "220 W", Ports: "3x DP 1.4a, 1x HDMI 2.1" }],
  ["Graphics cards", "AMD", "Radeon RX 7800 XT 16GB", 389900, null, 9, "1587831990711-23ca6441447b", { Memory: "16 GB GDDR6", Boost: "2.43 GHz", Power: "263 W" }],
  ["Graphics cards", "NVIDIA", "GeForce RTX 4060 8GB", 229900, 219900, 14, "1555618254-5ac4a5a2b6f4", { Memory: "8 GB GDDR6", Boost: "2.46 GHz", Power: "115 W" }],
  ["Graphics cards", "AMD", "Radeon RX 7600 8GB", 189900, null, 11, "1624705002806-5d72df19c3ad", { Memory: "8 GB GDDR6", Boost: "2.66 GHz", Power: "165 W" }],
  ["Processors", "AMD", "Ryzen 7 7800X3D", 279900, 259900, 10, "1555617981-dac3880eac6e", { Cores: "8 / 16 threads", Boost: "5.0 GHz", Cache: "96 MB L3", Socket: "AM5" }],
  ["Processors", "AMD", "Ryzen 5 7600", 129900, null, 18, "1591799264318-7e6ef8ddb7ea", { Cores: "6 / 12 threads", Boost: "5.1 GHz", Socket: "AM5", Cooler: "Wraith Stealth included" }],
  ["Processors", "AMD", "Ryzen 9 7950X", 349900, null, 4, "1555617766-c94804975da3", { Cores: "16 / 32 threads", Boost: "5.7 GHz", Cache: "64 MB L3", Socket: "AM5" }],
  ["Memory", "Kingston", "FURY Beast DDR5 32GB (2x16) 6000MHz", 74900, 69900, 25, "1562976540-1502c2145186", { Capacity: "32 GB (2x16)", Speed: "6000 MT/s", Latency: "CL36", Voltage: "1.35 V" }],
  ["Memory", "Corsair", "Vengeance DDR5 64GB (2x32) 5600MHz", 139900, null, 7, "1541029071515-84cc54f84dc5", { Capacity: "64 GB (2x32)", Speed: "5600 MT/s", Latency: "CL40" }],
  ["Memory", "Kingston", "FURY Beast DDR4 16GB (2x8) 3200MHz", 32900, 29900, 40, "1562976540-1502c2145186", { Capacity: "16 GB (2x8)", Speed: "3200 MT/s", Latency: "CL16" }],
  ["Storage", "Samsung", "990 PRO NVMe 2TB", 109900, 99900, 15, "1531492746076-161ca9bcad58", { Capacity: "2 TB", Interface: "PCIe 4.0 x4", Read: "7450 MB/s", Write: "6900 MB/s" }],
  ["Storage", "Kingston", "NV3 NVMe 1TB", 39900, null, 33, "1531492746076-161ca9bcad58", { Capacity: "1 TB", Interface: "PCIe 4.0 x4", Read: "6000 MB/s" }],
  ["Storage", "Samsung", "870 EVO SATA 1TB", 49900, 44900, 20, "1531492746076-161ca9bcad58", { Capacity: "1 TB", Interface: "SATA III", Read: "560 MB/s" }],
  ["Storage", "Samsung", "T7 Shield portable SSD 2TB", 89900, null, 12, "1618410320928-25228d811631", { Capacity: "2 TB", Interface: "USB 3.2 Gen 2", Rating: "IP65" }],
  ["Keyboards", "Logitech", "MX Keys S", 69900, 59900, 22, "1587829741301-dc798b83add3", { Layout: "ABNT2", Connection: "Bluetooth, Logi Bolt", Battery: "10 days with backlight", Keys: "Low profile" }],
  ["Keyboards", "Corsair", "K70 CORE RGB mechanical", 59900, null, 9, "1595225476474-87563907a212", { Switches: "Corsair MLX Red", Layout: "ABNT2", Backlight: "RGB per key" }],
  ["Keyboards", "Logitech", "G PRO X TKL Lightspeed", 99900, 89900, 6, "1618384887929-16ec33fab9ef", { Switches: "GX Brown", Connection: "Lightspeed, Bluetooth", Battery: "50 hours" }],
  ["Keyboards", "Logitech", "K380 multi device", 19900, null, 35, "1511467687858-23d96c32e4ae", { Connection: "Bluetooth", Devices: "3 paired", Battery: "2 years" }],
  ["Mice", "Logitech", "MX Master 3S", 59900, 52900, 18, "1527864550417-7fd91fc51a46", { Sensor: "8000 DPI", Buttons: "7", Battery: "70 days", Connection: "Bluetooth, Logi Bolt" }],
  ["Mice", "Logitech", "G502 X Lightspeed", 69900, null, 11, "1615663245857-ac93bb7c39e7", { Sensor: "HERO 25K", Weight: "102 g", Battery: "140 hours" }],
  ["Mice", "Logitech", "G305 Lightspeed", 24900, 19900, 30, "1613141411244-0e4ac259d217", { Sensor: "HERO 12K", Weight: "99 g", Battery: "250 hours on one AA" }],
  ["Mice", "Corsair", "Harpoon RGB Wireless", 22900, null, 0, "1527814050087-3793815479db", { Sensor: "10000 DPI", Weight: "99 g", Connection: "Slipstream, Bluetooth" }],
  ["Monitors", "Dell", 'UltraSharp U2723QE 27" 4K', 349900, 319900, 7, "1527443224154-c4a3942d3acf", { Size: '27"', Resolution: "3840x2160", Panel: "IPS Black", Ports: "USB-C 90 W, HDMI, DP" }],
  ["Monitors", "Samsung", 'Odyssey G5 32" QHD 165Hz', 189900, null, 9, "1616763355603-9755a640a287", { Size: '32"', Resolution: "2560x1440", Refresh: "165 Hz", Curve: "1000R" }],
  ["Monitors", "ASUS", 'ProArt PA278CV 27" QHD', 229900, 209900, 5, "1585792180666-f7347c490ee2", { Size: '27"', Resolution: "2560x1440", Colour: "100% sRGB, Calman verified", Ports: "USB-C 65 W" }],
  ["Monitors", "Dell", 'S2422HZ 24" FHD webcam', 129900, null, 13, "1593640408182-31c70c8268f5", { Size: '24"', Resolution: "1920x1080", Extras: "Pop up webcam, speakers" }],
  ["Headsets", "Logitech", "G PRO X 2 Lightspeed", 129900, 109900, 8, "1599669454699-248893623440", { Drivers: "50 mm graphene", Connection: "Lightspeed, Bluetooth, 3.5 mm", Battery: "50 hours" }],
  ["Headsets", "Corsair", "HS80 RGB Wireless", 79900, null, 10, "1546435770-a3e426bf472b", { Drivers: "50 mm", Audio: "Dolby Atmos", Battery: "20 hours" }],
  ["Headsets", "Sony", "INZONE H5", 89900, 79900, 6, "1618366712010-f4ae9c647dcb", { Drivers: "40 mm", Connection: "2.4 GHz, 3.5 mm", Battery: "28 hours" }],
  ["Speakers", "JBL", "Charge 5", 89900, 79900, 16, "1608043152269-423dbba4e7e1", { Power: "40 W", Battery: "20 hours", Rating: "IP67", Extras: "Powerbank out" }],
  ["Speakers", "Sony", "SRS-XB100", 29900, null, 24, "1545454675-3531b543be5d", { Battery: "16 hours", Rating: "IP67", Weight: "274 g" }],
  ["Speakers", "JBL", "Flip 6", 59900, 54900, 14, "1589003077984-894e133dabab", { Power: "30 W", Battery: "12 hours", Rating: "IP67" }],
  ["Earbuds", "Sony", "WF-1000XM5", 179900, 159900, 9, "1590658268037-6bf12165a8df", { Cancelling: "Adaptive ANC", Battery: "8 h + 16 h case", Codecs: "LDAC, AAC" }],
  ["Earbuds", "Samsung", "Galaxy Buds3 Pro", 149900, null, 11, "1606220588913-b3aacb4d2f46", { Cancelling: "ANC", Battery: "6 h + 20 h case", Drivers: "Dual, planar tweeter" }],
  ["Earbuds", "JBL", "Tune Beam", 39900, 34900, 21, "1572569511254-d8f925fe2cbb", { Cancelling: "ANC", Battery: "12 h + 36 h case", Rating: "IP54" }],
  ["Routers", "TP-Link", "Archer AX73 Wi-Fi 6 AX5400", 79900, 69900, 12, "1606904825846-647eb07f5be2", { Standard: "Wi-Fi 6 AX5400", Ports: "1x 2.5G WAN, 4x 1G LAN", Antennas: "6" }],
  ["Routers", "TP-Link", "Deco X50 mesh (3 pack)", 149900, null, 5, "1544197150-b99a580bb7a8", { Standard: "Wi-Fi 6 AX3000", Coverage: "up to 600 m²", Units: "3" }],
  ["Routers", "ASUS", "RT-AX88U Pro", 249900, 229900, 3, "1558494949-ef010cbdcc31", { Standard: "Wi-Fi 6 AX6000", Ports: "2x 2.5G, 4x 1G", CPU: "Quad core 2.0 GHz" }],
  ["Adapters", "TP-Link", "Archer TX50E Wi-Fi 6 PCIe", 24900, null, 17, "1562408590-e32931084e23", { Standard: "Wi-Fi 6 AX3000", Bluetooth: "5.2", Slot: "PCIe x1" }],
  ["Adapters", "TP-Link", "UE306 USB 3.0 Gigabit", 9900, 8900, 40, "1625948515291-69613efd103f", { Speed: "1 Gbps", Interface: "USB 3.0", Driverless: "yes" }],
  ["Adapters", "ASUS", "USB-AX56 Wi-Fi 6 USB", 29900, null, 8, "1625948515291-69613efd103f", { Standard: "Wi-Fi 6 AX1800", Interface: "USB 3.2", Antennas: "2 external" }],
]

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

export async function seed() {
  const pw = await bcrypt.hash(process.env.DEMO_PASSWORD ?? "kilobyte123", 10)

  // demo owned rows go first. real customers' accounts survive, their orders on demo products don't
  const demoUsers = await db.select({ id: users.id }).from(users).where(sql`${users.email} like ${"%" + DEMO}`)
  if (demoUsers.length) await db.delete(users).where(inArray(users.id, demoUsers.map((u) => u.id)))
  await db.delete(products)
  await db.delete(categories)
  await db.delete(brands)
  await db.delete(coupons)
  await db.delete(carts).where(sql`${carts.userId} is null`)

  const [manager] = await db.insert(users).values({ email: DEMO_MANAGER, name: "Gerente Kilobyte", passwordHash: pw, role: "manager" }).returning()
  const [customer] = await db.insert(users).values({ email: DEMO_CUSTOMER, name: "Marina Duarte", passwordHash: pw, role: "customer" }).returning()
  void manager

  const catId = new Map<string, number>()
  for (const [i, [parent, kids]] of CATS.entries()) {
    const [p] = await db.insert(categories).values({ name: parent, slug: slug(parent), position: i }).returning()
    catId.set(parent, p.id)
    for (const [j, kid] of kids.entries()) {
      const [c] = await db.insert(categories).values({ name: kid, slug: slug(kid), parentId: p.id, position: j }).returning()
      catId.set(kid, c.id)
    }
  }
  const brandId = new Map<string, number>()
  for (const b of BRANDS) {
    const [row] = await db.insert(brands).values({ name: b, slug: slug(b) }).returning()
    brandId.set(b, row.id)
  }

  const ids: number[] = []
  for (const [cat, brand, name, price, promo, stock, photo, specs] of PRODUCTS) {
    const [p] = await db
      .insert(products)
      .values({
        slug: slug(name),
        name,
        brandId: brandId.get(brand)!,
        categoryId: catId.get(cat)!,
        description: `${name} by ${brand}. ${Object.entries(specs)
          .slice(0, 3)
          .map(([k, v]) => `${k} ${v}`)
          .join(", ")}. Ships from São Paulo in up to two business days, twelve month warranty.`,
        specs,
        priceCents: price,
        promoPriceCents: promo,
        stock,
      })
      .returning()
    await db.insert(productImages).values({ productId: p.id, url: img(photo), alt: name, position: 0 })
    ids.push(p.id)
  }

  await db.insert(coupons).values([
    { code: "BEMVINDO10", kind: "percent", value: 10, minSubtotalCents: 10_000 },
    { code: "FRETE50", kind: "amount", value: 5_000, minSubtotalCents: 30_000 },
    { code: "EXPIRADO", kind: "percent", value: 50, active: false },
  ])

  // three past orders for the demo customer, at different points of the flow
  const past = [
    { days: 40, status: "delivered" as const, items: [[ids[23], 1], [ids[27], 1]] as [number, number][] },
    { days: 9, status: "shipped" as const, items: [[ids[16], 1]] as [number, number][] },
    { days: 2, status: "paid" as const, items: [[ids[38], 1], [ids[42], 2]] as [number, number][] },
  ]
  let n = 0
  for (const o of past) {
    const rows = await db.select().from(products).where(inArray(products.id, o.items.map(([id]) => id)))
    const lines = o.items.map(([id, qty]) => {
      const p = rows.find((r) => r.id === id)!
      return { product: p, qty, unitCents: p.promoPriceCents ?? p.priceCents }
    })
    const q = quote(lines, null)
    const at = new Date(Date.now() - o.days * 86_400_000)
    n += 1
    const [order] = await db
      .insert(orders)
      .values({
        number: `KB-${at.getFullYear()}-${String(1000 + n).padStart(6, "0")}`,
        userId: customer.id,
        status: o.status,
        ...q,
        address: { name: customer.name, line1: "Rua Harmonia, 123", line2: "Apto 42", city: "São Paulo", state: "SP", zip: "05435-000" },
        stripeSessionId: `cs_test_demo_${n}`,
        createdAt: at,
        paidAt: at,
      })
      .returning()
    await db.insert(orderItems).values(lines.map((l) => ({ orderId: order.id, productId: l.product.id, name: l.product.name, unitCents: l.unitCents, qty: l.qty })))
    const steps = ["paid", "packing", "shipped", "delivered"] as const
    const upto = steps.indexOf(o.status as (typeof steps)[number])
    await db.insert(orderEvents).values(
      steps.slice(0, upto + 1).map((s, i) => ({ orderId: order.id, status: s, at: new Date(at.getTime() + i * 86_400_000), note: s === "shipped" ? "Correios, tracking BR123456789BR" : "" })),
    )
  }

  await db.insert(reviews).values([
    { productId: ids[23], userId: customer.id, rating: 5, title: "Best keyboard I have owned", body: "Quiet, the backlight wakes up when your hands come close and the battery really does last. Typing all day on it." },
    { productId: ids[27], userId: customer.id, rating: 4, title: "Great, a bit heavy", body: "The scroll wheel is the star. Heavier than my old mouse but you stop noticing." },
  ])
  for (const id of [ids[23], ids[27]]) await refreshRating(id)
  await db.insert(wishlist).values([{ userId: customer.id, productId: ids[9] }, { userId: customer.id, productId: ids[31] }])

  return { products: ids.length }
}

export async function refreshRating(productId: number) {
  const [r] = await db
    .select({ avg: sql<number>`coalesce(round(avg(${reviews.rating}) * 100), 0)`, count: sql<number>`count(*)` })
    .from(reviews)
    .where(sql`${reviews.productId} = ${productId} and not ${reviews.hidden}`)
  await db.update(products).set({ ratingAvg: Number(r.avg), ratingCount: Number(r.count) }).where(eq(products.id, productId))
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seed()
    .then((r) => {
      console.log(`kilobyte demo ready, ${r.products} products. manager ${DEMO_MANAGER}, customer ${DEMO_CUSTOMER}`)
      process.exit(0)
    })
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}
