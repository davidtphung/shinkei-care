import type { LevelId } from '@/game/types.ts'

export type BoardId = 'care' | 'maze'

export type ScoreEntry = {
  id: string
  name: string
  score: number
  timeMs: number
  level: LevelId
  at: number
}

export type Boards = {
  care: ScoreEntry[]
  maze: ScoreEntry[]
  lastName: string
}

const KEY = 'shinkei-sere-boards'
const MAX = 10
const NAME_MIN = 3
const NAME_MAX = 12

const empty: Boards = {
  care: [],
  maze: [],
  lastName: '',
}

function parse(raw: string | null): Boards {
  if (!raw) return { care: [], maze: [], lastName: '' }
  try {
    const data = JSON.parse(raw) as Partial<Boards>
    return {
      care: sanitizeList(data.care),
      maze: sanitizeList(data.maze),
      lastName: sanitizeName(typeof data.lastName === 'string' ? data.lastName : ''),
    }
  } catch {
    return { care: [], maze: [], lastName: '' }
  }
}

function sanitizeList(value: unknown): ScoreEntry[] {
  if (!Array.isArray(value)) return []
  const rows: ScoreEntry[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const row = item as Partial<ScoreEntry>
    const name = sanitizeName(typeof row.name === 'string' ? row.name : '')
    const score = Number(row.score)
    const timeMs = Number(row.timeMs)
    const level = row.level === 2 || row.level === 3 ? row.level : 1
    const at = Number(row.at)
    if (!validName(name) || !Number.isFinite(score) || score <= 0) continue
    if (!Number.isFinite(timeMs) || timeMs <= 0) continue
    rows.push({
      id: typeof row.id === 'string' && row.id ? row.id : makeId(),
      name,
      score: Math.round(score),
      timeMs: Math.round(timeMs),
      level,
      at: Number.isFinite(at) && at > 0 ? at : Date.now(),
    })
  }
  return sortBoard(rows).slice(0, MAX)
}

function sortBoard(rows: ScoreEntry[]): ScoreEntry[] {
  return [...rows].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs
    return a.at - b.at
  })
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function sanitizeName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX)
}

export function validName(name: string): boolean {
  return name.length >= NAME_MIN && name.length <= NAME_MAX && /^[A-Za-z0-9 ]+$/.test(name)
}

export function readBoards(): Boards {
  try {
    return parse(localStorage.getItem(KEY))
  } catch {
    return { care: [], maze: [], lastName: '' }
  }
}

function save(next: Boards): Boards {
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    return next
  }
  return next
}

export function readLastName(): string {
  return readBoards().lastName
}

export function writeLastName(name: string): void {
  const clean = sanitizeName(name)
  if (!validName(clean)) return
  const boards = readBoards()
  save({ ...boards, lastName: clean })
}

export function boardOf(boards: Boards, game: BoardId): ScoreEntry[] {
  return game === 'care' ? boards.care : boards.maze
}

export function qualifiesForBoard(game: BoardId, score: number): boolean {
  const rows = boardOf(readBoards(), game)
  if (rows.length < MAX) return score > 0
  const floor = rows[rows.length - 1]?.score ?? 0
  return score > floor
}

export function submitScore(input: {
  game: BoardId
  name: string
  score: number
  timeMs: number
  level: LevelId
}): { boards: Boards; rank: number; saved: boolean } {
  const name = sanitizeName(input.name)
  if (!validName(name) || input.score <= 0) {
    return { boards: readBoards(), rank: 0, saved: false }
  }
  const entry: ScoreEntry = {
    id: makeId(),
    name,
    score: Math.round(input.score),
    timeMs: Math.max(1, Math.round(input.timeMs)),
    level: input.level,
    at: Date.now(),
  }
  const prev = readBoards()
  const nextList = sortBoard([...boardOf(prev, input.game), entry]).slice(0, MAX)
  const saved = nextList.some((row) => row.id === entry.id)
  const boards = save({
    ...prev,
    lastName: name,
    [input.game]: nextList,
  })
  const rank = saved ? nextList.findIndex((row) => row.id === entry.id) + 1 : 0
  return { boards, rank, saved }
}

export function bestEntry(game: BoardId): ScoreEntry | null {
  return boardOf(readBoards(), game)[0] ?? null
}

export function overallBest(boards: Boards = readBoards()): { game: BoardId; entry: ScoreEntry } | null {
  const care = boards.care[0]
  const maze = boards.maze[0]
  if (!care && !maze) return null
  if (!care) return { game: 'maze', entry: maze }
  if (!maze) return { game: 'care', entry: care }
  if (maze.score > care.score) return { game: 'maze', entry: maze }
  if (care.score > maze.score) return { game: 'care', entry: care }
  if (maze.timeMs < care.timeMs) return { game: 'maze', entry: maze }
  return { game: 'care', entry: care }
}

export function formatBoardText(boards: Boards = readBoards()): string {
  const lines = ['Sere leaderboard', '']
  for (const game of ['care', 'maze'] as const) {
    lines.push(game === 'care' ? 'Care' : 'Catch')
    const rows = boardOf(boards, game)
    if (rows.length === 0) {
      lines.push('No scores yet.')
    } else {
      rows.forEach((row, index) => {
        const time = formatPlainTime(row.timeMs)
        const date = new Date(row.at).toISOString().slice(0, 10)
        lines.push(`${index + 1}. ${row.name}  ${row.score}  ${time}  L${row.level}  ${date}`)
      })
    }
    lines.push('')
  }
  return lines.join('\n').trim() + '\n'
}

function formatPlainTime(ms: number): string {
  const safe = Math.max(0, ms)
  const tenths = Math.floor(safe / 100) % 10
  const totalSeconds = Math.floor(safe / 1000)
  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths}`
}

export function emptyBoards(): Boards {
  return { ...empty, care: [], maze: [] }
}
