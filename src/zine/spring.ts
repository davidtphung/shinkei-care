/** Critically damped spring. Zeta is 1, so a step from rest does not bounce. */

export const SPRING_OMEGA = 14

export type SpringState = {
  x: number
  v: number
}

export function stepSpring(
  state: SpringState,
  target: number,
  dt: number,
  omega = SPRING_OMEGA,
): SpringState {
  const step = Math.min(Math.max(dt, 0), 0.05)
  const y0 = state.x - target
  const v0 = state.v
  const decay = Math.exp(-omega * step)
  const bend = v0 + omega * y0
  const y = (y0 + bend * step) * decay
  const v = (bend - omega * (y0 + bend * step)) * decay
  if (Math.abs(y) < 0.0008 && Math.abs(v) < 0.0008) return { x: target, v: 0 }
  return { x: target + y, v }
}

/** Keep a flick, but cap it so the spring reaches the target without crossing it. */
export function handoffVelocity(
  position: number,
  velocity: number,
  target: number,
  omega = SPRING_OMEGA,
): number {
  const dist = target - position
  if (dist === 0 || velocity === 0) return 0
  if (Math.sign(velocity) !== Math.sign(dist)) return 0
  const cap = omega * Math.abs(dist)
  return Math.sign(dist) * Math.min(Math.abs(velocity), cap)
}

/** Positive velocity moves toward the next page. One page per gesture. */
export function settleIndex(position: number, velocity: number, maxIndex: number): number {
  const flick = 0.45
  let next: number
  if (velocity > flick) next = Math.floor(position) + 1
  else if (velocity < -flick) next = Math.ceil(position) - 1
  else next = Math.round(position)
  if (next < 0) return 0
  if (next > maxIndex) return maxIndex
  return next
}

/** 1:1 inside the range. Past either edge, motion shrinks (rubber band). */
export function rubberOffset(raw: number, min: number, max: number, resistance = 0.35): number {
  if (raw < min) return min + (raw - min) * resistance
  if (raw > max) return max + (raw - max) * resistance
  return raw
}
