import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { hubCopy } from '../src/game/hubCopy.ts'
import { AboutScreen } from '../src/hub/AboutScreen.tsx'
import { ArcadeNav } from '../src/hub/ArcadeNav.tsx'

function render(mode: 'hub' | 'care' | 'maze' | 'leaderboard' | 'zine' | 'about' = 'hub') {
  return renderToStaticMarkup(createElement(ArcadeNav, { mode, onMode: () => {} }))
}

describe('Sere tab bar', () => {
  it('renders Zine first as tabs in one list', () => {
    const html = render('hub')
    assert.match(html, /role="tablist"/)
    assert.match(html, /aria-orientation="horizontal"/)
    const labels = [...html.matchAll(/sere-tab-label">([^<]+)</g)].map((match) => match[1])
    assert.deepEqual(labels, ['Zine', 'Hub', 'Care', 'Catch', 'About'])
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

  it('marks About and keeps the leaderboard off the tab list', () => {
    const about = render('about')
    assert.match(about, /id="sere-tab-about"[^>]*aria-selected="true"/)
    assert.equal(about.includes('sere-tab-leaderboard'), false)
    const board = render('leaderboard')
    assert.equal(board.includes('aria-selected="true"'), false)
    assert.equal(board.includes('sere-tab-leaderboard'), false)
    assert.match(board, /id="sere-tab-hub"[^>]*tabindex="0"/)
  })
})

describe('About screen', () => {
  it('names Sere, David, and the two links', () => {
    const html = renderToStaticMarkup(createElement(AboutScreen))
    assert.match(html, /An arcade for Shinkei Systems\./)
    assert.match(html, /David T Phung made Sere\./)
    assert.match(html, /href="https:\/\/davidtphung\.com\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/)
    assert.match(html, /href="https:\/\/x\.com\/davidtphung"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/)
    assert.match(html, />My website</)
    assert.match(html, />Follow on X</)
    assert.equal(hubCopy.careBlurb, 'Six Seconds. Spike, gill, ice.')
    assert.equal([...html].some((char) => char.charCodeAt(0) === 8212 || char.charCodeAt(0) === 8211), false)
  })
})
