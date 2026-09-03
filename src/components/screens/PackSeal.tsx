import type { Ref } from 'react'
import { copy } from '@/game/copy.ts'
import { Button } from '@/components/ui/button.tsx'
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
          {copy.stageOf(3)}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl font-semibold tracking-tight text-navy"
        >
          {copy.restLead}
        </h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="relative h-56 w-56">
          <div className="absolute inset-x-8 bottom-6 h-32 rounded-b-3xl border-4 border-navy bg-cream" />
          <div
            className={cn(
              'absolute inset-x-8 top-10 h-16 origin-bottom rounded-t-3xl border-4 border-navy bg-band',
              reduced ? 'opacity-100' : 'spring',
            )}
          />
          <div className="absolute top-24 left-1/2 -translate-x-1/2">
            <PixelMatrix name="seal" size={88} title={copy.sealLabel} />
          </div>
        </div>
        <p className="text-center text-base font-semibold text-navy">{copy.sealLabel}</p>
      </div>

      <Button className="w-full" onClick={onContinue}>
        {copy.continue}
      </Button>
    </div>
  )
}
