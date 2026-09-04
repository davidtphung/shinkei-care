import * as Dialog from '@radix-ui/react-dialog'
import type { Ref } from 'react'
import { copy, levelName } from '@/game/copy.ts'
import { isMuted, playConfirm, unlockAudio } from '@/game/audio.ts'
import { isUnlocked, type Progress } from '@/game/progress.ts'
import { formatRaceTime } from '@/game/time.ts'
import type { LevelId } from '@/game/types.ts'
import { Button } from '@/components/ui/button.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { Mascot } from '@/components/Mascot.tsx'
import { usePressed } from '@/hooks/usePressed.ts'

type Props = {
  progress: Progress
  onPlay: (level: LevelId) => void
  headingRef: Ref<HTMLHeadingElement>
}

export function TitleScreen({ progress, onPlay, headingRef }: Props) {
  const start = (level: LevelId) => {
    void unlockAudio().then((ok) => {
      if (ok && !isMuted()) playConfirm()
    })
    onPlay(level)
  }

  return (
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-lg min-w-0 flex-col justify-between overflow-x-hidden pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))]">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.28em] text-navy uppercase">
          {copy.kicker}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display mt-2 text-[clamp(3.25rem,18vw,4.5rem)] leading-none text-cream drop-shadow-[0_2px_0_#0B1424] outline-none focus:outline-none focus-visible:outline-none sm:text-8xl"
        >
          {copy.wordmark}
        </h1>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{copy.wordmarkLine}</p>
        <p className="mt-2 text-lg text-navy">{copy.subtitle}</p>
        <p className="mt-3 text-sm font-semibold tracking-[0.16em] text-navy/80 uppercase">
          {copy.careScore}
        </p>
        <TitleBests progress={progress} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <Mascot size={132} className="drop-shadow-md" />
        <div className="flex items-center gap-3" aria-hidden>
          <PixelMatrix name="ice" size={40} />
          <PixelMatrix name="cooler" size={40} />
          <PixelMatrix name="seal" size={40} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-navy/70 uppercase">
          {copy.levelsTitle}
        </p>
        <ul className="space-y-2">
          {([1, 2, 3] as const).map((level) => {
            const open = isUnlocked(progress, level)
            const quality = progress.quality[level]
            const time = progress.time[level]
            return (
              <li key={level}>
                <LevelButton
                  open={open}
                  level={level}
                  quality={quality}
                  time={time}
                  onStart={() => start(level)}
                />
              </li>
            )
          })}
        </ul>
        <HowToPlay />
        <a
          className="block text-center text-sm font-semibold text-navy underline decoration-navy/40 underline-offset-4"
          href={copy.brandUrl}
        >
          {copy.brand}
        </a>
        <a
          className="block text-center text-sm font-semibold text-navy underline decoration-navy/40 underline-offset-4"
          href={copy.builtByUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {copy.builtBy}
        </a>
      </div>
    </div>
  )
}

function LevelButton({
  open,
  level,
  quality,
  time,
  onStart,
}: {
  open: boolean
  level: LevelId
  quality: number
  time: number | null
  onStart: () => void
}) {
  const { pressed, pressProps } = usePressed()

  return (
    <button
      type="button"
      disabled={!open}
      {...pressProps}
      data-pressed={pressed ? 'true' : 'false'}
      onClick={onStart}
      aria-label={
        open
          ? copy.playLevel(levelName(level))
          : copy.levelLocked(levelName(level - 1))
      }
      className="hit-target pressable spring panel min-h-12 w-full rounded-3xl border-4 border-navy bg-cream px-4 py-3 text-left text-navy disabled:opacity-50"
    >
      <span className="block text-lg font-semibold">
        {level}. {levelName(level)}
      </span>
      <span className="block text-sm text-navy/75">{copy.levelBlurb[level - 1]}</span>
      {open && quality > 0 ? (
        <span className="mt-1 block text-sm font-semibold">
          {copy.bestScore(quality)}
          {time !== null ? ` · ${copy.bestTimeValue(formatRaceTime(time))}` : ''}
        </span>
      ) : null}
      {!open ? (
        <span className="mt-1 block text-sm">{copy.levelLocked(levelName(level - 1))}</span>
      ) : null}
    </button>
  )
}

function TitleBests({ progress }: { progress: Progress }) {
  const qualities = [progress.quality[1], progress.quality[2], progress.quality[3]]
  const times = [progress.time[1], progress.time[2], progress.time[3]].filter(
    (value): value is number => value !== null,
  )
  const bestQuality = Math.max(...qualities)
  const bestTime = times.length > 0 ? Math.min(...times) : null

  if (bestQuality <= 0 && bestTime === null) {
    return (
      <p className="mt-2 text-sm text-navy/80">{copy.firstQuality}</p>
    )
  }

  return (
    <p className="mt-2 text-sm text-navy tabular-nums">
      {bestQuality > 0 ? copy.bestScore(bestQuality) : copy.firstQuality}
      {bestTime !== null ? ` · ${copy.bestTimeValue(formatRaceTime(bestTime))}` : ''}
    </p>
  )
}

function HowToPlay() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline" className="w-full">
          {copy.howTo}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/70" />
        <Dialog.Content className="panel fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[min(80dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem))] max-w-md -translate-y-1/2 overflow-y-auto rounded-3xl bg-cream p-6 text-navy shadow-xl">
          <Dialog.Title className="text-2xl font-semibold">{copy.howTo}</Dialog.Title>
          <Dialog.Description className="sr-only">
            How to play Shinkei Care
          </Dialog.Description>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-base">
            {copy.howToBody.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <h3 className="mt-6 text-lg font-semibold">{copy.howToMdaTitle}</h3>
          <ul className="mt-3 space-y-3 text-base">
            {copy.howToMda.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <h3 className="mt-6 text-lg font-semibold">{copy.howToLevelsTitle}</h3>
          <ul className="mt-3 space-y-3 text-base">
            {copy.howToLevels.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <Dialog.Close asChild>
            <Button className="mt-6 w-full">{copy.howToClose}</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
