import type { OrderStatus } from "@/db/schema"

// where each status goes when the manager clicks forward. delivered and cancelled are the end
export const NEXT: Partial<Record<OrderStatus, OrderStatus>> = { paid: "packing", packing: "shipped", shipped: "delivered" }
