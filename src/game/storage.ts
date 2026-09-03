const KEY = 'shinkei-care-high-score'
const MUTE_KEY = 'shinkei-care-mute'

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
