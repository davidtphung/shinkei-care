import { useEffect, type Ref } from 'react'
import { copy } from '@/game/copy.ts'
import { CycleRing } from '@/components/CycleRing.tsx'
import { FishPlayfield } from '@/components/FishPlayfield.tsx'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { LiveAnnouncer } from '@/components/LiveAnnouncer.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { StageHeader } from '@/components/StageHeader.tsx'
import { useCycle } from '@/hooks/useCycle.ts'

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
  const { progress, inWindow, reduced } = useCycle(true)

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
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col gap-4 px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <StageHeader
        stage={2}
        title={copy.gillLead}
        teach={copy.gillTeach}
        combo={combo}
        headingRef={headingRef}
      />
      <LiveAnnouncer message={announcement} />
      <p className="text-sm text-navy/80">{copy.gillHint}</p>

      <div className="grid flex-1 items-center gap-4 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-3">
          <CycleRing progress={progress} inWindow={inWindow} reduced={reduced} />
          <PixelMatrix name="gill" size={52} title={copy.itemNames.gill} />
        </div>
        <FishPlayfield mode="gill" still onGill={onGill} onGillMiss={onGillMiss} />
      </div>

      <FreshnessMeter value={freshness} max={freshnessMax} />
    </div>
  )
}
