export type ArcadeMode = 'hub' | 'care' | 'maze' | 'leaderboard' | 'zine' | 'about'

export function parseModeHash(hash: string): ArcadeMode {
  const value = hash.replace(/^#/, '').replace(/^\//, '').toLowerCase()
  if (value === 'care') return 'care'
  if (value === 'maze' || value === 'run' || value === 'catch' || value === 'ocean') return 'maze'
  if (value === 'leaderboard' || value === 'board') return 'leaderboard'
  if (value === 'about') return 'about'
  if (value === 'zine' || value.startsWith('zine/')) return 'zine'
  return 'hub'
}

export function hashForMode(mode: ArcadeMode): string {
  if (mode === 'hub') return '#'
  if (mode === 'maze') return '#catch'
  return `#${mode}`
}
