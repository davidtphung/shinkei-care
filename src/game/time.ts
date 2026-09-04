export function formatRaceTime(ms: number): string {
  const safe = Math.max(0, ms)
  const tenths = Math.floor(safe / 100) % 10
  const totalSeconds = Math.floor(safe / 1000)
  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths}`
}
