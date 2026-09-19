"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"

export function LangToggle() {
  const { locale, setLocale } = useT()
  const next = locale === "en" ? "pt" : "en"
  return (
    <Button variant="ghost" size="icon" className="font-mono text-xs uppercase" title={next === "pt" ? "Mudar para português" : "Switch to English"} onClick={() => setLocale(next)}>
      {locale}
    </Button>
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="theme">
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  )
}
