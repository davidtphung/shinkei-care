export const SHIP_MS = 900
export const SHIP_REDUCED_MS = 200
export const PRESSURE_CAP = 1.35

const GLOW_MS = 150
const SLIDE_START_MS = 150
const SLIDE_MS = 280
const STAGGER_MS = 70
const SETTLE_START_MS = 650
const SETTLE_MS = 250

export type ShipMotion = {
  glow: number
  slide: number[]
  bayClear: number
  chipOpacity: number
  chipCount: number
  done: boolean
}

export type PressureInput = {
  open: number
  cap: number
  jobsFull: boolean
  holdFull: boolean
}

export type AutoShipInput = {
  done: number
  open: number
  cap: number
  fishLeft: number
  hold: number
  payloads: number
  jobs: number
  scoopLive: boolean
  shipping: boolean
}

export function packCap(level: number): number {
  return level === 1 ? 4 : 3
}

export function openLotCount(lots: { done: boolean }[]): number {
  let count = 0
  for (const lot of lots) if (!lot.done) count += 1
  return count
}

export function doneLotCount(lots: { done: boolean }[]): number {
  let count = 0
  for (const lot of lots) if (lot.done) count += 1
  return count
}

export function bayPressureBand(open: number, cap: number): 'ok' | 'one-left' | 'holding' {
  if (cap > 1 && open >= cap) return 'holding'
  if (cap > 1 && open === cap - 1) return 'one-left'
  return 'ok'
}

export function pressureTarget(input: PressureInput): number {
  let value = 1
  if (input.open >= 2) value += 0.16
  if (input.cap > 1 && input.open >= input.cap - 1) value += 0.18
  if (input.jobsFull) value += 0.08
  if (input.holdFull) value += 0.06
  return Math.min(PRESSURE_CAP, value)
}

export function decayPressure(current: number, target: number, dt: number): number {
  const step = Math.min(1, Math.max(0, dt) * 1.4)
  const next = current + (target - current) * step
  return Math.min(PRESSURE_CAP, Math.max(1, next))
}

export function shouldAutoShip(input: AutoShipInput): boolean {
  if (input.shipping || input.done <= 0) return false
  if (input.done >= input.cap) return true
  return (
    input.fishLeft === 0 &&
    input.open === 0 &&
    input.hold === 0 &&
    input.payloads === 0 &&
    input.jobs === 0 &&
    !input.scoopLive
  )
}

export function shippedStatus(count: number, clearBay: boolean): string {
  const noun = count === 1 ? '1 lot' : `${count} lots`
  return clearBay ? `Shipped ${noun}. Bay clear.` : `Shipped ${noun}.`
}

export function shipMotion(input: {
  elapsed: number
  started: number
  count: number
  reduced: boolean
  clearBay: boolean
}): ShipMotion {
  const count = Math.max(0, input.count)
  const t = Math.max(0, input.elapsed - input.started)
  if (input.reduced) {
    const chipOpacity = clamp01(t / SHIP_REDUCED_MS)
    return {
      glow: 0,
      slide: Array.from({ length: count }, () => 1),
      bayClear: input.clearBay ? 1 : 0,
      chipOpacity,
      chipCount: count,
      done: t >= SHIP_REDUCED_MS,
    }
  }

  const glow =
    t < GLOW_MS ? easeOut(t / GLOW_MS) : t < SETTLE_START_MS ? 1 : 1 - easeInOut((t - SETTLE_START_MS) / SETTLE_MS)
  const settle = t < SETTLE_START_MS ? 0 : easeInOut((t - SETTLE_START_MS) / SETTLE_MS)
  const chipCount = settle <= 0 ? 0 : Math.max(1, Math.min(count, Math.round(settle * count)))
  return {
    glow: clamp01(glow),
    slide: Array.from({ length: count }, (_, index) => easeInOut((t - SLIDE_START_MS - index * STAGGER_MS) / SLIDE_MS)),
    bayClear: input.clearBay ? settle : 0,
    chipOpacity: settle,
    chipCount,
    done: t >= SHIP_MS,
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function easeOut(value: number): number {
  const t = clamp01(value)
  return 1 - (1 - t) * (1 - t)
}

function easeInOut(value: number): number {
  const t = clamp01(value)
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) * (-2 * t + 2)) / 2
}
