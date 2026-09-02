import { useEffect, useRef, useState } from 'react'
import { BrandBackground } from '@/components/BrandBackground.tsx'
import { HardwareAtmosphere } from '@/components/HardwareAtmosphere.tsx'
import { OceanScene } from '@/components/screens/OceanScene.tsx'
import { PackSeal } from '@/components/screens/PackSeal.tsx'
import { RoundEnd } from '@/components/screens/RoundEnd.tsx'
import { StageCool } from '@/components/screens/StageCool.tsx'
import { StageNotice } from '@/components/screens/StageNotice.tsx'
import { StagePack } from '@/components/screens/StagePack.tsx'
import { TitleScreen } from '@/components/screens/TitleScreen.tsx'
import { copy } from '@/game/copy.ts'
import { firstTryPoints, pickNotice, pickPack } from '@/game/puzzles.ts'
import { readHighScore, writeHighScore } from '@/game/storage.ts'
import type { NoticeId, NoticePuzzle, PackId, PackPuzzle, Screen } from '@/game/types.ts'

type Game = {
  screen: Screen
  round: number
  score: number
  highScore: number
  announcement: string
  notice: NoticePuzzle
  noticeAttempts: number
  coolPlaced: string[]
  coolSelected: string | null
  coolAttempts: number
  pack: PackPuzzle
  packPlaced: PackId[]
  packSelected: PackId | null
  packAttempts: number
}

function freshRound(round: number, highScore: number): Game {
  return {
    screen: 'notice',
    round,
    score: 0,
    highScore,
    announcement: '',
    notice: pickNotice(round),
    noticeAttempts: 0,
    coolPlaced: [],
    coolSelected: null,
    coolAttempts: 0,
    pack: pickPack(round),
    packPlaced: [],
    packSelected: null,
    packAttempts: 0,
  }
}

export default function App() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [game, setGame] = useState<Game>(() => ({
    ...freshRound(1, readHighScore()),
    screen: 'title',
  }))

  useEffect(() => {
    headingRef.current?.focus()
  }, [game.screen])

  const start = () => {
    setGame(freshRound(game.round, game.highScore))
  }

  const pickNoticeItem = (id: NoticeId) => {
    setGame((prev) => {
      const attempts = prev.noticeAttempts + 1
      if (id !== prev.notice.answer) {
        return {
          ...prev,
          noticeAttempts: attempts,
          announcement: attempts === 1 ? copy.noticeNear : copy.retry,
        }
      }
      return {
        ...prev,
        noticeAttempts: attempts,
        score: prev.score + firstTryPoints(attempts, 100),
        announcement: copy.noticeSuccess,
        screen: 'cool',
      }
    })
  }

  const selectIce = (id: string) => {
    setGame((prev) => ({
      ...prev,
      coolSelected: id,
      announcement: `${copy.itemNames.ice} selected.`,
    }))
  }

  const placeIce = (id: string) => {
    setGame((prev) => {
      if (prev.coolPlaced.includes(id)) return prev
      const placed = [...prev.coolPlaced, id]
      const attempts = prev.coolAttempts + 1
      const nextScore = prev.score + firstTryPoints(1, 34)
      if (placed.length >= 3) {
        return {
          ...prev,
          coolPlaced: placed,
          coolSelected: null,
          coolAttempts: attempts,
          score: nextScore,
          announcement: copy.coolSuccess,
          screen: 'pack',
        }
      }
      return {
        ...prev,
        coolPlaced: placed,
        coolSelected: null,
        coolAttempts: attempts,
        score: nextScore,
        announcement: copy.keepCool,
      }
    })
  }

  const selectPack = (id: PackId) => {
    setGame((prev) => ({
      ...prev,
      packSelected: id,
      announcement: `${copy.itemNames[id]} selected.`,
    }))
  }

  const placePack = (item: PackId, zone: PackId) => {
    setGame((prev) => {
      if (prev.packPlaced.includes(item)) return prev
      const attempts = prev.packAttempts + 1
      if (item !== zone) {
        return {
          ...prev,
          packAttempts: attempts,
          announcement: attempts >= 3 ? copy.learning : copy.retry,
        }
      }
      const placed = [...prev.packPlaced, item]
      const nextScore = prev.score + firstTryPoints(1, 34)
      if (placed.length >= prev.pack.items.length) {
        return {
          ...prev,
          packPlaced: placed,
          packSelected: null,
          packAttempts: attempts,
          score: nextScore,
          announcement: copy.packSuccess,
          screen: 'seal',
        }
      }
      return {
        ...prev,
        packPlaced: placed,
        packSelected: null,
        packAttempts: attempts,
        score: nextScore,
        announcement: `${copy.itemNames[item]} is in ${copy.zoneNames[zone]}.`,
      }
    })
  }

  const finishOcean = () => {
    setGame((prev) => {
      const high = writeHighScore(prev.score)
      return { ...prev, highScore: high, screen: 'score' }
    })
  }

  const again = () => {
    setGame(freshRound(game.round + 1, game.highScore))
  }

  const vitality = game.screen !== 'ocean'

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden">
      {vitality ? <BrandBackground /> : null}
      {vitality ? <HardwareAtmosphere /> : null}
      <div className="grain" aria-hidden />
      <a href="#game" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-cream focus:px-4 focus:py-3">
        {copy.skipToGame}
      </a>
      <main id="game">
        {game.screen === 'title' ? (
          <TitleScreen highScore={game.highScore} onPlay={start} headingRef={headingRef} />
        ) : null}
        {game.screen === 'notice' ? (
          <StageNotice
            puzzle={game.notice}
            announcement={game.announcement}
            headingRef={headingRef}
            onPick={pickNoticeItem}
          />
        ) : null}
        {game.screen === 'cool' ? (
          <StageCool
            placed={game.coolPlaced}
            selected={game.coolSelected}
            announcement={game.announcement}
            headingRef={headingRef}
            onSelect={selectIce}
            onPlace={placeIce}
          />
        ) : null}
        {game.screen === 'pack' ? (
          <StagePack
            items={game.pack.items}
            placed={game.packPlaced}
            selected={game.packSelected}
            announcement={game.announcement}
            headingRef={headingRef}
            onSelect={selectPack}
            onPlace={placePack}
          />
        ) : null}
        {game.screen === 'seal' ? (
          <PackSeal headingRef={headingRef} onContinue={() => setGame((prev) => ({ ...prev, screen: 'ocean' }))} />
        ) : null}
        {game.screen === 'ocean' ? (
          <OceanScene headingRef={headingRef} onContinue={finishOcean} />
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
