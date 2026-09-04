const KEY = 'shinkei-care-high-score'
const MUTE_KEY = 'shinkei-care-mute'
const TIME_KEY = 'shinkei-care-best-time'

export function readHighScore(): number {
  try {
    const raw = localStorage.getItem(KEY)
    const n = raw ? Number.parseInt(raw, 10) : 0
    return Number.isFinite(n) && n > 0 ? n : 0
  } catch {
    return 0
  }
}

export function writeHighScore(score: number): number {
  const prev = readHighScore()
  const next = Math.max(prev, score)
  try {
    localStorage.setItem(KEY, String(next))
  } catch {
    return next
  }
  return next
}

export function readMutePreference(): boolean | null {
  try {
    const raw = localStorage.getItem(MUTE_KEY)
    if (raw === '1') return true
    if (raw === '0') return false
    return null
  } catch {
    return null
  }
}

export function writeMutePreference(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    // Private mode can block writes. The in-memory mute flag still works.
  }
}

export function readBestTime(): number | null {
  try {
    const raw = localStorage.getItem(TIME_KEY)
    if (!raw) return null
    const n = Number.parseInt(raw, 10)
    return Number.isFinite(n) && n > 0 ? n : null
  } catch {
    return null
  }
}

export function writeBestTime(ms: number): { best: number; isNew: boolean } {
  const elapsed = Math.max(1, Math.round(ms))
  const prev = readBestTime()
  const isNew = prev === null || elapsed < prev
  const best = isNew ? elapsed : prev
  if (isNew) {
    try {
      localStorage.setItem(TIME_KEY, String(best))
    } catch {
      return { best, isNew }
    }
  }
  return { best, isNew }
}
