import * as Dialog from '@radix-ui/react-dialog'
import { Mascot } from '@/components/Mascot.tsx'
import { MuteToggle } from '@/components/MuteToggle.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { Button } from '@/components/ui/button.tsx'
import { copy } from '@/game/copy.ts'
import { hubCopy } from '@/game/hubCopy.ts'
import { bestEntry, overallBest, type Boards } from '@/game/leaderboard.ts'
import type { ArcadeMode } from '@/game/mode.ts'
import { formatRaceTime } from '@/game/time.ts'
import { usePressed } from '@/hooks/usePressed.ts'
import { CoolWater } from '@/motion/CoolWater.tsx'

type Props = {
  boards: Boards
  onMode: (mode: ArcadeMode) => void
}

export function HubScreen({ boards, onMode }: Props) {
  const care = bestEntry('care') ?? boards.care[0] ?? null
  const maze = bestEntry('maze') ?? boards.maze[0] ?? null
  const top = overallBest(boards)

  return (
    <div className="sere-screen flex min-h-[100dvh] flex-col justify-between gap-8">
      <MuteToggle className="sere-sound-inline" />
      <CoolWater />
      <div className="relative z-[1]">
        <PageHeader
          title={hubCopy.wordmark}
          line={hubCopy.tagline}
          display
          note={
            <>
              <p className="mt-3 text-sm font-semibold tracking-[0.16em] text-navy/80 uppercase">{hubCopy.careScore}</p>
              {top ? (
                <p className="mt-2 text-sm text-navy tabular-nums">
                  {hubCopy.overallLine(
                    top.game === 'care' ? hubCopy.careName : hubCopy.mazeName,
                    top.entry.name,
                    top.entry.score,
                    formatRaceTime(top.entry.timeMs),
                  )}
                </p>
              ) : (
                <p className="mt-2 text-sm text-navy/80">{hubCopy.firstScore}</p>
              )}
            </>
          }
        />
      </div>

      <div className="sere-float relative z-[1] flex justify-center">
        <Mascot size={120} />
      </div>

      <div className="sere-stagger relative z-[1] flex flex-col gap-4">
        <GameCard
          title={hubCopy.careName}
          blurb={hubCopy.careBlurb}
          best={care ? `${copy.bestScore(care.score)} · ${copy.bestTimeValue(formatRaceTime(care.timeMs))}` : null}
          label={hubCopy.playCare}
          onClick={() => onMode('care')}
        />
        <GameCard
          title={hubCopy.mazeName}
          blurb={hubCopy.mazeBlurb}
          best={maze ? `${copy.bestScore(maze.score)} · ${copy.bestTimeValue(formatRaceTime(maze.timeMs))}` : null}
          label={hubCopy.playMaze}
          onClick={() => onMode('maze')}
        />
        <HowArcade />
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

function GameCard({
  title,
  blurb,
  best,
  label,
  onClick,
}: {
  title: string
  blurb: string
  best: string | null
  label: string
  onClick: () => void
}) {
  const { pressed, pressProps } = usePressed()

  return (
    <button
      type="button"
      {...pressProps}
      data-pressed={pressed ? 'true' : 'false'}
      onClick={onClick}
      aria-label={label}
      className="sere-card hit-target pressable min-h-12 w-full px-4 py-4 text-left text-navy"
    >
      <span className="block text-lg font-semibold">{title}</span>
      <span className="block text-sm text-navy/75">{blurb}</span>
      {best ? <span className="mt-1 block text-sm font-semibold tabular-nums">{best}</span> : null}
    </button>
  )
}

function HowArcade() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline" className="w-full">
          {hubCopy.howTo}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/70" />
        <Dialog.Content className="sere-surface fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[min(80dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem))] max-w-md -translate-y-1/2 overflow-y-auto p-6 text-navy">
          <Dialog.Title className="text-2xl font-semibold">{hubCopy.howTo}</Dialog.Title>
          <Dialog.Description className="sr-only">{hubCopy.howTitle}</Dialog.Description>
          <h3 className="mt-4 text-lg font-semibold">{hubCopy.howTitle}</h3>
          <ul className="mt-3 space-y-3 text-base">
            {hubCopy.howMda.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <h3 className="mt-6 text-lg font-semibold">{hubCopy.howGamesTitle}</h3>
          <ul className="mt-3 space-y-3 text-base">
            {hubCopy.howGames.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <Dialog.Close asChild>
            <Button className="mt-6 w-full">{hubCopy.howToClose}</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
