import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { copy } from '@/game/copy.ts'
import { formatRaceTime } from '@/game/time.ts'
import type { LevelId } from '@/game/types.ts'
import { usePressed } from '@/hooks/usePressed.ts'
import { mazeCopy, mazeLevelName } from '@/maze/copy.ts'
import { mazeUnlocked, type MazeProgress } from '@/maze/progress.ts'

type Props = {
  progress: MazeProgress
  onPlay: (level: LevelId) => void
  onHub: () => void
}

export function MazeTitle({ progress, onPlay, onHub }: Props) {
  return (
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-lg min-w-0 flex-col justify-between overflow-x-hidden pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))]">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.28em] text-navy uppercase">{mazeCopy.kicker}</p>
        <p className="wordmark font-display mt-2 text-[clamp(3.25rem,16vw,4.5rem)] leading-none text-cream drop-shadow-[0_2px_0_#0B1424] outline-none">
          {mazeCopy.title}
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-navy">{mazeCopy.subtitle}</p>
        <p className="mt-3 text-sm font-semibold tracking-[0.16em] text-navy/80 uppercase">{mazeCopy.quality}</p>
        <MazeBests progress={progress} />
      </div>

      <div className="flex justify-center gap-3" aria-hidden>
        <PixelMatrix name="ice" size={40} />
        <PixelMatrix name="brain" size={40} />
        <PixelMatrix name="fish" size={40} />
      </div>

      <div className="space-y-3">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-navy/70 uppercase">{mazeCopy.levelsTitle}</p>
        <ul className="space-y-2">
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
      className="hit-target pressable spring panel min-h-12 w-full rounded-3xl border-4 border-navy bg-cream px-4 py-3 text-left text-navy disabled:opacity-50"
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

function MazeBests({ progress }: { progress: MazeProgress }) {
  const qualities = [progress.quality[1], progress.quality[2], progress.quality[3]]
  const times = [progress.time[1], progress.time[2], progress.time[3]].filter(
    (value): value is number => value !== null,
  )
  const bestQuality = Math.max(...qualities)
  const bestTime = times.length > 0 ? Math.min(...times) : null
  if (bestQuality <= 0 && bestTime === null) {
    return <p className="mt-2 text-sm text-navy/80">{mazeCopy.firstQuality}</p>
  }
  return (
    <p className="mt-2 text-sm text-navy tabular-nums">
      {bestQuality > 0 ? copy.bestScore(bestQuality) : mazeCopy.firstQuality}
      {bestTime !== null ? ` · ${copy.bestTimeValue(formatRaceTime(bestTime))}` : ''}
    </p>
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
        <Dialog.Content className="panel fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[min(80dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem))] max-w-md -translate-y-1/2 overflow-y-auto rounded-3xl bg-cream p-6 text-navy shadow-xl">
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
