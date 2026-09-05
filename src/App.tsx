import { useEffect, useState } from 'react'
import { BrandBackground } from '@/components/BrandBackground.tsx'
import { HardwareAtmosphere } from '@/components/HardwareAtmosphere.tsx'
import { MuteToggle } from '@/components/MuteToggle.tsx'
import { CareApp } from '@/care/CareApp.tsx'
import { copy } from '@/game/copy.ts'
import { readBoards, type Boards } from '@/game/leaderboard.ts'
import { hashForMode, parseModeHash, type ArcadeMode } from '@/game/mode.ts'
import { ArcadeNav } from '@/hub/ArcadeNav.tsx'
import { HubScreen } from '@/hub/HubScreen.tsx'
import { LeaderboardScreen } from '@/hub/LeaderboardScreen.tsx'
import { MazeApp } from '@/maze/MazeApp.tsx'

export default function App() {
  const [mode, setModeState] = useState<ArcadeMode>(() =>
    typeof window === 'undefined' ? 'hub' : parseModeHash(window.location.hash),
  )
  const [boards, setBoards] = useState<Boards>(() => readBoards())

  const setMode = (next: ArcadeMode) => {
    setModeState(next)
    const hash = hashForMode(next)
    if (window.location.hash !== hash && !(next === 'hub' && window.location.hash === '')) {
      window.history.replaceState(null, '', hash === '#' ? window.location.pathname + window.location.search : hash)
    }
  }

  useEffect(() => {
    const sync = () => setModeState(parseModeHash(window.location.hash))
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    if (mode === 'hub' || mode === 'leaderboard') setBoards(readBoards())
  }, [mode])

  const refreshBoards = () => setBoards(readBoards())

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden">
      <BrandBackground />
      <HardwareAtmosphere />
      <div className="grain" aria-hidden />
      <a
        href="#game"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-cream focus:px-4 focus:py-3"
      >
        {copy.skipToGame}
      </a>
      <div className="pointer-events-none absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] left-[max(0.75rem,env(safe-area-inset-left))] z-40 flex items-start justify-end gap-3">
        <div className="pointer-events-auto hidden min-[420px]:block">
          <ArcadeNav mode={mode} onMode={setMode} />
        </div>
        <div className="pointer-events-auto">
          <MuteToggle />
        </div>
      </div>
      <main id="game">
        {mode === 'hub' ? <HubScreen boards={boards} onMode={setMode} /> : null}
        {mode === 'care' ? <CareApp onHub={() => setMode('hub')} onBoardChange={refreshBoards} /> : null}
        {mode === 'maze' ? <MazeApp onHub={() => setMode('hub')} onBoardChange={refreshBoards} /> : null}
        {mode === 'leaderboard' ? (
          <LeaderboardScreen
            boards={boards}
            onHub={() => setMode('hub')}
            onCare={() => setMode('care')}
            onMaze={() => setMode('maze')}
          />
        ) : null}
      </main>
      {mode !== 'maze' ? (
        <div className="pointer-events-auto fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 z-40 min-[420px]:hidden">
          <div className="mx-auto max-w-lg rounded-full border-2 border-navy bg-cream/95 px-2 py-1">
            <ArcadeNav mode={mode} onMode={setMode} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
