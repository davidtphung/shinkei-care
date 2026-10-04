import * as Dialog from '@radix-ui/react-dialog'
import { MuteToggle } from '@/components/MuteToggle.tsx'
import { Button } from '@/components/ui/button.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { copy } from '@/game/copy.ts'
import { hubCopy } from '@/game/hubCopy.ts'
import { formatRaceTime } from '@/game/time.ts'
import type { LevelId } from '@/game/types.ts'
import { usePressed } from '@/hooks/usePressed.ts'
import { mazeCopy, mazeLevelName } from '@/maze/copy.ts'
import { mazeUnlocked, type MazeProgress } from '@/maze/progress.ts'

type Props = {
  progress: MazeProgress
  onPlay: (level: LevelId) => void
  onHub: () => void
  onLeaderboard: () => void
}

export function MazeTitle({ progress, onPlay, onHub, onLeaderboard }: Props) {
  return (
    <div className="sere-screen flex min-h-[100dvh] flex-col justify-start gap-8">
      <MuteToggle className="sere-sound-inline" />
      <PageHeader title={mazeCopy.title} line={mazeCopy.subtitle} />

      <div className="sere-stagger flex flex-col gap-4">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-navy/70 uppercase">{mazeCopy.levelsTitle}</p>
        <ul className="flex flex-col gap-3">
          {([1, 2, 3] as const).map((level) => {
            const open = mazeUnlocked(progress, level)
            const quality = progress.quality[level]
            const time = progress.time[level]
            return (
              <li key={level}>
                <LevelButton
                  open={open}
                  level={level}
                  quality={quality}
                  time={time}
                  onStart={() => onPlay(level)}
                />
              </li>
            )
          })}
        </ul>
        <HowMaze />
        <Button variant="outline" className="w-full" onClick={onLeaderboard}>
          {hubCopy.boardName}
        </Button>
        <Button variant="outline" className="w-full" onClick={onHub}>
          {mazeCopy.hub}
        </Button>
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
      aria-label={open ? mazeCopy.playLevel(mazeLevelName(level)) : mazeCopy.locked(mazeLevelName(level - 1))}
      className="sere-card hit-target pressable min-h-12 w-full px-4 py-4 text-left text-navy disabled:opacity-50"
    >
      <span className="block text-lg font-semibold">
        {level}. {mazeLevelName(level)}
      </span>
      <span className="block text-sm text-navy/75">{mazeCopy.levelBlurb[level - 1]}</span>
      {open && quality > 0 ? (
        <span className="mt-1 block text-sm font-semibold tabular-nums">
          {copy.bestScore(quality)}
          {time !== null ? ` · ${copy.bestTimeValue(formatRaceTime(time))}` : ''}
        </span>
      ) : null}
      {!open ? <span className="mt-1 block text-sm">{mazeCopy.locked(mazeLevelName(level - 1))}</span> : null}
    </button>
  )
}

function HowMaze() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline" className="w-full">
          {mazeCopy.howTo}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/70" />
        <Dialog.Content className="sere-surface fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[min(80dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem))] max-w-md -translate-y-1/2 overflow-y-auto p-6 text-navy">
          <Dialog.Title className="text-2xl font-semibold">{mazeCopy.howTo}</Dialog.Title>
          <Dialog.Description className="sr-only">{mazeCopy.howMdaTitle}</Dialog.Description>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-base">
            {mazeCopy.howBody.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <h3 className="mt-6 text-lg font-semibold">{mazeCopy.howMdaTitle}</h3>
          <ul className="mt-3 space-y-3 text-base">
            {mazeCopy.howMda.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <Dialog.Close asChild>
            <Button className="mt-6 w-full">{mazeCopy.howToClose}</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
