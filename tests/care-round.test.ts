import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { careSteps, freezeClockMs, stepPercent } from '../src/care/round.ts'

const quiet = {
  level: 1,
  screen: 'spike',
  icePlaced: 0,
  gateIndex: 0,
  lotsPlaced: 0,
  plateSealed: false,
}

describe('Care steps and clock', () => {
  it('starts empty and fills only as steps are completed', () => {
    assert.deepEqual(careSteps(quiet), { done: 0, total: 5 })
    assert.equal(stepPercent(0, 5), 0)
    assert.deepEqual(careSteps({ ...quiet, screen: 'gill' }), { done: 1, total: 5 })
    assert.deepEqual(careSteps({ ...quiet, screen: 'ice', icePlaced: 2 }), { done: 4, total: 5 })
    assert.equal(stepPercent(5, 5), 100)
    assert.deepEqual(careSteps({ ...quiet, screen: 'seal', icePlaced: 3 }), { done: 5, total: 5 })
  })

  it('fills Chain from gates, lots, and the seal', () => {
    const chain = { ...quiet, level: 3, screen: 'gates' }
    assert.deepEqual(careSteps(chain), { done: 0, total: 7 })
    assert.deepEqual(careSteps({ ...chain, gateIndex: 3, screen: 'handoff', lotsPlaced: 1 }), {
      done: 4,
      total: 7,
    })
    assert.deepEqual(careSteps({ ...chain, gateIndex: 3, lotsPlaced: 3, screen: 'plate', plateSealed: true }), {
      done: 7,
      total: 7,
    })
  })

  it('freezes the clock on the first stop and ignores a later Continue', () => {
    const frozen = freezeClockMs(1_000, 4_200, null)
    assert.equal(frozen, 3_200)
    assert.equal(freezeClockMs(1_000, 9_000, frozen), frozen)
    assert.equal(freezeClockMs(null, 9_000, null), 0)
  })
})
