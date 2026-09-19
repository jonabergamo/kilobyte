import { NextResponse } from "next/server"
import { seed } from "@/db/seed"

// vercel cron calls this once a night. anyone else needs the secret
export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "nope" }, { status: 401 })
  const r = await seed()
  return NextResponse.json({ ok: true, ...r })
}

export const maxDuration = 60
