import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { haptic } from '@/lib/haptics.ts'
import { hitsDropZone } from '@/lib/hit.ts'

const DRAG_THRESHOLD = 4
const DROP_PAD = 32

type Options = {
  dropRef: RefObject<HTMLButtonElement | null>
  tokenRef: RefObject<HTMLButtonElement | null>
  onSelect: () => void
  onPlace: () => void
  onMiss: () => void
}

type DragState = {
  active: boolean
  pointerId: number
  startX: number
  startY: number
  moved: boolean
  ignoreClick: boolean
}

const idle: DragState = {
  active: false,
  pointerId: -1,
  startX: 0,
  startY: 0,
  moved: false,
  ignoreClick: false,
}

export function useDragToDrop({ dropRef, tokenRef, onSelect, onPlace, onMiss }: Options) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [overDrop, setOverDrop] = useState(false)
  const drag = useRef<DragState>({ ...idle })
  const callbacks = useRef({ onSelect, onPlace, onMiss })
  const cleanup = useRef<(() => void) | null>(null)
  callbacks.current = { onSelect, onPlace, onMiss }

  const markDropHot = useCallback((hot: boolean) => {
    const node = dropRef.current
    if (!node) return
    if (hot) node.dataset.hot = 'true'
    else delete node.dataset.hot
  }, [dropRef])

  const finish = useCallback(
    (clientX: number, clientY: number, cancelled: boolean) => {
      const state = drag.current
      if (!state.active) return
      state.active = false
      state.ignoreClick = true
      cleanup.current?.()
      cleanup.current = null
      setDragging(false)
      setOverDrop(false)
      setOffset({ x: 0, y: 0 })
      markDropHot(false)

      if (cancelled || !state.moved) {
        if (!cancelled && !state.moved) callbacks.current.onSelect()
        return
      }

      const hit = hitsDropZone({
        pointerX: clientX,
        pointerY: clientY,
        drop: dropRef.current?.getBoundingClientRect() ?? null,
        token: tokenRef.current?.getBoundingClientRect() ?? null,
        pad: DROP_PAD,
      })
      if (hit) {
        haptic('success')
        callbacks.current.onPlace()
        return
      }
      haptic('miss')
      callbacks.current.onMiss()
    },
    [dropRef, markDropHot, tokenRef],
  )

  const onWindowMove = useCallback(
    (event: PointerEvent) => {
      const state = drag.current
      if (!state.active || event.pointerId !== state.pointerId) return
      if (event.cancelable) event.preventDefault()
      const dx = event.clientX - state.startX
      const dy = event.clientY - state.startY
      if (!state.moved && Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
        state.moved = true
        setDragging(true)
        haptic('start')
      }
      if (!state.moved) return
      setOffset({ x: dx, y: dy })
      const hot = hitsDropZone({
        pointerX: event.clientX,
        pointerY: event.clientY,
        drop: dropRef.current?.getBoundingClientRect() ?? null,
        token: tokenRef.current?.getBoundingClientRect() ?? null,
        pad: DROP_PAD,
      })
      setOverDrop(hot)
      markDropHot(hot)
    },
    [dropRef, markDropHot, tokenRef],
  )

  const onWindowUp = useCallback(
    (event: PointerEvent) => {
      if (event.pointerId !== drag.current.pointerId) return
      finish(event.clientX, event.clientY, false)
    },
    [finish],
  )

  const onWindowCancel = useCallback(
    (event: PointerEvent) => {
      if (event.pointerId !== drag.current.pointerId) return
      finish(event.clientX, event.clientY, true)
    },
    [finish],
  )

  const bindWindow = useCallback(() => {
    cleanup.current?.()
    const move = (event: PointerEvent) => onWindowMove(event)
    const up = (event: PointerEvent) => onWindowUp(event)
    const cancel = (event: PointerEvent) => onWindowCancel(event)
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    cleanup.current = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
    }
  }, [onWindowCancel, onWindowMove, onWindowUp])

  useEffect(() => {
    const node = tokenRef.current
    if (!node) return
    const block = (event: TouchEvent) => {
      if (!drag.current.active) return
      if (event.cancelable) event.preventDefault()
    }
    node.addEventListener('touchstart', block, { passive: false })
    node.addEventListener('touchmove', block, { passive: false })
    return () => {
      node.removeEventListener('touchstart', block)
      node.removeEventListener('touchmove', block)
    }
  }, [tokenRef])

  useEffect(() => () => cleanup.current?.(), [])

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (event.cancelable) event.preventDefault()
    event.stopPropagation()
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is optional. Window listeners still track the finger.
    }
    drag.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      ignoreClick: false,
    }
    bindWindow()
  }

  return {
    offset,
    dragging,
    overDrop,
    pressed: drag.current.active || dragging,
    dragProps: {
      onPointerDown,
      onPointerMove: (event: ReactPointerEvent<HTMLElement>) => onWindowMove(event.nativeEvent),
      onPointerUp: (event: ReactPointerEvent<HTMLElement>) => onWindowUp(event.nativeEvent),
      onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => onWindowCancel(event.nativeEvent),
      onClick: (event: ReactMouseEvent<HTMLElement>) => {
        if (drag.current.ignoreClick || drag.current.moved) {
          event.preventDefault()
          event.stopPropagation()
          drag.current.ignoreClick = false
          return
        }
        callbacks.current.onSelect()
      },
    },
  }
}
