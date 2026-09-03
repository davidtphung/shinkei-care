import { useEffect, useRef, useState } from 'react'
import { BrandBackground } from '@/components/BrandBackground.tsx'
import { HardwareAtmosphere } from '@/components/HardwareAtmosphere.tsx'
import { MuteToggle } from '@/components/MuteToggle.tsx'
import { OceanScene } from '@/components/screens/OceanScene.tsx'
import { PackSeal } from '@/components/screens/PackSeal.tsx'
import { RoundEnd } from '@/components/screens/RoundEnd.tsx'
import { StageCool } from '@/components/screens/StageCool.tsx'
import { StageNotice } from '@/components/screens/StageNotice.tsx'
import { StagePack } from '@/components/screens/StagePack.tsx'
import { TitleScreen } from '@/components/screens/TitleScreen.tsx'
import { playCue, unlockAudio } from '@/game/audio.ts'
import { copy } from '@/game/copy.ts'
import { comboBonus, firstTryPoints, FRESHNESS_MAX, ICE_GOAL, judgeSpike } from '@/game/puzzles.ts'
import { readHighScore, writeHighScore } from '@/game/storage.ts'
import type { Screen } from '@/game/types.ts'

const SPIKE_HIT_MS = 360
const SPIKE_HOLD_MS = 780
const GILL_HOLD_MS = 380

type Game = {
  screen: Screen
  round: number
  score: number
  highScore: number
  announcement: string
  freshness: number
  combo: number
  spikeAttempts: number
  gillAttempts: number
  icePlaced: string[]
  iceSelected: string | null
  iceMisses: number
}

function freshRound(round: number, highScore: number): Game {
  return {
    screen: 'spike',
    round,
    score: 0,
    highScore,
    announcement: '',
    freshness: FRESHNESS_MAX,
    combo: 0,
    spikeAttempts: 0,
    gillAttempts: 0,
    icePlaced: [],
    iceSelected: null,
    iceMisses: 0,
  }
}

function missCopy(kind: 'early' | 'late' | 'high' | 'window' | 'gill' | 'ice'): string {
  if (kind === 'early') return copy.spikeMissEarly
  if (kind === 'late') return copy.spikeMissLate
  if (kind === 'high') return copy.spikeMissHigh
  if (kind === 'gill') return copy.gillMiss
  if (kind === 'ice') return copy.iceMiss
  return copy.spikeMissWindow
}

export default function App() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const spikeLock = useRef(false)
  const gillLock = useRef(false)
  const holdTimer = useRef(0)
  const beatTimer = useRef(0)
  const [game, setGame] = useState<Game>(() => ({
    ...freshRound(1, readHighScore()),
    screen: 'title',
  }))

  useEffect(() => {
    headingRef.current?.focus()
    if (game.screen === 'spike') spikeLock.current = false
    if (game.screen === 'gill') gillLock.current = false
  }, [game.screen])

  useEffect(() => {
    return () => {
      window.clearTimeout(holdTimer.current)
      window.clearTimeout(beatTimer.current)
    }
  }, [])

  const start = () => {
    unlockAudio()
    setGame(freshRound(game.round, game.highScore))
  }

  const cheer = (combo: number) => {
    if (combo >= 2) {
      window.setTimeout(() => playCue('combo'), 160)
    }
  }

  const spike = (progress: number, reduced: boolean, onTarget: boolean): 'hit' | 'miss' => {
    if (spikeLock.current) return 'hit'
    const timing = judgeSpike(progress, reduced, onTarget)
    if (timing !== 'hit') {
      playCue('miss')
      setGame((prev) => ({
        ...prev,
        spikeAttempts: prev.spikeAttempts + 1,
        freshness: Math.max(0, prev.freshness - 1),
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
      freshness: Math.max(0, prev.freshness - 1),
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
      freshness: Math.max(0, prev.freshness - 1),
      combo: 0,
      announcement: copy.iceMiss,
    }))
  }

  const finishRest = () => {
    setGame((prev) => {
      if (prev.screen !== 'rest') return prev
      const scored = prev.score + prev.freshness * 8
      const high = writeHighScore(scored)
      return { ...prev, score: scored, highScore: high, screen: 'score' }
    })
  }

  const again = () => {
    setGame(freshRound(game.round + 1, game.highScore))
  }

  const vitality = game.screen !== 'rest'

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden">
      {vitality ? <BrandBackground /> : null}
      {vitality ? <HardwareAtmosphere /> : null}
      <div className="grain" aria-hidden />
      <a href="#game" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-cream focus:px-4 focus:py-3">
        {copy.skipToGame}
      </a>
      <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-40">
        <MuteToggle ink={game.screen === 'rest'} />
      </div>
      <main id="game">
        {game.screen === 'title' ? (
          <TitleScreen highScore={game.highScore} onPlay={start} headingRef={headingRef} />
        ) : null}
        {game.screen === 'spike' ? (
          <StageNotice
            announcement={game.announcement}
            freshness={game.freshness}
            freshnessMax={FRESHNESS_MAX}
            combo={game.combo}
            headingRef={headingRef}
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
            onSelect={selectIce}
            onPlace={placeIce}
            onMiss={missIce}
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
            score={game.score}
            highScore={game.highScore}
            headingRef={headingRef}
            onAgain={again}
          />
        ) : null}
      </main>
    </div>
  )
}
