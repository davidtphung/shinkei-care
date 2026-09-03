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
      <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-between px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
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

        <div className="relative flex flex-1 flex-col items-center justify-center gap-6 py-8">
          <div className="flex items-end gap-3">
            <PixelMatrix name="ice" size={56} />
            <Mascot resting size={180} />
            <PixelMatrix name="ice" size={56} />
          </div>
          <ol className="grid w-full grid-cols-3 gap-2 text-center">
            <li className="panel rounded-2xl bg-navy px-2 py-3">
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase">1</p>
              <p className="text-sm font-semibold">{copy.spikeName}</p>
            </li>
            <li className="panel rounded-2xl bg-navy px-2 py-3">
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase">2</p>
              <p className="text-sm font-semibold">{copy.gillName}</p>
            </li>
            <li className="panel rounded-2xl bg-navy px-2 py-3">
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase">3</p>
              <p className="text-sm font-semibold">{copy.stageNames[2]}</p>
            </li>
          </ol>
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
