import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { entranceTotalMs, motionTokens, SPRING_OMEGA, SPRING_ZETA } from '../src/motion/tokens.ts'
import { indicatorTransform, sharedAxis, stepTab, tabIndex, tabItems } from '../src/motion/tabs.ts'
import { SPRING_OMEGA as springOmega, stepSpring } from '../src/zine/spring.ts'

describe('motion tokens', () => {
  it('keeps one critically damped spring', () => {
    assert.equal(SPRING_ZETA, 1)
    assert.equal(SPRING_OMEGA, 14)
    assert.equal(springOmega, SPRING_OMEGA)
    let state = { x: 0, v: 0 }
    let previous = Math.sign(state.x - 1)
    let crossed = 0
    for (let i = 0; i < 160; i += 1) {
      state = stepSpring(state, 1, 1 / 120, SPRING_OMEGA)
      const sign = Math.sign(state.x - 1)
      if (sign !== 0 && previous !== 0 && sign !== previous) crossed += 1
      if (sign !== 0) previous = sign
    }
    assert.equal(crossed, 0)
    assert.ok(Math.abs(state.x - 1) < 0.01)
  })

  it('keeps hover, press, and the content shift inside the brief', () => {
    assert.ok(motionTokens.hoverInMs >= 80 && motionTokens.hoverInMs <= 250)
    assert.ok(motionTokens.hoverOutMs >= 80 && motionTokens.hoverOutMs <= 250)
    assert.ok(motionTokens.pressMs >= 80 && motionTokens.pressMs <= 250)
    assert.equal(motionTokens.contentShiftPx, 8)
    assert.ok(motionTokens.fadeMs > 0)
    assert.ok(motionTokens.contentMs > 0)
  })

  it('finishes the nav entrance in under 600ms', () => {
    const total = entranceTotalMs(tabItems.length)
    assert.equal(total, motionTokens.entranceFadeMs + motionTokens.entranceStaggerMs * (tabItems.length - 1))
    assert.ok(total < 600)
    assert.ok(total > 0)
  })
})

describe('tab motion math', () => {
  it('puts Zine first and wraps arrow keys', () => {
    assert.deepEqual(
      tabItems.map((item) => item.mode),
      ['zine', 'hub', 'care', 'maze', 'about'],
    )
    assert.equal(stepTab(0, 'ArrowLeft', 5), 4)
    assert.equal(stepTab(4, 'ArrowRight', 5), 0)
    assert.equal(stepTab(1, 'ArrowDown', 5), 2)
    assert.equal(stepTab(2, 'ArrowUp', 5), 1)
    assert.equal(stepTab(3, 'Home', 5), 0)
    assert.equal(stepTab(3, 'End', 5), 4)
    assert.equal(stepTab(1, 'Enter', 5), null)
    assert.equal(tabIndex('about'), 4)
    assert.equal(tabIndex('leaderboard'), -1)
    assert.equal(motionTokens.coverFadeMs, 250)
    assert.equal(motionTokens.shareNoteMs, 2000)
  })

  it('uses one shared axis for the way in and the way out', () => {
    const forward = sharedAxis(0, 2, 8)
    assert.equal(forward.enterPx, -8)
    assert.equal(forward.leavePx, 8)
    const back = sharedAxis(3, 1, 8)
    assert.equal(back.enterPx, 8)
    assert.equal(back.leavePx, -8)
    assert.equal(Math.abs(forward.enterPx), Math.abs(forward.leavePx))
  })

  it('slides the indicator with transform only', () => {
    assert.equal(indicatorTransform(24, 36, 80, 100), 'translate3d(24px, 36px, 0) scaleX(0.8)')
  })
})
