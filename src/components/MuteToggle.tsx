import { copy } from '@/game/copy.ts'
import { useMute } from '@/hooks/useMute.ts'
import { usePressed } from '@/hooks/usePressed.ts'
import { cn } from '@/lib/utils.ts'

type Props = {
  className?: string
}

export function MuteToggle({ className }: Props) {
  const { muted, toggle } = useMute()
  const { pressed, pressProps } = usePressed()

  return (
    <button
      type="button"
      {...pressProps}
      data-pressed={pressed ? 'true' : 'false'}
      onClick={toggle}
      aria-pressed={muted}
      aria-label={copy.soundToggle}
      className={cn('sere-sound sere-lift hit-target pressable', className)}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path fill="currentColor" d="M4 9.5h3.2L12 5v14l-4.8-4.5H4z" />
        {muted ? (
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M16 9l5 6M21 9l-5 6"
          />
        ) : (
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M16 9.2a4 4 0 0 1 0 5.6M18.5 7a7 7 0 0 1 0 10"
          />
        )}
      </svg>
    </button>
  )
}
