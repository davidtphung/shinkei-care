import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { leafIndexFor, leavesFor, progressScale, SPREAD_COUNT, zineStrings } from '../src/zine/model.ts'

describe('zine page math', () => {
  it('reads seven spreads on a wide screen', () => {
    const leaves = leavesFor('spread')
    assert.equal(leaves.length, SPREAD_COUNT)
    assert.equal(leaves[0]?.file, 'six-seconds-spread-01.webp')
    assert.equal(leaves[2]?.stop, 3)
    assert.equal(leaves[3]?.file, 'six-seconds-spread-04.webp')
    assert.equal(leaves[6]?.side, 'full')
    assert.equal(leafIndexFor(leaves, 5, 1), 4)
  })

  it('splits spreads 2 to 6 into single pages', () => {
    const leaves = leavesFor('single')
    assert.equal(leaves.length, 12)
    assert.deepEqual(
      leaves.map((leaf) => `${leaf.spread}:${leaf.side}`),
      [
        '1:full',
        '2:left',
        '2:right',
        '3:left',
        '3:right',
        '4:left',
        '4:right',
        '5:left',
        '5:right',
        '6:left',
        '6:right',
        '7:full',
      ],
    )
    assert.equal(leaves[0]?.file, 'six-seconds-spread-01.webp')
    assert.equal(leaves[1]?.file, 'six-seconds-spread-02-left.webp')
    assert.equal(leaves[2]?.file, 'six-seconds-spread-02-right.webp')
    assert.equal(leaves[3]?.pageLabel, 'P.04')
    assert.equal(leaves[4]?.pageLabel, 'P.05')
    assert.equal(leaves[11]?.file, 'six-seconds-spread-07.webp')
    assert.equal(leafIndexFor(leaves, 3, 0), 3)
    assert.equal(leafIndexFor(leaves, 3, 1), 4)
    assert.equal(leafIndexFor(leaves, 1, 1), 0)
  })

  it('fills the progress hairline from the first page', () => {
    assert.equal(progressScale(0, 7), 1 / 7)
    assert.equal(progressScale(6, 7), 1)
    assert.equal(progressScale(11, 12), 1)
    assert.equal(progressScale(-2, 7), 1 / 7)
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
