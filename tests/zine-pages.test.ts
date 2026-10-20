import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { describe, it } from 'node:test'
import { blurFile, leafIndexFor, leavesFor, midFile, progressScale, SPREAD_COUNT, thumbFile, zineStrings } from '../src/zine/model.ts'

describe('zine page math', () => {
  it('reads eight spreads on a wide screen', () => {
    const leaves = leavesFor('spread')
    assert.equal(leaves.length, SPREAD_COUNT)
    assert.equal(leaves[0]?.file, 'six-seconds-v3-spread-01.webp')
    assert.equal(leaves[0]?.blur, 'six-seconds-v3-spread-01-blur.webp')
    assert.equal(leaves[1]?.stop, 2)
    assert.equal(leaves[1]?.side, 'full')
    assert.equal(leaves[4]?.file, 'six-seconds-v3-spread-05.webp')
    assert.equal(leaves[7]?.side, 'full')
    assert.equal(leafIndexFor(leaves, 5, 1), 4)
  })

  it('splits interior spreads into single pages on a phone', () => {
    const leaves = leavesFor('single')
    assert.equal(leaves.length, 13)
    assert.deepEqual(
      leaves.map((leaf) => `${leaf.spread}:${leaf.side}`),
      [
        '1:full',
        '2:full',
        '3:left',
        '3:right',
        '4:left',
        '4:right',
        '5:left',
        '5:right',
        '6:left',
        '6:right',
        '7:left',
        '7:right',
        '8:full',
      ],
    )
    assert.equal(leaves[0]?.file, 'six-seconds-v3-spread-01.webp')
    assert.equal(leaves[1]?.file, 'six-seconds-v3-spread-02.webp')
    assert.equal(leaves[2]?.file, 'six-seconds-v3-spread-03-left.webp')
    assert.equal(leaves[3]?.file, 'six-seconds-v3-spread-03-right.webp')
    assert.equal(leaves[4]?.pageLabel, 'P.04')
    assert.equal(leaves[5]?.pageLabel, 'P.05')
    assert.equal(leaves[12]?.file, 'six-seconds-v3-spread-08.webp')
    assert.equal(leafIndexFor(leaves, 4, 0), 4)
    assert.equal(leafIndexFor(leaves, 4, 1), 5)
    assert.equal(leafIndexFor(leaves, 1, 1), 0)
  })

  it('keeps full, mid, thumb, and blur files beside the older spreads', () => {
    for (let spread = 1; spread <= SPREAD_COUNT; spread++) {
      const pad = String(spread).padStart(2, '0')
      for (const name of [
        `six-seconds-v3-spread-${pad}.webp`,
        midFile(spread),
        thumbFile(spread),
        blurFile(spread),
      ]) {
        assert.equal(existsSync(`published/assets/zine/${name}`), true, name)
      }
    }
    assert.equal(existsSync('published/assets/zine/six-seconds-v3-spread-03-left.webp'), true)
    assert.equal(existsSync('published/assets/zine/six-seconds-v3-spread-07-right.webp'), true)
    assert.equal(existsSync('published/assets/zine/six-seconds-v2-spread-01.webp'), true)
    assert.equal(existsSync('published/assets/zine/six-seconds-spread-01.webp'), true)
  })

  it('fills the progress hairline from the first page', () => {
    assert.equal(progressScale(0, 8), 1 / 8)
    assert.equal(progressScale(7, 8), 1)
    assert.equal(progressScale(12, 13), 1)
    assert.equal(progressScale(-2, 8), 1 / 8)
  })

  it('keeps site copy free of em dashes and hard language', () => {
    const banned = [/\u2014/, /\u2013/, /\bdead\b/, /\bharm\b/, /\bfailure\b/, /\bmiss\b/, /\brot\b/, /\bsour\b/, /\bskipped\b/]
    const text = zineStrings().join('\n').toLowerCase()
    for (const word of banned) {
      assert.equal(word.test(text), false, String(word))
    }
    assert.match(text, /not affiliated with shinkei systems or seremoni/)
    assert.match(text, /michelin quality fish for all/)
  })
})
