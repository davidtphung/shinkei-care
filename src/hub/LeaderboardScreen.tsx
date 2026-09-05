import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { levelName } from '@/game/copy.ts'
import { hubCopy } from '@/game/hubCopy.ts'
import { formatBoardText, overallBest, type BoardId, type Boards, type ScoreEntry } from '@/game/leaderboard.ts'
import { formatRaceTime } from '@/game/time.ts'

type Props = {
  boards: Boards
  onHub: () => void
  onCare: () => void
  onMaze: () => void
}

export function LeaderboardScreen({ boards, onHub, onCare, onMaze }: Props) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const top = overallBest(boards)

  const copyText = async () => {
    const text = formatBoardText(boards)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setCopyError(false)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopyError(true)
    }
  }

  return (
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-lg min-w-0 flex-col overflow-x-hidden pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.25rem))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))]">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.28em] text-navy uppercase">{hubCopy.kicker}</p>
        <p className="wordmark font-display mt-2 text-[clamp(2.8rem,14vw,4rem)] leading-none text-cream drop-shadow-[0_2px_0_#0B1424] outline-none">
          {hubCopy.wordmark}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy">{hubCopy.boardName}</h1>
        <p className="mt-2 text-sm text-navy/80">{hubCopy.boardBlurb}</p>
        {top ? (
          <p className="mt-3 text-sm font-semibold text-navy tabular-nums">
            {hubCopy.overall}:{' '}
            {hubCopy.overallLine(
              top.game === 'care' ? hubCopy.careName : hubCopy.mazeName,
              top.entry.name,
              top.entry.score,
              formatRaceTime(top.entry.timeMs),
            )}
          </p>
        ) : null}
      </div>

      <BoardTable title={hubCopy.careName} rows={boards.care} />
      <BoardTable title={hubCopy.mazeName} rows={boards.maze} />

      <div className="mt-6 space-y-2">
        <Button className="w-full" onClick={copyText}>
          {copied ? hubCopy.copied : hubCopy.copyBoard}
        </Button>
        {copyError ? <p className="text-center text-sm text-navy">{hubCopy.copyFail}</p> : null}
        <Button variant="outline" className="w-full" onClick={onCare}>
          {hubCopy.playCare}
        </Button>
        <Button variant="outline" className="w-full" onClick={onMaze}>
          {hubCopy.playMaze}
        </Button>
        <Button variant="outline" className="w-full" onClick={onHub}>
          {hubCopy.backHub}
        </Button>
      </div>
    </div>
  )
}

function BoardTable({ title, rows }: { title: string; rows: ScoreEntry[] }) {
  return (
    <section className="panel mt-6 rounded-3xl border-4 border-navy bg-cream p-4 text-navy">
      <h2 className="text-xl font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm">{hubCopy.emptyBoard}</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <thead>
              <tr className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-navy/70">
                <th className="pb-2 pr-2">{hubCopy.rank}</th>
                <th className="pb-2 pr-2">{hubCopy.name}</th>
                <th className="pb-2 pr-2">{hubCopy.quality}</th>
                <th className="pb-2 pr-2">{hubCopy.time}</th>
                <th className="pb-2 pr-2">{hubCopy.level}</th>
                <th className="pb-2">{hubCopy.date}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="tabular-nums">
                  <td className="py-1.5 pr-2 font-semibold">{index + 1}</td>
                  <td className="py-1.5 pr-2 font-semibold">{row.name}</td>
                  <td className="py-1.5 pr-2">{row.score}</td>
                  <td className="py-1.5 pr-2">{formatRaceTime(row.timeMs)}</td>
                  <td className="py-1.5 pr-2">{levelName(row.level)}</td>
                  <td className="py-1.5">{new Date(row.at).toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export const boardIdLabel: Record<BoardId, string> = {
  care: hubCopy.careName,
  maze: hubCopy.mazeName,
}
