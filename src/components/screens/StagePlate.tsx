import { useEffect, type Ref } from 'react'
import { copy } from '@/game/copy.ts'
import { Button } from '@/components/ui/button.tsx'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { LiveAnnouncer } from '@/components/LiveAnnouncer.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { StageHeader } from '@/components/StageHeader.tsx'
import { usePressed } from '@/hooks/usePressed.ts'
import { cn } from '@/lib/utils.ts'

type Props = {
  announcement: string
  freshness: number
  freshnessMax: number
  combo: number
  headingRef: Ref<HTMLHeadingElement>
  onSeal: () => void
}

export function StagePlate({
  announcement,
  freshness,
  freshnessMax,
  combo,
  headingRef,
  onSeal,
}: Props) {
  const { pressed, pressProps } = usePressed()
  const held = freshness >= 4

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return
      const target = event.target
      if (target instanceof HTMLElement && (target.tagName === 'BUTTON' || target.tagName === 'A')) {
        return
      }
      event.preventDefault()
      onSeal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSeal])

  return (
    <div className="play-pad relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col gap-5 px-5 pb-8">
      <StageHeader
        stage={3}
        title={copy.l3PlateLead}
        teach={copy.l3PlateTeach}
        combo={combo}
        headingRef={headingRef}
      />
      <LiveAnnouncer message={announcement} />
      <p className="text-sm text-navy/80">{copy.l3PlateHint}</p>
      <button
        type="button"
        {...pressProps}
        data-pressed={pressed ? 'true' : 'false'}
        onClick={onSeal}
        aria-label={copy.l3PlateAction}
        className={cn(
          'pressable spring panel mx-auto flex min-h-[220px] w-full max-w-sm flex-col items-center justify-center gap-3 rounded-[2rem] border-4 px-6 py-8 text-navy',
          held ? 'border-cool bg-cream' : 'border-navy bg-cream',
        )}
      >
        <PixelMatrix name="seal" size={96} />
        <span className="text-lg font-semibold">{copy.sealLabel}</span>
        <span className="text-sm">{held ? copy.l3PlateHeld : copy.l3PlateSoft}</span>
      </button>
      <FreshnessMeter value={freshness} max={freshnessMax} />
      <Button className="w-full" onClick={onSeal}>
        {copy.l3PlateAction}
      </Button>
    </div>
  )
}
