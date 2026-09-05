import { hubCopy } from '@/game/hubCopy.ts'
import type { ArcadeMode } from '@/game/mode.ts'
import { cn } from '@/lib/utils.ts'

type Props = {
  mode: ArcadeMode
  onMode: (mode: ArcadeMode) => void
  ink?: boolean
}

const items: { mode: ArcadeMode; label: string }[] = [
  { mode: 'hub', label: hubCopy.hub },
  { mode: 'care', label: hubCopy.careName },
  { mode: 'maze', label: hubCopy.mazeName },
  { mode: 'leaderboard', label: hubCopy.boardName },
]

export function ArcadeNav({ mode, onMode, ink = false }: Props) {
  return (
    <nav aria-label={hubCopy.nav} className="pointer-events-auto">
      <ul className="flex flex-wrap items-center justify-center gap-1">
        {items.map((item) => {
          const current = item.mode === mode
          return (
            <li key={item.mode}>
              <button
                type="button"
                aria-current={current ? 'page' : undefined}
                onClick={() => onMode(item.mode)}
                className={cn(
                  'hit-target rounded-full px-3 py-2 text-xs font-semibold tracking-[0.12em] uppercase',
                  ink ? 'text-cream' : 'text-navy',
                  current
                    ? ink
                      ? 'bg-cream/15 underline decoration-2 underline-offset-4'
                      : 'bg-navy/10 underline decoration-2 underline-offset-4'
                    : ink
                      ? 'text-cream/80'
                      : 'text-navy/70',
                )}
              >
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
