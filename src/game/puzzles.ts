import type { NoticePuzzle, PackPuzzle } from './types.ts'

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
