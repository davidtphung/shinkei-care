import type { LevelId } from '@/game/types.ts'

const KEY = 'shinkei-maze-progress'

export type MazeProgress = {
  unlocked: LevelId
  quality: Record<LevelId, number>
  time: Record<LevelId, number | null>
}

const empty: MazeProgress = {
  unlocked: 1,
  quality: { 1: 0, 2: 0, 3: 0 },
  time: { 1: null, 2: null, 3: null },
}

function parse(raw: string | null): MazeProgress {
  if (!raw) return { unlocked: 1, quality: { 1: 0, 2: 0, 3: 0 }, time: { 1: null, 2: null, 3: null } }
  try {
    const data = JSON.parse(raw) as Partial<MazeProgress>
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
    return { unlocked: 1, quality: { 1: 0, 2: 0, 3: 0 }, time: { 1: null, 2: null, 3: null } }
  }
}

export function readMazeProgress(): MazeProgress {
  try {
    return parse(localStorage.getItem(KEY))
  } catch {
    return { ...empty, quality: { ...empty.quality }, time: { ...empty.time } }
  }
}

function save(next: MazeProgress): MazeProgress {
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    return next
  }
  return next
}

export function writeMazeQuality(level: LevelId, score: number): { progress: MazeProgress; isNew: boolean } {
  const prev = readMazeProgress()
  const isNew = score > prev.quality[level]
  const quality = { ...prev.quality, [level]: Math.max(prev.quality[level], score) }
  const unlocked: LevelId = score > 0 && prev.unlocked < 3 && level === prev.unlocked
    ? ((prev.unlocked + 1) as LevelId)
    : prev.unlocked
  return { progress: save({ ...prev, quality, unlocked }), isNew }
}

export function writeMazeTime(level: LevelId, ms: number): { progress: MazeProgress; isNew: boolean } {
  const prev = readMazeProgress()
  const elapsed = Math.max(1, Math.round(ms))
  const current = prev.time[level]
  const isNew = current === null || elapsed < current
  const time = { ...prev.time, [level]: isNew ? elapsed : current }
  return { progress: save({ ...prev, time }), isNew }
}

export function mazeUnlocked(progress: MazeProgress, level: LevelId): boolean {
  return level <= progress.unlocked
}
