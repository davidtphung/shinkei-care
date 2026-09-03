import { useEffect, useRef, useState, type Ref } from 'react'
import { copy } from '@/game/copy.ts'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { LiveAnnouncer } from '@/components/LiveAnnouncer.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { StageHeader } from '@/components/StageHeader.tsx'
import { useCycle } from '@/hooks/useCycle.ts'
import { usePressed } from '@/hooks/usePressed.ts'
import { cn } from '@/lib/utils.ts'

const SPIKE_CARDS = ['fish', 'brain', 'basket'] as const

type SpikeId = (typeof SPIKE_CARDS)[number]

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
      attempt(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reduced])

  return (
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col gap-5 px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <StageHeader stage={1} title={copy.spikeLead} combo={combo} headingRef={headingRef} />
      <LiveAnnouncer message={inWindow ? copy.windowOpen : announcement || windowNote} />
      <p className="text-sm text-navy/80">{copy.spikeHint}</p>
      <ul className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        {SPIKE_CARDS.map((id, index) => (
          <li key={id} className="floaty" style={{ animationDelay: `${index * 180}ms` }}>
            <SpikeCard
              id={id}
              progress={progress}
              inWindow={inWindow}
              onPick={() => attempt(id === 'brain')}
            />
          </li>
        ))}
      </ul>
      <FreshnessMeter value={freshness} max={freshnessMax} />
    </div>
  )
}


function SpikeCard({
  id,
  progress,
  inWindow,
  onPick,
}: {
  id: SpikeId
  progress: number
  inWindow: boolean
  onPick: () => void
}) {
  const { pressed, pressProps } = usePressed()
  const isBrain = id === 'brain'
  const live = isBrain && inWindow
  const name = id === 'fish' ? copy.bodyLabel : copy.itemNames[id]
  const clue = live ? copy.now : copy.clue.brain

  return (
    <button
      type="button"
      {...pressProps}
      onClick={onPick}
      data-pressed={pressed ? 'true' : 'false'}
      aria-label={
        isBrain
          ? `${copy.spikeTarget}. ${inWindow ? copy.windowOpen : copy.windowClosed}`
          : `${name}. ${copy.looksSteady}`
      }
      className={cn(
        'pressable spring panel flex min-h-[168px] w-full flex-col items-center justify-center gap-3 rounded-3xl border-4 bg-cream px-4 py-5 text-navy',
        live ? 'cycle-pulse border-cool' : 'border-navy',
      )}
    >
      <PixelMatrix name={id} size={88} />
      <span className="text-lg font-semibold">{name}</span>
      {isBrain ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-navy px-3 py-1 text-sm font-semibold text-cream">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-cool" />
          <span>{clue}</span>
        </span>
      ) : (
        <span className="text-sm text-navy/70">{copy.looksSteady}</span>
      )}
      {isBrain ? <CycleMeter progress={progress} inWindow={inWindow} /> : null}
    </button>
  )
}

function CycleMeter({ progress, inWindow }: { progress: number; inWindow: boolean }) {
  const pct = Math.round(progress * 100)

  return (
    <div className="w-full max-w-[9rem]">
      <p className="sr-only">{inWindow ? copy.windowOpen : copy.windowClosed}</p>
      <div className="h-2 overflow-hidden rounded-full bg-navy/20" aria-hidden>
        <div className="h-full rounded-full bg-cool" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
