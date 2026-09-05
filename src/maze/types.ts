import type { LevelId } from '@/game/types.ts'

export type Dir = 'up' | 'down' | 'left' | 'right'

export type GhostKind = 'heat' | 'delay' | 'bacteria' | 'rough'

export type CellKind = 'wall' | 'path' | 'pen' | 'door'

export type Pickup = 'dot' | 'ice' | 'spike' | 'chain' | 'gate'

export type Actor = {
  x: number
  y: number
  dir: Dir
}

export type Ghost = Actor & {
  kind: GhostKind
  homeX: number
  homeY: number
  eaten: boolean
  leaveIn: number
}

export type MazeGrid = {
  cols: number
  rows: number
  cells: CellKind[][]
  pickups: (Pickup | null)[][]
  gates: (string | null)[][]
  gateOrder: string[]
  player: { x: number; y: number }
  ghosts: { x: number; y: number; kind: GhostKind }[]
}

export type Phase = 'ready' | 'play' | 'hit' | 'clear' | 'over' | 'pause'

export type MazeState = {
  level: LevelId
  grid: MazeGrid
  player: Actor
  desired: Dir
  ghosts: Ghost[]
  freshness: number
  freshnessMax: number
  score: number
  combo: number
  ghostChain: number
  elapsed: number
  phase: Phase
  announcement: string
  frightenLeft: number
  iceSlowLeft: number
  chainLeft: number
  hitLeft: number
  drainAcc: number
  nextGate: number
  dotsLeft: number
  dotsTotal: number
  gatesLeft: number
  ignoreTile: string | null
  reduced: boolean
}

export const DIRS: Dir[] = ['up', 'left', 'down', 'right']

export const DIR_VEC: Record<Dir, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

export const OPPOSITE: Record<Dir, Dir> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}
