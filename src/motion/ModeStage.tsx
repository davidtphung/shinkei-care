import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { ArcadeMode } from '../game/mode.ts'
import { usePrefersReducedMotion } from '../hooks/usePrefers.ts'
import { sharedAxis, tabIndex } from './tabs.ts'
import { motionTokens } from './tokens.ts'

type Props = {
  mode: ArcadeMode
  render: (mode: ArcadeMode) => ReactNode
}

export function ModeStage({ mode, render }: Props) {
  const reduce = usePrefersReducedMotion()
  const currentRef = useRef(mode)
  const [current, setCurrent] = useState(mode)
  const [prev, setPrev] = useState<ArcadeMode | null>(null)
  const [dir, setDir] = useState(1)
  const [moving, setMoving] = useState(false)
  const token = useRef(0)

  useEffect(() => {
    if (mode === currentRef.current) return
    setMoving(true)
    const axis = sharedAxis(tabIndex(currentRef.current), tabIndex(mode))
    setDir(axis.dir)
    setPrev(currentRef.current)
    currentRef.current = mode
    setCurrent(mode)
    const id = token.current + 1
    token.current = id
    const ms = reduce ? motionTokens.fadeMs : motionTokens.contentMs
    const timer = window.setTimeout(() => {
      if (token.current !== id) return
      setPrev(null)
    }, ms)
    return () => window.clearTimeout(timer)
  }, [mode, reduce])

  const shift = { '--mode-dir': String(dir) } as CSSProperties
  const inClass = !moving ? undefined : reduce ? 'mode-fade-in' : 'mode-in'
  const outClass = reduce ? 'mode-fade-out' : 'mode-out'

  return (
    <div className="mode-stage">
      {prev ? (
        <div key={`leave-${prev}`} className={outClass} style={shift} inert>
          {render(prev)}
        </div>
      ) : null}
      <div key={current} className={inClass} style={shift}>
        {render(current)}
      </div>
    </div>
  )
}
