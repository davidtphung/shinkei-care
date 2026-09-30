import { copy } from '@/game/copy.ts'
import { stepPercent } from '@/care/round.ts'

type Props = {
  done: number
  total: number
  label?: string
}

export function StepMeter({ done, total, label = copy.stepMeter }: Props) {
  const pct = stepPercent(done, total)
  const shown = Math.min(total, Math.max(0, done))

  return (
    <div className="w-full text-navy">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <p className="text-[0.7rem] font-semibold tracking-[0.16em] uppercase">{label}</p>
        <p className="text-sm font-medium tabular-nums">{copy.of(shown, total)}</p>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-navy/15"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={shown}
        aria-valuetext={copy.of(shown, total)}
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
