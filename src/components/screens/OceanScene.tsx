import type { Ref } from 'react'
import { copy } from '@/game/copy.ts'
import { BrandBackground } from '@/components/BrandBackground.tsx'
import { Mascot } from '@/components/Mascot.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { Button } from '@/components/ui/button.tsx'
import { usePrefersReducedMotion } from '@/hooks/usePrefers.ts'

type Props = {
  headingRef: Ref<HTMLHeadingElement>
  onContinue: () => void
}

export function OceanScene({ headingRef, onContinue }: Props) {
  const reduced = usePrefersReducedMotion()

  return (
    <div className="on-ink relative isolate min-h-[100dvh] overflow-hidden text-cream">
      <BrandBackground variant="ocean" />
      <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-between px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <header className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.22em] text-cream/75 uppercase">
            After care
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {copy.oceanLead}
          </h1>
          <p className="max-w-md text-base text-cream/90">{copy.oceanBody}</p>
        </header>

        <div className="relative flex flex-1 items-center justify-center py-8">
          <div className={reduced ? undefined : 'swim'}>
            <Mascot waving={!reduced} size={200} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel flex items-center gap-3 rounded-2xl bg-navy px-4 py-3">
            <PixelMatrix name="seal" size={48} />
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase">{copy.sealLabel}</p>
              <p className="text-sm text-cream/85">{copy.packSuccess}</p>
            </div>
          </div>
          <Button className="w-full" onClick={onContinue}>
            {copy.continue}
          </Button>
        </div>
      </div>
    </div>
  )
}
