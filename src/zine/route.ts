import { clampStop, SPREAD_COUNT } from './model.ts'

export function parseZineStop(hash: string): number | null {
  const value = hash.replace(/^#/, '').replace(/^\//, '')
  const match = /^zine(?:\/(\d+))?$/i.exec(value)
  if (!match) return null
  if (!match[1]) return 1
  return clampStop(Number(match[1]))
}

export function hashForZine(stop: number): string {
  const n = clampStop(stop)
  if (n === 1) return '#zine'
  return `#zine/${n}`
}

export function canonicalZineHash(hash: string): string {
  const value = hash.replace(/^#/, '').replace(/^\//, '')
  if (!/^zine(?:\/.*)?$/i.test(value)) return '#zine'
  const stop = parseZineStop(hash)
  if (stop == null) return '#zine'
  return hashForZine(stop)
}

export function isZineHash(hash: string): boolean {
  const value = hash.replace(/^#/, '').replace(/^\//, '').toLowerCase()
  return value === 'zine' || value.startsWith('zine/')
}

export { SPREAD_COUNT }
