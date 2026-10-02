import { useEffect, useState } from 'react'
import { BrandBackground } from '@/components/BrandBackground.tsx'
import { HardwareAtmosphere } from '@/components/HardwareAtmosphere.tsx'
import { MuteToggle } from '@/components/MuteToggle.tsx'
import { CareApp } from '@/care/CareApp.tsx'
import { copy } from '@/game/copy.ts'
import { readBoards, type Boards } from '@/game/leaderboard.ts'
import { hashForMode, parseModeHash, type ArcadeMode } from '@/game/mode.ts'
import { ArcadeNav } from '@/hub/ArcadeNav.tsx'
import { ModeStage } from '@/motion/ModeStage.tsx'
import { motionVars } from '@/motion/tokens.ts'
import { canonicalZineHash } from '@/zine/route.ts'
import { ZineApp } from '@/zine/ZineApp.tsx'
import '@/motion/motion.css'
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
    if (next === 'zine') {
      if (!/^#zine(?:\/[1-7])?$/i.test(window.location.hash)) {
        window.history.replaceState(null, '', '#zine')
      }
      return
    }
    const hash = hashForMode(next)
    if (window.location.hash !== hash && !(next === 'hub' && window.location.hash === '')) {
      window.history.replaceState(null, '', hash === '#' ? window.location.pathname + window.location.search : hash)
    }
  }

  useEffect(() => {
    const sync = () => {
      const next = parseModeHash(window.location.hash)
      setModeState(next)
      if (next === 'zine') {
        const canonical = canonicalZineHash(window.location.hash)
        if (window.location.hash !== canonical) window.history.replaceState(null, '', canonical)
        return
      }
      const canonical = hashForMode(next)
      if (next !== 'hub' && window.location.hash !== canonical) {
        window.history.replaceState(null, '', canonical)
      }
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    if (mode === 'hub' || mode === 'leaderboard') setBoards(readBoards())
  }, [mode])

  const refreshBoards = () => setBoards(readBoards())

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden" style={motionVars()}>
      <BrandBackground />
      <HardwareAtmosphere />
      <div className="grain" aria-hidden />
      <a
        href="#game"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-cream focus:px-4 focus:py-3"
      >
        {copy.skipToGame}
      </a>
      {mode !== 'zine' ? (
        <>
          <div className="sere-nav-slot">
            <ArcadeNav mode={mode} onMode={setMode} />
          </div>
          <div className="pointer-events-none absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-50">
            <div className="pointer-events-auto">
              <MuteToggle />
            </div>
          </div>
        </>
      ) : null}
      <main id="game" role={mode === 'zine' ? undefined : 'tabpanel'} aria-labelledby={mode === 'zine' ? undefined : `sere-tab-${mode}`}>
        <ModeStage
          mode={mode}
          render={(shown) => (
            <>
              {shown === 'hub' ? <HubScreen boards={boards} onMode={setMode} /> : null}
              {shown === 'care' ? <CareApp onHub={() => setMode('hub')} onBoardChange={refreshBoards} /> : null}
              {shown === 'maze' ? <MazeApp onHub={() => setMode('hub')} onBoardChange={refreshBoards} /> : null}
              {shown === 'zine' ? <ZineApp onClose={() => setMode('hub')} /> : null}
              {shown === 'leaderboard' ? (
                <LeaderboardScreen
                  boards={boards}
                  onHub={() => setMode('hub')}
                  onCare={() => setMode('care')}
                  onMaze={() => setMode('maze')}
                />
              ) : null}
            </>
          )}
        />
      </main>
    </div>
  )
}
