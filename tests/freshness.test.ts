import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  easeFreshness,
  lowerFreshness,
  meterPercent,
  raiseFreshness,
} from '../src/game/freshness.ts'

describe('Freshness seal', () => {
  it('draws a full seal at 6 and about two thirds at 4', () => {
    assert.equal(meterPercent(6, 6), 100)
    assert.equal(meterPercent(4, 6), 67)
    assert.notEqual(meterPercent(4, 6), meterPercent(6, 6))
    assert.notEqual(meterPercent(5, 6), meterPercent(4, 6))
    assert.equal(meterPercent(0, 6), 0)
  })

  it('rises with careful play and eases down with time and warmth', () => {
    const dropped = lowerFreshness(6, 6, 2)
    assert.equal(dropped, 4)
    assert.equal(meterPercent(dropped, 6), 67)

    const restored = raiseFreshness(dropped, 6, 1)
    assert.equal(restored, 5)
    assert.equal(raiseFreshness(6, 6, 1), 6)

    const calmed = easeFreshness(6, 6, 20, false)
    const warmed = easeFreshness(6, 6, 20, true)
    assert.ok(calmed < 6)
    assert.ok(warmed < calmed)
    assert.ok(easeFreshness(4, 6, 0, true) === 4)
  })
})
