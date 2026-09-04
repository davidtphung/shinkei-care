import { useEffect, useState } from 'react'
import { applyMute, playConfirm, unlockAudio } from '@/game/audio.ts'
import { readMutePreference, writeMutePreference } from '@/game/storage.ts'
import { usePrefersReducedMotion } from '@/hooks/usePrefers.ts'

export function useMute() {
  const reduced = usePrefersReducedMotion()
  const [muted, setMutedState] = useState(() => {
    const stored = readMutePreference()
    if (stored !== null) return stored
    return false
  })

  useEffect(() => {
    if (readMutePreference() !== null) return
    if (reduced) setMutedState(true)
  }, [reduced])

  useEffect(() => {
    applyMute(muted)
  }, [muted])

  const setMuted = (next: boolean) => {
    setMutedState(next)
    writeMutePreference(next)
    applyMute(next)
    if (!next) {
      void unlockAudio().then((ok) => {
        if (ok) playConfirm()
      })
    }
  }

  return {
    muted,
    setMuted,
    toggle: () => setMuted(!muted),
  }
}
