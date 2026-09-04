import type { Ref } from 'react'
import { copy, levelName, rankLabel } from '@/game/copy.ts'
import { formatRaceTime } from '@/game/time.ts'
import type { LevelId } from '@/game/types.ts'
import { Button } from '@/components/ui/button.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'

type Props = {
  level: LevelId
  score: number
  bestQuality: number
  elapsed: number
  bestTime: number | null
  newBestQuality: boolean
  newBestTime: boolean
  headingRef: Ref<HTMLHeadingElement>
  onAgain: () => void
  onLevels: () => void
}

export function RoundEnd({
  level,
  score,
  bestQuality,
  elapsed,
  bestTime,
  newBestQuality,
  newBestTime,
  headingRef,
  onAgain,
  onLevels,
}: Props) {
  const label = rankLabel(score)

  return (
    <div className="play-pad cabinet relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-center gap-5">
      <p className="text-center text-xs font-semibold tracking-[0.24em] text-navy uppercase">
        {levelName(level)} · {copy.careScore}
      </p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-center text-7xl font-semibold leading-none text-navy"
      >
        {score}
      </h1>
      <p className="font-display text-center text-5xl text-cream drop-shadow-[0_2px_0_#0B1424]">
        {label}
      </p>
      <div className="mx-auto flex items-center gap-3" aria-hidden>
        <PixelMatrix name="seal" size={52} />
        <PixelMatrix name="fish" size={52} />
        <PixelMatrix name="ice" size={52} />
      </div>
      <p className="text-center text-base text-navy tabular-nums">
        {copy.time} {formatRaceTime(elapsed)}
      </p>
      <p className="text-center text-base text-navy">
        {bestQuality > 0 ? copy.bestScore(bestQuality) : copy.firstSavedQuality}
      </p>
      {bestTime !== null ? (
        <p className="text-center text-base text-navy tabular-nums">
          {copy.bestTimeValue(formatRaceTime(bestTime))}
        </p>
      ) : null}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {newBestQuality ? `${copy.newBest}. ${copy.bestScore(bestQuality)}.` : ''}
        {newBestTime && bestTime !== null ? ` ${copy.newBest}. ${copy.bestTimeValue(formatRaceTime(bestTime))}.` : ''}
      </div>
      {newBestQuality || newBestTime ? (
        <p className="text-center text-sm font-semibold tracking-[0.16em] text-navy uppercase">
          {copy.newBest}
        </p>
      ) : null}
      <Button className="w-full text-lg" onClick={onAgain}>
        {copy.playAgain}
      </Button>
      <Button variant="outline" className="w-full" onClick={onLevels}>
        {copy.backToLevels}
      </Button>
    </div>
  )
}
