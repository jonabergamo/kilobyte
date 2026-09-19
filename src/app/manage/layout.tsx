import { ManageNav } from "@/components/manage/nav"

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <ManageNav />
      <main className="min-w-0 flex-1 space-y-6 p-4 md:p-8">{children}</main>
    </div>
  )
}
export const dynamic = "force-dynamic"
