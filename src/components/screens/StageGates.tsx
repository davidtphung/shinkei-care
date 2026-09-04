import { useEffect, type Ref } from 'react'
import { copy } from '@/game/copy.ts'
import { GATES } from '@/game/puzzles.ts'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { LiveAnnouncer } from '@/components/LiveAnnouncer.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { StageHeader } from '@/components/StageHeader.tsx'
import { usePressed } from '@/hooks/usePressed.ts'
import { cn } from '@/lib/utils.ts'

const ICONS = {
  harvest: 'fish',
  bleed: 'gill',
  chill: 'ice',
} as const

type Props = {
  current: number
  announcement: string
  freshness: number
  freshnessMax: number
  combo: number
  headingRef: Ref<HTMLHeadingElement>
  onGate: (index: number) => void
}

export function StageGates({
  current,
  announcement,
  freshness,
  freshnessMax,
  combo,
  headingRef,
  onGate,
}: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return
      const target = event.target
      if (target instanceof HTMLElement && (target.tagName === 'BUTTON' || target.tagName === 'A')) {
        return
      }
      event.preventDefault()
      onGate(current)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, onGate])

  return (
    <div className="play-pad relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col gap-5 px-5 pb-8">
      <StageHeader
        stage={1}
        title={copy.l3GatesLead}
        teach={copy.l3GatesTeach}
        combo={combo}
        headingRef={headingRef}
      />
      <LiveAnnouncer message={announcement} />
      <p className="text-sm text-navy/80">{copy.l3GatesHint}</p>
      <ul className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        {GATES.map((id, index) => (
          <li key={id}>
            <GateCard
              id={id}
              live={index === current}
              done={index < current}
              onPick={() => onGate(index)}
            />
          </li>
        ))}
      </ul>
      <FreshnessMeter value={freshness} max={freshnessMax} />
    </div>
  )
}

function GateCard({
  id,
  live,
  done,
  onPick,
}: {
  id: (typeof GATES)[number]
  live: boolean
  done: boolean
  onPick: () => void
}) {
  const { pressed, pressProps } = usePressed()
  const name = copy.l3GateNames[id]

  return (
    <button
      type="button"
      {...pressProps}
      onClick={onPick}
      data-pressed={pressed ? 'true' : 'false'}
      aria-label={live ? `${name}. ${copy.now}.` : `${name}. ${copy.looksSteady}`}
      className={cn(
        'pressable spring panel flex min-h-[168px] w-full flex-col items-center justify-center gap-3 rounded-3xl border-4 bg-cream px-4 py-5 text-navy',
        live ? 'cycle-pulse border-cool' : 'border-navy',
      )}
    >
      <PixelMatrix name={ICONS[id]} size={88} />
      <span className="text-lg font-semibold">{name}</span>
      {live ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-navy px-3 py-1 text-sm font-semibold text-cream">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-cool" />
          <span>{copy.now}</span>
        </span>
      ) : (
        <span className="text-sm text-navy/70">{done ? copy.coolSuccess : copy.looksSteady}</span>
      )}
    </button>
  )
}
