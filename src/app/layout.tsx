import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: { default: "Kilobyte", template: "%s · Kilobyte" },
  description: "Laptops, components and peripherals. A demo store with real Stripe test checkouts, built by Jonathan Bergamo.",
  openGraph: { title: "Kilobyte", description: "Gear that keeps up with you.", type: "website" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
