import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SettingsForms } from "@/components/store/settings-forms"

export default async function Settings() {
  const s = await auth()
  if (!s?.user) redirect("/login?next=/account/settings")
  return <SettingsForms name={s.user.name ?? ""} />
}
