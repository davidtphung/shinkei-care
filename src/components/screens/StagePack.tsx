import { useEffect, useRef, useState, type Ref } from 'react'
import { FishPlayfield, type FishPose } from '@/components/FishPlayfield.tsx'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { LiveAnnouncer } from '@/components/LiveAnnouncer.tsx'
import { StageHeader } from '@/components/StageHeader.tsx'
import { copy } from '@/game/copy.ts'

type Props = {
  announcement: string
  freshness: number
  freshnessMax: number
  combo: number
  headingRef: Ref<HTMLHeadingElement>
  lead?: string
  teach?: string
  hint?: string
  onGill: () => void
  onGillMiss: () => void
}

export function StagePack({
  announcement,
  freshness,
  freshnessMax,
  combo,
  headingRef,
  lead = copy.gillLead,
  teach = copy.gillTeach,
  hint = copy.gillHint,
  onGill,
  onGillMiss,
}: Props) {
  const targetRef = useRef<HTMLButtonElement>(null)
  const [pose, setPose] = useState<FishPose>('idle')
  const [done, setDone] = useState(false)

  const cut = () => {
    if (done) return
    setDone(true)
    setPose('success')
    onGill()
  }

  const miss = () => {
    if (done) return
    setPose('miss')
    onGillMiss()
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
      cut()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done])

  return (
    <div className="play-pad relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col gap-5 px-5 pb-8">
      <StageHeader
        stage={2}
        title={lead}
        teach={teach}
        combo={combo}
        headingRef={headingRef}
      />
      <LiveAnnouncer message={announcement} />
      <p className="text-sm text-navy/80">{hint}</p>
      <FishPlayfield
        mode="gill"
        pose={pose}
        gillDone={done}
        onGill={cut}
        onGillMiss={miss}
        targetRef={targetRef}
      />
      <FreshnessMeter value={freshness} max={freshnessMax} />
    </div>
  )
}
