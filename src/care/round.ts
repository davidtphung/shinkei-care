export const READY_MS = 800

export type CareStepInput = {
  level: number
  screen: string
  icePlaced: number
  gateIndex: number
  lotsPlaced: number
  plateSealed: boolean
}

export function careSteps(input: CareStepInput): { done: number; total: number } {
  if (input.level === 3) {
    const gates = Math.min(3, Math.max(0, input.gateIndex))
    const lots = Math.min(3, Math.max(0, input.lotsPlaced))
    const plate = input.plateSealed || input.screen === 'seal' || input.screen === 'rest' || input.screen === 'score' ? 1 : 0
    return { done: gates + lots + plate, total: 7 }
  }
  const pastSpike = input.screen !== 'title' && input.screen !== 'spike'
  const pastGill = pastSpike && input.screen !== 'gill'
  const ice =
    input.screen === 'seal' || input.screen === 'rest' || input.screen === 'score'
      ? 3
      : Math.min(3, Math.max(0, input.icePlaced))
  return { done: (pastSpike ? 1 : 0) + (pastGill ? 1 : 0) + ice, total: 5 }
}

export function stepPercent(done: number, total: number): number {
  if (total <= 0) return 0
  const ratio = Math.min(total, Math.max(0, done)) / total
  return Math.round(ratio * 100)
}

export function freezeClockMs(start: number | null, now: number, already: number | null): number {
  if (already != null) return already
  if (start == null) return 0
  return Math.max(1, Math.round(now - start))
}
