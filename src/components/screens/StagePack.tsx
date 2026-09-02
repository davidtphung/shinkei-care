import * as Dialog from '@radix-ui/react-dialog'
import { useRef, useState, type Ref } from 'react'
import { copy } from '@/game/copy.ts'
import type { PackId } from '@/game/types.ts'
import { Button } from '@/components/ui/button.tsx'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { LiveAnnouncer } from '@/components/LiveAnnouncer.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { StageHeader } from '@/components/StageHeader.tsx'
import { usePressed } from '@/hooks/usePressed.ts'
import { cn } from '@/lib/utils.ts'

type Props = {
  items: PackId[]
  placed: PackId[]
  selected: PackId | null
  announcement: string
  headingRef: Ref<HTMLHeadingElement>
  onSelect: (id: PackId) => void
  onPlace: (item: PackId, zone: PackId) => void
}

export function StagePack({
  items,
  placed,
  selected,
  announcement,
  headingRef,
  onSelect,
  onPlace,
}: Props) {
  const remaining = items.filter((id) => !placed.includes(id))

  return (
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col gap-4 px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <StageHeader stage={3} title={copy.packLead} headingRef={headingRef} />
      <LiveAnnouncer message={announcement} />
      <p className="text-sm text-navy/80">{copy.packHint}</p>

      <div className="grid flex-1 gap-5 lg:grid-cols-2">
        <section aria-label="Items to pack" className="space-y-3">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-navy uppercase">
            Items
          </h2>
          <ul className="flex flex-wrap gap-3">
            {remaining.map((id) => (
              <li key={id}>
                <PackItem
                  id={id}
                  selected={selected === id}
                  onSelect={onSelect}
                  onDrop={(zone) => onPlace(id, zone)}
                />
              </li>
            ))}
          </ul>
          {remaining.length > 0 ? (
            <ChooseSpot
              items={remaining}
              zones={items}
              selected={selected}
              onSelect={onSelect}
              onPlace={onPlace}
            />
          ) : null}
        </section>

        <section aria-label="Labeled packing zones" className="space-y-3">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-navy uppercase">
            Zones
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((id) => (
              <li key={id}>
                <PackZone
                  id={id}
                  filled={placed.includes(id)}
                  selected={selected}
                  onActivate={() => {
                    if (selected) onPlace(selected, id)
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <FreshnessMeter value={placed.length} max={items.length} />
    </div>
  )
}

function PackItem({
  id,
  selected,
  onSelect,
  onDrop,
}: {
  id: PackId
  selected: boolean
  onSelect: (id: PackId) => void
  onDrop: (zone: PackId) => void
}) {
  const { pressed, pressProps } = usePressed()
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef({ active: false, startX: 0, startY: 0, moved: false })

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${copy.itemNames[id]}${selected ? ', selected' : ''}`}
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
      }
      onPointerUp={(event) => {
        pressProps.onPointerUp()
        const { moved } = drag.current
        drag.current.active = false
        setOffset({ x: 0, y: 0 })
        if (moved) {
          const zone = zoneAtPoint(event.clientX, event.clientY)
          if (zone) onDrop(zone)
        } else {
          onSelect(id)
        }
      }}
      className={cn(
        'pressable spring flex min-h-[132px] min-w-[132px] flex-col items-center justify-center gap-2 rounded-3xl border-4 bg-cream px-4 py-3 text-navy',
        selected ? 'border-cool' : 'border-navy',
      )}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      <PixelMatrix name={id} size={64} />
      <span className="text-sm font-semibold">{copy.itemNames[id]}</span>
    </button>
  )
}

function PackZone({
  id,
  filled,
  selected,
  onActivate,
}: {
  id: PackId
  filled: boolean
  selected: PackId | null
  onActivate: () => void
}) {
  const { pressed, pressProps } = usePressed()
  const name = copy.zoneNames[id]

  return (
    <button
      type="button"
      data-zone={id}
      disabled={filled}
      {...pressProps}
      data-pressed={pressed ? 'true' : 'false'}
      onClick={onActivate}
      aria-label={`${name}${filled ? ', filled' : selected ? `, ready for ${copy.itemNames[selected]}` : ''}`}
      className={cn(
        'pressable spring panel flex min-h-[132px] w-full flex-col items-center justify-center gap-2 rounded-3xl border-4 border-dashed bg-cream px-4 py-5 text-navy',
        filled ? 'border-solid border-cool' : 'border-navy',
      )}
    >
      <PixelMatrix name={id} size={56} />
      <span className="text-base font-semibold">{name}</span>
      <span className="text-sm">{filled ? 'Placed' : 'Empty zone'}</span>
    </button>
  )
}

function ChooseSpot({
  items,
  zones,
  selected,
  onSelect,
  onPlace,
}: {
  items: PackId[]
  zones: PackId[]
  selected: PackId | null
  onSelect: (id: PackId) => void
  onPlace: (item: PackId, zone: PackId) => void
}) {
  const [open, setOpen] = useState(false)
  const current = selected ?? items[0]

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="navy"
          className="w-full"
          onClick={() => {
            if (!selected) onSelect(items[0])
          }}
        >
          {copy.chooseSpot}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/70" />
        <Dialog.Content className="panel fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-3xl bg-cream p-6 text-navy shadow-xl">
          <Dialog.Title className="text-2xl font-semibold">
            {copy.chooseSpotFor(copy.itemNames[current])}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-base">
            {copy.chooseSpotHelp}
          </Dialog.Description>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold">Item</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {items.map((id) => (
                <Button
                  key={id}
                  variant={current === id ? 'primary' : 'outline'}
                  aria-pressed={current === id}
                  onClick={() => onSelect(id)}
                >
                  {copy.itemNames[id]}
                </Button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Spot</legend>
            <div className="mt-2 grid gap-2">
              {zones.map((zone) => (
                <Button
                  key={zone}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    onPlace(current, zone)
                    setOpen(false)
                  }}
                >
                  {copy.placeIn(copy.zoneNames[zone])}
                </Button>
              ))}
            </div>
          </fieldset>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function zoneAtPoint(x: number, y: number): PackId | null {
  const node = document
    .elementsFromPoint(x, y)
    .find((el) => el instanceof HTMLElement && el.dataset.zone)
  const zone = node instanceof HTMLElement ? node.dataset.zone : undefined
  if (zone === 'ice' || zone === 'label' || zone === 'container' || zone === 'tag') {
    return zone
  }
  return null
}
