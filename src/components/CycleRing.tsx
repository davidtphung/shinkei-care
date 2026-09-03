import { copy } from '@/game/copy.ts'
import { WINDOW_END, WINDOW_START } from '@/game/puzzles.ts'
import { cn } from '@/lib/utils.ts'

type Props = {
  progress: number
  inWindow: boolean
  reduced: boolean
  size?: 'md' | 'sm'
  className?: string
}

export function CycleRing({ progress, inWindow, reduced, size = 'md', className }: Props) {
  const dim = size === 'sm' ? 96 : 120
  const cx = dim / 2
  const cy = dim / 2
  const r = size === 'sm' ? 36 : 46
  const circ = 2 * Math.PI * r
  const sweep = reduced ? WINDOW_START : progress
  const dash = Math.max(0.02, sweep) * circ
  const windowLen = (WINDOW_END - WINDOW_START) * circ
  const windowOffset = (1 - WINDOW_START) * circ

  return (
    <div
      role="status"
      aria-label={`${copy.cycleLabel}. ${inWindow ? copy.windowOpen : copy.windowClosed}`}
      className={cn(
        'relative',
        size === 'sm' ? 'h-24 w-24' : 'h-[120px] w-[120px]',
        inWindow ? 'cycle-pulse' : null,
        className,
      )}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0B1424" strokeWidth="8" opacity="0.18" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#3D8FB5"
          strokeWidth="10"
          strokeDasharray={`${windowLen} ${circ}`}
          strokeDashoffset={windowOffset}
          strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cy})`}
          opacity="0.95"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#FF4400"
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <g
          style={{
            transform: `rotate(${sweep * 360}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
          }}
        >
          <circle cx={cx} cy={cy - r} r="6" fill="#0B1424" />
          <circle cx={cx} cy={cy - r} r="3" fill="#FFEBD0" />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {size === 'md' ? (
          <p className="text-[10px] font-semibold tracking-[0.18em] text-navy uppercase">{copy.cycleLabel}</p>
        ) : (
          <p className="sr-only">{copy.cycleLabel}</p>
        )}
        <p className={cn('font-semibold text-navy', size === 'sm' ? 'text-base' : 'text-lg')}>
          {inWindow ? copy.now : '6s'}
        </p>
      </div>
    </div>
  )
}

export function CycleBar({
  progress,
  inWindow,
  reduced,
  className,
}: {
  progress: number
  inWindow: boolean
  reduced: boolean
  className?: string
}) {
  const sweep = reduced ? WINDOW_START : progress
  const windowLeft = WINDOW_START * 100
  const windowWidth = (WINDOW_END - WINDOW_START) * 100

  return (
    <div
      role="status"
      aria-label={`${copy.cycleLabel}. ${inWindow ? copy.windowOpen : copy.windowClosed}`}
      className={cn('w-full', className)}
    >
      <div className="mb-1 flex items-baseline justify-between gap-3 text-navy">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase">{copy.cycleLabel}</p>
        <p className="text-sm font-semibold">{inWindow ? copy.now : '6s'}</p>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-navy/15">
        <div
          className="absolute inset-y-0 rounded-full bg-cool"
          style={{ left: `${windowLeft}%`, width: `${windowWidth}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent"
          style={{ width: `${Math.max(4, sweep * 100)}%` }}
        />
      </div>
    </div>
  )
}
