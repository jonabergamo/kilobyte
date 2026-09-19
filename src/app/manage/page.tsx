import Link from "next/link"
import { dashboard } from "@/lib/manage"
import { Dashboard } from "@/components/manage/dashboard"

export default async function ManageHome() {
  const data = await dashboard()
  return <Dashboard data={data} />
}
void Link
