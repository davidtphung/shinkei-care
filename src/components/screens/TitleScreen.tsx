import * as Dialog from '@radix-ui/react-dialog'
import type { Ref } from 'react'
import { copy, levelName } from '@/game/copy.ts'
import { isMuted, playConfirm, unlockAudio } from '@/game/audio.ts'
import { isUnlocked, type Progress } from '@/game/progress.ts'
import { formatRaceTime } from '@/game/time.ts'
import type { LevelId } from '@/game/types.ts'
import { MuteToggle } from '@/components/MuteToggle.tsx'
import { Button } from '@/components/ui/button.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { Mascot } from '@/components/Mascot.tsx'
import { hubCopy } from '@/game/hubCopy.ts'
import { usePressed } from '@/hooks/usePressed.ts'

type Props = {
  progress: Progress
  onPlay: (level: LevelId) => void
  onHub?: () => void
  onLeaderboard?: () => void
  headingRef: Ref<HTMLHeadingElement>
}

export function TitleScreen({ progress, onPlay, onHub, onLeaderboard, headingRef }: Props) {
  const start = (level: LevelId) => {
    void unlockAudio().then((ok) => {
      if (ok && !isMuted()) playConfirm()
    })
    onPlay(level)
  }

  return (
    <div className="sere-screen flex min-h-[100dvh] flex-col justify-between gap-8">
      <MuteToggle className="sere-sound-inline" />
      <PageHeader title={copy.wordmarkLine} line={copy.subtitle} headingRef={headingRef} />

      <div className="sere-float sere-mascot flex justify-center">
        <Mascot size={132} />
      </div>

      <div className="sere-stagger flex flex-col gap-4">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-navy/70 uppercase">
          {copy.levelsTitle}
        </p>
        <ul className="flex flex-col gap-3">
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
        {onLeaderboard ? (
          <Button variant="outline" className="w-full" onClick={onLeaderboard}>
            {hubCopy.boardName}
          </Button>
        ) : null}
        {onHub ? (
          <Button variant="outline" className="w-full" onClick={onHub}>
            {copy.backToHub}
          </Button>
        ) : null}
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
      className="sere-card hit-target pressable min-h-12 w-full px-4 py-4 text-left text-navy disabled:opacity-50"
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
        <Dialog.Content className="sere-surface fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[min(80dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem))] max-w-md -translate-y-1/2 overflow-y-auto p-6 text-navy">
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
