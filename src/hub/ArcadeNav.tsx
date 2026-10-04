import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { hubCopy } from '@/game/hubCopy.ts'
import type { ArcadeMode } from '@/game/mode.ts'
import { usePrefersReducedMotion } from '@/hooks/usePrefers.ts'
import { stepSpring } from '@/zine/spring.ts'
import { indicatorTransform, stepTab, tabItems } from '@/motion/tabs.ts'
import { entranceTotalMs, motionTokens, SPRING_OMEGA } from '@/motion/tokens.ts'

type Props = {
  mode: ArcadeMode
  onMode: (mode: ArcadeMode) => void
}

let navEntered = false

type SpringPair = { x: number; v: number }

export function ArcadeNav({ mode, onMode }: Props) {
  const reduce = usePrefersReducedMotion()
  const listRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const place = useRef<SpringPair>({ x: 0, v: 0 })
  const lift = useRef<SpringPair>({ x: 0, v: 0 })
  const width = useRef<SpringPair>({ x: motionTokens.indicatorBasePx, v: 0 })
  const run = useRef(0)
  const seen = useRef(false)
  const [pressed, setPressed] = useState<ArcadeMode | null>(null)
  const [enter, setEnter] = useState(false)

  useEffect(() => {
    if (navEntered) return
    setEnter(true)
    const timer = window.setTimeout(() => {
      navEntered = true
      setEnter(false)
    }, entranceTotalMs(tabItems.length))
    return () => window.clearTimeout(timer)
  }, [])

  const paint = (opacity: number) => {
    const node = indicatorRef.current
    if (!node) return
    node.style.opacity = String(opacity)
    node.style.transform = indicatorTransform(place.current.x, lift.current.x, width.current.x)
  }

  const jump = (x: number, y: number, w: number) => {
    run.current += 1
    place.current = { x, v: 0 }
    lift.current = { x: y, v: 0 }
    width.current = { x: w, v: 0 }
    paint(1)
  }

  const glide = (x: number, y: number, w: number) => {
    const token = run.current + 1
    run.current = token
    let last = performance.now()
    const tick = (now: number) => {
      if (run.current !== token) return
      const dt = (now - last) / 1000
      last = now
      place.current = stepSpring(place.current, x, dt, SPRING_OMEGA)
      lift.current = stepSpring(lift.current, y, dt, SPRING_OMEGA)
      width.current = stepSpring(width.current, w, dt, SPRING_OMEGA)
      paint(1)
      const placed = place.current.x === x && place.current.v === 0
      const raised = lift.current.x === y && lift.current.v === 0
      const sized = width.current.x === w && width.current.v === 0
      if (placed && raised && sized) return
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      const button = list.querySelector<HTMLButtonElement>(`[data-mode="${mode}"]`)
      if (!button) return null
      return {
        button,
        x: button.offsetLeft,
        y: button.offsetTop,
        w: button.offsetWidth,
      }
    }
    const box = measure()
    if (!box) {
      paint(0)
      return
    }
    if (!seen.current || reduce) {
      seen.current = true
      jump(box.x, box.y, box.w)
    } else {
      glide(box.x, box.y, box.w)
      const scroller = list.parentElement
      if (scroller) {
        const start = box.button.offsetLeft
        const end = start + box.button.offsetWidth
        const viewStart = scroller.scrollLeft
        const viewEnd = viewStart + scroller.clientWidth
        if (start < viewStart || end > viewEnd) {
          const left = start - (scroller.clientWidth - box.button.offsetWidth) / 2
          scroller.scrollTo({ left: Math.max(left, 0), behavior: 'smooth' })
        }
      }
    }
    const onResize = () => {
      const next = measure()
      if (!next) return
      jump(next.x, next.y, next.w)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [mode, reduce])

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const focused = (event.target as HTMLElement).closest('button[data-mode]')
    if (!(focused instanceof HTMLButtonElement)) return
    const index = tabItems.findIndex((item) => item.mode === focused.dataset.mode)
    if (index < 0) return
    const next = stepTab(index, event.key, tabItems.length)
    if (next == null) return
    event.preventDefault()
    const item = tabItems[next]
    if (!item) return
    onMode(item.mode)
    listRef.current?.querySelector<HTMLButtonElement>(`[data-mode="${item.mode}"]`)?.focus()
  }

  const press = (itemMode: ArcadeMode) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    setPressed(itemMode)
  }

  return (
    <div className="sere-tabs" data-testid="sere-tabs" data-enter={enter ? 'true' : 'false'}>
      <div className="sere-tabs-scroll">
        <div
          ref={listRef}
          className="sere-tablist"
          role="tablist"
          aria-label={hubCopy.nav}
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
        >
          {tabItems.map((item, index) => {
            const selected = item.mode === mode
            const listed = tabItems.some((tab) => tab.mode === mode)
            const delay = enter && !reduce ? index * motionTokens.entranceStaggerMs : 0
            return (
              <button
                key={item.mode}
                type="button"
                role="tab"
                id={`sere-tab-${item.mode}`}
                data-mode={item.mode}
                data-enter={enter ? 'true' : 'false'}
                data-pressed={pressed === item.mode ? 'true' : 'false'}
                aria-selected={selected}
                aria-controls="game"
                tabIndex={selected || (!listed && item.mode === 'hub') ? 0 : -1}
                className="sere-tab"
                style={{ animationDelay: `${delay}ms` } as CSSProperties}
                onClick={() => onMode(item.mode)}
                onPointerDown={press(item.mode)}
                onPointerUp={() => setPressed(null)}
                onPointerCancel={() => setPressed(null)}
                onPointerLeave={() => setPressed(null)}
              >
                <span className="sere-tab-wash" aria-hidden />
                <span className="sere-tab-label">{item.label}</span>
              </button>
            )
          })}
          <span ref={indicatorRef} className="sere-indicator" data-testid="sere-indicator" aria-hidden />
        </div>
      </div>
    </div>
  )
}
