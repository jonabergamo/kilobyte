import { cn } from "@/lib/utils"

// a kilobyte is 1024, so the mark is a "1k" in a chip
export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={cn("shrink-0", className)} aria-hidden>
      <rect x="6" y="6" width="52" height="52" rx="14" className="fill-foreground" />
      <rect x="14" y="14" width="36" height="36" rx="8" className="fill-background/15" />
      <text x="32" y="41" textAnchor="middle" fontFamily="ui-monospace, monospace" fontWeight="700" fontSize="24" className="fill-background">
        1k
      </text>
      <g className="fill-foreground/70">
        <rect x="2" y="20" width="4" height="6" rx="1" /><rect x="2" y="30" width="4" height="6" rx="1" /><rect x="2" y="40" width="4" height="6" rx="1" />
        <rect x="58" y="20" width="4" height="6" rx="1" /><rect x="58" y="30" width="4" height="6" rx="1" /><rect x="58" y="40" width="4" height="6" rx="1" />
      </g>
    </svg>
  )
}
