import type { Ref } from 'react'
import { copy } from '@/game/copy.ts'
import { Button } from '@/components/ui/button.tsx'
import { Mascot } from '@/components/Mascot.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { usePrefersReducedMotion } from '@/hooks/usePrefers.ts'
import { cn } from '@/lib/utils.ts'

type Props = {
  headingRef: Ref<HTMLHeadingElement>
  onContinue: () => void
}

export function PackSeal({ headingRef, onContinue }: Props) {
  const reduced = usePrefersReducedMotion()

  return (
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-between px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.22em] text-navy/70 uppercase">
          {copy.stageOf(3)} · {copy.stageNames[2]}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl font-semibold tracking-tight text-navy"
        >
          {copy.restLead}
        </h1>
        <p className="text-base text-navy">{copy.restBody}</p>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4">
        <div className="panel relative flex w-full max-w-sm flex-col items-center rounded-[2rem] border-4 border-navy bg-cream px-6 py-8">
          <div className="relative mb-4 h-28 w-48">
            <div className="absolute inset-x-6 bottom-0 h-20 rounded-b-3xl border-4 border-navy bg-cream" />
            <div
              className={cn(
                'absolute inset-x-6 top-2 h-12 rounded-t-3xl border-4 border-navy bg-band',
                reduced ? 'opacity-100' : 'spring',
              )}
            />
            <div className="absolute top-8 left-1/2 -translate-x-1/2">
              <PixelMatrix name="seal" size={56} title={copy.sealLabel} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <PixelMatrix name="ice" size={40} />
            <Mascot resting size={120} />
            <PixelMatrix name="ice" size={40} />
          </div>
          <p className="mt-3 text-center text-base font-semibold text-navy">{copy.sealLabel}</p>
        </div>
      </div>

      <Button className="w-full" onClick={onContinue}>
        {copy.continue}
      </Button>
    </div>
  )
}
