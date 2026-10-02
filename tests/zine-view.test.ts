import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ZineApp } from '../src/zine/ZineApp.tsx'

function render(props: {
  motion?: 'spring' | 'fade'
  single?: boolean
  solid?: boolean
  initialStop?: number
  initialContents?: boolean
  initialZoom?: boolean
}) {
  return renderToStaticMarkup(createElement(ZineApp, { onClose: () => {}, ...props }))
}

describe('zine reader markup', () => {
  it('renders one heading, the caption, and alt text', () => {
    const html = render({ motion: 'fade', initialStop: 1 })
    assert.equal(html.match(/<h1\b/g)?.length, 1)
    assert.match(html, /Six seconds\./)
    assert.match(html, /A salmon comes over the rail/)
    assert.match(html, /data-testid="zine-cover-note"/)
    assert.match(html, /class="zine-sr"/)
    assert.equal(html.includes('data-testid="zine-plate"'), false)
    assert.equal(html.includes('class="zine-plate"'), false)
    assert.match(html, /Cover: a person in bright blue gloves holds a silver salmon over a boat rail, gray sea behind/)
    assert.equal(html.includes('data-testid="zine-play"'), false)
    assert.match(html, /six-seconds-v2-spread-01\.webp/)
    assert.match(html, /Not affiliated with Shinkei Systems or Seremoni\. Non commercial brief\./)
    assert.match(html, /data-motion="fade"/)
    assert.match(html, /data-testid="zine-fade"/)
    const alts = [...html.matchAll(/<img\b[^>]*\balt="([^"]*)"/g)]
    assert.ok(alts.length > 0)
    assert.ok(alts.every((match) => match[1]!.length > 0))
  })

  it('uses the left page for a phone and lists the chapter rail', () => {
    const html = render({ motion: 'fade', single: true, initialStop: 3, initialContents: true, solid: true })
    assert.match(html, /six-seconds-v2-spread-03-left\.webp/)
    assert.match(html, /six-seconds-v2-spread-01-thumb\.webp/)
    assert.equal(html.includes('six-seconds-spread-'), false)
    assert.match(html, /data-single="true"/)
    assert.match(html, /data-solid="true"/)
    assert.match(html, /data-testid="zine-rail"/)
    assert.match(html, />Craft</)
    assert.match(html, />Boats</)
    assert.match(html, /The robot rides for free/)
    assert.match(html, /Bill in Morro Bay/)
  })

  it('marks the zoomed spread', () => {
    const html = render({ motion: 'spring', initialStop: 4, initialZoom: true })
    assert.match(html, /data-zoomed="true"/)
    assert.match(html, /data-testid="zine-zoom"/)
    assert.match(html, /six-seconds-v2-spread-04\.webp/)
    assert.match(html, /Drag to look across the page\./)
  })

  it('keeps the caption plate on later stops', () => {
    const html = render({ motion: 'fade', initialStop: 2 })
    assert.match(html, /data-testid="zine-plate"/)
    assert.match(html, /class="zine-plate"/)
    assert.match(html, /Surgery, at sea, in six seconds\./)
    assert.equal(html.includes('data-testid="zine-cover-note"'), false)
  })

  it('offers Play Sere on the back cover', () => {
    const html = render({ motion: 'fade', initialStop: 7 })
    assert.match(html, /data-testid="zine-play"/)
    assert.match(html, />Play Sere</)
    assert.match(html, /a Play Sere line/)
    assert.match(html, /six-seconds-v2-spread-07\.webp/)
  })
})
