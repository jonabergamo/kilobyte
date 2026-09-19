import { SuccessPoll } from "@/components/store/success-poll"

export default async function Success({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams
  return <SuccessPoll sessionId={session_id ?? ""} />
}
