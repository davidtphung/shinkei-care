import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  PRESSURE_CAP,
  bayPressureBand,
  decayPressure,
  doneLotCount,
  openLotCount,
  packCap,
  pressureTarget,
  shipMotion,
  shippedStatus,
  shouldAutoShip,
} from '../src/maze/ship.ts'

const quiet = {
  done: 1,
  open: 0,
  cap: 4,
  fishLeft: 0,
  hold: 0,
  payloads: 0,
  jobs: 0,
  scoopLive: false,
  shipping: false,
}

describe('Catch bay ship', () => {
  it('ships a bay of done lots, or the last packed fish, and leaves open lots', () => {
    assert.equal(packCap(1), 4)
    assert.equal(packCap(2), 3)
    assert.equal(packCap(3), 3)
    assert.equal(shouldAutoShip({ ...quiet, done: 4, open: 2, fishLeft: 6 }), true)
    assert.equal(shouldAutoShip(quiet), true)
    assert.equal(shouldAutoShip({ ...quiet, open: 1 }), false)
    assert.equal(shouldAutoShip({ ...quiet, done: 2, fishLeft: 3 }), false)
    assert.equal(shouldAutoShip({ ...quiet, scoopLive: true }), false)
    assert.equal(shouldAutoShip({ ...quiet, shipping: true }), false)
    assert.equal(shouldAutoShip({ ...quiet, done: 0 }), false)
    assert.equal(shippedStatus(3, true), 'Shipped 3 lots. Bay clear.')
    assert.equal(shippedStatus(1, true), 'Shipped 1 lot. Bay clear.')
    assert.equal(shippedStatus(2, false), 'Shipped 2 lots.')
  })

  it('keeps done lots out of capacity, warmth, and pressure', () => {
    const lots = [{ done: true }, { done: true }, { done: false }, { done: false }]
    assert.equal(doneLotCount(lots), 2)
    assert.equal(openLotCount(lots), 2)
    assert.equal(bayPressureBand(2, 3), 'one-left')
    assert.equal(bayPressureBand(3, 3), 'holding')
    assert.equal(bayPressureBand(1, 3), 'ok')
    const busy = pressureTarget({ open: 9, cap: 3, jobsFull: true, holdFull: true })
    assert.ok(busy <= PRESSURE_CAP)
    assert.equal(pressureTarget({ open: 0, cap: 4, jobsFull: false, holdFull: false }), 1)
    const eased = decayPressure(PRESSURE_CAP, 1, 0.5)
    assert.ok(eased < PRESSURE_CAP)
    assert.ok(eased >= 1)
  })

  it('slides lots off with a stagger and no bounce, then counts the chip', () => {
    const start = shipMotion({ elapsed: 0, started: 0, count: 4, reduced: false, clearBay: true })
    assert.equal(start.glow, 0)
    assert.deepEqual(start.slide, [0, 0, 0, 0])
    assert.equal(start.chipCount, 0)

    const glow = shipMotion({ elapsed: 150, started: 0, count: 4, reduced: false, clearBay: true })
    assert.equal(glow.glow, 1)
    assert.equal(glow.slide[0], 0)
    assert.equal(glow.slide[1], 0)

    const staggered = shipMotion({ elapsed: 220, started: 0, count: 2, reduced: false, clearBay: true })
    assert.ok(staggered.slide[0] > 0)
    assert.equal(staggered.slide[1], 0)

    for (let t = 0; t <= 1000; t += 10) {
      const frame = shipMotion({ elapsed: t, started: 0, count: 4, reduced: false, clearBay: true })
      assert.ok(frame.glow >= 0 && frame.glow <= 1)
      assert.ok(frame.chipOpacity >= 0 && frame.chipOpacity <= 1)
      assert.ok(frame.bayClear >= 0 && frame.bayClear <= 1)
      for (const slide of frame.slide) assert.ok(slide >= 0 && slide <= 1)
      assert.ok(frame.chipCount >= 0 && frame.chipCount <= 4)
    }

    const end = shipMotion({ elapsed: 900, started: 0, count: 3, reduced: false, clearBay: true })
    assert.equal(end.done, true)
    assert.equal(end.chipOpacity, 1)
    assert.equal(end.chipCount, 3)
    assert.equal(end.bayClear, 1)
    assert.deepEqual(end.slide, [1, 1, 1])
  })

  it('empties at once when motion is reduced and only fades the chip', () => {
    const early = shipMotion({ elapsed: 0, started: 0, count: 3, reduced: true, clearBay: true })
    assert.equal(early.glow, 0)
    assert.deepEqual(early.slide, [1, 1, 1])
    assert.equal(early.bayClear, 1)
    assert.equal(early.chipOpacity, 0)
    assert.equal(early.chipCount, 3)
    assert.equal(early.done, false)

    const mid = shipMotion({ elapsed: 100, started: 0, count: 3, reduced: true, clearBay: false })
    assert.equal(mid.chipOpacity, 0.5)
    assert.equal(mid.bayClear, 0)
    assert.equal(mid.chipCount, 3)

    const done = shipMotion({ elapsed: 200, started: 0, count: 3, reduced: true, clearBay: true })
    assert.equal(done.done, true)
    assert.equal(done.chipOpacity, 1)
  })
})
