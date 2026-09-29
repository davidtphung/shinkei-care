import { PACK_KEYS, type PackNeed } from './types.ts'

export const CATCH_SHORTCUT = 'C Space W ArrowUp'
export const FEED_SHORTCUT = 'I F ArrowDown Enter'
export const LEFT_SHORTCUT = 'ArrowLeft A'
export const RIGHT_SHORTCUT = 'ArrowRight D'

const PACK_NUMBER: Record<PackNeed, string> = {
  ice: '1',
  seal: '2',
  band: '3',
  crate: '4',
}

const PACK_LETTER: Partial<Record<PackNeed, string>> = {
  seal: 'E',
  band: 'B',
}

export type MazeShortcut =
  | { kind: 'escape' }
  | { kind: 'move'; dir: -1 | 1 }
  | { kind: 'catch' }
  | { kind: 'feed' }
  | { kind: 'pack'; need: PackNeed }
  | { kind: 'pack-next' }

export type MazeKeyEvent = {
  key: string
  repeat: boolean
  metaKey: boolean
  ctrlKey: boolean
  altKey: boolean
  target: EventTarget | null
}

export type MazeKeyRead = {
  action: MazeShortcut | null
  preventDefault: boolean
}

export function fieldBlocksShortcut(tagName: string, contentEditable: boolean): boolean {
  if (contentEditable) return true
  const tag = tagName.toUpperCase()
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

export function typingTarget(target: EventTarget | null): boolean {
  if (typeof Element === 'undefined' || !(target instanceof Element)) return false
  const field = target.closest('input, textarea, select, [contenteditable]')
  if (!(field instanceof HTMLElement)) return false
  return fieldBlocksShortcut(field.tagName, field.isContentEditable)
}

function actionFor(key: string): MazeShortcut | null {
  if (key === 'Escape') return { kind: 'escape' }
  if (key === 'ArrowLeft' || key === 'a' || key === 'A') return { kind: 'move', dir: -1 }
  if (key === 'ArrowRight' || key === 'd' || key === 'D') return { kind: 'move', dir: 1 }
  if (key === ' ' || key === 'w' || key === 'W' || key === 'ArrowUp' || key === 'c' || key === 'C') {
    return { kind: 'catch' }
  }
  if (key === 'f' || key === 'F' || key === 'ArrowDown' || key === 'Enter' || key === 'i' || key === 'I') {
    return { kind: 'feed' }
  }
  if (key === 'p' || key === 'P') return { kind: 'pack-next' }
  const pack = PACK_KEYS[key]
  if (pack) return { kind: 'pack', need: pack }
  return null
}

// C catches and I feeds. Numbers 1 to 4 still pack ice, seal, band, and crate.
// E still seals and B still bands. P packs the highlighted next item.
// A held move key repeats so the boat keeps steering. Other shortcuts do not repeat.
export function readMazeKey(event: MazeKeyEvent): MazeKeyRead {
  if (event.metaKey || event.ctrlKey || event.altKey || typingTarget(event.target)) {
    return { action: null, preventDefault: false }
  }
  const action = actionFor(event.key)
  if (!action) return { action: null, preventDefault: false }
  if (action.kind === 'move') return { action, preventDefault: true }
  if (event.repeat) return { action: null, preventDefault: true }
  return { action, preventDefault: true }
}

export function packBadge(need: PackNeed, next: boolean): string {
  const num = PACK_NUMBER[need]
  return next ? `${num} P` : num
}

export function packShortcut(need: PackNeed, next: boolean): string {
  const letter = PACK_LETTER[need]
  const base = letter ? `${PACK_NUMBER[need]} ${letter}` : PACK_NUMBER[need]
  return next ? `${base} P` : base
}
