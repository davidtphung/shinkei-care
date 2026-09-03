import type { Ref } from 'react'
import { copy, rankLabel } from '@/game/copy.ts'
import { Button } from '@/components/ui/button.tsx'
import { Mascot } from '@/components/Mascot.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'

type Props = {
  score: number
  highScore: number
  headingRef: Ref<HTMLHeadingElement>
  onAgain: () => void
}

export function RoundEnd({ score, highScore, headingRef, onAgain }: Props) {
  const label = rankLabel(score)

  return (
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-center gap-6 px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <p className="text-center text-xs font-semibold tracking-[0.24em] text-navy uppercase">
        {copy.careScore}
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
      <div className="mx-auto flex items-center gap-3">
        <PixelMatrix name="brain" size={48} />
        <Mascot resting size={96} />
        <PixelMatrix name="ice" size={48} />
      </div>
      <p className="text-center text-base text-navy">
        {highScore > 0 ? copy.bestScore(highScore) : 'This is your first saved Ikejime Score.'}
      </p>
      <Button className="w-full text-lg" onClick={onAgain}>
        {copy.playAgain}
      </Button>
    </div>
  )
}
