import type { LevelId } from '@/game/types.ts'

export type Dir = 'left' | 'right'
export type PackNeed = 'ice' | 'seal' | 'band' | 'crate'
export type GateId = 'boat' | 'auction' | 'truck' | 'kitchen' | 'plate'
export type FishKind = 'lot' | 'ice' | 'gate'
export type Phase = 'ready' | 'play' | 'hit' | 'clear' | 'over' | 'pause'

export type OceanFish = {
  id: number
  col: number
  row: number
  kind: FishKind
  gate: GateId | null
  alive: boolean
}

export type Scoop = {
  x: number
  y: number
  live: boolean
}

export type HeldFish = {
  id: number
  kind: FishKind
  gate: GateId | null
  wait: number
}

export type Payload = {
  id: number
  x: number
  y: number
  kind: FishKind
  gate: GateId | null
}

export type MachineJob = {
  id: number
  kind: FishKind
  gate: GateId | null
  left: number
  total: number
}

export type PackLot = {
  id: number
  needs: PackNeed[]
  step: number
  wait: number
}

export type Special = {
  x: number
  y: number
  vx: number
  live: boolean
}

export type CatchState = {
  level: LevelId
  phase: Phase
  announcement: string
  freshness: number
  freshnessMax: number
  score: number
  combo: number
  elapsed: number
  reduced: boolean
  playerX: number
  desiredX: number
  scoop: Scoop
  scoopCool: number
  hold: HeldFish[]
  payloads: Payload[]
  jobs: MachineJob[]
  pack: PackLot[]
  fish: OceanFish[]
  cols: number
  rows: number
  formX: number
  formY: number
  formDir: 1 | -1
  dropPending: boolean
  special: Special | null
  specialIn: number
  nextGate: number
  drainAcc: number
  hitLeft: number
  machineGlow: number
  chew: number
  nextId: number
}

export const GATES: GateId[] = ['boat', 'auction', 'truck', 'kitchen', 'plate']

export const PACK_KEYS: Record<string, PackNeed> = {
  '1': 'ice',
  i: 'ice',
  I: 'ice',
  '2': 'seal',
  e: 'seal',
  E: 'seal',
  '3': 'band',
  b: 'band',
  B: 'band',
  '4': 'crate',
  c: 'crate',
  C: 'crate',
}

export const OCEAN = { x0: 0.03, x1: 0.56, y0: 0.05, y1: 0.93 }
export const BOAT_Y = 0.86
export const INTAKE = { x: 0.6, y: 0.7 }
export const OUTPUT = { x: 0.745, y: 0.4 }
export const MACHINE = { x: 0.575, y: 0.16, w: 0.17, h: 0.68 }
export const PACK_BAY = { x0: 0.76, x1: 0.975, y0: 0.1, y1: 0.9 }
