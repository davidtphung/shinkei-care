import type { Ref } from 'react'
import { copy } from '@/game/copy.ts'
import { BrandBackground } from '@/components/BrandBackground.tsx'
import { Mascot } from '@/components/Mascot.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { Button } from '@/components/ui/button.tsx'

type Props = {
  headingRef: Ref<HTMLHeadingElement>
  onContinue: () => void
}

export function OceanScene({ headingRef, onContinue }: Props) {
  return (
    <div className="on-ink relative isolate min-h-[100dvh] overflow-hidden text-cream">
      <BrandBackground variant="ocean" />
      <div className="play-pad cabinet relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-between">
        <header className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.22em] text-cream/75 uppercase">
            {copy.oceanLead}
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {copy.oceanBody}
          </h1>
        </header>

        <div className="relative flex flex-1 items-center justify-center py-8">
          <Mascot resting size={200} />
        </div>

        <div className="space-y-4">
          <div className="panel flex items-center gap-3 rounded-2xl bg-navy px-4 py-3">
            <PixelMatrix name="seal" size={48} />
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase">{copy.sealLabel}</p>
              <p className="text-sm text-cream/85">{copy.coolSuccess}</p>
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
