import { useEffect, useState } from 'react'
import { READY_MS } from '@/care/round.ts'

export function useReadyArm(onArm: () => void): boolean {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setArmed(true)
      onArm()
    }, READY_MS)
    return () => window.clearTimeout(timer)
  }, [onArm])

  return armed
}
