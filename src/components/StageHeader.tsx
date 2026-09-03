import type { Ref } from 'react'
import { copy } from '@/game/copy.ts'

type Props = {
  stage: number
  title: string
  headingRef: Ref<HTMLHeadingElement>
  onInk?: boolean
  teach?: string
  combo?: number
}

export function StageHeader({
  stage,
  title,
  headingRef,
  onInk = false,
  teach,
  combo = 0,
}: Props) {
  const ink = onInk ? 'text-cream' : 'text-navy'
  const mute = onInk ? 'text-cream/80' : 'text-navy/70'

  return (
    <header className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs font-semibold tracking-[0.22em] uppercase ${mute}`}>
          {copy.stageOf(stage)}
        </p>
        {combo > 0 ? (
          <p className={`text-xs font-semibold tracking-[0.16em] uppercase ${ink}`}>
            {copy.comboCount(combo)}
          </p>
        ) : null}
      </div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={`text-3xl font-semibold tracking-tight sm:text-4xl ${ink}`}
      >
        {title}
      </h1>
      {teach ? <p className={`max-w-xl text-base ${ink}`}>{teach}</p> : null}
    </header>
  )
}
