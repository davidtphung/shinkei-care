import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { handoffVelocity, rubberOffset, settleIndex, SPRING_OMEGA, stepSpring } from '../src/zine/spring.ts'

function integrate(from: number, velocity: number, target: number, seconds = 1.4) {
  let state = { x: from, v: handoffVelocity(from, velocity, target) }
  let crossed = 0
  let previous = Math.sign(state.x - target)
  const dt = 1 / 120
  const steps = Math.round(seconds / dt)
  for (let i = 0; i < steps; i += 1) {
    state = stepSpring(state, target, dt)
    const sign = Math.sign(state.x - target)
    if (sign !== 0 && previous !== 0 && sign !== previous) crossed += 1
    previous = sign === 0 ? previous : sign
  }
  return { state, crossed }
}

describe('zine spring', () => {
  it('settles from rest without crossing the target', () => {
    const { state, crossed } = integrate(0, 0, 1)
    assert.equal(crossed, 0)
    assert.ok(Math.abs(state.x - 1) < 0.01)
    assert.equal(state.v, 0)
  })

  it('hands velocity forward and still does not bounce', () => {
    const { state, crossed } = integrate(0.2, 8, 1)
    assert.equal(crossed, 0)
    assert.ok(Math.abs(state.x - 1) < 0.01)
    assert.ok(handoffVelocity(0.2, 8, 1) <= SPRING_OMEGA * 0.8 + 0.0001)
    assert.equal(handoffVelocity(0.2, -4, 1), 0)
  })

  it('can be interrupted onto a new target', () => {
    let state = { x: 0, v: 0 }
    for (let i = 0; i < 20; i += 1) state = stepSpring(state, 1, 1 / 120)
    const mid = state.x
    assert.ok(mid > 0 && mid < 1)
    const next = integrate(state.x, state.v, 0)
    assert.equal(next.crossed, 0)
    assert.ok(Math.abs(next.state.x) < 0.01)
  })

  it('tracks a finger inside the range and rubber-bands past the edge', () => {
    assert.equal(rubberOffset(0.4, 0, 6), 0.4)
    assert.equal(rubberOffset(-2, 0, 6, 0.35), -0.7)
    assert.equal(rubberOffset(6.5, 0, 6, 0.35), 6.175)
  })

  it('turns one page on a flick and stays put on a short drag', () => {
    assert.equal(settleIndex(0.2, 0, 6), 0)
    assert.equal(settleIndex(0.8, 0, 6), 1)
    assert.equal(settleIndex(0.2, 1, 6), 1)
    assert.equal(settleIndex(0.8, -1, 6), 0)
    assert.equal(settleIndex(1, 2, 6), 2)
    assert.equal(settleIndex(0, -3, 6), 0)
    assert.equal(settleIndex(6, 3, 6), 6)
  })
})
