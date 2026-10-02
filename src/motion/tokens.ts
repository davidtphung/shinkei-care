/** Shared motion numbers for Sere. Critically damped springs use zeta 1. */

export const SPRING_ZETA = 1
export const SPRING_OMEGA = 14

export const motionTokens = {
  pressMs: 80,
  hoverInMs: 140,
  hoverOutMs: 220,
  fadeMs: 200,
  contentMs: 240,
  contentShiftPx: 8,
  entranceFadeMs: 280,
  entranceStaggerMs: 50,
  liftMs: 220,
  shimmerMs: 6400,
  indicatorBasePx: 100,
} as const

export function entranceTotalMs(count: number): number {
  const steps = Math.max(count - 1, 0)
  return motionTokens.entranceFadeMs + motionTokens.entranceStaggerMs * steps
}

export function motionVars(): Record<string, string> {
  return {
    '--motion-press': `${motionTokens.pressMs}ms`,
    '--motion-hover-in': `${motionTokens.hoverInMs}ms`,
    '--motion-hover-out': `${motionTokens.hoverOutMs}ms`,
    '--motion-fade': `${motionTokens.fadeMs}ms`,
    '--motion-content': `${motionTokens.contentMs}ms`,
    '--motion-shift': `${motionTokens.contentShiftPx}px`,
    '--motion-enter': `${motionTokens.entranceFadeMs}ms`,
    '--motion-lift': `${motionTokens.liftMs}ms`,
    '--motion-shimmer': `${motionTokens.shimmerMs}ms`,
  }
}
