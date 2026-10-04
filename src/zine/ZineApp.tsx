import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type Ref } from 'react'
import { motionTokens } from '../motion/tokens.ts'
import { zineFileUrl } from './assets.ts'
import { zineCopy } from './copy.ts'
import {
  CHAPTERS,
  clampStop,
  leafIndexFor,
  leavesFor,
  MOBILE_MAX_PX,
  progressScale,
  SPREAD_COUNT,
  STOPS,
  thumbFile,
  type Leaf,
} from './model.ts'
import { hashForZine, parseZineStop } from './route.ts'
import { handoffVelocity, rubberOffset, settleIndex, stepSpring } from './spring.ts'
import './zine.css'

type MotionMode = 'spring' | 'fade'

type Props = {
  onClose: () => void
  onPlay?: () => void
  motion?: MotionMode
  single?: boolean
  solid?: boolean
  initialStop?: number
  initialContents?: boolean
  initialZoom?: boolean
}

function readQuery(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(query).matches
}

function readStop(initialStop?: number): number {
  if (initialStop != null) return clampStop(initialStop)
  if (typeof window === 'undefined') return 1
  return parseZineStop(window.location.hash) ?? 1
}

function useMediaFlag(query: string, override?: boolean): boolean {
  const [value, setValue] = useState(() => override ?? readQuery(query))
  useEffect(() => {
    if (override != null) return
    const media = window.matchMedia(query)
    const apply = () => setValue(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [override, query])
  return override ?? value
}

export function ZineApp({
  onClose,
  onPlay,
  motion: motionProp,
  single: singleProp,
  solid: solidProp,
  initialStop,
  initialContents = false,
  initialZoom = false,
}: Props) {
  const reduce = useMediaFlag('(prefers-reduced-motion: reduce)', motionProp ? motionProp === 'fade' : undefined)
  const solid = useMediaFlag('(prefers-reduced-transparency: reduce)', solidProp)
  const single = useMediaFlag(`(max-width: ${MOBILE_MAX_PX}px)`, singleProp)
  const motion: MotionMode = motionProp ?? (reduce ? 'fade' : 'spring')
  const [stop, setStop] = useState(() => readStop(initialStop))
  const [side, setSide] = useState<0 | 1>(0)
  const [contents, setContents] = useState(initialContents)
  const [zoom, setZoom] = useState(initialZoom)
  const [open, setOpen] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [note, setNote] = useState<'copied' | 'manual' | null>(null)
  const [manualUrl, setManualUrl] = useState('')
  const noteTimer = useRef(0)
  const [announce, setAnnounce] = useState('')
  const [stageWidth, setStageWidth] = useState(0)
  const [fadeFrom, setFadeFrom] = useState<number | null>(null)

  const leaves = useMemo(() => leavesFor(single ? 'single' : 'spread'), [single])

  useEffect(() => {
    const spread = leavesFor('spread')
    const phone = leavesFor('single')
    const cover = spread.find((item) => item.stop === 1 && item.side === 'full')
    const page = spread.find((item) => item.stop === 2 && item.side === 'full')
    const pageLeft = phone.find((item) => item.stop === 2 && item.side === 'left')
    for (const file of [cover?.file, cover?.thumb, page?.file, pageLeft?.file]) {
      if (!file) continue
      const image = new Image()
      image.src = zineFileUrl(file)
    }
  }, [])

  useEffect(() => () => window.clearTimeout(noteTimer.current), [])
  const index = leafIndexFor(leaves, stop, side)
  const leaf = leaves[index] ?? leaves[0]!
  const maxIndex = Math.max(leaves.length - 1, 0)

  const stageRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<HTMLImageElement>(null)
  const widthRef = useRef(0)
  const heightRef = useRef(0)
  const visual = useRef(index)
  const pan = useRef({ x: 0, y: 0 })
  const springRun = useRef(0)
  const leavesRef = useRef(leaves)
  const motionRef = useRef(motion)
  const zoomOn = useRef(zoom)
  const indexRef = useRef(index)
  const goToRef = useRef<(nextIndex: number, animate: boolean) => void>(() => {})
  const contentsRef = useRef(contents)
  const onCloseRef = useRef(onClose)
  leavesRef.current = leaves
  motionRef.current = motion
  zoomOn.current = zoom
  indexRef.current = index

  const applyFrame = (value: number) => {
    visual.current = value
    const node = trackRef.current
    if (!node) return
    node.style.transform = `translate3d(${-value * widthRef.current}px, 0, 0)`
  }

  const applyPan = (x = pan.current.x, y = pan.current.y) => {
    pan.current = { x, y }
    const node = zoomRef.current
    if (!node) return
    node.style.transform = `translate3d(${x}px, ${y}px, 0) scale(2)`
  }

  const cancelSpring = () => {
    springRun.current += 1
  }

  const runSpring = (from: number, velocity: number, target: number, onFrame: (value: number) => void) => {
    const token = springRun.current + 1
    springRun.current = token
    const handed = handoffVelocity(from, velocity, target)
    let state = { x: from, v: handed }
    let last = performance.now()
    const tick = (now: number) => {
      if (springRun.current !== token) return
      const dt = (now - last) / 1000
      last = now
      state = stepSpring(state, target, dt)
      onFrame(state.x)
      if (state.x === target && state.v === 0) return
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  const publish = (nextLeaf: Leaf) => {
    setStop(nextLeaf.stop)
    setSide(nextLeaf.side === 'right' ? 1 : 0)
    setAnnounce(zineCopy.announce(nextLeaf.stop, SPREAD_COUNT, nextLeaf.title))
    if (typeof window === 'undefined') return
    const hash = hashForZine(nextLeaf.stop)
    if (window.location.hash !== hash) window.history.pushState(null, '', hash)
  }

  const goTo = (nextIndex: number, animate: boolean) => {
    const book = leavesRef.current
    const max = Math.max(book.length - 1, 0)
    const clamped = Math.min(Math.max(nextIndex, 0), max)
    const nextLeaf = book[clamped]
    if (!nextLeaf) return
    const from = visual.current
    pan.current = { x: 0, y: 0 }
    applyPan(0, 0)
    if (motionRef.current === 'fade') {
      if (Math.round(from) !== clamped) setFadeFrom(Math.round(from))
      cancelSpring()
      applyFrame(clamped)
      publish(nextLeaf)
      return
    }
    publish(nextLeaf)
    if (!animate) {
      cancelSpring()
      applyFrame(clamped)
      return
    }
    runSpring(from, 0, clamped, applyFrame)
  }

  goToRef.current = goTo
  contentsRef.current = contents
  onCloseRef.current = onClose

  useEffect(() => {
    const previous = document.title
    document.title = 'Six seconds. Sere'
    return () => {
      document.title = previous
    }
  }, [])

  useEffect(() => {
    const node = stageRef.current
    if (!node) return
    const measure = () => {
      widthRef.current = node.clientWidth
      heightRef.current = node.clientHeight
      setStageWidth(node.clientWidth)
      applyFrame(visual.current)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [zoom, contents, single])

  useEffect(() => {
    const book = leavesFor(single ? 'single' : 'spread')
    const next = leafIndexFor(book, stop, side)
    cancelSpring()
    applyFrame(next)
  }, [single])

  useEffect(() => {
    const onHash = () => {
      const nextStop = parseZineStop(window.location.hash)
      if (nextStop == null) return
      const book = leavesRef.current
      const next = leafIndexFor(book, nextStop, 0)
      cancelSpring()
      applyFrame(next)
      const nextLeaf = book[next]
      if (!nextLeaf) return
      setStop(nextLeaf.stop)
      setSide(0)
      setAnnounce(zineCopy.announce(nextLeaf.stop, SPREAD_COUNT, nextLeaf.title))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToRef.current(indexRef.current + 1, true)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToRef.current(indexRef.current - 1, true)
      } else if (event.key === 'Home') {
        event.preventDefault()
        goToRef.current(0, true)
      } else if (event.key === 'End') {
        event.preventDefault()
        goToRef.current(leavesRef.current.length - 1, true)
      } else if (event.key === 'Escape') {
        event.preventDefault()
        if (zoomOn.current) {
          setZoom(false)
          applyPan(0, 0)
          return
        }
        if (contentsRef.current) {
          setContents(false)
          return
        }
        onCloseRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (note !== 'copied') return
    const timer = window.setTimeout(() => setNote(null), 1600)
    return () => window.clearTimeout(timer)
  }, [note])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const target = event.target
    if (target instanceof Element && target.closest('button, a, input')) return
    const stage = stageRef.current
    if (!stage) return
    try {
      stage.setPointerCapture(event.pointerId)
    } catch {
      // A pointer that is already gone cannot be captured. The gesture still tracks.
    }
    cancelSpring()
    setDragging(true)
    setPressed(true)
    const drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      lastT: performance.now(),
      origin: visual.current,
      vx: 0,
      moved: false,
      panX: pan.current.x,
      panY: pan.current.y,
    }
    const onMove = (move: PointerEvent) => {
      if (move.pointerId !== drag.id) return
      const dx = move.clientX - drag.x
      const dy = move.clientY - drag.y
      if (!drag.moved && Math.hypot(dx, dy) > 6) {
        drag.moved = true
        setPressed(false)
      }
      const now = performance.now()
      const dt = Math.max((now - drag.lastT) / 1000, 0.001)
      const widthNow = widthRef.current || 1
      drag.vx = (move.clientX - drag.lastX) / widthNow / dt
      drag.lastX = move.clientX
      drag.lastT = now
      if (zoomOn.current) {
        const maxX = widthRef.current / 2
        const maxY = heightRef.current / 2
        applyPan(
          rubberOffset(drag.panX + dx, -maxX, maxX),
          rubberOffset(drag.panY + dy, -maxY, maxY),
        )
        return
      }
      if (motionRef.current === 'fade') return
      const width = widthRef.current || 1
      const raw = drag.origin - dx / width
      applyFrame(rubberOffset(raw, 0, Math.max(leavesRef.current.length - 1, 0)))
    }
    const finish = (end: PointerEvent) => {
      if (end.pointerId !== drag.id) return
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', finish)
      stage.removeEventListener('pointercancel', finish)
      setDragging(false)
      setPressed(false)
      if (!drag.moved) {
        setOpen((value) => !value)
        return
      }
      if (zoomOn.current) {
        const maxX = widthRef.current / 2
        const maxY = heightRef.current / 2
        const tx = Math.min(maxX, Math.max(-maxX, pan.current.x))
        const ty = Math.min(maxY, Math.max(-maxY, pan.current.y))
        if (motionRef.current === 'fade') {
          applyPan(tx, ty)
          return
        }
        const token = springRun.current + 1
        springRun.current = token
        let stateX = { x: pan.current.x, v: 0 }
        let stateY = { x: pan.current.y, v: 0 }
        let last = performance.now()
        const tick = (now: number) => {
          if (springRun.current !== token) return
          const dt = (now - last) / 1000
          last = now
          stateX = stepSpring(stateX, tx, dt)
          stateY = stepSpring(stateY, ty, dt)
          applyPan(stateX.x, stateY.x)
          if (stateX.x === tx && stateY.x === ty && stateX.v === 0 && stateY.v === 0) return
          requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        return
      }
      const width = widthRef.current || 1
      const velocity = -drag.vx
      if (motionRef.current === 'fade') {
        const flick = Math.abs(end.clientX - drag.x) > Math.min(72, width * 0.18)
        if (!flick) return
        goTo(indexRef.current + (end.clientX < drag.x ? 1 : -1), true)
        return
      }
      const target = settleIndex(visual.current, velocity, Math.max(leavesRef.current.length - 1, 0))
      const nextLeaf = leavesRef.current[target]
      if (!nextLeaf) return
      publish(nextLeaf)
      runSpring(visual.current, velocity, target, applyFrame)
    }
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerup', finish)
    stage.addEventListener('pointercancel', finish)
  }

  const share = async () => {
    const url = new URL(window.location.href)
    url.hash = hashForZine(stop)
    const payload = { title: zineCopy.shareTitle, text: zineCopy.shareText, url: url.toString() }
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(payload)
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(payload.url)
      setManualUrl('')
      setNote('copied')
      window.clearTimeout(noteTimer.current)
      noteTimer.current = window.setTimeout(() => {
        setNote((current) => (current === 'copied' ? null : current))
      }, motionTokens.shareNoteMs)
    } catch {
      setManualUrl(payload.url)
      setNote('manual')
    }
  }

  const progress = progressScale(index, leaves.length)
  const outgoing = fadeFrom != null ? leaves[fadeFrom] : null

  return (
    <div
      className="zine"
      data-testid="zine"
      data-motion={motion}
      data-zoomed={zoom ? 'true' : 'false'}
      data-contents={contents ? 'true' : 'false'}
      data-single={single ? 'true' : 'false'}
      data-solid={solid ? 'true' : 'false'}
    >
      <div className="zine-band" aria-hidden />
      <header className="zine-bar">
        <div className="zine-title">
          <p className="zine-kicker">{zineCopy.kicker}</p>
          <h1 className="zine-h1">{zineCopy.h1}</h1>
        </div>
        <p className="zine-count zine-mono">{zineCopy.count(stop, SPREAD_COUNT)}</p>
        <div className="zine-chips">
          <button
            type="button"
            className="zine-chip"
            aria-expanded={contents}
            aria-controls="zine-contents"
            onClick={() => setContents((value) => !value)}
          >
            {zineCopy.contents}
          </button>
          <button
            type="button"
            className="zine-chip"
            aria-pressed={zoom}
            onClick={() => {
              setZoom((value) => !value)
              applyPan(0, 0)
            }}
          >
            {zineCopy.zoom}
          </button>
          <div className="zine-share">
            <button type="button" className="zine-chip" onClick={() => void share()}>
              {zineCopy.share}
            </button>
            {note === 'copied' ? (
              <p className="zine-copied" role="status" aria-live="polite">
                {zineCopy.linkCopied}
              </p>
            ) : null}
          </div>
          <button type="button" className="zine-chip" onClick={onClose}>
            {zineCopy.close}
          </button>
        </div>
      </header>
      <div
        className="zine-progress"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={leaves.length}
        aria-valuenow={index + 1}
        aria-valuetext={zineCopy.announce(stop, SPREAD_COUNT, leaf.title)}
        aria-label={zineCopy.progressLabel}
      >
        <span className="zine-progress-fill" style={{ transform: `scaleX(${progress})` }} />
      </div>
      <div className="zine-body">
        {contents ? (
          <nav id="zine-contents" className="zine-rail" data-testid="zine-rail" aria-label={zineCopy.contentsLabel}>
            <p className="zine-rail-kicker zine-mono">{zineCopy.contents}</p>
            {CHAPTERS.map((chapter) => (
              <section key={chapter.id}>
                <h2 className="zine-chapter zine-mono">{chapter.label}</h2>
                {chapter.stops.map((chapterStop) => {
                  const item = STOPS[chapterStop - 1]!
                  const current = item.stop === stop
                  return (
                    <button
                      key={item.stop}
                      type="button"
                      className="zine-stop"
                      aria-current={current ? 'true' : undefined}
                      onClick={() => {
                        goTo(leafIndexFor(leaves, item.stop, 0), true)
                        setContents(false)
                      }}
                    >
                      <img src={zineFileUrl(thumbFile(item.spread))} alt={item.alt} width={640} height={498} />
                      <span>
                        <span className="zine-stop-title">{item.title}</span>
                        <span className="zine-stop-page">{item.pages.join('  ')}</span>
                      </span>
                    </button>
                  )
                })}
              </section>
            ))}
          </nav>
        ) : null}
        <div
          ref={stageRef}
          className="zine-stage"
          data-testid="zine-stage"
          data-open={open ? 'true' : 'false'}
          data-pressed={pressed ? 'true' : 'false'}
          data-dragging={dragging ? 'true' : 'false'}
          onPointerDown={onPointerDown}
        >
          <div className="zine-lift" data-testid="zine-lift" aria-hidden />
          <div className="zine-grid" aria-hidden />
          {zoom ? (
            <div key="zoom" className="zine-zoom" data-testid="zine-zoom">
              {leaf.stop === 1 ? (
                <CoverImage
                  leaf={leaf}
                  imgRef={zoomRef}
                  style={{ transform: `translate3d(${pan.current.x}px, ${pan.current.y}px, 0) scale(2)` }}
                />
              ) : (
                <img
                  ref={zoomRef}
                  src={zineFileUrl(leaf.file)}
                  alt={leaf.alt}
                  width={leaf.width}
                  height={leaf.height}
                  draggable={false}
                  style={{ transform: `translate3d(${pan.current.x}px, ${pan.current.y}px, 0) scale(2)` }}
                />
              )}
              <p className="zine-sr">{zineCopy.zoomHint}</p>
            </div>
          ) : motion === 'fade' ? (
            <div key="fade" className="zine-fade" data-testid="zine-fade">
              {outgoing && outgoing.index !== leaf.index ? (
                <PageFrame leaf={outgoing} className="zine-fade-out" />
              ) : null}
              <PageFrame leaf={leaf} className="zine-fade-in" />
            </div>
          ) : (
            <div key="track" ref={trackRef} className="zine-track" data-testid="zine-track">
              {leaves.map((page) => (
                <PageFrame
                  key={`${page.spread}-${page.side}`}
                  leaf={page}
                  width={stageWidth}
                  eager={Math.abs(page.index - index) <= 1}
                />
              ))}
            </div>
          )}
          <aside
            className={leaf.stop === 1 ? 'zine-sr' : 'zine-plate'}
            aria-label={leaf.title}
            data-stop={leaf.stop}
            data-testid={leaf.stop === 1 ? 'zine-cover-note' : 'zine-plate'}
          >
            <div className="zine-plate-head">
              <p className="zine-plate-kicker zine-mono">{leaf.kicker}</p>
              <p className="zine-plate-page zine-mono">{leaf.pageLabel}</p>
            </div>
            <span className="zine-rule" aria-hidden />
            <p className="zine-plate-title">{leaf.title}</p>
            {leaf.subtitle ? <p className="zine-plate-sub">{leaf.subtitle}</p> : null}
            <p className="zine-plate-body">{leaf.caption}</p>
          </aside>
          {leaf.stop > 1 && leaf.stop < 7 ? (
            <p className="zine-cue" data-testid="zine-cue" aria-hidden="true">
              {leaf.title}
            </p>
          ) : null}
        </div>
      </div>
      <footer className="zine-foot">
        {leaf.stop === 7 ? (
          <button type="button" className="zine-chip zine-play" data-testid="zine-play" onClick={onPlay}>
            {zineCopy.play}
          </button>
        ) : null}
        <div className="zine-foot-row">
          <button type="button" className="zine-step" onClick={() => goTo(index - 1, true)} disabled={index <= 0}>
            {zineCopy.prev}
          </button>
          <nav className="zine-ticks" aria-label={zineCopy.chaptersLabel}>
            {CHAPTERS.map((chapter) => {
              const current = chapter.stops.some((value) => value === stop)
              return (
                <button
                  key={chapter.id}
                  type="button"
                  className="zine-tick"
                  aria-current={current ? 'true' : undefined}
                  onClick={() => goTo(leafIndexFor(leaves, chapter.stops[0] ?? 1, 0), true)}
                >
                  <i aria-hidden />
                  <span>{chapter.label}</span>
                </button>
              )
            })}
          </nav>
          <button
            type="button"
            className="zine-step"
            onClick={() => goTo(index + 1, true)}
            disabled={index >= maxIndex}
          >
            {zineCopy.next}
          </button>
        </div>
        {note === 'manual' ? (
          <input className="zine-link" readOnly value={manualUrl} aria-label={zineCopy.linkLabel} />
        ) : null}
        <p className="zine-legal">{zineCopy.byline}</p>
        <p className="zine-legal">{zineCopy.credits}</p>
        <p className="zine-legal">{zineCopy.disclaimer}</p>
      </footer>
      <p className="zine-sr">{zineCopy.keys}</p>
      <p className="zine-sr" aria-live="polite">
        {announce}
      </p>
    </div>
  )
}

function PageFrame({
  leaf,
  width,
  className,
  eager = true,
}: {
  leaf: Leaf
  width?: number
  className?: string
  eager?: boolean
}) {
  const cover = leaf.stop === 1 && leaf.side === 'full'
  return (
    <div className={className ? `zine-page ${className}` : 'zine-page'} style={width ? { width } : undefined}>
      {cover ? (
        <CoverImage leaf={leaf} eager={eager} />
      ) : (
        <img
          src={zineFileUrl(leaf.file)}
          alt={leaf.alt}
          width={leaf.width}
          height={leaf.height}
          draggable={false}
          loading={eager ? 'eager' : 'lazy'}
        />
      )}
    </div>
  )
}

function CoverImage({
  leaf,
  eager = true,
  imgRef,
  style,
}: {
  leaf: Leaf
  eager?: boolean
  imgRef?: Ref<HTMLImageElement>
  style?: CSSProperties
}) {
  const src = zineFileUrl(leaf.file)
  const [ready, setReady] = useState(false)
  const localRef = useRef<HTMLImageElement>(null)

  const setRefs = (node: HTMLImageElement | null) => {
    localRef.current = node
    if (typeof imgRef === 'function') imgRef(node)
    else if (imgRef && typeof imgRef === 'object') {
      ;(imgRef as { current: HTMLImageElement | null }).current = node
    }
  }

  useEffect(() => {
    const image = localRef.current
    if (image && image.complete && image.naturalWidth > 0) setReady(true)
  }, [src])

  return (
    <span className="zine-cover">
      <span
        className="zine-cover-preview"
        data-testid="zine-cover-preview"
        aria-hidden="true"
        style={{ backgroundImage: `url("${zineFileUrl(leaf.thumb)}")` }}
      />
      <img
        ref={setRefs}
        className="zine-cover-full"
        data-ready={ready ? 'true' : 'false'}
        data-testid="zine-cover-full"
        src={src}
        alt={leaf.alt}
        width={leaf.width}
        height={leaf.height}
        draggable={false}
        loading={eager ? 'eager' : 'lazy'}
        style={style}
        onLoad={() => setReady(true)}
      />
    </span>
  )
}
