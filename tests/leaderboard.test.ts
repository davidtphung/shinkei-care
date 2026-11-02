import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { hubCopy } from '../src/game/hubCopy.ts'
import {
  formatBoardText,
  formatSavedAt,
  qualifiesForBoard,
  readBoards,
  submitScore,
  visibleRuns,
  type ScoreEntry,
} from '../src/game/leaderboard.ts'
import { LeaderboardScreen } from '../src/hub/LeaderboardScreen.tsx'
import { NamePrompt } from '../src/hub/NamePrompt.tsx'

const KEY = 'shinkei-sere-boards'

const memory = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value)
    },
    removeItem: (key: string) => {
      memory.delete(key)
    },
    clear: () => {
      memory.clear()
    },
  },
})

function row(id: string, score: number, at: number, name = id): ScoreEntry {
  return { id, name, score, timeMs: 1000 + score, level: 1, at }
}

function seed(care: ScoreEntry[], maze: ScoreEntry[] = []) {
  memory.set(KEY, JSON.stringify({ care, maze, lastName: 'SER' }))
}

const banned = /\u2014|\u2013|\bdead\b|\bharm\b|\bfailure\b|\bmiss\b|\brot\b|\bsour\b|\bskipped\b/i

describe('score history storage', () => {
  it('keeps every stored run, including scores outside a top ten', () => {
    const care = Array.from({ length: 12 }, (_, index) =>
      row(`care-${index + 1}`, 1200 - index * 10, 1_700_000_000_000 + index * 1000, `CARE ${index + 1}`),
    )
    care.push({ id: 'drop', name: 'NO', score: 0, timeMs: 1000, level: 1, at: 1_700_000_000_000 })
    seed(care, [row('maze-1', 50, 1_700_000_000_000, 'MAZE ONE')])

    const boards = readBoards()
    assert.equal(boards.care.length, 12)
    assert.equal(boards.care.some((entry) => entry.id === 'care-12'), true)
    assert.equal(boards.care.some((entry) => entry.id === 'drop'), false)
    assert.equal(boards.care[0]?.id, 'care-1')
    assert.equal(boards.maze.length, 1)
    assert.equal(qualifiesForBoard('care', 1), true)

    const saved = submitScore({ game: 'care', name: 'LOW RUN', score: 5, timeMs: 4000, level: 2 })
    assert.equal(saved.saved, true)
    assert.equal(saved.boards.care.length, 13)
    assert.equal(saved.boards.care.some((entry) => entry.name === 'LOW RUN'), true)
    assert.equal(saved.boards.care.some((entry) => entry.id === 'care-12'), true)
    assert.equal(readBoards().care.length, 13)
  })

  it('sorts the full list by best or newest and previews ten', () => {
    const rows = [
      row('a', 10, 3000, 'OLDER'),
      row('b', 30, 1000, 'BEST'),
      row('c', 20, 2000, 'MID'),
    ]
    assert.deepEqual(
      visibleRuns(rows, 'best', false).map((entry) => entry.name),
      ['BEST', 'MID', 'OLDER'],
    )
    assert.deepEqual(
      visibleRuns(rows, 'newest', true).map((entry) => entry.name),
      ['OLDER', 'MID', 'BEST'],
    )
    const many = Array.from({ length: 12 }, (_, index) => row(`n${index}`, index + 1, index + 1))
    assert.equal(visibleRuns(many, 'best', false).length, 10)
    assert.equal(visibleRuns(many, 'newest', true).length, 12)
    assert.equal(visibleRuns(many, 'newest', true)[0]?.id, 'n11')
  })

  it('writes the date and clock for every saved row', () => {
    const at = Date.UTC(2026, 10, 2, 15, 4)
    const boards = {
      care: [row('care-1', 80, at, 'ADA')],
      maze: [] as ScoreEntry[],
      lastName: 'ADA',
    }
    const text = formatBoardText(boards)
    assert.match(text, /ADA/)
    assert.match(text, /80/)
    assert.match(text, new RegExp(formatSavedAt(at).replace(/[.]/g, '\\.')))
    assert.match(formatSavedAt(at), /Nov 2, 2026, \d{1,2}:04 (AM|PM)/)
    assert.equal(banned.test(text), false)
  })
})

describe('leaderboard history screen', () => {
  it('opens on the top scores and can show every run', () => {
    const care = Array.from({ length: 12 }, (_, index) =>
      row(`care-${index + 1}`, 1200 - index * 10, 1_700_000_000_000 + index * 1000, `CARE ${index + 1}`),
    )
    const maze = [row('maze-1', 40, 1_700_000_000_000, 'MAZE ONE')]
    const boards = { care, maze, lastName: 'SER' }
    const collapsed = renderToStaticMarkup(
      createElement(LeaderboardScreen, { boards, onHub: () => {}, onCare: () => {}, onMaze: () => {} }),
    )
    assert.match(collapsed, /aria-expanded="false"/)
    assert.match(collapsed, />Show all</)
    assert.match(collapsed, /aria-pressed="true"/)
    assert.match(collapsed, />Best</)
    assert.match(collapsed, />Newest</)
    assert.match(collapsed, /Care 10 of 12\. Catch 1 of 1\. Best first\./)
    assert.equal((collapsed.match(/data-testid="board-row"/g) ?? []).length, 11)
    assert.match(collapsed, /Mode/)
    assert.match(collapsed, />Care</)
    assert.match(collapsed, /CARE 1/)
    assert.equal(collapsed.includes('CARE 12'), false)
    assert.match(collapsed, /Date/)
    assert.equal(collapsed.includes('tabindex="0"'), false)

    const expanded = renderToStaticMarkup(
      createElement(LeaderboardScreen, {
        boards,
        onHub: () => {},
        onCare: () => {},
        onMaze: () => {},
        startExpanded: true,
        startSort: 'newest',
      }),
    )
    assert.match(expanded, /aria-expanded="true"/)
    assert.match(expanded, />Show top scores</)
    assert.match(expanded, /aria-pressed="true"/)
    assert.match(expanded, /Care 12 of 12\. Catch 1 of 1\. Newest first\./)
    assert.match(expanded, /CARE 12/)
    assert.match(expanded, /tabindex="0"/)
    assert.match(expanded, /role="region"/)
    assert.equal(banned.test(collapsed), false)
    assert.equal(banned.test(expanded), false)
    assert.equal([...collapsed].some((char) => char.charCodeAt(0) === 8212 || char.charCodeAt(0) === 8211), false)
  })

  it('names a personal best and a later run differently', () => {
    const best = renderToStaticMarkup(createElement(NamePrompt, { best: true, onSave: () => {}, onSkip: () => {} }))
    const later = renderToStaticMarkup(createElement(NamePrompt, { best: false, onSave: () => {}, onSkip: () => {} }))
    assert.match(best, />New best</)
    assert.match(later, />Save this run</)
    assert.equal(later.includes('New best'), false)
    assert.equal(banned.test(`${hubCopy.saveRunTitle} ${hubCopy.showAll} ${hubCopy.boardBlurb}`), false)
  })
})
