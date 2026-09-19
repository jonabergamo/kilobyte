import { AccountNav } from "@/components/store/account-nav"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <AccountNav />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
