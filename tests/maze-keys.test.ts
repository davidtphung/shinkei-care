import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  fieldBlocksShortcut,
  packBadge,
  packShortcut,
  readMazeKey,
  type MazeKeyEvent,
} from '../src/maze/keys.ts'
import { PACK_KEYS } from '../src/maze/types.ts'

function press(key: string, extra: Partial<MazeKeyEvent> = {}) {
  return readMazeKey({
    key,
    repeat: false,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    target: null,
    ...extra,
  })
}

describe('Catch keyboard', () => {
  it('binds C to catch, I to feed, and P to the next pack', () => {
    for (const key of ['c', 'C', ' ', 'w', 'W', 'ArrowUp']) {
      assert.equal(press(key).action?.kind, 'catch', key)
    }
    for (const key of ['i', 'I', 'f', 'F', 'ArrowDown', 'Enter']) {
      assert.equal(press(key).action?.kind, 'feed', key)
    }
    assert.deepEqual(press('p').action, { kind: 'pack-next' })
    assert.deepEqual(press('P').action, { kind: 'pack-next' })
    assert.equal(PACK_KEYS.c, undefined)
    assert.equal(PACK_KEYS.C, undefined)
    assert.equal(PACK_KEYS.i, undefined)
    assert.equal(PACK_KEYS.I, undefined)
    assert.equal(PACK_KEYS.p, undefined)
  })

  it('keeps number keys and E and B for pack items', () => {
    assert.deepEqual(press('1').action, { kind: 'pack', need: 'ice' })
    assert.deepEqual(press('2').action, { kind: 'pack', need: 'seal' })
    assert.deepEqual(press('e').action, { kind: 'pack', need: 'seal' })
    assert.deepEqual(press('E').action, { kind: 'pack', need: 'seal' })
    assert.deepEqual(press('3').action, { kind: 'pack', need: 'band' })
    assert.deepEqual(press('b').action, { kind: 'pack', need: 'band' })
    assert.deepEqual(press('B').action, { kind: 'pack', need: 'band' })
    assert.deepEqual(press('4').action, { kind: 'pack', need: 'crate' })
    assert.deepEqual(press('a').action, { kind: 'move', dir: -1 })
    assert.deepEqual(press('A').action, { kind: 'move', dir: -1 })
    assert.deepEqual(press('ArrowLeft').action, { kind: 'move', dir: -1 })
    assert.deepEqual(press('d').action, { kind: 'move', dir: 1 })
    assert.deepEqual(press('D').action, { kind: 'move', dir: 1 })
    assert.deepEqual(press('ArrowRight').action, { kind: 'move', dir: 1 })
    assert.deepEqual(press('Escape').action, { kind: 'escape' })
  })

  it('ignores repeats except movement, and ignores modifier chords', () => {
    const repeatedCatch = press('c', { repeat: true })
    assert.equal(repeatedCatch.action, null)
    assert.equal(repeatedCatch.preventDefault, true)
    const repeatedMove = press('ArrowLeft', { repeat: true })
    assert.deepEqual(repeatedMove.action, { kind: 'move', dir: -1 })
    assert.equal(repeatedMove.preventDefault, true)
    assert.equal(press('Escape', { repeat: true }).action, null)
    assert.equal(press('c', { ctrlKey: true }).action, null)
    assert.equal(press('c', { metaKey: true }).preventDefault, false)
    assert.equal(press('i', { altKey: true }).action, null)
    assert.equal(press('z').action, null)
    assert.equal(press('z').preventDefault, false)
  })

  it('treats initials fields as typing targets', () => {
    assert.equal(fieldBlocksShortcut('INPUT', false), true)
    assert.equal(fieldBlocksShortcut('textarea', false), true)
    assert.equal(fieldBlocksShortcut('SELECT', false), true)
    assert.equal(fieldBlocksShortcut('DIV', true), true)
    assert.equal(fieldBlocksShortcut('BUTTON', false), false)
  })

  it('shows the number on pack badges and P on the next item', () => {
    assert.equal(packBadge('ice', false), '1')
    assert.equal(packBadge('ice', true), '1 P')
    assert.equal(packBadge('seal', true), '2 P')
    assert.equal(packBadge('band', false), '3')
    assert.equal(packBadge('crate', true), '4 P')
    assert.equal(packShortcut('ice', true), '1 P')
    assert.equal(packShortcut('seal', false), '2 E')
    assert.equal(packShortcut('seal', true), '2 E P')
    assert.equal(packShortcut('band', true), '3 B P')
    assert.equal(packShortcut('crate', false), '4')
  })
})