import { useCallback, useEffect, useRef, useState } from 'react'
import { CYCLE_MS, WINDOW_END, WINDOW_START } from '@/game/puzzles.ts'
import { usePrefersReducedMotion } from '@/hooks/usePrefers.ts'

export function useCycle(active: boolean) {
  const reduced = usePrefersReducedMotion()
  const [progress, setProgress] = useState(0)
  const startRef = useRef(0)

  const reset = useCallback(() => {
    startRef.current = performance.now()
    setProgress(reduced ? 1 : 0)
  }, [reduced])

  useEffect(() => {
    if (!active) {
      setProgress(0)
      return
    }
    if (reduced) {
      setProgress(1)
      return
    }

    startRef.current = performance.now()
    setProgress(0)
    let frame = 0
    const tick = (now: number) => {
      const elapsed = (now - startRef.current) % CYCLE_MS
      setProgress(elapsed / CYCLE_MS)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, reduced])

  const shown = active ? progress : 0
  const inWindow = active && (reduced || (shown >= WINDOW_START && shown < WINDOW_END))

  return { progress: shown, inWindow, reduced, reset }
}
