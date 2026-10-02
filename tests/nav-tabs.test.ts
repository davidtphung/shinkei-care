import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ArcadeNav } from '../src/hub/ArcadeNav.tsx'

function render(mode: 'hub' | 'care' | 'maze' | 'leaderboard' | 'zine' = 'hub') {
  return renderToStaticMarkup(createElement(ArcadeNav, { mode, onMode: () => {} }))
}

describe('Sere tab bar', () => {
  it('renders Zine first as tabs in one list', () => {
    const html = render('hub')
    assert.match(html, /role="tablist"/)
    assert.match(html, /aria-orientation="horizontal"/)
    const labels = [...html.matchAll(/sere-tab-label">([^<]+)</g)].map((match) => match[1])
    assert.deepEqual(labels, ['Zine', 'Hub', 'Care', 'Catch', 'Leaderboard'])
    const tabs = html.match(/role="tab"/g) ?? []
    assert.equal(tabs.length, 5)
    assert.match(html, /id="sere-tab-hub"[^>]*aria-selected="true"/)
    assert.match(html, /id="sere-tab-zine"[^>]*aria-selected="false"/)
    assert.match(html, /data-testid="sere-indicator"/)
    assert.equal([...html].some((char) => char.charCodeAt(0) === 8212), false)
  })

  it('marks the active tab when the mode is Zine', () => {
    const html = render('zine')
    assert.match(html, /id="sere-tab-zine"[^>]*aria-selected="true"/)
    assert.match(html, /id="sere-tab-care"[^>]*aria-selected="false"/)
  })
})
