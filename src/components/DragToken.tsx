import { useRef, type ReactNode, type RefObject } from 'react'
import { copy } from '@/game/copy.ts'
import { useDragToDrop } from '@/hooks/useDragToDrop.ts'
import { cn } from '@/lib/utils.ts'

type Props = {
  selected: boolean
  label: string
  dropRef: RefObject<HTMLButtonElement | null>
  onSelect: () => void
  onPlace: () => void
  onMiss: () => void
  children: ReactNode
}

export function DragToken({
  selected,
  label,
  dropRef,
  onSelect,
  onPlace,
  onMiss,
  children,
}: Props) {
  const tokenRef = useRef<HTMLButtonElement>(null)
  const { offset, dragging, overDrop, dragProps } = useDragToDrop({
    dropRef,
    tokenRef,
    onSelect,
    onPlace,
    onMiss,
  })
  const lifted = dragging || offset.x !== 0 || offset.y !== 0

  return (
    <button
      ref={tokenRef}
      type="button"
      aria-pressed={selected}
      aria-label={`${label}${selected ? ', selected' : ''}. ${copy.dragCue}.`}
      {...dragProps}
      data-pressed={dragging ? 'true' : 'false'}
      className={cn(
        'drag-token pressable spring flex min-h-24 min-w-24 flex-1 flex-col items-center justify-center gap-1 rounded-3xl border-4 bg-cream px-2 py-2 text-navy sm:min-h-28 sm:min-w-28 sm:flex-none sm:gap-2 sm:px-4 sm:py-3',
        selected || overDrop ? 'border-cool' : 'border-navy',
        dragging ? 'is-dragging' : null,
        overDrop ? 'is-over-drop' : null,
      )}
      style={
        lifted
          ? { transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${dragging ? 1.06 : 1})` }
          : undefined
      }
    >
      <span className="drag-grip" aria-hidden />
      {children}
      <span className="text-sm font-semibold">{label}</span>
      <span className="hidden text-[10px] font-semibold tracking-[0.16em] text-navy/65 uppercase sm:inline">
        {copy.dragCue}
      </span>
    </button>
  )
}
