import { useEffect, useRef, useState, type Ref, type RefObject } from 'react'
import { copy } from '@/game/copy.ts'
import { HANDOFF_GOAL } from '@/game/puzzles.ts'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { LiveAnnouncer } from '@/components/LiveAnnouncer.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { StageHeader } from '@/components/StageHeader.tsx'
import { usePressed } from '@/hooks/usePressed.ts'
import { cn } from '@/lib/utils.ts'

const LOTS = ['lot-a', 'lot-b', 'lot-c'] as const

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

export function StageHandoff({
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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const remaining = LOTS.filter((id) => !placed.includes(id))
      if (remaining.length === 0) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        const idx = selected ? remaining.indexOf(selected as (typeof LOTS)[number]) : -1
        onSelect(remaining[(idx + 1) % remaining.length])
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        const idx = selected ? remaining.indexOf(selected as (typeof LOTS)[number]) : 0
        onSelect(remaining[(idx - 1 + remaining.length) % remaining.length])
      }
      if (event.key === 'Enter' && selected && remaining.includes(selected as (typeof LOTS)[number])) {
        event.preventDefault()
        onPlace(selected)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [placed, selected, onPlace, onSelect])

  return (
    <div className="play-pad relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col gap-4 px-5 pb-8">
      <StageHeader
        stage={2}
        title={copy.l3HandoffLead}
        teach={copy.l3HandoffTeach}
        combo={combo}
        headingRef={headingRef}
      />
      <LiveAnnouncer message={announcement} />
      <p className="text-sm text-navy/80">{copy.l3HandoffHint}</p>

      <div className="grid flex-1 grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <ul className="flex flex-wrap justify-center gap-3 sm:flex-col">
          {LOTS.map((id) =>
            placed.includes(id) ? null : (
              <li key={id}>
                <LotToken
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

        <HoldDrop
          ref={dropRef}
          selected={selected}
          filled={placed.length}
          onActivate={() => {
            if (selected) onPlace(selected)
          }}
        />

        <div className="hidden sm:block" />
      </div>

      <FreshnessMeter value={freshness} max={freshnessMax} />
    </div>
  )
}

function HoldDrop({
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
      data-drop="hold"
      {...pressProps}
      data-pressed={pressed ? 'true' : 'false'}
      onClick={onActivate}
      aria-label={
        selected
          ? `Open hold. Place selected lot. ${copy.of(filled, HANDOFF_GOAL)} filled.`
          : `Open hold drop zone. ${copy.of(filled, HANDOFF_GOAL)} filled.`
      }
      className={cn(
        'pressable spring panel mx-auto flex min-h-[220px] min-w-[220px] flex-col items-center justify-center gap-3 rounded-[2rem] border-4 border-dashed border-navy bg-cream px-6 py-8 text-navy',
        selected ? 'border-solid border-cool' : null,
      )}
    >
      <PixelMatrix name="cooler" size={96} />
      <span className="text-lg font-semibold">{copy.l3Hold}</span>
      <span className="text-sm">Open drop zone</span>
    </button>
  )
}

function LotToken({
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
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    moved: false,
  })

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${copy.l3Lot}${selected ? ', selected' : ''}`}
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
        'pressable spring flex min-h-28 min-w-28 flex-col items-center justify-center gap-2 rounded-3xl border-4 bg-cream px-4 py-3 text-navy',
        selected ? 'border-cool' : 'border-navy',
      )}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      <PixelMatrix name="fish" size={72} />
      <span className="text-sm font-semibold">{copy.l3Lot}</span>
    </button>
  )
}
