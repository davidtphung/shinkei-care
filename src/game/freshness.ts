export function clampFreshness(value: number, max: number): number {
  if (max <= 0) return 0
  return Math.min(max, Math.max(0, value))
}

export function meterPercent(value: number, max: number): number {
  if (max <= 0) return 0
  const ratio = clampFreshness(value, max) / max
  return Math.round(ratio * 100)
}

export function raiseFreshness(value: number, max: number, amount = 1): number {
  return clampFreshness(value + amount, max)
}

export function lowerFreshness(value: number, max: number, amount: number): number {
  return clampFreshness(value - amount, max)
}

// Calm time eases the seal down. A warm hold or a waiting lot eases it faster.
export function easeFreshness(value: number, max: number, dt: number, warm: boolean): number {
  if (dt <= 0 || value <= 0) return clampFreshness(value, max)
  const perSecond = warm ? 0.14 : 0.04
  return clampFreshness(value - perSecond * dt, max)
}
