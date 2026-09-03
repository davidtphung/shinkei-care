import { useEffect, type Ref } from 'react'
import { copy } from '@/game/copy.ts'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { LiveAnnouncer } from '@/components/LiveAnnouncer.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { StageHeader } from '@/components/StageHeader.tsx'
import { usePressed } from '@/hooks/usePressed.ts'
import { cn } from '@/lib/utils.ts'

const GILL_CARDS = ['fish', 'gill', 'brain'] as const

type GillId = (typeof GILL_CARDS)[number]

type Props = {
  announcement: string
  freshness: number
  freshnessMax: number
  combo: number
  headingRef: Ref<HTMLHeadingElement>
  onGill: () => void
  onGillMiss: () => void
}

export function StagePack({
  announcement,
  freshness,
  freshnessMax,
  combo,
  headingRef,
  onGill,
  onGillMiss,
}: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return
      const target = event.target
      if (target instanceof HTMLElement && (target.tagName === 'BUTTON' || target.tagName === 'A')) {
        return
      }
      event.preventDefault()
      onGill()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onGill])

  return (
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col gap-5 px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <StageHeader stage={2} title={copy.gillLead} combo={combo} headingRef={headingRef} />
      <LiveAnnouncer message={announcement} />
      <p className="text-sm text-navy/80">{copy.gillHint}</p>
      <ul className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        {GILL_CARDS.map((id, index) => (
          <li key={id} className="floaty" style={{ animationDelay: `${index * 180}ms` }}>
            <GillCard
              id={id}
              onPick={() => {
                if (id === 'gill') onGill()
                else onGillMiss()
              }}
            />
          </li>
        ))}
      </ul>
      <FreshnessMeter value={freshness} max={freshnessMax} />
    </div>
  )
}

function GillCard({ id, onPick }: { id: GillId; onPick: () => void }) {
  const { pressed, pressProps } = usePressed()
  const isGill = id === 'gill'
  const name = copy.itemNames[id]

  return (
    <button
      type="button"
      {...pressProps}
      onClick={onPick}
      data-pressed={pressed ? 'true' : 'false'}
      aria-label={isGill ? `${copy.gillTarget}. ${copy.gillAction}.` : `${name}. ${copy.looksSteady}`}
      className={cn(
        'pressable spring panel flex min-h-[168px] w-full flex-col items-center justify-center gap-3 rounded-3xl border-4 bg-cream px-4 py-5 text-navy',
        isGill ? 'border-cool' : 'border-navy',
      )}
    >
      <PixelMatrix name={id} size={88} />
      <span className="text-lg font-semibold">{name}</span>
      {isGill ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-navy px-3 py-1 text-sm font-semibold text-cream">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-cool" />
          <span>{copy.clue.gill}</span>
        </span>
      ) : (
        <span className="text-sm text-navy/70">{copy.looksSteady}</span>
      )}
    </button>
  )
}
