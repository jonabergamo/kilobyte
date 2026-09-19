"use client"
import { ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { I18nProvider } from "@/lib/i18n"

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } } }))
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nProvider>{children}</I18nProvider>
      </ThemeProvider>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  )
}
