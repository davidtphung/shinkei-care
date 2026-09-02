import { copy } from '@/game/copy.ts'
import { cn } from '@/lib/utils.ts'

type Props = {
  value: number
  max: number
  className?: string
}

export function FreshnessMeter({ value, max, className }: Props) {
  const pct = Math.round((value / max) * 100)

  return (
    <div className={cn('panel w-full rounded-2xl bg-cream px-4 py-3 text-navy', className)}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold tracking-[0.16em] uppercase">{copy.freshness}</p>
        <p className="text-sm font-medium">{copy.of(value, max)}</p>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-navy/15"
        role="meter"
        aria-label={copy.freshness}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div
          className="spring h-full rounded-full bg-cool"
          style={{ width: `${pct}%`, transformOrigin: 'left center' }}
        />
      </div>
    </div>
  )
}
