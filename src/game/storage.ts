const KEY = 'shinkei-care-high-score'

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
