import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefers.ts'

export function CoolWater() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = usePrefersReducedMotion()
  const [offscreen, setOffscreen] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    let visible = true
    const sync = () => setOffscreen(!visible || document.hidden)
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting)
        sync()
      },
      { threshold: 0 },
    )
    observer.observe(node)
    document.addEventListener('visibilitychange', sync)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="cool-water"
      data-paused={reduce || offscreen ? 'true' : 'false'}
      data-reduce={reduce ? 'true' : 'false'}
      aria-hidden
    >
      <span />
      <span />
    </div>
  )
}
