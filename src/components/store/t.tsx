"use client"
import { useT, type Dict } from "@/lib/i18n"

// a translated string inside a server component. dotted key into the dictionary
type Leaves<T, P extends string = ""> = { [K in keyof T & string]: T[K] extends string ? `${P}${K}` : T[K] extends Record<string, unknown> ? Leaves<T[K], `${P}${K}.`> : never }[keyof T & string]
export type Key = Leaves<Dict>

export function T({ k }: { k: Key }) {
  const { t } = useT()
  const v = k.split(".").reduce<unknown>((o, part) => (o as Record<string, unknown>)?.[part], t)
  return <>{typeof v === "string" ? v : k}</>
}
