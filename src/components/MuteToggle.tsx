import { copy } from '@/game/copy.ts'
import { useMute } from '@/hooks/useMute.ts'
import { usePressed } from '@/hooks/usePressed.ts'
import { cn } from '@/lib/utils.ts'

type Props = {
  ink?: boolean
  className?: string
}

export function MuteToggle({ ink = false, className }: Props) {
  const { muted, toggle } = useMute()
  const { pressed, pressProps } = usePressed()

  return (
    <button
      type="button"
      {...pressProps}
      data-pressed={pressed ? 'true' : 'false'}
      onClick={toggle}
      aria-pressed={muted}
      aria-label={muted ? copy.soundOff : copy.soundOn}
      className={cn(
        'hit-target pressable spring inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 px-3 py-2 text-xs font-semibold tracking-[0.14em] uppercase sm:min-h-12',
        ink ? 'border-cream text-cream' : 'border-navy bg-cream/90 text-navy',
        className,
      )}
    >
      {muted ? copy.muteLabel : copy.soundLabel}
    </button>
  )
}
