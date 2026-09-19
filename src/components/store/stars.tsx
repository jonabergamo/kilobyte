import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

// ratingX100 is 0..500. five stars, filled to the average
export function Stars({ ratingX100, count, size = 14, className }: { ratingX100: number; count?: number; size?: number; className?: string }) {
  const avg = ratingX100 / 100
  return (
    <span className={cn("inline-flex items-center gap-1", className)} title={`${avg.toFixed(1)} / 5`}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} style={{ width: size, height: size }} className={i <= Math.round(avg) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"} />
        ))}
      </span>
      {count != null && <span className="text-muted-foreground text-xs">({count})</span>}
    </span>
  )
}
