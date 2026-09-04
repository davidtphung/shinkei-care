import { copy } from '@/game/copy.ts'
import { formatRaceTime } from '@/game/time.ts'
import { cn } from '@/lib/utils.ts'

type Props = {
  elapsed: number
  ink?: boolean
  className?: string
}

export function RaceClock({ elapsed, ink = false, className }: Props) {
  const value = formatRaceTime(elapsed)

  return (
    <div
      role="status"
      aria-label={`${copy.time} ${value}`}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-3 py-2 sm:min-h-12',
        ink ? 'border-cream text-cream' : 'border-navy bg-cream/90 text-navy',
        className,
      )}
    >
      <span className="text-[11px] font-semibold tracking-[0.16em] uppercase">{copy.time}</span>
      <span className="text-sm font-semibold tabular-nums sm:text-base">{value}</span>
    </div>
  )
}
