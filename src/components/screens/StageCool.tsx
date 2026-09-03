import { useEffect, useRef, useState, type Ref, type RefObject } from 'react'
import { copy } from '@/game/copy.ts'
import { ICE_GOAL } from '@/game/puzzles.ts'
import { CycleBar } from '@/components/CycleRing.tsx'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { LiveAnnouncer } from '@/components/LiveAnnouncer.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { StageHeader } from '@/components/StageHeader.tsx'
import { useCycle } from '@/hooks/useCycle.ts'
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
  onSelect,
  onPlace,
  onMiss,
}: Props) {
  const dropRef = useRef<HTMLButtonElement>(null)
  const { progress, inWindow, reduced } = useCycle(true)

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
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col gap-4 px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <StageHeader
        stage={3}
        title={copy.coolLead}
        teach={copy.iceTeach}
        combo={combo}
        headingRef={headingRef}
      />
      <LiveAnnouncer message={announcement} />
      <p className="text-sm text-navy/80">{copy.coolHint}</p>

      <CycleBar progress={progress} inWindow={inWindow} reduced={reduced} />

      <div className="flex flex-1 flex-col justify-center gap-4">
        <ul className="flex flex-wrap justify-center gap-3">
          {TOKENS.map((id) =>
            placed.includes(id) ? null : (
              <li key={id}>
                <IceToken
                  id={id}
                  selected={selected === id}
                  dropRef={dropRef}
                  onSelect={onSelect}
                  onPlace={onPlace}
                  onMiss={onMiss}
                />
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
        'pressable spring panel mx-auto flex min-h-[180px] w-full max-w-[20rem] flex-col items-center justify-center gap-3 rounded-[2rem] border-4 border-dashed border-navy bg-cream px-6 py-6 text-navy',
        selected ? 'border-solid border-accent' : null,
        filled > 0 ? 'scale-[1.02]' : null,
      )}
    >
      <PixelMatrix name="cooler" size={96} />
      <span className="text-lg font-semibold">{copy.itemNames.cooler}</span>
      <span className="text-sm">{copy.of(filled, ICE_GOAL)} iced</span>
    </button>
  )
}

function IceToken({
  id,
  selected,
  dropRef,
  onSelect,
  onPlace,
  onMiss,
}: {
  id: string
  selected: boolean
  dropRef: RefObject<HTMLButtonElement | null>
  onSelect: (id: string) => void
  onPlace: (id: string) => void
  onMiss: () => void
}) {
  const { pressed, pressProps } = usePressed()
  const tokenRef = useRef<HTMLButtonElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    moved: false,
  })

  return (
    <button
      ref={tokenRef}
      type="button"
      aria-pressed={selected}
      aria-label={`${copy.itemNames.ice}${selected ? ', selected' : ''}`}
      {...pressProps}
      data-pressed={pressed ? 'true' : 'false'}
      onPointerDown={(event) => {
        pressProps.onPointerDown()
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = {
          active: true,
          startX: event.clientX,
          startY: event.clientY,
          moved: false,
        }
      }}
      onPointerMove={(event) => {
        if (!drag.current.active) return
        const dx = event.clientX - drag.current.startX
        const dy = event.clientY - drag.current.startY
        if (Math.hypot(dx, dy) > 8) drag.current.moved = true
        if (drag.current.moved) setOffset({ x: dx, y: dy })
      }}
      onPointerUp={(event) => {
        pressProps.onPointerUp()
        const { moved } = drag.current
        drag.current.active = false
        setOffset({ x: 0, y: 0 })
        if (moved) {
          const zone = dropRef.current?.getBoundingClientRect()
          if (
            zone &&
            event.clientX >= zone.left &&
            event.clientX <= zone.right &&
            event.clientY >= zone.top &&
            event.clientY <= zone.bottom
          ) {
            onPlace(id)
            return
          }
          onMiss()
        } else {
          onSelect(id)
        }
      }}
      onClick={() => {
        if (!drag.current.moved) onSelect(id)
      }}
      className={cn(
        'pressable spring flex min-h-20 min-w-20 flex-col items-center justify-center gap-1 rounded-3xl border-4 bg-cream px-3 py-2 text-navy',
        selected ? 'border-accent scale-105' : 'border-navy',
      )}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      <PixelMatrix name="ice" size={56} />
      <span className="text-sm font-semibold">{copy.itemNames.ice}</span>
    </button>
  )
}
