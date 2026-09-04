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
        'drag-token pressable spring flex min-h-[5.5rem] w-full min-w-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-3xl border-4 bg-cream px-3 py-3 text-navy sm:min-h-28 sm:min-w-28 sm:gap-2 sm:px-4',
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
      <span className="text-[10px] font-semibold tracking-[0.16em] text-navy/65 uppercase">
        {copy.dragCue}
      </span>
    </button>
  )
}
