import { useEffect, useRef, useState, type PointerEvent } from 'react'
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
import { mazeCopy, mazeLegend, mazeLevelName, mazeRankLabel } from '@/maze/copy.ts'
import { drawCatch } from '@/maze/draw.ts'
import {
  aimBoat,
  createCatch,
  feedHold,
  fireScoop,
  moveBoat,
  packLot,
  qualityFor,
  startRun,
  stepCatch,
  togglePause,
} from '@/maze/engine.ts'
import { MazeTitle } from '@/maze/MazeTitle.tsx'
import { readMazeProgress, writeMazeQuality, writeMazeTime, type MazeProgress } from '@/maze/progress.ts'
import { PACK_KEYS, type CatchState, type PackNeed } from '@/maze/types.ts'
import { cn } from '@/lib/utils.ts'

type Screen = 'title' | 'play' | 'score'
type Hud = {
  score: number
  freshness: number
  freshnessMax: number
  announcement: string
  phase: CatchState['phase']
  elapsed: number
  combo: number
  hold: number
  pack: number
  nextPack: PackNeed | null
}

type Props = {
  onHub: () => void
  onBoardChange: () => void
}

export function MazeApp({ onHub, onBoardChange }: Props) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<CatchState | null>(null)
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

  const finish = (state: CatchState) => {
    if (endedRef.current) return
    endedRef.current = true
    const scored = qualityFor(state)
    const ms = Math.max(1, Math.round(state.elapsed))
    const quality = writeMazeQuality(state.level, scored)
    const time = writeMazeTime(state.level, ms)
    setProgress(time.progress)
    const prompt = (quality.isNew || time.isNew || qualifiesForBoard('maze', scored)) && scored > 0
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
    const state = createCatch(nextLevel, reduced)
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
      stepCatch(state, dt)
      if (state.announcement !== before && state.announcement !== lastCueRef.current) {
        lastCueRef.current = state.announcement
        cueFor(state.announcement)
      }
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        drawCatch(ctx, state, rect.width, rect.height)
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
      if (screen !== 'play') return
      const state = frameRef.current
      if (!state) return
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        event.preventDefault()
        moveBoat(state, -1)
        setHud(snapshot(state))
        return
      }
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        event.preventDefault()
        moveBoat(state, 1)
        setHud(snapshot(state))
        return
      }
      if (event.key === ' ' || event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') {
        event.preventDefault()
        void unlockAudio()
        fireScoop(state)
        setHud(snapshot(state))
        return
      }
      if (event.key === 'f' || event.key === 'F' || event.key === 'ArrowDown' || event.key === 'Enter') {
        event.preventDefault()
        void unlockAudio()
        feedHold(state)
        setHud(snapshot(state))
        return
      }
      const pack = PACK_KEYS[event.key]
      if (!pack) return
      event.preventDefault()
      void unlockAudio()
      packLot(state, pack)
      setHud(snapshot(state))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, onHub])

  const pointBoat = (event: PointerEvent<HTMLCanvasElement>) => {
    const state = frameRef.current
    const canvas = canvasRef.current
    if (!state || !canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    if (x <= 0.58) {
      void unlockAudio()
      aimBoat(state, x)
      setHud(snapshot(state))
    }
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
    <div className="play-pad cabinet relative z-20 mx-auto flex min-h-0 w-full max-w-3xl flex-col gap-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
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
      {hud ? <FreshnessMeter value={hud.freshness} max={hud.freshnessMax} /> : null}
      <p className="stage-announce min-h-11 rounded-2xl bg-cream px-4 py-2 text-center text-base font-semibold text-navy" aria-live="polite">
        {hud?.announcement ?? ''}
      </p>
      <div className="maze-window relative overflow-hidden rounded-3xl border-4 border-navy bg-ink shadow-xl">
        <canvas
          ref={canvasRef}
          className="block h-full w-full touch-none"
          onPointerDown={pointBoat}
          onPointerMove={(event) => {
            if (event.buttons === 0) return
            pointBoat(event)
          }}
        />
        {hud?.phase === 'ready' ? (
          <div className="absolute inset-0 flex flex-col justify-end overflow-y-auto bg-navy/55 p-4">
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
          <div className="absolute inset-0 flex flex-col justify-end overflow-y-auto bg-navy/55 p-4">
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
      <p className="text-center text-xs text-navy/70">{mazeLegend(level)}</p>
      <CatchPad
        level={level}
        nextPack={hud?.nextPack ?? null}
        onLeft={() => {
          const state = frameRef.current
          if (!state) return
          moveBoat(state, -1)
          setHud(snapshot(state))
        }}
        onRight={() => {
          const state = frameRef.current
          if (!state) return
          moveBoat(state, 1)
          setHud(snapshot(state))
        }}
        onCatch={() => {
          const state = frameRef.current
          if (!state) return
          void unlockAudio()
          fireScoop(state)
          setHud(snapshot(state))
        }}
        onFeed={() => {
          const state = frameRef.current
          if (!state) return
          void unlockAudio()
          feedHold(state)
          setHud(snapshot(state))
        }}
        onPack={(need) => {
          const state = frameRef.current
          if (!state) return
          void unlockAudio()
          packLot(state, need)
          setHud(snapshot(state))
        }}
      />
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
    <div className="play-pad cabinet relative z-20 mx-auto flex w-full max-w-lg flex-col justify-start gap-5">
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

function CatchPad({
  level,
  nextPack,
  onLeft,
  onRight,
  onCatch,
  onFeed,
  onPack,
}: {
  level: LevelId
  nextPack: PackNeed | null
  onLeft: () => void
  onRight: () => void
  onCatch: () => void
  onFeed: () => void
  onPack: (need: PackNeed) => void
}) {
  const packs: PackNeed[] = level === 1 ? ['ice'] : level === 2 ? ['ice', 'seal'] : ['ice', 'band', 'crate']
  return (
    <div className="space-y-2" aria-label={mazeCopy.pad}>
      <div className="grid grid-cols-4 gap-1.5">
        <PadButton className="maze-move" label={mazeCopy.left} repeat onHold={onLeft}>
          ←
        </PadButton>
        <PadButton label={mazeCopy.catch} onHold={onCatch}>
          {mazeCopy.catch}
        </PadButton>
        <PadButton label={mazeCopy.feed} onHold={onFeed}>
          {mazeCopy.feed}
        </PadButton>
        <PadButton className="maze-move" label={mazeCopy.right} repeat onHold={onRight}>
          →
        </PadButton>
      </div>
      <div className={cn('grid gap-1.5', packs.length === 1 ? 'grid-cols-1' : packs.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
        {packs.map((need) => (
          <PadButton
            key={need}
            label={packButtonLabel(need)}
            onHold={() => onPack(need)}
            hot={nextPack === need}
          >
            {packButtonLabel(need)}
          </PadButton>
        ))}
      </div>
    </div>
  )
}

function packButtonLabel(need: PackNeed): string {
  if (need === 'seal') return mazeCopy.packSeal
  if (need === 'band') return mazeCopy.packBand
  if (need === 'crate') return mazeCopy.packCrate
  return mazeCopy.packIce
}

function PadButton({
  label,
  onHold,
  children,
  className,
  hot = false,
  repeat = false,
}: {
  label: string
  onHold: () => void
  children: string
  className?: string
  hot?: boolean
  repeat?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'hit-target min-h-12 rounded-2xl border-2 border-navy bg-cream px-2 text-sm font-semibold text-navy',
        hot && 'bg-accent',
        className,
      )}
      onPointerDown={(event) => {
        event.preventDefault()
        onHold()
        if (!repeat) return
        const button = event.currentTarget
        button.setPointerCapture(event.pointerId)
        const tick = window.setInterval(onHold, 90)
        const stop = () => {
          window.clearInterval(tick)
          button.removeEventListener('pointerup', stop)
          button.removeEventListener('pointercancel', stop)
        }
        button.addEventListener('pointerup', stop)
        button.addEventListener('pointercancel', stop)
      }}
    >
      {children}
    </button>
  )
}

function snapshot(state: CatchState): Hud {
  const lot = state.pack[0]
  return {
    score: state.score,
    freshness: state.freshness,
    freshnessMax: state.freshnessMax,
    announcement: state.announcement,
    phase: state.phase,
    elapsed: state.elapsed,
    combo: state.combo,
    hold: state.hold.length,
    pack: state.pack.length,
    nextPack: lot ? (lot.needs[lot.step] ?? null) : null,
  }
}

function cueFor(line: string): void {
  if (line === mazeCopy.collectIce || line === mazeCopy.caught) playCue('ice')
  else if (line === mazeCopy.fed || line === mazeCopy.processDone) playCue('gill')
  else if (line === mazeCopy.packed || line === mazeCopy.packStep) playCue('combo')
  else if ((mazeCopy.collectGate as readonly string[]).includes(line)) playCue('gill')
  else if (
    line === mazeCopy.hit ||
    line === mazeCopy.drain ||
    line === mazeCopy.gateMiss ||
    line === mazeCopy.packMiss ||
    line === mazeCopy.missSchool ||
    line === mazeCopy.bayFull
  ) {
    playCue('miss')
  } else if (line === mazeCopy.clear) playCue('seal')
}
