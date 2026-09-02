import type { Ref } from 'react'
import { copy } from '@/game/copy.ts'
import type { NoticeId, NoticePuzzle } from '@/game/types.ts'
import { FreshnessMeter } from '@/components/FreshnessMeter.tsx'
import { LiveAnnouncer } from '@/components/LiveAnnouncer.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { StageHeader } from '@/components/StageHeader.tsx'
import { usePressed } from '@/hooks/usePressed.ts'
import { cn } from '@/lib/utils.ts'

type Props = {
  puzzle: NoticePuzzle
  announcement: string
  headingRef: Ref<HTMLHeadingElement>
  onPick: (id: NoticeId) => void
}

export function StageNotice({ puzzle, announcement, headingRef, onPick }: Props) {
  return (
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col gap-5 px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <StageHeader stage={1} title={copy.noticeLead} headingRef={headingRef} />
      <LiveAnnouncer message={announcement} />
      <ul className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        {puzzle.options.map((id, index) => (
          <li key={id} className="floaty" style={{ animationDelay: `${index * 180}ms` }}>
            <NoticeCard id={id} needsHelp={id === puzzle.answer} onPick={onPick} />
          </li>
        ))}
      </ul>
      <FreshnessMeter value={0} max={3} />
    </div>
  )
}

function NoticeCard({
  id,
  needsHelp,
  onPick,
}: {
  id: NoticeId
  needsHelp: boolean
  onPick: (id: NoticeId) => void
}) {
  const { pressed, pressProps } = usePressed()
  const name = copy.itemNames[id]

  return (
    <button
      type="button"
      {...pressProps}
      onClick={() => onPick(id)}
      data-pressed={pressed ? 'true' : 'false'}
      aria-describedby={needsHelp ? `clue-${id}` : undefined}
      className={cn(
        'pressable spring panel flex min-h-[168px] w-full flex-col items-center justify-center gap-3 rounded-3xl border-4 bg-cream px-4 py-5 text-navy',
        needsHelp ? 'border-cool' : 'border-navy',
      )}
    >
      <PixelMatrix name={id} size={88} />
      <span className="text-lg font-semibold">{name}</span>
      {needsHelp ? (
        <span
          id={`clue-${id}`}
          className="inline-flex items-center gap-2 rounded-full bg-navy px-3 py-1 text-sm font-semibold text-cream"
        >
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-cool" />
          <span>{copy.clue[id]}</span>
        </span>
      ) : (
        <span className="text-sm text-navy/70">Looks steady</span>
      )}
      {needsHelp ? <CoolnessMeter id={id} /> : null}
    </button>
  )
}

function CoolnessMeter({ id }: { id: NoticeId }) {
  if (id !== 'cooler') return null
  return (
    <div className="w-full max-w-[9rem]">
      <p className="sr-only">Coolness meter is low</p>
      <div className="h-2 overflow-hidden rounded-full bg-navy/20" aria-hidden>
        <div className="h-full w-1/4 rounded-full bg-cool" />
      </div>
    </div>
  )
}
