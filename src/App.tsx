import { useEffect, useRef, useState } from 'react'
import { BrandBackground } from '@/components/BrandBackground.tsx'
import { HardwareAtmosphere } from '@/components/HardwareAtmosphere.tsx'
import { MuteToggle } from '@/components/MuteToggle.tsx'
import { RaceClock } from '@/components/RaceClock.tsx'
import { OceanScene } from '@/components/screens/OceanScene.tsx'
import { PackSeal } from '@/components/screens/PackSeal.tsx'
import { RoundEnd } from '@/components/screens/RoundEnd.tsx'
import { StageCool } from '@/components/screens/StageCool.tsx'
import { StageGates } from '@/components/screens/StageGates.tsx'
import { StageHandoff } from '@/components/screens/StageHandoff.tsx'
import { StageNotice } from '@/components/screens/StageNotice.tsx'
import { StagePack } from '@/components/screens/StagePack.tsx'
import { StagePlate } from '@/components/screens/StagePlate.tsx'
import { TitleScreen } from '@/components/screens/TitleScreen.tsx'
import { playCue, unlockAudio } from '@/game/audio.ts'
import { copy } from '@/game/copy.ts'
import { readProgress, writeLevelQuality, writeLevelTime, type Progress } from '@/game/progress.ts'
import { comboBonus, drainForLevel, firstTryPoints, FRESHNESS_MAX, GATES, HANDOFF_GOAL, ICE_GOAL, judgeSpike } from '@/game/puzzles.ts'
import type { LevelId, Screen } from '@/game/types.ts'

const SPIKE_HIT_MS = 360
const SPIKE_HOLD_MS = 780
const GILL_HOLD_MS = 380

type Game = {
  screen: Screen
  level: LevelId
  score: number
  announcement: string
  freshness: number
  combo: number
  spikeAttempts: number
  gillAttempts: number
  icePlaced: string[]
  iceSelected: string | null
  iceMisses: number
  gateIndex: number
  lotsPlaced: string[]
  lotSelected: string | null
}

function firstScreen(level: LevelId): Screen {
  return level === 3 ? 'gates' : 'spike'
}

function freshRound(level: LevelId): Game {
  return {
    screen: firstScreen(level),
    level,
    score: 0,
    announcement: '',
    freshness: FRESHNESS_MAX,
    combo: 0,
    spikeAttempts: 0,
    gillAttempts: 0,
    icePlaced: [],
    iceSelected: null,
    iceMisses: 0,
    gateIndex: 0,
    lotsPlaced: [],
    lotSelected: null,
  }
}

function missCopy(kind: 'early' | 'late' | 'high' | 'window' | 'gill' | 'ice' | 'gate' | 'handoff'): string {
  if (kind === 'early') return copy.spikeMissEarly
  if (kind === 'late') return copy.spikeMissLate
  if (kind === 'high') return copy.spikeMissHigh
  if (kind === 'gill') return copy.gillMiss
  if (kind === 'ice') return copy.iceMiss
  if (kind === 'gate') return copy.l3GateMiss
  if (kind === 'handoff') return copy.l3HandoffMiss
  return copy.spikeMissWindow
}

export default function App() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const spikeLock = useRef(false)
  const gillLock = useRef(false)
  const plateLock = useRef(false)
  const restLock = useRef(false)
  const holdTimer = useRef(0)
  const beatTimer = useRef(0)
  const clockStart = useRef<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [progress, setProgress] = useState<Progress>(() => readProgress())
  const [newBestQuality, setNewBestQuality] = useState(false)
  const [newBestTime, setNewBestTime] = useState(false)
  const [game, setGame] = useState<Game>(() => ({
    ...freshRound(1),
    screen: 'title',
  }))

  const running = game.screen !== 'title' && game.screen !== 'score'

  useEffect(() => {
    headingRef.current?.focus()
    if (game.screen === 'spike') spikeLock.current = false
    if (game.screen === 'gill') gillLock.current = false
    if (game.screen === 'plate') plateLock.current = false
  }, [game.screen])

  useEffect(() => {
    return () => {
      window.clearTimeout(holdTimer.current)
      window.clearTimeout(beatTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!running) return
    let frame = 0
    const tick = () => {
      if (clockStart.current != null) setElapsed(performance.now() - clockStart.current)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running])

  useEffect(() => {
    const arm = () => {
      void unlockAudio()
    }
    window.addEventListener('pointerdown', arm)
    window.addEventListener('keydown', arm)
    return () => {
      window.removeEventListener('pointerdown', arm)
      window.removeEventListener('keydown', arm)
    }
  }, [])

  const begin = (level: LevelId) => {
    void unlockAudio()
    clockStart.current = performance.now()
    restLock.current = false
    plateLock.current = false
    setElapsed(0)
    setNewBestQuality(false)
    setNewBestTime(false)
    setGame(freshRound(level))
  }

  const drainFor = (level: LevelId) => drainForLevel(level)

  const cheer = (combo: number) => {
    if (combo >= 2) {
      window.setTimeout(() => playCue('combo'), 160)
    }
  }

  const spike = (progressValue: number, reduced: boolean, onTarget: boolean): 'hit' | 'miss' => {
    void unlockAudio()
    if (spikeLock.current) return 'hit'
    const timing = judgeSpike(progressValue, reduced, onTarget)
    if (timing !== 'hit') {
      playCue('miss')
      setGame((prev) => ({
        ...prev,
        spikeAttempts: prev.spikeAttempts + 1,
        freshness: Math.max(0, prev.freshness - drainFor(prev.level)),
        combo: 0,
        announcement: missCopy(timing === 'early' || timing === 'late' || timing === 'high' ? timing : 'window'),
      }))
      return 'miss'
    }

    spikeLock.current = true
    playCue('spike')
    let nextCombo = 0
    setGame((prev) => {
      const attempts = prev.spikeAttempts + 1
      const first = attempts === 1
      const combo = first ? prev.combo + 1 : 0
      nextCombo = combo
      return {
        ...prev,
        spikeAttempts: attempts,
        combo,
        score: prev.score + firstTryPoints(attempts, 100) + comboBonus(combo),
        announcement: copy.spikeHit,
      }
    })
    cheer(nextCombo)
    beatTimer.current = window.setTimeout(() => {
      setGame((prev) => (prev.screen === 'spike' ? { ...prev, announcement: copy.spikeSuccess } : prev))
    }, SPIKE_HIT_MS)
    holdTimer.current = window.setTimeout(() => {
      setGame((prev) => (prev.screen === 'spike' ? { ...prev, screen: 'gill' } : prev))
    }, SPIKE_HOLD_MS)
    return 'hit'
  }

  const gill = () => {
    void unlockAudio()
    if (gillLock.current) return
    gillLock.current = true
    playCue('gill')
    let nextCombo = 0
    setGame((prev) => {
      if (prev.screen !== 'gill') return prev
      const attempts = prev.gillAttempts + 1
      const first = attempts === 1
      const combo = first ? prev.combo + 1 : 0
      nextCombo = combo
      return {
        ...prev,
        gillAttempts: attempts,
        combo,
        score: prev.score + firstTryPoints(attempts, 100) + comboBonus(combo),
        announcement: copy.gillSuccess,
      }
    })
    cheer(nextCombo)
    holdTimer.current = window.setTimeout(() => {
      setGame((prev) => (prev.screen === 'gill' ? { ...prev, screen: 'ice' } : prev))
    }, GILL_HOLD_MS)
  }

  const gillMiss = () => {
    playCue('miss')
    setGame((prev) => ({
      ...prev,
      gillAttempts: prev.gillAttempts + 1,
      freshness: Math.max(0, prev.freshness - drainFor(prev.level)),
      combo: 0,
      announcement: prev.gillAttempts >= 2 ? copy.gillMissHigh : copy.gillMiss,
    }))
  }

  const selectIce = (id: string) => {
    setGame((prev) => ({
      ...prev,
      iceSelected: id,
      announcement: `${copy.itemNames.ice} selected.`,
    }))
  }

  const placeIce = (id: string) => {
    playCue('ice')
    let nextCombo = 0
    let finished = false
    setGame((prev) => {
      if (prev.icePlaced.includes(id)) return prev
      const placed = [...prev.icePlaced, id]
      const nextScore = prev.score + 34
      if (placed.length >= ICE_GOAL) {
        const first = prev.iceMisses === 0
        const combo = first ? prev.combo + 1 : 0
        nextCombo = combo
        finished = true
        return {
          ...prev,
          icePlaced: placed,
          iceSelected: null,
          combo,
          score: nextScore + comboBonus(combo),
          announcement: copy.coolSuccess,
          screen: 'seal',
        }
      }
      return {
        ...prev,
        icePlaced: placed,
        iceSelected: null,
        score: nextScore,
        announcement: copy.keepCool,
      }
    })
    if (finished) cheer(nextCombo)
  }

  const missIce = () => {
    playCue('miss')
    setGame((prev) => ({
      ...prev,
      iceMisses: prev.iceMisses + 1,
      freshness: Math.max(0, prev.freshness - drainFor(prev.level)),
      combo: 0,
      announcement: copy.iceMiss,
    }))
  }

  const pickGate = (index: number) => {
    void unlockAudio()
    let nextCombo = 0
    let finished = false
    let missed = false
    setGame((prev) => {
      if (prev.screen !== 'gates') return prev
      if (index !== prev.gateIndex) {
        missed = true
        return {
          ...prev,
          freshness: Math.max(0, prev.freshness - drainFor(prev.level)),
          combo: 0,
          announcement: missCopy('gate'),
        }
      }
      const nextIndex = prev.gateIndex + 1
      const combo = prev.combo + 1
      nextCombo = combo
      if (nextIndex >= GATES.length) {
        finished = true
        return {
          ...prev,
          gateIndex: nextIndex,
          combo,
          score: prev.score + 100 + comboBonus(combo),
          announcement: copy.coolSuccess,
          screen: 'handoff',
        }
      }
      const gate = GATES[index]
      return {
        ...prev,
        gateIndex: nextIndex,
        combo,
        score: prev.score + 34,
        announcement: `${copy.l3GateNames[gate]}. ${copy.now}`,
      }
    })
    if (missed) {
      playCue('miss')
      return
    }
    playCue('spike')
    if (finished) cheer(nextCombo)
  }

  const selectLot = (id: string) => {
    setGame((prev) => ({
      ...prev,
      lotSelected: id,
      announcement: `${copy.l3Lot} selected.`,
    }))
  }

  const placeLot = (id: string) => {
    playCue('ice')
    let nextCombo = 0
    let finished = false
    setGame((prev) => {
      if (prev.lotsPlaced.includes(id)) return prev
      const placed = [...prev.lotsPlaced, id]
      const nextScore = prev.score + 34
      if (placed.length >= HANDOFF_GOAL) {
        const combo = prev.combo + 1
        nextCombo = combo
        finished = true
        return {
          ...prev,
          lotsPlaced: placed,
          lotSelected: null,
          combo,
          score: nextScore + comboBonus(combo),
          announcement: copy.coolSuccess,
          screen: 'plate',
        }
      }
      return {
        ...prev,
        lotsPlaced: placed,
        lotSelected: null,
        score: nextScore,
        announcement: copy.keepCool,
      }
    })
    if (finished) cheer(nextCombo)
  }

  const missLot = () => {
    playCue('miss')
    setGame((prev) => ({
      ...prev,
      freshness: Math.max(0, prev.freshness - drainFor(prev.level)),
      combo: 0,
      announcement: missCopy('handoff'),
    }))
  }

  const plate = () => {
    void unlockAudio()
    if (plateLock.current) return
    plateLock.current = true
    playCue('seal')
    setGame((prev) => ({
      ...prev,
      score: prev.score + (prev.freshness >= 4 ? 80 : 40),
      announcement: prev.freshness >= 4 ? copy.l3PlateHeld : copy.l3PlateSoft,
    }))
    holdTimer.current = window.setTimeout(() => {
      setGame((prev) => (prev.screen === 'plate' ? { ...prev, screen: 'seal' } : prev))
    }, GILL_HOLD_MS)
  }

  const finishRest = () => {
    if (game.screen !== 'rest' || restLock.current) return
    restLock.current = true
    const scored = game.score + game.freshness * 8
    const ms = clockStart.current != null ? performance.now() - clockStart.current : elapsed
    setElapsed(ms)
    const quality = writeLevelQuality(game.level, scored)
    const time = writeLevelTime(game.level, ms)
    setProgress(time.progress)
    setNewBestQuality(quality.isNew)
    setNewBestTime(time.isNew)
    setGame((prev) => ({ ...prev, score: scored, screen: 'score' }))
  }

  const craftCopy = game.level === 2
    ? {
        spikeLead: copy.l2SpikeLead,
        spikeTeach: copy.l2SpikeTeach,
        spikeHint: copy.l2SpikeHint,
        gillLead: copy.l2GillLead,
        gillTeach: copy.l2GillTeach,
        gillHint: copy.l2GillHint,
        iceLead: copy.l2IceLead,
        iceTeach: copy.l2IceTeach,
      }
    : {
        spikeLead: copy.spikeLead,
        spikeTeach: copy.spikeTeach,
        spikeHint: copy.spikeHint,
        gillLead: copy.gillLead,
        gillTeach: copy.gillTeach,
        gillHint: copy.gillHint,
        iceLead: copy.coolLead,
        iceTeach: copy.iceTeach,
      }

  const vitality = game.screen !== 'rest'

  return (
    <div
      className="relative min-h-[100dvh] overflow-x-hidden"
      onPointerDown={() => {
        void unlockAudio()
      }}
    >
      {vitality ? <BrandBackground /> : null}
      {vitality ? <HardwareAtmosphere /> : null}
      <div className="grain" aria-hidden />
      <a href="#game" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-cream focus:px-4 focus:py-3">
        {copy.skipToGame}
      </a>
      <div className="pointer-events-none absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-40 flex items-center justify-between gap-3">
        <div>{running ? <RaceClock elapsed={elapsed} ink={game.screen === 'rest'} /> : null}</div>
        <div className="pointer-events-auto">
          <MuteToggle ink={game.screen === 'rest'} />
        </div>
      </div>
      <main id="game">
        {game.screen === 'title' ? (
          <TitleScreen progress={progress} onPlay={begin} headingRef={headingRef} />
        ) : null}
        {game.screen === 'spike' ? (
          <StageNotice
            announcement={game.announcement}
            freshness={game.freshness}
            freshnessMax={FRESHNESS_MAX}
            combo={game.combo}
            headingRef={headingRef}
            lead={craftCopy.spikeLead}
            teach={craftCopy.spikeTeach}
            hint={craftCopy.spikeHint}
            onSpike={spike}
          />
        ) : null}
        {game.screen === 'gill' ? (
          <StagePack
            announcement={game.announcement}
            freshness={game.freshness}
            freshnessMax={FRESHNESS_MAX}
            combo={game.combo}
            headingRef={headingRef}
            lead={craftCopy.gillLead}
            teach={craftCopy.gillTeach}
            hint={craftCopy.gillHint}
            onGill={gill}
            onGillMiss={gillMiss}
          />
        ) : null}
        {game.screen === 'ice' ? (
          <StageCool
            placed={game.icePlaced}
            selected={game.iceSelected}
            announcement={game.announcement}
            freshness={game.freshness}
            freshnessMax={FRESHNESS_MAX}
            combo={game.combo}
            headingRef={headingRef}
            lead={craftCopy.iceLead}
            teach={craftCopy.iceTeach}
            onSelect={selectIce}
            onPlace={placeIce}
            onMiss={missIce}
          />
        ) : null}
        {game.screen === 'gates' ? (
          <StageGates
            current={game.gateIndex}
            announcement={game.announcement}
            freshness={game.freshness}
            freshnessMax={FRESHNESS_MAX}
            combo={game.combo}
            headingRef={headingRef}
            onGate={pickGate}
          />
        ) : null}
        {game.screen === 'handoff' ? (
          <StageHandoff
            placed={game.lotsPlaced}
            selected={game.lotSelected}
            announcement={game.announcement}
            freshness={game.freshness}
            freshnessMax={FRESHNESS_MAX}
            combo={game.combo}
            headingRef={headingRef}
            onSelect={selectLot}
            onPlace={placeLot}
            onMiss={missLot}
          />
        ) : null}
        {game.screen === 'plate' ? (
          <StagePlate
            announcement={game.announcement}
            freshness={game.freshness}
            freshnessMax={FRESHNESS_MAX}
            combo={game.combo}
            headingRef={headingRef}
            onSeal={plate}
          />
        ) : null}
        {game.screen === 'seal' ? (
          <PackSeal headingRef={headingRef} onContinue={() => setGame((prev) => ({ ...prev, screen: 'rest' }))} />
        ) : null}
        {game.screen === 'rest' ? (
          <OceanScene headingRef={headingRef} onContinue={finishRest} />
        ) : null}
        {game.screen === 'score' ? (
          <RoundEnd
            level={game.level}
            score={game.score}
            bestQuality={progress.quality[game.level]}
            elapsed={elapsed}
            bestTime={progress.time[game.level]}
            newBestQuality={newBestQuality}
            newBestTime={newBestTime}
            headingRef={headingRef}
            onAgain={() => begin(game.level)}
            onLevels={() => setGame((prev) => ({ ...prev, screen: 'title' }))}
          />
        ) : null}
      </main>
    </div>
  )
}
