import { useEffect, useRef, useState, type Ref } from 'react'
import { copy } from '@/game/copy.ts'
import { CycleRing } from '@/components/CycleRing.tsx'
import { FishPlayfield } from '@/components/FishPlayfield.tsx'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { LiveAnnouncer } from '@/components/LiveAnnouncer.tsx'
import { StageHeader } from '@/components/StageHeader.tsx'
import { useCycle } from '@/hooks/useCycle.ts'

type Props = {
  announcement: string
  freshness: number
  freshnessMax: number
  combo: number
  headingRef: Ref<HTMLHeadingElement>
  onSpike: (progress: number, reduced: boolean, onTarget: boolean) => 'hit' | 'miss'
}

export function StageNotice({
  announcement,
  freshness,
  freshnessMax,
  combo,
  headingRef,
  onSpike,
}: Props) {
  const { progress, inWindow, reduced, reset } = useCycle(true)
  const progressRef = useRef(progress)
  progressRef.current = progress
  const [windowNote, setWindowNote] = useState('')
  const wasOpen = useRef(false)

  useEffect(() => {
    if (inWindow && !wasOpen.current) {
      setWindowNote(copy.windowOpen)
    }
    if (!inWindow && wasOpen.current) {
      setWindowNote('')
    }
    wasOpen.current = inWindow
  }, [inWindow])

  const attempt = (onTarget: boolean) => {
    const result = onSpike(progressRef.current, reduced, onTarget)
    if (result === 'miss') reset()
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return
      const target = event.target
      if (target instanceof HTMLElement && (target.tagName === 'BUTTON' || target.tagName === 'A')) {
        return
      }
      event.preventDefault()
      const result = onSpike(progressRef.current, reduced, true)
      if (result === 'miss') reset()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSpike, reduced, reset])

  return (
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col gap-4 px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <StageHeader
        stage={1}
        title={copy.spikeLead}
        teach={copy.spikeTeach}
        combo={combo}
        headingRef={headingRef}
      />
      <LiveAnnouncer message={inWindow ? copy.windowOpen : announcement || windowNote} />
      <p className="text-sm text-navy/80">{copy.spikeHint}</p>

      <div className="flex flex-1 flex-col justify-center">
        <FishPlayfield
          mode="spike"
          inWindow={inWindow}
          hud={<CycleRing progress={progress} inWindow={inWindow} reduced={reduced} size="sm" />}
          onSpike={() => attempt(true)}
          onSpikeHigh={() => attempt(false)}
        />
      </div>

      <FreshnessMeter value={freshness} max={freshnessMax} />
    </div>
  )
}
