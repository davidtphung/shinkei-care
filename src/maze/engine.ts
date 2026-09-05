import { FRESHNESS_MAX } from '@/game/puzzles.ts'
import type { LevelId } from '@/game/types.ts'
import { mazeCopy } from '@/maze/copy.ts'
import {
  BOAT_Y,
  GATES,
  INTAKE,
  OCEAN,
  type CatchState,
  type FishKind,
  type GateId,
  type HeldFish,
  type OceanFish,
  type PackNeed,
} from '@/maze/types.ts'

const BOAT_SPEED = 0.92
const SCOOP_SPEED = 1.45
const FEED_SPEED = 1.55
const SCOOP_COOL = 0.28
const HIT_STUN = 0.9
const HOLD_WARM = 6.5
const PACK_WARM = 5.5
const SPECIAL_Y = 0.09

function holdCap(level: LevelId): number {
  return level === 1 ? 1 : 2
}

function jobCap(level: LevelId): number {
  return level === 1 ? 2 : 2
}

function packCap(level: LevelId): number {
  return level === 1 ? 4 : 3
}

function processTime(level: LevelId): number {
  if (level === 1) return 0.62
  if (level === 2) return 0.78
  return 0.92
}

function formSpeed(level: LevelId, alive: number, total: number, pressure: number): number {
  const base = level === 1 ? 0.07 : level === 2 ? 0.095 : 0.12
  const thin = 1 + (1 - alive / Math.max(1, total)) * 0.7
  return base * thin * pressure
}

function dropStep(level: LevelId): number {
  return level === 3 ? 0.038 : 0.032
}

function drainEvery(level: LevelId): number {
  if (level === 1) return 0
  if (level === 2) return 15
  return 11
}

function gridFor(level: LevelId): { cols: number; rows: number } {
  if (level === 1) return { cols: 5, rows: 2 }
  if (level === 2) return { cols: 6, rows: 3 }
  return { cols: 7, rows: 3 }
}

function kindAt(level: LevelId, col: number, row: number): { kind: FishKind; gate: GateId | null } {
  if (level === 3 && row === 0) {
    const gates: GateId[] = ['boat', 'auction', 'truck', 'kitchen', 'plate']
    if (col >= 1 && col <= 5) return { kind: 'gate', gate: gates[col - 1] ?? null }
  }
  if (level >= 2 && (col + row) % 4 === 0) return { kind: 'ice', gate: null }
  return { kind: 'lot', gate: null }
}

function needsFor(level: LevelId, kind: FishKind): PackNeed[] {
  if (level === 1) return ['ice']
  if (level === 2) return kind === 'ice' ? ['ice'] : ['seal']
  return ['ice', 'band', 'crate']
}

function cellSize(state: CatchState): { cw: number; ch: number } {
  const span = OCEAN.x1 - OCEAN.x0 - 0.04
  return {
    cw: span / Math.max(state.cols, 1),
    ch: 0.1,
  }
}

export function fishPos(state: CatchState, fish: OceanFish): { x: number; y: number } {
  const { cw, ch } = cellSize(state)
  return {
    x: state.formX + fish.col * cw,
    y: state.formY + fish.row * ch,
  }
}

export function createCatch(level: LevelId, reduced: boolean): CatchState {
  const { cols, rows } = gridFor(level)
  const fish: OceanFish[] = []
  let nextId = 1
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const spec = kindAt(level, col, row)
      fish.push({ id: nextId, col, row, kind: spec.kind, gate: spec.gate, alive: true })
      nextId += 1
    }
  }
  return {
    level,
    phase: 'ready',
    announcement: mazeCopy.readyLead[level - 1],
    freshness: FRESHNESS_MAX,
    freshnessMax: FRESHNESS_MAX,
    score: 0,
    combo: 0,
    elapsed: 0,
    reduced,
    playerX: (OCEAN.x0 + OCEAN.x1) / 2,
    desiredX: (OCEAN.x0 + OCEAN.x1) / 2,
    scoop: { x: 0.3, y: BOAT_Y, live: false },
    scoopCool: 0,
    hold: [],
    payloads: [],
    jobs: [],
    pack: [],
    fish,
    cols,
    rows,
    formX: OCEAN.x0 + 0.04,
    formY: 0.12,
    formDir: 1,
    dropPending: false,
    special: null,
    specialIn: level === 1 ? 18 : 10,
    nextGate: 0,
    drainAcc: 0,
    hitLeft: 0,
    machineGlow: 0,
    chew: 0,
    nextId,
  }
}

export function startRun(state: CatchState): void {
  if (state.phase !== 'ready') return
  state.phase = 'play'
  state.announcement = mazeCopy.readyTeach[state.level - 1]
}

export function togglePause(state: CatchState): void {
  if (state.phase === 'play') {
    state.phase = 'pause'
    return
  }
  if (state.phase === 'pause') state.phase = 'play'
}

export function moveBoat(state: CatchState, dir: 1 | -1): void {
  if (state.phase === 'ready') startRun(state)
  const next = state.desiredX + dir * 0.08
  state.desiredX = clamp(next, OCEAN.x0 + 0.04, OCEAN.x1 - 0.04)
}

export function aimBoat(state: CatchState, x: number): void {
  if (state.phase === 'ready') startRun(state)
  state.desiredX = clamp(x, OCEAN.x0 + 0.04, OCEAN.x1 - 0.04)
}

export function fireScoop(state: CatchState): void {
  if (state.phase === 'ready') startRun(state)
  if (state.phase !== 'play') return
  if (state.scoop.live || state.scoopCool > 0) return
  if (state.hold.length >= holdCap(state.level)) {
    state.announcement = mazeCopy.holdFull
    return
  }
  state.scoop.live = true
  state.scoop.x = state.playerX
  state.scoop.y = BOAT_Y - 0.06
  state.scoopCool = SCOOP_COOL
}

export function feedHold(state: CatchState): void {
  if (state.phase === 'ready') startRun(state)
  if (state.phase !== 'play') return
  const held = state.hold[0]
  if (!held) {
    state.announcement = mazeCopy.emptyHold
    return
  }
  if (state.jobs.length >= jobCap(state.level) && state.payloads.length >= 1) {
    state.announcement = mazeCopy.machineFull
    return
  }
  if (held.gate && state.level === 3) {
    const expected = GATES[state.nextGate]
    if (held.gate !== expected) {
      state.hold.shift()
      loseFreshness(state, 1, mazeCopy.gateMiss)
      return
    }
  }
  state.hold.shift()
  state.payloads.push({
    id: held.id,
    x: state.playerX,
    y: BOAT_Y - 0.04,
    kind: held.kind,
    gate: held.gate,
  })
  state.announcement = mazeCopy.fed
}

export function packLot(state: CatchState, need: PackNeed): void {
  if (state.phase === 'ready') startRun(state)
  if (state.phase !== 'play') return
  const lot = state.pack[0]
  if (!lot) {
    state.announcement = mazeCopy.missFeed
    return
  }
  const want = lot.needs[lot.step]
  if (want !== need) {
    loseFreshness(state, 1, mazeCopy.packMiss)
    return
  }
  lot.step += 1
  lot.wait = 0
  state.combo += 1
  state.score += 50 + state.combo * 8
  if (lot.step >= lot.needs.length) {
    state.pack.shift()
    state.announcement = mazeCopy.packed
    state.score += 20
    return
  }
  state.announcement = nextPackLine(lot.needs[lot.step] ?? 'ice')
}

export function stepCatch(state: CatchState, dt: number): void {
  if (state.phase !== 'play' && state.phase !== 'hit') return
  const capped = Math.min(0.05, Math.max(0, dt))
  state.elapsed += capped * 1000
  state.scoopCool = Math.max(0, state.scoopCool - capped)
  state.machineGlow = Math.max(0, state.machineGlow - capped)
  state.chew = (state.chew + capped * (state.jobs.length > 0 ? 3.2 : 0.6)) % 1

  if (state.phase === 'hit') {
    state.hitLeft -= capped
    if (state.hitLeft <= 0) {
      state.phase = state.freshness <= 0 ? 'over' : 'play'
      state.announcement = state.freshness <= 0 ? mazeCopy.over : mazeCopy.hit
    }
    return
  }

  const drain = drainEvery(state.level)
  if (drain > 0) {
    state.drainAcc += capped
    if (state.drainAcc >= drain) {
      state.drainAcc = 0
      loseFreshness(state, 1, mazeCopy.drain)
      if (state.phase !== 'play') return
    }
  }

  const pressure = wavePressure(state)
  stepBoat(state, capped)
  stepScoop(state, capped)
  stepSpecial(state, capped)
  stepPayloads(state, capped)
  stepJobs(state, capped)
  stepHoldWarm(state, capped)
  stepPackWarm(state, capped)
  stepFormation(state, capped, pressure)
  if (state.phase !== 'play') return
  if (cleared(state)) finishClear(state)
}

export function qualityFor(state: CatchState): number {
  return state.score
}

export function wavePressure(state: CatchState): number {
  let value = 1
  if (state.pack.length >= 2) value += 0.22
  if (state.pack.length >= packCap(state.level) - 1) value += 0.28
  if (state.jobs.length >= jobCap(state.level)) value += 0.16
  if (state.hold.length >= holdCap(state.level)) value += 0.1
  return value
}

function stepBoat(state: CatchState, dt: number): void {
  const delta = state.desiredX - state.playerX
  const max = BOAT_SPEED * dt
  if (Math.abs(delta) <= max) state.playerX = state.desiredX
  else state.playerX += Math.sign(delta) * max
  state.playerX = clamp(state.playerX, OCEAN.x0 + 0.04, OCEAN.x1 - 0.04)
}

function stepScoop(state: CatchState, dt: number): void {
  if (!state.scoop.live) return
  state.scoop.y -= SCOOP_SPEED * dt
  if (state.scoop.y < OCEAN.y0) {
    state.scoop.live = false
    return
  }
  if (state.special?.live && near(state.scoop.x, state.scoop.y, state.special.x, state.special.y, 0.045)) {
    state.special.live = false
    state.scoop.live = false
    state.freshness = Math.min(state.freshnessMax, state.freshness + 1)
    state.score += 50
    state.combo += 1
    state.announcement = mazeCopy.collectIce
    return
  }
  for (const fish of state.fish) {
    if (!fish.alive) continue
    const pos = fishPos(state, fish)
    if (!near(state.scoop.x, state.scoop.y, pos.x, pos.y, 0.048)) continue
    catchFish(state, fish)
    return
  }
}

function catchFish(state: CatchState, fish: OceanFish): void {
  state.scoop.live = false
  if (state.hold.length >= holdCap(state.level)) {
    state.announcement = mazeCopy.holdFull
    return
  }
  fish.alive = false
  const held: HeldFish = { id: fish.id, kind: fish.kind, gate: fish.gate, wait: 0 }
  state.hold.push(held)
  state.score += 12
  state.combo += 1
  state.announcement = mazeCopy.caught
}

function stepSpecial(state: CatchState, dt: number): void {
  if (state.special?.live) {
    state.special.x += state.special.vx * dt
    if (state.special.x < OCEAN.x0 - 0.05 || state.special.x > OCEAN.x1 + 0.05) {
      state.special.live = false
    }
    return
  }
  state.specialIn -= dt
  if (state.specialIn > 0) return
  const left = Math.random() < 0.5
  state.special = {
    x: left ? OCEAN.x0 - 0.02 : OCEAN.x1 + 0.02,
    y: SPECIAL_Y,
    vx: left ? 0.22 : -0.22,
    live: true,
  }
  state.specialIn = state.level === 1 ? 20 : 12
}

function stepPayloads(state: CatchState, dt: number): void {
  const keep: CatchState['payloads'] = []
  for (const payload of state.payloads) {
    const dx = INTAKE.x - payload.x
    const dy = INTAKE.y - payload.y
    const dist = Math.hypot(dx, dy)
    const step = FEED_SPEED * dt
    if (dist <= step + 0.02) {
      intake(state, payload)
      continue
    }
    payload.x += (dx / dist) * step
    payload.y += (dy / dist) * step
    keep.push(payload)
  }
  state.payloads = keep
}

function intake(state: CatchState, payload: CatchState['payloads'][number]): void {
  if (state.jobs.length >= jobCap(state.level) && state.pack.length >= packCap(state.level)) {
    loseFreshness(state, 1, mazeCopy.bayFull)
    return
  }
  if (payload.gate && state.level === 3 && payload.gate === GATES[state.nextGate]) {
    state.nextGate += 1
    state.score += 40
    state.announcement = mazeCopy.collectGate[state.nextGate - 1] ?? mazeCopy.fed
  }
  const total = processTime(state.level)
  state.jobs.push({
    id: payload.id,
    kind: payload.kind,
    gate: payload.gate,
    left: total,
    total,
  })
  state.machineGlow = 0.45
  state.score += 18
}

function stepJobs(state: CatchState, dt: number): void {
  const keep: CatchState['jobs'] = []
  for (const job of state.jobs) {
    if (state.pack.length >= packCap(state.level)) {
      keep.push(job)
      if (state.announcement !== mazeCopy.bayFull) state.announcement = mazeCopy.bayFull
      continue
    }
    job.left -= dt
    if (job.left > 0) {
      keep.push(job)
      continue
    }
    state.pack.push({
      id: job.id,
      needs: needsFor(state.level, job.kind),
      step: 0,
      wait: 0,
    })
    state.score += 22
    state.announcement = mazeCopy.processDone
    state.machineGlow = 0.35
  }
  state.jobs = keep
}

function stepHoldWarm(state: CatchState, dt: number): void {
  if (state.level === 1) return
  for (const held of state.hold) {
    held.wait += dt
    if (held.wait >= HOLD_WARM) {
      held.wait = 0
      loseFreshness(state, 1, mazeCopy.drain)
      return
    }
  }
}

function stepPackWarm(state: CatchState, dt: number): void {
  if (state.level === 1) return
  for (const lot of state.pack) {
    lot.wait += dt
    if (lot.wait >= PACK_WARM) {
      lot.wait = 0
      loseFreshness(state, 1, mazeCopy.drain)
      return
    }
  }
}

function stepFormation(state: CatchState, dt: number, pressure: number): void {
  const alive = state.fish.filter((fish) => fish.alive)
  if (alive.length === 0) return
  const speed = formSpeed(state.level, alive.length, state.fish.length, pressure)
  if (state.dropPending) {
    state.formY += dropStep(state.level)
    state.dropPending = false
    warnPressure(state, pressure)
  } else {
    state.formX += state.formDir * speed * dt
  }

  let minX = 1
  let maxX = 0
  let maxY = 0
  for (const fish of alive) {
    const pos = fishPos(state, fish)
    minX = Math.min(minX, pos.x)
    maxX = Math.max(maxX, pos.x)
    maxY = Math.max(maxY, pos.y)
  }
  if (maxX > OCEAN.x1 - 0.03) {
    state.formX -= maxX - (OCEAN.x1 - 0.03)
    state.formDir = -1
    state.dropPending = true
  } else if (minX < OCEAN.x0 + 0.03) {
    state.formX += OCEAN.x0 + 0.03 - minX
    state.formDir = 1
    state.dropPending = true
  }
  if (maxY >= BOAT_Y - 0.06) {
    loseFreshness(state, state.level === 1 ? 1 : 2, mazeCopy.missSchool)
  }
}

function warnPressure(state: CatchState, pressure: number): void {
  if (pressure >= 1.35 && state.pack.length >= 2) {
    state.announcement = mazeCopy.pressure
  }
}

function cleared(state: CatchState): boolean {
  return (
    state.fish.every((fish) => !fish.alive) &&
    !state.scoop.live &&
    state.hold.length === 0 &&
    state.payloads.length === 0 &&
    state.jobs.length === 0 &&
    state.pack.length === 0
  )
}

function finishClear(state: CatchState): void {
  state.phase = 'clear'
  state.score += state.freshness * 50 + state.level * 80
  state.announcement = mazeCopy.clear
}

function loseFreshness(state: CatchState, amount: number, message: string): void {
  state.freshness = Math.max(0, state.freshness - amount)
  state.combo = 0
  state.announcement = message
  state.hitLeft = HIT_STUN
  state.phase = state.freshness <= 0 ? 'over' : 'hit'
  if (state.phase === 'over') state.announcement = mazeCopy.over
}

function nextPackLine(need: PackNeed): string {
  if (need === 'seal') return mazeCopy.packSealNeed
  if (need === 'band') return mazeCopy.packBandNeed
  if (need === 'crate') return mazeCopy.packCrateNeed
  return mazeCopy.packIceNeed
}

function near(ax: number, ay: number, bx: number, by: number, r: number): boolean {
  return Math.hypot(ax - bx, ay - by) <= r
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

const _boot = createCatch(1, true)
if (_boot.fish.length !== 10) throw new Error('Craft school should be 10 fish')
startRun(_boot)
fireScoop(_boot)
if (!_boot.scoop.live) throw new Error('Scoop should fire')
feedHold(_boot)
if (_boot.payloads.length !== 0) throw new Error('Empty hold should not feed')
const _sys = createCatch(2, true)
if (_sys.fish.length !== 18) throw new Error('Systems school should be 18 fish')
const _chain = createCatch(3, true)
if (_chain.fish.filter((fish) => fish.kind === 'gate').length !== 5) {
  throw new Error('Chain needs five gate fish')
}
