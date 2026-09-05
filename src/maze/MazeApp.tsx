import { useEffect, useRef, useState } from 'react'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { RaceClock } from '@/components/RaceClock.tsx'
import { Button } from '@/components/ui/button.tsx'
import { playCue, unlockAudio } from '@/game/audio.ts'
import { copy } from '@/game/copy.ts'
import { qualifiesForBoard, submitScore } from '@/game/leaderboard.ts'
import { formatRaceTime } from '@/game/time.ts'
import type { LevelId } from '@/game/types.ts'
import { NamePrompt } from '@/hub/NamePrompt.tsx'
import { usePrefersReducedMotion } from '@/hooks/usePrefers.ts'
import { mazeCopy, mazeLevelName, mazeRankLabel } from '@/maze/copy.ts'
import { drawMaze } from '@/maze/draw.ts'
import { createMaze, qualityFor, queueDir, startRun, stepMaze, togglePause } from '@/maze/engine.ts'
import { MazeTitle } from '@/maze/MazeTitle.tsx'
import { readMazeProgress, writeMazeQuality, writeMazeTime, type MazeProgress } from '@/maze/progress.ts'
import type { Dir, MazeState } from '@/maze/types.ts'
import { cn } from '@/lib/utils.ts'

type Screen = 'title' | 'play' | 'score'
type Hud = {
  score: number
  freshness: number
  freshnessMax: number
  announcement: string
  phase: MazeState['phase']
  elapsed: number
  combo: number
}

type Props = {
  onHub: () => void
  onBoardChange: () => void
}

const KEY_DIR: Record<string, Dir> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  a: 'left',
  A: 'left',
  s: 'down',
  S: 'down',
  d: 'right',
  D: 'right',
}

export function MazeApp({ onHub, onBoardChange }: Props) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<MazeState | null>(null)
  const lastRef = useRef(0)
  const rafRef = useRef(0)
  const endedRef = useRef(false)
  const lastCueRef = useRef('')
  const [screen, setScreen] = useState<Screen>('title')
  const [level, setLevel] = useState<LevelId>(1)
  const [progress, setProgress] = useState<MazeProgress>(() => readMazeProgress())
  const [hud, setHud] = useState<Hud | null>(null)
  const [result, setResult] = useState<{
    score: number
    elapsed: number
    freshness: number
    freshnessMax: number
    newBestQuality: boolean
    newBestTime: boolean
    prompt: boolean
  } | null>(null)

  const stopLoop = () => {
    cancelAnimationFrame(rafRef.current)
    frameRef.current = null
  }

  const finish = (state: MazeState) => {
    if (endedRef.current) return
    endedRef.current = true
    const scored = qualityFor(state)
    const ms = Math.max(1, Math.round(state.elapsed))
    const quality = writeMazeQuality(state.level, scored)
    const time = writeMazeTime(state.level, ms)
    setProgress(time.progress)
    const prompt =
      (quality.isNew || time.isNew || qualifiesForBoard('maze', scored)) && scored > 0
    setResult({
      score: scored,
      elapsed: ms,
      freshness: state.freshness,
      freshnessMax: state.freshnessMax,
      newBestQuality: quality.isNew,
      newBestTime: time.isNew,
      prompt,
    })
    playCue(state.phase === 'clear' ? 'seal' : 'miss')
    setScreen('score')
    stopLoop()
  }

  const begin = (nextLevel: LevelId) => {
    void unlockAudio()
    stopLoop()
    endedRef.current = false
    setLevel(nextLevel)
    setResult(null)
    const state = createMaze(nextLevel, reduced)
    frameRef.current = state
    lastRef.current = 0
    lastCueRef.current = state.announcement
    setHud(snapshot(state))
    setScreen('play')
  }

  useEffect(() => {
    if (screen !== 'play' || !frameRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return

    const loop = (now: number) => {
      const state = frameRef.current
      if (!state) return
      if (!lastRef.current) lastRef.current = now
      const dt = (now - lastRef.current) / 1000
      lastRef.current = now
      const before = state.announcement
      const dots = state.dotsLeft
      const fright = state.frightenLeft
      stepMaze(state, dt)
      if (state.announcement !== before || state.dotsLeft !== dots) {
        if (state.announcement !== lastCueRef.current) {
          lastCueRef.current = state.announcement
          if (state.announcement === mazeCopy.collectIce || state.announcement === mazeCopy.collectDot) playCue('ice')
          else if (state.announcement === mazeCopy.collectSpike) playCue('spike')
          else if (state.announcement === mazeCopy.collectChain) playCue('combo')
          else if (state.announcement === mazeCopy.eatGhost) playCue('combo')
          else if (state.announcement === mazeCopy.hit || state.announcement === mazeCopy.drain) playCue('miss')
          else if (state.announcement === mazeCopy.gateMiss) playCue('miss')
          else if ((mazeCopy.collectGate as readonly string[]).includes(state.announcement)) {
            playCue('gill')
          }
        }
      }
      if (fright > 0 && state.frightenLeft === 0) playCue('window')
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        drawMaze(ctx, state, rect.width, rect.height)
      }
      if (now % 3 < 16) setHud(snapshot(state))
      if (state.phase === 'clear' || state.phase === 'over') {
        finish(state)
        return
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [screen, reduced])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (screen === 'title' || screen === 'score') {
          onHub()
          return
        }
        const state = frameRef.current
        if (!state) return
        if (state.phase === 'ready') {
          onHub()
          return
        }
        togglePause(state)
        setHud(snapshot(state))
        return
      }
      const dir = KEY_DIR[event.key]
      if (!dir) return
      event.preventDefault()
      const state = frameRef.current
      if (!state || screen !== 'play') return
      queueDir(state, dir)
      setHud(snapshot(state))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, onHub])

  const steer = (dir: Dir) => {
    const state = frameRef.current
    if (!state) return
    void unlockAudio()
    queueDir(state, dir)
    setHud(snapshot(state))
  }

  if (screen === 'title') {
    return <MazeTitle progress={progress} onPlay={begin} onHub={onHub} />
  }

  if (screen === 'score' && result) {
    return (
      <MazeScore
        level={level}
        result={result}
        progress={progress}
        onAgain={() => begin(level)}
        onLevels={() => setScreen('title')}
        onHub={onHub}
        onSaved={onBoardChange}
      />
    )
  }

  return (
    <div className="play-pad cabinet relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        {hud ? <RaceClock elapsed={hud.elapsed} /> : <span />}
        <Button variant="outline" className="min-h-11 px-4 text-xs tracking-[0.12em] uppercase" onClick={onHub}>
          {mazeCopy.hub}
        </Button>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-navy/70 uppercase">
            {mazeLevelName(level)}
          </p>
          <p className="text-xl font-semibold text-navy">{mazeCopy.quality}</p>
        </div>
        <p className="text-3xl font-semibold text-navy tabular-nums">{hud?.score ?? 0}</p>
      </div>
      {hud ? (
        <FreshnessMeter value={hud.freshness} max={hud.freshnessMax} />
      ) : null}
      <p className="stage-announce min-h-12 rounded-2xl bg-cream px-4 py-3 text-center text-base font-semibold text-navy" aria-live="polite">
        {hud?.announcement ?? ''}
      </p>
      <div className="maze-window relative overflow-hidden rounded-3xl border-4 border-navy bg-ink shadow-xl">
        <canvas ref={canvasRef} className="block h-full w-full touch-none" />
        {hud?.phase === 'ready' ? (
          <div className="absolute inset-0 flex flex-col justify-end bg-navy/55 p-4">
            <div className="rounded-3xl bg-cream p-4 text-navy">
              <p className="text-lg font-semibold">{mazeCopy.readyLead[level - 1]}</p>
              <p className="mt-2 text-sm">{mazeCopy.readyTeach[level - 1]}</p>
              <p className="mt-2 text-sm text-navy/80">{mazeCopy.readyMda[level - 1]}</p>
              <Button
                className="mt-4 w-full"
                onClick={() => {
                  const state = frameRef.current
                  if (!state) return
                  startRun(state)
                  setHud(snapshot(state))
                }}
              >
                {mazeCopy.start}
              </Button>
            </div>
          </div>
        ) : null}
        {hud?.phase === 'pause' ? (
          <div className="absolute inset-0 flex flex-col justify-end bg-navy/55 p-4">
            <div className="rounded-3xl bg-cream p-4 text-navy">
              <p className="text-lg font-semibold">{mazeCopy.paused}</p>
              <Button
                className="mt-4 w-full"
                onClick={() => {
                  const state = frameRef.current
                  if (!state) return
                  togglePause(state)
                  setHud(snapshot(state))
                }}
              >
                {mazeCopy.resume}
              </Button>
              <Button variant="outline" className="mt-2 w-full" onClick={onHub}>
                {mazeCopy.leave}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      <p className="text-center text-xs text-navy/70">{mazeCopy.legend}</p>
      <DPad onSteer={steer} />
    </div>
  )
}

function MazeScore({
  level,
  result,
  progress,
  onAgain,
  onLevels,
  onHub,
  onSaved,
}: {
  level: LevelId
  result: {
    score: number
    elapsed: number
    freshness: number
    freshnessMax: number
    newBestQuality: boolean
    newBestTime: boolean
    prompt: boolean
  }
  progress: MazeProgress
  onAgain: () => void
  onLevels: () => void
  onHub: () => void
  onSaved: () => void
}) {
  const [prompt, setPrompt] = useState(result.prompt)
  const label = mazeRankLabel(result.score, result.freshness, result.freshnessMax)

  const save = (name: string) => {
    submitScore({ game: 'maze', name, score: result.score, timeMs: result.elapsed, level })
    onSaved()
    setPrompt(false)
  }

  return (
    <div className="play-pad cabinet relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-center gap-5">
      <p className="text-center text-xs font-semibold tracking-[0.24em] text-navy uppercase">
        {mazeLevelName(level)} · {mazeCopy.quality}
      </p>
      <p className="text-center text-7xl font-semibold leading-none text-navy">{result.score}</p>
      <p className="font-display text-center text-5xl text-cream drop-shadow-[0_2px_0_#0B1424]">{label}</p>
      <p className="text-center text-base text-navy tabular-nums">
        {copy.time} {formatRaceTime(result.elapsed)}
      </p>
      <p className="text-center text-base text-navy">
        {progress.quality[level] > 0 ? copy.bestScore(progress.quality[level]) : mazeCopy.firstQuality}
      </p>
      {progress.time[level] !== null ? (
        <p className="text-center text-base text-navy tabular-nums">
          {copy.bestTimeValue(formatRaceTime(progress.time[level] ?? 0))}
        </p>
      ) : null}
      {result.newBestQuality || result.newBestTime ? (
        <p className="text-center text-sm font-semibold tracking-[0.16em] text-navy uppercase">{copy.newBest}</p>
      ) : null}
      {prompt ? <NamePrompt onSave={save} onSkip={() => setPrompt(false)} /> : null}
      <Button className="w-full text-lg" onClick={onAgain}>
        {mazeCopy.playAgain}
      </Button>
      <Button variant="outline" className="w-full" onClick={onLevels}>
        {mazeCopy.backLevels}
      </Button>
      <Button variant="outline" className="w-full" onClick={onHub}>
        {mazeCopy.hub}
      </Button>
    </div>
  )
}

function DPad({ onSteer }: { onSteer: (dir: Dir) => void }) {
  return (
    <div className="maze-pad mx-auto grid w-[12.5rem] grid-cols-3 grid-rows-3 gap-1.5" aria-label={mazeCopy.pad}>
      <span />
      <PadButton label={mazeCopy.up} onHold={() => onSteer('up')}>
        ↑
      </PadButton>
      <span />
      <PadButton label={mazeCopy.left} onHold={() => onSteer('left')}>
        ←
      </PadButton>
      <span />
      <PadButton label={mazeCopy.right} onHold={() => onSteer('right')}>
        →
      </PadButton>
      <span />
      <PadButton label={mazeCopy.down} onHold={() => onSteer('down')}>
        ↓
      </PadButton>
    </div>
  )
}

function PadButton({
  label,
  onHold,
  children,
}: {
  label: string
  onHold: () => void
  children: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'hit-target min-h-12 rounded-2xl border-2 border-navy bg-cream text-xl font-semibold text-navy',
      )}
      onPointerDown={(event) => {
        event.preventDefault()
        onHold()
      }}
    >
      {children}
    </button>
  )
}

function snapshot(state: MazeState): Hud {
  return {
    score: state.score,
    freshness: state.freshness,
    freshnessMax: state.freshnessMax,
    announcement: state.announcement,
    phase: state.phase,
    elapsed: state.elapsed,
    combo: state.combo,
  }
}
