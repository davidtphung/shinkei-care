import { useEffect, useRef, type Ref } from 'react'
import { DragToken } from '@/components/DragToken.tsx'
import { copy } from '@/game/copy.ts'
import { ICE_GOAL } from '@/game/puzzles.ts'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { LiveAnnouncer } from '@/components/LiveAnnouncer.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { StageHeader } from '@/components/StageHeader.tsx'
import { usePressed } from '@/hooks/usePressed.ts'
import { cn } from '@/lib/utils.ts'

const TOKENS = ['ice-a', 'ice-b', 'ice-c'] as const

type Props = {
  placed: string[]
  selected: string | null
  announcement: string
  freshness: number
  freshnessMax: number
  combo: number
  headingRef: Ref<HTMLHeadingElement>
  lead?: string
  teach?: string
  hint?: string
  onSelect: (id: string) => void
  onPlace: (id: string) => void
  onMiss: () => void
}

export function StageCool({
  placed,
  selected,
  announcement,
  freshness,
  freshnessMax,
  combo,
  headingRef,
  lead = copy.coolLead,
  teach = copy.iceTeach,
  hint = copy.coolHint,
  onSelect,
  onPlace,
  onMiss,
}: Props) {
  const dropRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const remaining = TOKENS.filter((id) => !placed.includes(id))
      if (remaining.length === 0) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        const idx = selected ? remaining.indexOf(selected as (typeof TOKENS)[number]) : -1
        onSelect(remaining[(idx + 1) % remaining.length])
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        const idx = selected ? remaining.indexOf(selected as (typeof TOKENS)[number]) : 0
        onSelect(remaining[(idx - 1 + remaining.length) % remaining.length])
      }
      if (event.key === 'Enter' && selected && remaining.includes(selected as (typeof TOKENS)[number])) {
        event.preventDefault()
        onPlace(selected)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [placed, selected, onPlace, onSelect])

  return (
    <div className="play-pad play-surface cabinet relative z-20 mx-auto flex min-h-[100dvh] w-full flex-col gap-3 sm:gap-4">
      <StageHeader
        stage={3}
        title={lead}
        teach={teach}
        combo={combo}
        headingRef={headingRef}
      />
      <LiveAnnouncer message={announcement} />
      <p className="stage-hint text-sm text-navy/80">{hint}</p>

      <div className="drop-board grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:grid-rows-1 sm:gap-4">
        <ul className="order-2 flex min-w-0 flex-row justify-center gap-2 sm:order-1 sm:flex-col sm:items-center sm:gap-3">
          {TOKENS.map((id) =>
            placed.includes(id) ? null : (
              <li key={id} className="flex min-w-0 flex-1 sm:flex-none">
                <DragToken
                  selected={selected === id}
                  label={copy.itemNames.ice}
                  dropRef={dropRef}
                  onSelect={() => onSelect(id)}
                  onPlace={() => onPlace(id)}
                  onMiss={onMiss}
                >
                  <PixelMatrix name="ice" size={56} className="sm:h-[72px] sm:w-[72px]" />
                </DragToken>
              </li>
            ),
          )}
        </ul>

        <CoolerDrop
          ref={dropRef}
          selected={selected}
          filled={placed.length}
          onActivate={() => {
            if (selected) onPlace(selected)
          }}
        />

        <div className="drop-spacer hidden sm:block" />
      </div>

      <FreshnessMeter value={freshness} max={freshnessMax} />
    </div>
  )
}

function CoolerDrop({
  ref,
  selected,
  filled,
  onActivate,
}: {
  ref: Ref<HTMLButtonElement>
  selected: string | null
  filled: number
  onActivate: () => void
}) {
  const { pressed, pressProps } = usePressed()

  return (
    <button
      ref={ref}
      type="button"
      data-drop="cooler"
      {...pressProps}
      data-pressed={pressed ? 'true' : 'false'}
      onClick={onActivate}
      aria-label={
        selected
          ? `Open cooler. Place selected ice pack. ${copy.of(filled, ICE_GOAL)} filled.`
          : `Open cooler drop zone. ${copy.of(filled, ICE_GOAL)} filled.`
      }
      className={cn(
        'hit-target pressable spring panel order-1 mx-auto flex min-h-[168px] w-full min-w-0 flex-col items-center justify-center gap-2 rounded-[2rem] border-4 border-dashed border-navy bg-cream px-5 py-5 text-navy sm:order-2 sm:min-h-[220px] sm:min-w-[220px] sm:gap-3 sm:px-6 sm:py-8',
        selected ? 'border-solid border-cool' : null,
      )}
    >
      <PixelMatrix name="cooler" size={88} className="sm:h-24 sm:w-24" />
      <span className="text-lg font-semibold">{copy.itemNames.cooler}</span>
      <span className="text-sm">{copy.dropOpen}</span>
    </button>
  )
}
