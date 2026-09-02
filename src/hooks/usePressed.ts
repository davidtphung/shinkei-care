import { useState } from 'react'

export function usePressed() {
  const [pressed, setPressed] = useState(false)

  return {
    pressed,
    pressProps: {
      onPointerDown: () => setPressed(true),
      onPointerUp: () => setPressed(false),
      onPointerCancel: () => setPressed(false),
      onPointerLeave: () => setPressed(false),
    },
  }
}
