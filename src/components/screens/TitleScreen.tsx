import * as Dialog from '@radix-ui/react-dialog'
import type { Ref } from 'react'
import { copy } from '@/game/copy.ts'
import { Button } from '@/components/ui/button.tsx'
import { PixelMatrix } from '@/components/icons/PixelMatrix.tsx'
import { Mascot } from '@/components/Mascot.tsx'

type Props = {
  highScore: number
  onPlay: () => void
  headingRef: Ref<HTMLHeadingElement>
}

export function TitleScreen({ highScore, onPlay, headingRef }: Props) {
  return (
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-between px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="pt-6 text-center">
        <p className="text-xs font-semibold tracking-[0.28em] text-navy uppercase">
          {copy.kicker}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display mt-2 text-6xl leading-none text-cream drop-shadow-[0_2px_0_#0B1424] sm:text-8xl"
        >
          {copy.title}
        </h1>
        <p className="mt-3 text-lg font-semibold tracking-tight text-navy">{copy.subtitle}</p>
        <p className="mt-1 text-sm text-navy/80">A centuries-old Japanese technique.</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Mascot size={168} className="drop-shadow-md" />
        <div className="flex items-center gap-3" aria-hidden>
          <PixelMatrix name="brain" size={44} />
          <PixelMatrix name="gill" size={44} />
          <PixelMatrix name="ice" size={44} />
        </div>
      </div>

      <div className="space-y-3">
        {highScore > 0 ? (
          <p className="text-center text-sm font-semibold tracking-wide text-navy">
            {copy.bestScore(highScore)}
          </p>
        ) : (
          <p className="text-center text-sm text-navy/80">A new Ikejime Score starts at zero.</p>
        )}
        <Button className="w-full text-lg" onClick={onPlay}>
          {copy.play}
        </Button>
        <HowToPlay />
        <a
          className="block text-center text-sm font-semibold text-navy underline decoration-navy/40 underline-offset-4"
          href={copy.brandUrl}
        >
          {copy.brand}
        </a>
      </div>
    </div>
  )
}

function HowToPlay() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline" className="w-full">
          {copy.howTo}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/70" />
        <Dialog.Content className="panel fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-3xl bg-cream p-6 text-navy shadow-xl">
          <Dialog.Title className="text-2xl font-semibold">{copy.howTo}</Dialog.Title>
          <Dialog.Description className="sr-only">
            How to play Six Seconds
          </Dialog.Description>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-base">
            {copy.howToBody.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <Dialog.Close asChild>
            <Button className="mt-6 w-full">{copy.howToClose}</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
