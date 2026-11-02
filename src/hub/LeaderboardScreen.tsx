import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader.tsx'
import { Button } from '@/components/ui/button.tsx'
import { levelName } from '@/game/copy.ts'
import { hubCopy } from '@/game/hubCopy.ts'
import {
  BOARD_PREVIEW,
  formatBoardText,
  formatSavedAt,
  overallBest,
  visibleRuns,
  type BoardId,
  type BoardSort,
  type Boards,
  type ScoreEntry,
} from '@/game/leaderboard.ts'
import { formatRaceTime } from '@/game/time.ts'

type Props = {
  boards: Boards
  onHub: () => void
  onCare: () => void
  onMaze: () => void
  startExpanded?: boolean
  startSort?: BoardSort
}

export function LeaderboardScreen({
  boards,
  onHub,
  onCare,
  onMaze,
  startExpanded = false,
  startSort = 'best',
}: Props) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const [expanded, setExpanded] = useState(startExpanded)
  const [sort, setSort] = useState<BoardSort>(startSort)
  const top = overallBest(boards)
  const canExpand = boards.care.length > BOARD_PREVIEW || boards.maze.length > BOARD_PREVIEW
  const showingAll = expanded || !canExpand
  const orderLead = sort === 'newest' ? hubCopy.sortNewestLead : hubCopy.sortBestLead

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
    <div className="sere-screen flex min-h-[100dvh] flex-col gap-2">
      <PageHeader title={hubCopy.boardName} line={hubCopy.boardBlurb} />
      {top ? (
        <p className="mt-3 text-center text-sm font-semibold text-navy tabular-nums">
          {hubCopy.overall}:{' '}
          {hubCopy.overallLine(
            top.game === 'care' ? hubCopy.careName : hubCopy.mazeName,
            top.entry.name,
            top.entry.score,
            formatRaceTime(top.entry.timeMs),
          )}
        </p>
      ) : null}

      <div className="sere-surface mt-6 flex flex-col gap-3 p-4">
        <div role="group" aria-label={hubCopy.sortRuns} className="flex gap-2">
          <Button
            variant={sort === 'best' ? 'primary' : 'outline'}
            className="min-h-11 flex-1"
            aria-pressed={sort === 'best'}
            data-testid="board-sort-best"
            onClick={() => setSort('best')}
          >
            {hubCopy.sortBest}
          </Button>
          <Button
            variant={sort === 'newest' ? 'primary' : 'outline'}
            className="min-h-11 flex-1"
            aria-pressed={sort === 'newest'}
            data-testid="board-sort-newest"
            onClick={() => setSort('newest')}
          >
            {hubCopy.sortNewest}
          </Button>
        </div>
        {canExpand ? (
          <Button
            variant="outline"
            className="min-h-11 w-full"
            aria-expanded={expanded}
            aria-controls="sere-board-care sere-board-catch"
            data-testid="board-show-all"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? hubCopy.showTop : hubCopy.showAll}
          </Button>
        ) : null}
        <p className="text-center text-sm text-navy" role="status" aria-live="polite">
          {boardStatus(boards, sort, showingAll, orderLead)}
        </p>
      </div>

      <BoardList
        id="sere-board-care"
        title={hubCopy.careName}
        mode={hubCopy.careName}
        rows={boards.care}
        sort={sort}
        expanded={showingAll}
      />
      <BoardList
        id="sere-board-catch"
        title={hubCopy.mazeName}
        mode={hubCopy.mazeName}
        rows={boards.maze}
        sort={sort}
        expanded={showingAll}
      />

      <div className="sere-stagger mt-6 flex flex-col gap-3">
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

function boardStatus(boards: Boards, sort: BoardSort, expanded: boolean, orderLead: string): string {
  const careShown = visibleRuns(boards.care, sort, expanded).length
  const mazeShown = visibleRuns(boards.maze, sort, expanded).length
  return `${hubCopy.careName} ${careShown} of ${boards.care.length}. ${hubCopy.mazeName} ${mazeShown} of ${boards.maze.length}. ${orderLead}.`
}

function BoardList({
  id,
  title,
  mode,
  rows,
  sort,
  expanded,
}: {
  id: string
  title: string
  mode: string
  rows: ScoreEntry[]
  sort: BoardSort
  expanded: boolean
}) {
  const visible = visibleRuns(rows, sort, expanded)
  const rankOf = new Map(visibleRuns(rows, 'best', true).map((row, index) => [row.id, index + 1]))
  const scroll = expanded && rows.length > BOARD_PREVIEW

  return (
    <section className="sere-surface mt-6 p-4 text-navy" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-xl font-semibold">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm">{hubCopy.emptyBoard}</p>
      ) : (
        <div
          id={id}
          data-testid={id}
          className={scroll ? 'mt-3 max-h-80 overflow-auto overscroll-contain' : 'mt-3'}
          tabIndex={scroll ? 0 : undefined}
          role="region"
          aria-label={`${title} runs`}
        >
          <ul className="flex flex-col gap-2">
            {visible.map((row) => (
              <li
                key={row.id}
                data-testid="board-row"
                data-mode={mode}
                className="rounded-[20px] border border-navy/10 px-3 py-3"
              >
                <p className="flex items-baseline justify-between gap-3 text-base font-semibold">
                  <span>
                    <span className="sr-only">{hubCopy.rank} </span>
                    {rankOf.get(row.id)}. {row.name}
                  </span>
                  <span className="tabular-nums">
                    <span className="sr-only">{hubCopy.quality} </span>
                    {row.score}
                  </span>
                </p>
                <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  <span>
                    <span className="font-semibold">{hubCopy.mode}</span> {mode}
                  </span>
                  <span className="tabular-nums">
                    <span className="font-semibold">{hubCopy.time}</span> {formatRaceTime(row.timeMs)}
                  </span>
                  <span>
                    <span className="font-semibold">{hubCopy.level}</span> {levelName(row.level)}
                  </span>
                </p>
                <p className="mt-1 text-sm tabular-nums">
                  <span className="font-semibold">{hubCopy.date}</span> {formatSavedAt(row.at)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export const boardIdLabel: Record<BoardId, string> = {
  care: hubCopy.careName,
  maze: hubCopy.mazeName,
}
