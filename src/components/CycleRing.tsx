import { copy } from '@/game/copy.ts'
import { WINDOW_END, WINDOW_START } from '@/game/puzzles.ts'
import { cn } from '@/lib/utils.ts'

type Props = {
  progress: number
  inWindow: boolean
  reduced: boolean
  className?: string
}

const SIZE = 132
const CX = 66
const CY = 66
const R = 52
const CIRC = 2 * Math.PI * R

export function CycleRing({ progress, inWindow, reduced, className }: Props) {
  const sweep = reduced ? WINDOW_START : progress
  const dash = Math.max(0.02, sweep) * CIRC
  const windowLen = (WINDOW_END - WINDOW_START) * CIRC
  const windowOffset = (1 - WINDOW_START) * CIRC

  return (
    <div
      role="status"
      aria-label={`${copy.cycleLabel}. ${inWindow ? copy.windowOpen : copy.windowClosed}`}
      className={cn('relative mx-auto h-[132px] w-[132px]', inWindow ? 'cycle-pulse' : null, className)}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#0B1424" strokeWidth="8" opacity="0.18" />
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="#3D8FB5"
          strokeWidth="10"
          strokeDasharray={`${windowLen} ${CIRC}`}
          strokeDashoffset={windowOffset}
          strokeLinecap="butt"
          transform={`rotate(-90 ${CX} ${CY})`}
          opacity="0.95"
        />
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="#FF4400"
          strokeWidth="4"
          strokeDasharray={`${dash} ${CIRC}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CY})`}
        />
        <g
          style={{
            transform: `rotate(${sweep * 360}deg)`,
            transformOrigin: `${CX}px ${CY}px`,
          }}
        >
          <circle cx={CX} cy={CY - R} r="6" fill="#0B1424" />
          <circle cx={CX} cy={CY - R} r="3" fill="#FFEBD0" />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-navy uppercase">{copy.cycleLabel}</p>
        <p className="text-lg font-semibold text-navy">{inWindow ? copy.now : '6s'}</p>
      </div>
    </div>
  )
}
