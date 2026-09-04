import type { NoticePuzzle, PackPuzzle } from './types.ts'

export const CYCLE_MS = 6000
export const WINDOW_START = 0.48
export const WINDOW_END = 0.9
export const FRESHNESS_MAX = 6
export const ICE_GOAL = 3
export const HANDOFF_GOAL = 3
export const GATES = ['harvest', 'bleed', 'chill'] as const

export function drainForLevel(level: number): number {
  return level >= 2 ? 2 : 1
}

export const noticePuzzles: NoticePuzzle[] = [
  { id: 'n1', options: ['cooler', 'ice', 'label'], answer: 'cooler' },
  { id: 'n2', options: ['basket', 'ice', 'label'], answer: 'ice' },
  { id: 'n3', options: ['cooler', 'label', 'fish'], answer: 'label' },
  { id: 'n4', options: ['basket', 'ice', 'fish'], answer: 'basket' },
  { id: 'n5', options: ['fish', 'cooler', 'ice'], answer: 'fish' },
]

export const packThree: PackPuzzle = {
  items: ['ice', 'label', 'container'],
}

export const packFour: PackPuzzle = {
  items: ['ice', 'label', 'container', 'tag'],
}

export function pickNotice(round: number): NoticePuzzle {
  return noticePuzzles[round % noticePuzzles.length]
}

export function pickPack(round: number): PackPuzzle {
  return round % 2 === 0 ? packFour : packThree
}

export function firstTryPoints(attempts: number, max: number): number {
  if (attempts <= 1) return max
  if (attempts === 2) return Math.round(max * 0.7)
  return Math.round(max * 0.4)
}

export function comboBonus(combo: number): number {
  if (combo <= 1) return 0
  return combo * 15
}

export function judgeSpike(progress: number, reducedMotion: boolean, onTarget: boolean): 'early' | 'late' | 'high' | 'hit' {
  if (!onTarget) return 'high'
  if (reducedMotion) return 'hit'
  if (progress >= WINDOW_START && progress < WINDOW_END) return 'hit'
  if (progress < WINDOW_START) return 'early'
  return 'late'
}
