import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const url = process.env.DATABASE_URL ?? "postgres://kilobyte:kilobyte@localhost:5436/kilobyte"

// one pool per process. next dev reloads modules, so it hangs off globalThis
const g = globalThis as unknown as { __pool?: Pool }
const pool = (g.__pool ??= new Pool({ connectionString: url, ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined, max: 5 }))

export const db = drizzle(pool, { schema })
export type Db = typeof db
