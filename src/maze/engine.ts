import { FRESHNESS_MAX } from '@/game/puzzles.ts'
import type { LevelId } from '@/game/types.ts'
import { cloneGrid, ghostWalkable, loadMaze, playerWalkable, wrapX } from '@/maze/mazes.ts'
import type { Actor, Dir, Ghost, MazeState } from '@/maze/types.ts'
import { DIR_VEC, DIRS, OPPOSITE } from '@/maze/types.ts'
import { mazeCopy } from '@/maze/copy.ts'

const PLAYER_SPEED = 6.2
const CENTER = 0.16
const HIT_RANGE = 0.48
const FRIGHTEN = 6
const ICE_SLOW = 5
const CHAIN = 5
const HIT_STUN = 1.35

function ghostSpeed(level: LevelId): number {
  if (level === 1) return 3.8
  if (level === 2) return 4.8
  return 5.6
}

function drainEvery(level: LevelId): number {
  if (level === 1) return 0
  if (level === 2) return 16
  return 12
}

function hitDrain(level: LevelId): number {
  return level === 1 ? 1 : 2
}

export function createMaze(level: LevelId, reduced: boolean): MazeState {
  const grid = cloneGrid(loadMaze(level))
  let dots = 0
  let gates = 0
  for (const row of grid.pickups) {
    for (const pickup of row) {
      if (pickup === 'dot') dots += 1
      if (pickup === 'gate') gates += 1
    }
  }
  const ghosts: Ghost[] = grid.ghosts.map((spawn, index) => ({
    x: spawn.x,
    y: spawn.y,
    dir: 'up',
    kind: spawn.kind,
    homeX: spawn.x,
    homeY: spawn.y,
    eaten: false,
    leaveIn: 1.6 + index * 1.6,
  }))

  return {
    level,
    grid,
    player: { x: grid.player.x, y: grid.player.y, dir: 'left' },
    desired: 'left',
    ghosts,
    freshness: FRESHNESS_MAX,
    freshnessMax: FRESHNESS_MAX,
    score: 0,
    combo: 0,
    ghostChain: 0,
    elapsed: 0,
    phase: 'ready',
    announcement: mazeCopy.readyLead[level - 1],
    frightenLeft: 0,
    iceSlowLeft: 0,
    chainLeft: 0,
    hitLeft: 0,
    drainAcc: 0,
    nextGate: 0,
    dotsLeft: dots,
    dotsTotal: dots,
    gatesLeft: gates,
    ignoreTile: null,
    reduced,
  }
}

export function queueDir(state: MazeState, dir: Dir): void {
  state.desired = dir
  if (state.phase === 'ready') startRun(state)
}

export function startRun(state: MazeState): void {
  if (state.phase !== 'ready') return
  state.phase = 'play'
  state.announcement = mazeCopy.readyTeach[state.level - 1]
}

export function togglePause(state: MazeState): void {
  if (state.phase === 'play') {
    state.phase = 'pause'
    return
  }
  if (state.phase === 'pause') state.phase = 'play'
}

export function stepMaze(state: MazeState, dt: number): void {
  if (state.phase !== 'play' && state.phase !== 'hit') return
  const capped = Math.min(0.05, Math.max(0, dt))
  state.elapsed += capped * 1000

  if (state.phase === 'hit') {
    state.hitLeft -= capped
    if (state.hitLeft <= 0) {
      state.phase = state.freshness <= 0 ? 'over' : 'play'
      state.announcement = state.freshness <= 0 ? mazeCopy.over : mazeCopy.hit
    }
    return
  }

  state.frightenLeft = Math.max(0, state.frightenLeft - capped)
  state.iceSlowLeft = Math.max(0, state.iceSlowLeft - capped)
  state.chainLeft = Math.max(0, state.chainLeft - capped)

  const drain = drainEvery(state.level)
  if (drain > 0) {
    state.drainAcc += capped
    if (state.drainAcc >= drain) {
      state.drainAcc = 0
      loseFreshness(state, 1, mazeCopy.drain)
      if (state.phase !== 'play') return
    }
  }

  const pSpeed = PLAYER_SPEED * (state.chainLeft > 0 ? 1.32 : 1)
  stepActor(state, state.player, state.desired, pSpeed * capped, false)
  collectAt(state)

  if (state.dotsLeft <= 0 && state.gatesLeft <= 0) {
    finishClear(state)
    return
  }

  const base = ghostSpeed(state.level)
  for (const ghost of state.ghosts) {
    stepGhost(state, ghost, capped, base)
  }

  if (state.hitLeft > 0) return
  resolveHits(state)
}

function stepActor(state: MazeState, actor: Actor, desired: Dir, dist: number, asGhost: boolean): void {
  const centered = nearCenter(actor.x) && nearCenter(actor.y)
  if (centered || desired === OPPOSITE[actor.dir]) {
    if (canStep(state, actor, desired, asGhost)) actor.dir = desired
  }
  if (!canStep(state, actor, actor.dir, asGhost)) {
    actor.x = Math.round(actor.x)
    actor.y = Math.round(actor.y)
    return
  }
  const vec = DIR_VEC[actor.dir]
  if (vec.x !== 0) actor.y = Math.round(actor.y)
  if (vec.y !== 0) actor.x = Math.round(actor.x)
  actor.x += vec.x * dist
  actor.y += vec.y * dist
  wrapActor(state, actor)
  stopAtWall(state, actor, asGhost)
}

function stopAtWall(state: MazeState, actor: Actor, asGhost: boolean): void {
  const tx = Math.round(actor.x)
  const ty = Math.round(actor.y)
  const vec = DIR_VEC[actor.dir]
  const aheadX = tx + vec.x
  const aheadY = ty + vec.y
  if (canEnter(state, aheadX, aheadY, asGhost)) return
  if (vec.x > 0 && actor.x > tx) actor.x = tx
  if (vec.x < 0 && actor.x < tx) actor.x = tx
  if (vec.y > 0 && actor.y > ty) actor.y = ty
  if (vec.y < 0 && actor.y < ty) actor.y = ty
}

function wrapActor(state: MazeState, actor: Actor): void {
  const cols = state.grid.cols
  if (actor.x < -0.5) actor.x += cols
  if (actor.x > cols - 0.5) actor.x -= cols
}

function canStep(state: MazeState, actor: Actor, dir: Dir, asGhost: boolean): boolean {
  const tx = Math.round(actor.x)
  const ty = Math.round(actor.y)
  const vec = DIR_VEC[dir]
  return canEnter(state, tx + vec.x, ty + vec.y, asGhost)
}

function canEnter(state: MazeState, x: number, y: number, asGhost: boolean): boolean {
  const wx = wrapX(state.grid, x, y)
  if (wx === null || y < 0 || y >= state.grid.rows) return false
  return asGhost ? ghostWalkable(state.grid, wx, y) : playerWalkable(state.grid, wx, y)
}

function nearCenter(value: number): boolean {
  return Math.abs(value - Math.round(value)) <= CENTER
}

function collectAt(state: MazeState): void {
  if (!nearCenter(state.player.x) || !nearCenter(state.player.y)) return
  const x = Math.round(state.player.x)
  const y = Math.round(state.player.y)
  const wx = wrapX(state.grid, x, y)
  if (wx === null) return
  const tileKey = `${wx},${y}`
  if (state.ignoreTile && state.ignoreTile !== tileKey) state.ignoreTile = null
  const pickup = state.grid.pickups[y][wx]
  if (!pickup) return
  if (state.ignoreTile === tileKey) return

  if (pickup === 'gate') {
    const expected = state.grid.gateOrder[state.nextGate]
    const actual = state.grid.gates[y][wx]
    if (actual !== expected) {
      state.combo = 0
      state.ignoreTile = tileKey
      state.freshness = Math.max(0, state.freshness - 1)
      state.announcement = mazeCopy.gateMiss
      if (state.freshness <= 0) {
        state.phase = 'over'
        state.announcement = mazeCopy.over
      }
      return
    }
    state.grid.pickups[y][wx] = null
    state.grid.gates[y][wx] = null
    state.nextGate += 1
    state.gatesLeft = Math.max(0, state.gatesLeft - 1)
    state.score += 100
    state.combo += 1
    state.announcement = mazeCopy.collectGate[state.nextGate - 1] ?? mazeCopy.collectGate[0]
    return
  }

  state.grid.pickups[y][wx] = null
  if (pickup === 'dot') {
    state.dotsLeft = Math.max(0, state.dotsLeft - 1)
    state.score += 10
    state.announcement = mazeCopy.collectDot
    return
  }
  if (pickup === 'ice') {
    state.score += 50
    state.freshness = Math.min(state.freshnessMax, state.freshness + 1)
    state.iceSlowLeft = ICE_SLOW
    state.combo += 1
    state.announcement = mazeCopy.collectIce
    return
  }
  if (pickup === 'spike') {
    state.score += 30
    state.frightenLeft = FRIGHTEN
    state.ghostChain = 0
    state.combo += 1
    state.announcement = mazeCopy.collectSpike
    return
  }
  state.score += 30
  state.chainLeft = CHAIN
  state.combo += 1
  state.announcement = mazeCopy.collectChain
}

function stepGhost(state: MazeState, ghost: Ghost, dt: number, base: number): void {
  if (ghost.leaveIn > 0 && !ghost.eaten) {
    ghost.leaveIn -= dt
    return
  }
  let speed = base
  if (ghost.eaten) speed = base * 2.1
  else if (state.frightenLeft > 0) speed = base * 0.52
  else if (state.iceSlowLeft > 0) speed = base * 0.58
  if (inTunnel(state, ghost)) speed *= 0.62

  const target = ghostTarget(state, ghost)
  const next = pickGhostDir(state, ghost, target)
  stepActor(state, ghost, next, speed * dt, true)

  if (ghost.eaten && Math.hypot(ghost.x - ghost.homeX, ghost.y - ghost.homeY) < 0.35) {
    ghost.eaten = false
    ghost.x = ghost.homeX
    ghost.y = ghost.homeY
    ghost.leaveIn = 0.8
  }
}

function inTunnel(state: MazeState, actor: Actor): boolean {
  const y = Math.round(actor.y)
  const x = Math.round(actor.x)
  return x <= 0 || x >= state.grid.cols - 1 || wrapX(state.grid, -1, y) !== null
}

function ghostTarget(state: MazeState, ghost: Ghost): { x: number; y: number } {
  if (ghost.eaten) return { x: ghost.homeX, y: ghost.homeY }
  const px = state.player.x
  const py = state.player.y
  const pdir = DIR_VEC[state.player.dir]
  const scatter = scatterCorner(state, ghost.kind)
  const frightened = state.frightenLeft > 0 && !ghost.eaten
  if (frightened) return scatter
  if (state.chainLeft > 0) return scatter

  const cycle = state.elapsed / 1000
  const scatterBeat = cycle < 6 || (cycle > 26 && cycle < 32)
  if (scatterBeat) return scatter

  if (ghost.kind === 'heat') return { x: px, y: py }
  if (ghost.kind === 'delay') return { x: px + pdir.x * 4, y: py + pdir.y * 4 }
  if (ghost.kind === 'bacteria') {
    const dist = Math.hypot(ghost.x - px, ghost.y - py)
    return dist > 8 ? { x: px, y: py } : scatter
  }
  const heat = state.ghosts.find((item) => item.kind === 'heat') ?? ghost
  return { x: px * 2 - heat.x, y: py * 2 - heat.y }
}

function scatterCorner(state: MazeState, kind: Ghost['kind']): { x: number; y: number } {
  const { cols, rows } = state.grid
  if (kind === 'heat') return { x: cols - 2, y: 1 }
  if (kind === 'delay') return { x: 1, y: 1 }
  if (kind === 'bacteria') return { x: 1, y: rows - 2 }
  return { x: cols - 2, y: rows - 2 }
}

function pickGhostDir(state: MazeState, ghost: Ghost, target: { x: number; y: number }): Dir {
  const centered = nearCenter(ghost.x) && nearCenter(ghost.y)
  if (!centered) return ghost.dir
  const reverse = OPPOSITE[ghost.dir]
  let best: Dir = ghost.dir
  let bestDist = Number.POSITIVE_INFINITY
  for (const dir of DIRS) {
    if (dir === reverse && !ghost.eaten) continue
    if (!canStep(state, ghost, dir, true)) continue
    const vec = DIR_VEC[dir]
    const nx = ghost.x + vec.x
    const ny = ghost.y + vec.y
    const dist = (nx - target.x) ** 2 + (ny - target.y) ** 2
    if (dist < bestDist) {
      bestDist = dist
      best = dir
    }
  }
  if (bestDist === Number.POSITIVE_INFINITY) return reverse
  return best
}

function resolveHits(state: MazeState): void {
  for (const ghost of state.ghosts) {
    if (Math.hypot(ghost.x - state.player.x, ghost.y - state.player.y) > HIT_RANGE) continue
    if (ghost.eaten) continue
    if (state.frightenLeft > 0) {
      ghost.eaten = true
      state.ghostChain += 1
      const prize = 200 * 2 ** Math.min(3, state.ghostChain - 1)
      state.score += prize
      state.combo += 1
      state.announcement = mazeCopy.eatGhost
      continue
    }
    loseFreshness(state, hitDrain(state.level), mazeCopy.hit)
    ghost.eaten = true
    return
  }
}

function loseFreshness(state: MazeState, amount: number, message: string): void {
  state.freshness = Math.max(0, state.freshness - amount)
  state.combo = 0
  state.announcement = message
  state.hitLeft = HIT_STUN
  state.phase = state.freshness <= 0 ? 'over' : 'hit'
  if (state.phase === 'over') state.announcement = mazeCopy.over
}

function finishClear(state: MazeState): void {
  state.phase = 'clear'
  state.score += state.freshness * 50 + state.level * 80
  state.announcement = mazeCopy.clear
}

export function qualityFor(state: MazeState): number {
  return state.score
}
