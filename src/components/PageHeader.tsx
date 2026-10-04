import type { ReactNode, Ref } from 'react'
import { hubCopy } from '@/game/hubCopy.ts'

type Props = {
  title: string
  line: string
  display?: boolean
  headingRef?: Ref<HTMLHeadingElement>
  note?: ReactNode
}

export function PageHeader({ title, line, display = false, headingRef, note }: Props) {
  return (
    <header className="text-center">
      <p className="text-xs font-semibold tracking-[0.28em] text-navy uppercase">{hubCopy.kicker}</p>
      <h1
        ref={headingRef}
        tabIndex={headingRef ? -1 : undefined}
        className={
          display
            ? 'wordmark font-display mt-2 text-[clamp(3.25rem,18vw,4.5rem)] leading-none text-cream drop-shadow-[0_2px_0_#0B1424] outline-none sm:text-8xl'
            : 'mt-2 text-3xl font-semibold tracking-tight text-navy outline-none sm:text-4xl'
        }
      >
        {title}
      </h1>
      <p className="mt-2 text-lg text-navy">{line}</p>
      {note}
    </header>
  )
}
