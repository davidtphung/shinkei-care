import { useRef, type PointerEvent } from 'react'
import { copy } from '@/game/copy.ts'
import { usePressed } from '@/hooks/usePressed.ts'
import { cn } from '@/lib/utils.ts'

type Mode = 'spike' | 'gill' | 'ice' | 'rest'

type Props = {
  mode: Mode
  still?: boolean
  inWindow?: boolean
  gillDone?: boolean
  onSpike?: () => void
  onSpikeHigh?: () => void
  onGill?: () => void
  onGillMiss?: () => void
}

export function FishPlayfield({
  mode,
  still = false,
  inWindow = false,
  gillDone = false,
  onSpike,
  onSpikeHigh,
  onGill,
  onGillMiss,
}: Props) {
  return (
    <div className="panel relative mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border-4 border-navy bg-cream px-3 py-5 sm:px-6">
      <div className="pointer-events-none absolute inset-x-6 top-4 flex justify-between text-[10px] font-semibold tracking-[0.2em] text-navy/50 uppercase">
        <span>Playfield</span>
        <span>{mode}</span>
      </div>
      <div className="relative mx-auto aspect-[8/5] w-full max-w-[34rem]">
        <FishArt still={still} gillDone={gillDone} mode={mode} />
        {mode === 'spike' && onSpike ? (
          <BrainTarget inWindow={inWindow} onSpike={onSpike} />
        ) : null}
        {mode === 'spike' && onSpikeHigh ? <BodyMiss onMiss={onSpikeHigh} /> : null}
        {mode === 'gill' && onGill ? (
          <GillTarget done={gillDone} onGill={onGill} onMiss={onGillMiss} />
        ) : null}
      </div>
    </div>
  )
}

function FishArt({
  still,
  gillDone,
  mode,
}: {
  still: boolean
  gillDone: boolean
  mode: Mode
}) {
  const restTilt = mode === 'rest' || (still && mode === 'ice')

  return (
    <svg
      className={cn('h-full w-full', still ? undefined : 'floaty')}
      viewBox="0 0 320 200"
      role="img"
      aria-label={
        mode === 'rest'
          ? 'Friendly pixel fish resting on ice'
          : 'Abstract friendly fish silhouette'
      }
    >
      <g transform={restTilt ? 'rotate(-8 168 108)' : undefined}>
        <ellipse cx="168" cy="168" rx="88" ry="10" fill="#0B1424" opacity="0.12" />
        <polygon points="248,104 304,72 304,136" fill="#0B1424" />
        <polygon points="256,104 296,82 296,126" fill="#FFEBD0" />
        <polygon points="186,46 232,78 176,84" fill="#FF4400" />
        <ellipse cx="148" cy="108" rx="92" ry="52" fill="#0B1424" />
        <ellipse cx="148" cy="108" rx="82" ry="42" fill="#FF4400" />
        <ellipse cx="108" cy="96" rx="28" ry="20" fill="#FFEBD0" />
        <circle cx="100" cy="96" r="10" fill="#0B1424" />
        <circle cx="96" cy="93" r="3.2" fill="#FFEBD0" />
        <rect x="72" y="122" width="16" height="8" fill="#0B1424" />
        <rect x="94" y="128" width="12" height="6" fill="#0B1424" />
        <path
          d="M128 78 C136 96, 136 120, 128 138"
          fill="none"
          stroke="#0B1424"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {gillDone ? (
          <g>
            <path d="M118 88 C92 70, 70 62, 48 58" fill="none" stroke="#3D8FB5" strokeWidth="3" />
            <path d="M118 108 C88 108, 64 112, 42 120" fill="none" stroke="#3D8FB5" strokeWidth="3" />
            <path d="M118 128 C96 140, 74 148, 52 154" fill="none" stroke="#3D8FB5" strokeWidth="3" />
          </g>
        ) : null}
        {mode === 'ice' || mode === 'rest' ? (
          <g>
            <rect x="86" y="158" width="36" height="22" rx="4" fill="#3D8FB5" />
            <rect x="130" y="162" width="40" height="20" rx="4" fill="#3D8FB5" />
            <rect x="178" y="158" width="34" height="22" rx="4" fill="#3D8FB5" />
            <rect x="94" y="164" width="10" height="8" fill="#FFEBD0" />
            <rect x="142" y="168" width="10" height="8" fill="#FFEBD0" />
            <rect x="188" y="164" width="10" height="8" fill="#FFEBD0" />
          </g>
        ) : null}
      </g>
    </svg>
  )
}

function BrainTarget({ inWindow, onSpike }: { inWindow: boolean; onSpike: () => void }) {
  const { pressed, pressProps } = usePressed()

  return (
    <button
      type="button"
      {...pressProps}
      data-pressed={pressed ? 'true' : 'false'}
      onClick={onSpike}
      aria-label={`${copy.spikeTarget}. ${inWindow ? copy.windowOpen : copy.windowClosed}`}
      className={cn(
        'pressable spring absolute z-20 flex min-h-16 min-w-16 flex-col items-center justify-center rounded-full border-4 px-2 py-2',
        'left-[16%] top-[18%] sm:left-[18%] sm:top-[16%]',
        inWindow ? 'scale-105 border-accent bg-accent text-navy' : 'border-cool bg-navy text-cream',
      )}
    >
      <span aria-hidden className="h-3 w-3 rounded-full bg-cream" />
      <span className="mt-1 text-[11px] font-semibold tracking-[0.14em] uppercase">{copy.clue.brain}</span>
    </button>
  )
}

function BodyMiss({ onMiss }: { onMiss: () => void }) {
  return (
    <button
      type="button"
      onClick={onMiss}
      tabIndex={-1}
      aria-label="Fish body. Aim for the brain target on the head."
      className="absolute top-[36%] right-[18%] left-[38%] z-10 h-[34%] rounded-[40%] bg-transparent"
    />
  )
}

function GillTarget({
  done,
  onGill,
  onMiss,
}: {
  done: boolean
  onGill: () => void
  onMiss?: () => void
}) {
  const { pressed, pressProps } = usePressed()
  const drag = useRefDrag(onGill)

  return (
    <>
      <button
        type="button"
        {...pressProps}
        data-pressed={pressed ? 'true' : 'false'}
        disabled={done}
        aria-label={`${copy.gillTarget}. ${copy.gillAction}.`}
        onPointerDown={(event) => {
          pressProps.onPointerDown()
          drag.onDown(event)
        }}
        onPointerMove={drag.onMove}
        onPointerUp={(event) => {
          pressProps.onPointerUp()
          drag.onUp(event)
        }}
        className={cn(
          'pressable spring absolute z-20 flex min-h-16 min-w-[4.5rem] flex-col items-center justify-center rounded-full border-4 px-3 py-2',
          'left-[32%] top-[28%] sm:left-[34%]',
          done ? 'border-cool bg-cool text-navy' : 'border-navy bg-navy text-cream',
        )}
      >
        <span className="text-[11px] font-semibold tracking-[0.14em] uppercase">{copy.clue.gill}</span>
        <span className="text-xs">{done ? copy.gillSuccess : copy.gillAction}</span>
      </button>
      {onMiss && !done ? (
        <button
          type="button"
          tabIndex={-1}
          onClick={onMiss}
          aria-label="Fish body. Follow the labeled gill line."
          className="absolute top-[42%] right-[14%] left-[52%] z-10 h-[30%] rounded-[40%] bg-transparent"
        />
      ) : null}
    </>
  )
}

function useRefDrag(onComplete: () => void) {
  const state = useRef({
    active: false,
    startX: 0,
    startY: 0,
    moved: false,
    done: false,
  })

  return {
    onDown: (event: PointerEvent<HTMLButtonElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId)
      state.current.active = true
      state.current.startX = event.clientX
      state.current.startY = event.clientY
      state.current.moved = false
      state.current.done = false
    },
    onMove: (event: PointerEvent<HTMLButtonElement>) => {
      if (!state.current.active || state.current.done) return
      const dist = Math.hypot(event.clientX - state.current.startX, event.clientY - state.current.startY)
      if (dist > 10) state.current.moved = true
      if (dist >= 36) {
        state.current.done = true
        onComplete()
      }
    },
    onUp: (event: PointerEvent<HTMLButtonElement>) => {
      const already = state.current.done
      state.current.active = false
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      if (!already) onComplete()
    },
  }
}
