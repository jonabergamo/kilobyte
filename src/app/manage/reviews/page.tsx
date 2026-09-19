import { listReviews } from "@/lib/manage"
import { ReviewsTable } from "@/components/manage/reviews-table"

export default async function Reviews() {
  return <ReviewsTable rows={await listReviews()} />
}
