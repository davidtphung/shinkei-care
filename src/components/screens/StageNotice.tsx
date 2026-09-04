import { useEffect, useRef, useState, type Ref } from 'react'
import { FishPlayfield, type FishPose } from '@/components/FishPlayfield.tsx'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { LiveAnnouncer } from '@/components/LiveAnnouncer.tsx'
import { StageHeader } from '@/components/StageHeader.tsx'
import { playCue } from '@/game/audio.ts'
import { copy } from '@/game/copy.ts'
import { useCycle } from '@/hooks/useCycle.ts'

type Props = {
  announcement: string
  freshness: number
  freshnessMax: number
  combo: number
  headingRef: Ref<HTMLHeadingElement>
  lead?: string
  teach?: string
  hint?: string
  onSpike: (progress: number, reduced: boolean, onTarget: boolean) => 'hit' | 'miss'
}

export function StageNotice({
  announcement,
  freshness,
  freshnessMax,
  combo,
  headingRef,
  lead = copy.spikeLead,
  teach = copy.spikeTeach,
  hint = copy.spikeHint,
  onSpike,
}: Props) {
  const { progress, inWindow, reduced, reset } = useCycle(true)
  const progressRef = useRef(progress)
  progressRef.current = progress
  const targetRef = useRef<HTMLButtonElement>(null)
  const [windowNote, setWindowNote] = useState('')
  const [pose, setPose] = useState<FishPose>('idle')
  const wasOpen = useRef(false)

  useEffect(() => {
    if (inWindow && !wasOpen.current) {
      setWindowNote(copy.windowOpen)
      playCue('window')
    }
    if (!inWindow && wasOpen.current) {
      setWindowNote('')
    }
    wasOpen.current = inWindow
  }, [inWindow])

  const attempt = (onTarget: boolean) => {
    if (pose === 'success') return
    const result = onSpike(progressRef.current, reduced, onTarget)
    if (result === 'hit') {
      setPose('success')
      return
    }
    setPose('miss')
    reset()
    window.setTimeout(() => setPose('idle'), 380)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault()
        targetRef.current?.focus()
        return
      }
      if (event.key !== ' ' && event.key !== 'Enter') return
      const target = event.target
      if (target instanceof HTMLElement && (target.tagName === 'BUTTON' || target.tagName === 'A')) {
        return
      }
      event.preventDefault()
      attempt(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pose, reduced])

  return (
    <div className="play-pad cabinet relative z-20 mx-auto flex min-h-[100dvh] w-full flex-col gap-4 sm:gap-5">
      <StageHeader
        stage={1}
        title={lead}
        teach={teach}
        combo={combo}
        headingRef={headingRef}
      />
      <LiveAnnouncer message={announcement || (inWindow ? copy.windowOpen : windowNote)} />
      <p className="stage-hint text-sm text-navy/80">{hint}</p>
      <FishPlayfield
        mode="spike"
        pose={pose}
        progress={progress}
        inWindow={inWindow}
        onSpike={attempt}
        targetRef={targetRef}
      />
      <FreshnessMeter value={freshness} max={freshnessMax} />
    </div>
  )
}
