import { hubCopy } from '../game/hubCopy.ts'
import type { ArcadeMode } from '../game/mode.ts'
import { motionTokens } from './tokens.ts'

export const tabItems: { mode: ArcadeMode; label: string }[] = [
  { mode: 'zine', label: hubCopy.zineName },
  { mode: 'hub', label: hubCopy.hub },
  { mode: 'care', label: hubCopy.careName },
  { mode: 'maze', label: hubCopy.mazeName },
  { mode: 'leaderboard', label: hubCopy.boardName },
]

export function tabIndex(mode: ArcadeMode): number {
  const index = tabItems.findIndex((item) => item.mode === mode)
  return index < 0 ? 0 : index
}

/** Arrow keys wrap. Home and End jump to the ends. Other keys are ignored. */
export function stepTab(index: number, key: string, count: number): number | null {
  if (count <= 0) return null
  const current = ((index % count) + count) % count
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  if (key === 'ArrowRight' || key === 'ArrowDown') return (current + 1) % count
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (current - 1 + count) % count
  return null
}

/** Shared axis: enter and leave travel the same distance on one axis. */
export function sharedAxis(fromIndex: number, toIndex: number, shiftPx = motionTokens.contentShiftPx) {
  const dir = toIndex >= fromIndex ? 1 : -1
  return {
    dir,
    enterPx: -dir * shiftPx,
    leavePx: dir * shiftPx,
  }
}

export function indicatorTransform(
  x: number,
  y: number,
  width: number,
  base: number = motionTokens.indicatorBasePx,
): string {
  const scale = base === 0 ? 1 : width / base
  return `translate3d(${x}px, ${y}px, 0) scaleX(${scale})`
}
