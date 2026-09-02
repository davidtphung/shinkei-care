import type { Ref } from 'react'

type Props = {
  stage: number
  title: string
  headingRef: Ref<HTMLHeadingElement>
  onInk?: boolean
}

export function StageHeader({ stage, title, headingRef, onInk = false }: Props) {
  return (
    <header className="space-y-2">
      <p
        className={`text-xs font-semibold tracking-[0.22em] uppercase ${onInk ? 'text-cream/80' : 'text-navy/70'}`}
      >
        Stage {stage} of 3
      </p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={`text-3xl font-semibold tracking-tight sm:text-4xl ${onInk ? 'text-cream' : 'text-navy'}`}
      >
        {title}
      </h1>
    </header>
  )
}
