import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { hashForMode, parseModeHash } from '../src/game/mode.ts'
import { canonicalZineHash, hashForZine, parseZineStop } from '../src/zine/route.ts'
import { resolveZineUrl } from '../src/zine/assets.ts'

describe('zine hash routes', () => {
  it('opens the brief at stop 1 and keeps deep links', () => {
    assert.equal(parseZineStop('#zine'), 1)
    assert.equal(parseZineStop('#zine/1'), 1)
    assert.equal(parseZineStop('#zine/3'), 3)
    assert.equal(parseZineStop('#Zine/7'), 7)
    assert.equal(hashForZine(1), '#zine')
    assert.equal(hashForZine(3), '#zine/3')
    assert.equal(hashForZine(7), '#zine/7')
  })

  it('clamps a stop that falls outside 1 to 7', () => {
    assert.equal(parseZineStop('#zine/0'), 1)
    assert.equal(parseZineStop('#zine/8'), 7)
    assert.equal(parseZineStop('#zine/nope'), null)
    assert.equal(canonicalZineHash('#zine/3'), '#zine/3')
    assert.equal(canonicalZineHash('#zine/1'), '#zine')
    assert.equal(canonicalZineHash('#zine/nope'), '#zine')
    assert.equal(canonicalZineHash('#zine/99'), '#zine/7')
  })

  it('keeps the arcade hashes and adds the zine mode', () => {
    assert.equal(parseModeHash('#care'), 'care')
    assert.equal(parseModeHash('#catch'), 'maze')
    assert.equal(parseModeHash('#maze'), 'maze')
    assert.equal(parseModeHash('#leaderboard'), 'leaderboard')
    assert.equal(parseModeHash('#zine'), 'zine')
    assert.equal(parseModeHash('#zine/4'), 'zine')
    assert.equal(parseModeHash('#'), 'hub')
    assert.equal(hashForMode('zine'), '#zine')
    assert.equal(hashForMode('maze'), '#catch')
    assert.equal(hashForMode('care'), '#care')
  })
})

describe('zine asset urls', () => {
  it('uses the same jsDelivr folder as the bundle script', () => {
    const script =
      'https://cdn.jsdelivr.net/gh/davidtphung/shinkei-care@d13382e580ff4898b8773caab7ba9cb341c7ac45/published/assets/index-D5oBwPEW.js'
    assert.equal(
      resolveZineUrl('six-seconds-v2-spread-01.webp', script),
      'https://cdn.jsdelivr.net/gh/davidtphung/shinkei-care@d13382e580ff4898b8773caab7ba9cb341c7ac45/published/assets/zine/six-seconds-v2-spread-01.webp',
    )
  })

  it('falls back to the site base when the page is the dev server', () => {
    assert.equal(resolveZineUrl('six-seconds-v2-spread-02-left.webp', null, '/'), '/assets/zine/six-seconds-v2-spread-02-left.webp')
    assert.equal(
      resolveZineUrl('six-seconds-v2-spread-07.webp', 'http://127.0.0.1:4721/src/main.tsx', '/shinkei-care/'),
      '/shinkei-care/assets/zine/six-seconds-v2-spread-07.webp',
    )
  })
})
