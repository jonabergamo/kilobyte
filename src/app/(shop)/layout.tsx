import { Suspense } from "react"
import { Header } from "@/components/store/header"
import { Footer } from "@/components/store/footer"
import { DemoBanner } from "@/components/store/demo-banner"

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoBanner />
      <Suspense>
        <Header />
      </Suspense>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      <Footer />
    </>
  )
}
