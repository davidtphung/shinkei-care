import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { hubCopy } from '@/game/hubCopy.ts'
import { readLastName, sanitizeName, validName } from '@/game/leaderboard.ts'

type Props = {
  onSave: (name: string) => void
  onSkip: () => void
}

export function NamePrompt({ onSave, onSkip }: Props) {
  const [name, setName] = useState(() => readLastName() || 'SER')
  const clean = sanitizeName(name)
  const ok = validName(clean)

  return (
    <div className="panel rounded-3xl border-4 border-navy bg-cream p-5 text-navy">
      <h2 className="text-2xl font-semibold">{hubCopy.initialsTitle}</h2>
      <p className="mt-2 text-base">{hubCopy.initialsLead}</p>
      <label className="mt-4 block">
        <span className="text-xs font-semibold tracking-[0.16em] uppercase">{hubCopy.initialsLabel}</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={12}
          autoComplete="off"
          spellCheck={false}
          className="mt-2 min-h-12 w-full rounded-2xl border-2 border-navy bg-cream px-4 text-lg font-semibold text-navy outline-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy"
        />
      </label>
      <p className="mt-2 text-sm text-navy/75">{hubCopy.initialsHint}</p>
      <div className="mt-4 flex flex-col gap-2">
        <Button className="w-full" disabled={!ok} onClick={() => onSave(clean)}>
          {hubCopy.initialsSave}
        </Button>
        <Button variant="outline" className="w-full" onClick={onSkip}>
          {hubCopy.initialsSkip}
        </Button>
      </div>
    </div>
  )
}
