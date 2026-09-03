import { useCallback, useEffect, useRef, useState } from 'react'
import { CYCLE_MS, WINDOW_END, WINDOW_START } from '@/game/puzzles.ts'
import { usePrefersReducedMotion } from '@/hooks/usePrefers.ts'

export function useCycle(active: boolean) {
  const reduced = usePrefersReducedMotion()
  const [progress, setProgress] = useState(reduced ? 0.7 : 0)
  const startRef = useRef(typeof performance === 'undefined' ? 0 : performance.now())

  const reset = useCallback(() => {
    startRef.current = performance.now()
    setProgress(reduced ? 0.7 : 0)
  }, [reduced])

  useEffect(() => {
    if (!active) return
    if (reduced) {
      setProgress(0.7)
      return
    }

    startRef.current = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const elapsed = (now - startRef.current) % CYCLE_MS
      setProgress(elapsed / CYCLE_MS)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, reduced])

  const inWindow = reduced || (progress >= WINDOW_START && progress < WINDOW_END)

  return { progress, inWindow, reduced, reset }
}
