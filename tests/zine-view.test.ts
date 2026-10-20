import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { zineCopy } from '../src/zine/copy.ts'
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
    assert.match(html, /Vol\. 01 \/ Field Brief, by David T Phung, davidtphung\.com/)
    assert.match(html, /data-testid="zine-cover-note"/)
    assert.match(html, /data-testid="zine-cover-preview"/)
    assert.match(html, /data-testid="zine-cover-full"/)
    assert.match(html, /six-seconds-v3-spread-01-blur\.webp/)
    assert.equal(html.includes('data-testid="zine-cue"'), false)
    assert.match(html, /class="zine-sr"/)
    assert.equal(html.includes('data-testid="zine-plate"'), false)
    assert.equal(html.includes('class="zine-plate"'), false)
    assert.match(html, /Cover: the printed brief open to a salmon at the rail/)
    assert.equal(html.includes('data-testid="zine-play"'), false)
    assert.match(html, /six-seconds-v3-spread-01\.webp/)
    assert.match(html, /Not affiliated with Shinkei Systems or Seremoni\. Non commercial brief\./)
    assert.match(html, /data-motion="fade"/)
    assert.match(html, /data-testid="zine-fade"/)
    const alts = [...html.matchAll(/<img\b[^>]*\balt="([^"]*)"/g)]
    assert.ok(alts.length > 0)
    assert.ok(alts.every((match) => match[1]!.length > 0))
  })

  it('uses the left page for a phone and lists the chapter rail', () => {
    const html = render({ motion: 'fade', single: true, initialStop: 4, initialContents: true, solid: true })
    assert.match(html, /six-seconds-v3-spread-04-left\.webp/)
    assert.match(html, /six-seconds-v3-spread-01-thumb\.webp/)
    assert.equal(html.includes('six-seconds-v2-spread-'), false)
    assert.equal(html.includes('six-seconds-spread-'), false)
    assert.match(html, /data-single="true"/)
    assert.match(html, /data-solid="true"/)
    assert.match(html, /data-testid="zine-rail"/)
    assert.match(html, />Craft</)
    assert.match(html, />Boats</)
    assert.match(html, />Map</)
    assert.match(html, /The robot rides for free/)
    assert.match(html, /Bill in Morro Bay/)
    assert.match(html, /P\.04/)
  })

  it('marks the zoomed spread', () => {
    const html = render({ motion: 'spring', initialStop: 5, initialZoom: true })
    assert.match(html, /data-zoomed="true"/)
    assert.match(html, /data-testid="zine-zoom"/)
    assert.match(html, /six-seconds-v3-spread-05\.webp/)
    assert.match(html, /Drag to look across the page\./)
  })

  it('keeps the caption plate on later stops', () => {
    const html = render({ motion: 'fade', initialStop: 3 })
    assert.match(html, /data-testid="zine-plate"/)
    assert.match(html, /class="zine-plate"/)
    assert.match(html, /Surgery, at sea, in six seconds\./)
    assert.match(html, /data-testid="zine-cue"/)
    assert.equal(html.includes('data-testid="zine-cover-note"'), false)
  })

  it('reserves the map plate and skips the cue on the back cover', () => {
    const map = render({ motion: 'fade', initialStop: 7 })
    assert.match(map, /data-stop="7"/)
    assert.match(map, /data-testid="zine-cue"/)
    assert.match(map, /The map is the menu\./)
    const close = render({ motion: 'fade', initialStop: 8 })
    assert.equal(close.includes('data-testid="zine-cue"'), false)
    assert.match(close, /data-stop="8"/)
  })

  it('offers Play Sere on the back cover', () => {
    const html = render({ motion: 'fade', initialStop: 8 })
    assert.match(html, /data-testid="zine-play"/)
    assert.match(html, />Play Sere</)
    assert.match(html, /a Play Sere line/)
    assert.match(html, /six-seconds-v3-spread-08\.webp/)
    assert.equal(zineCopy.linkCopied, 'Link copied')
  })
})
