import { readBestTime, readHighScore, writeBestTime as writeLegacyTime, writeHighScore } from '@/game/storage.ts'
import type { LevelId } from '@/game/types.ts'

const KEY = 'shinkei-care-progress'

export type Progress = {
  unlocked: LevelId
  quality: Record<LevelId, number>
  time: Record<LevelId, number | null>
}

const empty: Progress = {
  unlocked: 1,
  quality: { 1: 0, 2: 0, 3: 0 },
  time: { 1: null, 2: null, 3: null },
}

function parse(raw: string | null): Progress {
  if (!raw) return { ...empty, quality: { ...empty.quality }, time: { ...empty.time } }
  try {
    const data = JSON.parse(raw) as Partial<Progress>
    const unlocked = data.unlocked === 3 || data.unlocked === 2 ? data.unlocked : 1
    return {
      unlocked,
      quality: {
        1: Number(data.quality?.[1]) || 0,
        2: Number(data.quality?.[2]) || 0,
        3: Number(data.quality?.[3]) || 0,
      },
      time: {
        1: typeof data.time?.[1] === 'number' ? data.time[1] : null,
        2: typeof data.time?.[2] === 'number' ? data.time[2] : null,
        3: typeof data.time?.[3] === 'number' ? data.time[3] : null,
      },
    }
  } catch {
    return { ...empty, quality: { ...empty.quality }, time: { ...empty.time } }
  }
}

export function readProgress(): Progress {
  let stored = empty
  try {
    stored = parse(localStorage.getItem(KEY))
  } catch {
    stored = { ...empty, quality: { ...empty.quality }, time: { ...empty.time } }
  }

  if (stored.quality[1] === 0) {
    const legacy = readHighScore()
    if (legacy > 0) stored.quality[1] = legacy
  }
  if (stored.time[1] === null) {
    stored.time[1] = readBestTime()
  }
  return stored
}

function save(next: Progress): Progress {
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    return next
  }
  return next
}

export function writeLevelQuality(level: LevelId, score: number): { progress: Progress; isNew: boolean } {
  const prev = readProgress()
  const isNew = score > prev.quality[level]
  const quality = { ...prev.quality, [level]: Math.max(prev.quality[level], score) }
  const unlocked: LevelId = score > 0 && prev.unlocked < 3 && level === prev.unlocked
    ? ((prev.unlocked + 1) as LevelId)
    : prev.unlocked
  const progress = save({ ...prev, quality, unlocked })
  if (level === 1) writeHighScore(score)
  return { progress, isNew }
}

export function writeLevelTime(level: LevelId, ms: number): { progress: Progress; isNew: boolean } {
  const prev = readProgress()
  const elapsed = Math.max(1, Math.round(ms))
  const current = prev.time[level]
  const isNew = current === null || elapsed < current
  const time = { ...prev.time, [level]: isNew ? elapsed : current }
  const progress = save({ ...prev, time })
  if (level === 1) writeLegacyTime(elapsed)
  return { progress, isNew }
}

export function isUnlocked(progress: Progress, level: LevelId): boolean {
  return level <= progress.unlocked
}
