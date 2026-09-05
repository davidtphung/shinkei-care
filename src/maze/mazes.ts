import type { CellKind, GhostKind, MazeGrid, Pickup } from '@/maze/types.ts'
import type { LevelId } from '@/game/types.ts'

const KINDS: GhostKind[] = ['heat', 'delay', 'bacteria', 'rough']

const L1 = `
###################
#........#........#
#o##.###.#.###.##o#
#.................#
#.##.#.#####.#.##.#
#....#...P...#....#
###.##.#.D.#.##.###
#......#12n#......#
###.##.#####.##.###
#....#.......#....#
#.##.#.#####.#.##.#
#........!........#
#o##.###.#.###.##o#
#........#........#
###################
`

const L2 = `
###################
#o....+....+....o.#
#.##.##.#.##.##.#.#
#.................#
#.###.#...#.###.#.#
#.....#.P.#.....#o#
##.##.#nDn#.##.##.#
#.....#123#.......#
#o###.#####.###.o.#
#........!........#
##.##.#...#.##.##.#
#.....#...#.......#
#.##.###.#.###.##.#
#+.......#.......+#
###################
`

const L3 = `
###################
#a.......#.......b#
#o##.###.#.###.##o#
#........+........#
#.##.#.#####.#.##.#
#....#...P...#....#
###.##.#.D.#.##.###
#......#12n#......#
###.##.#34n#.##.###
#....#.#####.#....#
#.##.#...c...#.##.#
#........!........#
#o##.###.#.###.##o#
#d.......#.......e#
###################
`

const RAW: Record<LevelId, string> = { 1: L1, 2: L2, 3: L3 }

export function loadMaze(level: LevelId): MazeGrid {
  return parseMaze(RAW[level], level)
}

export function parseMaze(raw: string, level: LevelId): MazeGrid {
  const lines = raw.trim().split('\n').map((line) => line.replace(/\r$/, ''))
  const rows = lines.length
  const cols = lines[0]?.length ?? 0
  if (rows < 7 || cols < 7) throw new Error(`Maze ${level} is too small`)
  if (lines.some((line) => line.length !== cols)) {
    throw new Error(`Maze ${level} has uneven rows`)
  }

  const cells: CellKind[][] = []
  const pickups: (Pickup | null)[][] = []
  const gates: (string | null)[][] = []
  const ghosts: MazeGrid['ghosts'] = []
  const gateChars: { x: number; y: number; id: string }[] = []
  let player: { x: number; y: number } | null = null

  for (let y = 0; y < rows; y += 1) {
    const cellRow: CellKind[] = []
    const pickupRow: (Pickup | null)[] = []
    const gateRow: (string | null)[] = []
    for (let x = 0; x < cols; x += 1) {
      const ch = lines[y][x]
      let cell: CellKind = 'path'
      let pickup: Pickup | null = null
      let gate: string | null = null
      if (ch === '#') cell = 'wall'
      else if (ch === 'D' || ch === 'n' || ch === '1' || ch === '2' || ch === '3' || ch === '4') {
        cell = ch === 'D' ? 'door' : 'pen'
      } else if (ch === '.') pickup = 'dot'
      else if (ch === 'o') pickup = 'ice'
      else if (ch === '!') pickup = 'spike'
      else if (ch === '+') pickup = 'chain'
      else if (ch === 'P') player = { x, y }
      else if (ch === 'a' || ch === 'b' || ch === 'c' || ch === 'd' || ch === 'e') {
        pickup = 'gate'
        gate = ch
        gateChars.push({ x, y, id: ch })
      } else if (ch !== ' ') {
        throw new Error(`Maze ${level} has unknown tile "${ch}" at ${x},${y}`)
      }

      if (ch === '1' || ch === '2' || ch === '3' || ch === '4') {
        const index = Number(ch) - 1
        ghosts.push({ x, y, kind: KINDS[index] ?? 'heat' })
      }

      cellRow.push(cell)
      pickupRow.push(pickup)
      gateRow.push(gate)
    }
    cells.push(cellRow)
    pickups.push(pickupRow)
    gates.push(gateRow)
  }

  if (!player) throw new Error(`Maze ${level} needs a player start`)
  if (ghosts.length === 0) throw new Error(`Maze ${level} needs a ghost`)

  const gateOrder = [...gateChars].sort((a, b) => a.id.localeCompare(b.id)).map((g) => g.id)
  const grid: MazeGrid = { cols, rows, cells, pickups, gates, gateOrder, player, ghosts }
  const issues = validateMaze(grid)
  if (issues.length) throw new Error(`Maze ${level}: ${issues.join('; ')}`)
  return grid
}

export function cloneGrid(grid: MazeGrid): MazeGrid {
  return {
    cols: grid.cols,
    rows: grid.rows,
    cells: grid.cells.map((row) => [...row]),
    pickups: grid.pickups.map((row) => [...row]),
    gates: grid.gates.map((row) => [...row]),
    gateOrder: [...grid.gateOrder],
    player: { ...grid.player },
    ghosts: grid.ghosts.map((ghost) => ({ ...ghost })),
  }
}

export function playerWalkable(grid: MazeGrid, x: number, y: number): boolean {
  const cell = tile(grid, x, y)
  return cell === 'path'
}

export function ghostWalkable(grid: MazeGrid, x: number, y: number): boolean {
  const cell = tile(grid, x, y)
  return cell !== null && cell !== 'wall'
}

export function tile(grid: MazeGrid, x: number, y: number): CellKind | null {
  if (y < 0 || y >= grid.rows) return null
  const wrapped = wrapX(grid, x, y)
  if (wrapped === null) return null
  return grid.cells[y][wrapped]
}

export function wrapX(grid: MazeGrid, x: number, y: number): number | null {
  if (y < 0 || y >= grid.rows) return null
  if (x >= 0 && x < grid.cols) return x
  if (x === -1 && grid.cells[y][0] !== 'wall' && grid.cells[y][grid.cols - 1] !== 'wall') {
    return grid.cols - 1
  }
  if (x === grid.cols && grid.cells[y][0] !== 'wall' && grid.cells[y][grid.cols - 1] !== 'wall') {
    return 0
  }
  return null
}

function validateMaze(grid: MazeGrid): string[] {
  const issues: string[] = []
  const seen = new Set<string>()
  const queue = [grid.player]
  seen.add(`${grid.player.x},${grid.player.y}`)
  while (queue.length) {
    const cur = queue.pop()
    if (!cur) break
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = cur.x + dx
      const ny = cur.y + dy
      const wx = wrapX(grid, nx, ny)
      if (wx === null || ny < 0 || ny >= grid.rows) continue
      if (!playerWalkable(grid, wx, ny)) continue
      const key = `${wx},${ny}`
      if (seen.has(key)) continue
      seen.add(key)
      queue.push({ x: wx, y: ny })
    }
  }

  let dots = 0
  for (let y = 0; y < grid.rows; y += 1) {
    for (let x = 0; x < grid.cols; x += 1) {
      const pickup = grid.pickups[y][x]
      if (!pickup) continue
      if (pickup === 'dot') dots += 1
      if (!seen.has(`${x},${y}`)) issues.push(`${pickup} at ${x},${y} is unreachable`)
    }
  }
  if (dots < 8) issues.push('needs more freshness dots')
  if (grid.gateOrder.length && grid.gateOrder.join('') !== 'abcde'.slice(0, grid.gateOrder.length)) {
    issues.push('gates must be a, b, c in order')
  }
  return issues
}

loadMaze(1)
loadMaze(2)
loadMaze(3)
