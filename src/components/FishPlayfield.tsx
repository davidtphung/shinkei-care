import { useRef, type PointerEvent, type Ref } from 'react'
import { copy } from '@/game/copy.ts'
import { usePressed } from '@/hooks/usePressed.ts'
import { cn } from '@/lib/utils.ts'

export type FishPose = 'idle' | 'success' | 'miss'

type Mode = 'spike' | 'gill'

type Props = {
  mode: Mode
  pose?: FishPose
  progress?: number
  inWindow?: boolean
  gillDone?: boolean
  onSpike?: (onTarget: boolean) => void
  onGill?: () => void
  onGillMiss?: () => void
  targetRef?: Ref<HTMLButtonElement>
}

export function FishPlayfield({
  mode,
  pose = 'idle',
  progress = 0,
  inWindow = false,
  gillDone = false,
  onSpike,
  onGill,
  onGillMiss,
  targetRef,
}: Props) {
  return (
    <div className="panel relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border-4 border-navy bg-cream px-2 pt-6 pb-3 sm:px-5 sm:pt-7 sm:pb-4">
      <div
        className={cn(
          'relative mx-auto w-full max-w-[34rem]',
          pose === 'success' ? 'fish-success' : null,
        )}
      >
        <div
          className={cn(
            pose === 'success' ? 'fish-wiggle' : null,
            pose === 'miss' ? 'fish-shake' : null,
          )}
        >
          <FishArt mode={mode} gillDone={gillDone} pose={pose} />
        </div>
        {mode === 'spike' && onSpike ? (
          <BrainTarget
            progress={progress}
            inWindow={inWindow}
            onSpike={() => onSpike(true)}
            targetRef={targetRef}
          />
        ) : null}
        {mode === 'spike' && onSpike ? (
          <BodyMiss onMiss={() => onSpike(false)} label={copy.bodyMiss} />
        ) : null}
        {mode === 'gill' && onGill ? (
          <GillTarget
            done={gillDone}
            onGill={onGill}
            onMiss={onGillMiss}
            targetRef={targetRef}
          />
        ) : null}
      </div>
    </div>
  )
}

function FishArt({
  mode,
  gillDone,
  pose,
}: {
  mode: Mode
  gillDone: boolean
  pose: FishPose
}) {
  const still = pose === 'success'

  return (
    <svg
      className="h-auto w-full"
      viewBox="0 0 360 200"
      role="img"
      aria-label={
        still
          ? 'Side-view fish, still after a clean spike'
          : 'Silvery side-view fish with a readable eye, gill plate, and lateral line'
      }
    >
      <ellipse cx="196" cy="178" rx="118" ry="8" fill="#0B1424" opacity="0.12" />

      <g className="fish-tail">
        <polygon points="292,104 352,68 340,104 352,140" fill="#0B1424" />
        <polygon points="298,104 340,78 332,104 340,130" fill="#FFEBD0" />
      </g>

      <g className="fish-fin-dorsal">
        <polygon points="176,36 228,74 158,76" fill="#FF4400" />
        <polygon points="182,46 216,72 166,72" fill="#0B1424" />
        <rect x="188" y="48" width="6" height="20" fill="#FFEBD0" />
        <rect x="198" y="52" width="6" height="16" fill="#FFEBD0" />
      </g>

      <ellipse cx="188" cy="110" rx="108" ry="42" fill="#0B1424" />
      <ellipse cx="186" cy="110" rx="100" ry="36" fill="#FFEBD0" />
      <ellipse cx="200" cy="96" rx="70" ry="16" fill="#3D8FB5" opacity="0.22" />
      <ellipse cx="190" cy="128" rx="78" ry="14" fill="#FFEBD0" />

      <rect x="158" y="96" width="10" height="7" fill="#0B1424" opacity="0.18" />
      <rect x="176" y="102" width="10" height="7" fill="#0B1424" opacity="0.18" />
      <rect x="194" y="96" width="10" height="7" fill="#0B1424" opacity="0.18" />
      <rect x="212" y="102" width="10" height="7" fill="#0B1424" opacity="0.18" />
      <rect x="230" y="96" width="10" height="7" fill="#0B1424" opacity="0.18" />
      <rect x="248" y="102" width="10" height="7" fill="#0B1424" opacity="0.18" />

      <ellipse cx="92" cy="104" rx="54" ry="40" fill="#0B1424" />
      <ellipse cx="92" cy="104" rx="48" ry="34" fill="#FFEBD0" />
      <ellipse cx="100" cy="90" rx="28" ry="12" fill="#3D8FB5" opacity="0.16" />
      <polygon points="38,106 68,84 70,128" fill="#FFEBD0" />
      <polygon points="34,106 56,90 56,122" fill="#0B1424" />

      <g className="fish-mouth">
        <rect x="32" y="100" width="24" height="5" fill="#0B1424" />
        <rect className="fish-jaw-lower" x="34" y="108" width="22" height="4" fill="#0B1424" />
        <rect className="fish-mouth-gap spring" x="36" y="104" width="18" height="7" fill="#0B1424" />
      </g>

      <circle cx="84" cy="90" r="16" fill="#0B1424" />
      <circle cx="84" cy="90" r="12" fill="#FFEBD0" />
      <circle cx="84" cy="90" r="7" fill="#FFB060" />
      <circle cx="81" cy="88" r="4.2" fill="#0B1424" />
      <circle cx="79" cy="86" r="1.6" fill="#FFEBD0" />

      <path
        d="M108 62 C124 78, 126 112, 110 140"
        fill="none"
        stroke="#0B1424"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M114 68 C128 84, 130 116, 114 136"
        fill="#FFEBD0"
        stroke="#0B1424"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M122 74 C136 90, 136 118, 120 134"
        fill={mode === 'gill' || gillDone ? '#3D8FB5' : '#0B1424'}
        fillOpacity={mode === 'gill' || gillDone ? 0.28 : 0.12}
        stroke="#3D8FB5"
        strokeWidth={mode === 'gill' ? 4 : 2.4}
        strokeLinecap="round"
      />

      <polyline
        points="108,76 150,90 198,100 268,108"
        fill="none"
        stroke="#0B1424"
        strokeWidth="2.4"
        strokeDasharray="7 5"
        strokeLinecap="round"
      />
      <line x1="108" y1="64" x2="108" y2="88" stroke="#3D8FB5" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="108" cy="76" r="3.6" fill="#3D8FB5" />

      <g className="fish-fin-pectoral">
        <polygon points="138,120 180,146 130,136" fill="#FF4400" />
        <polygon points="142,124 170,140 134,132" fill="#0B1424" />
      </g>

      <polygon points="214,144 246,144 228,162" fill="#FF4400" />
      <polygon points="218,146 240,146 228,158" fill="#0B1424" />
    </svg>
  )
}

function BrainTarget({
  progress,
  inWindow,
  onSpike,
  targetRef,
}: {
  progress: number
  inWindow: boolean
  onSpike: () => void
  targetRef?: Ref<HTMLButtonElement>
}) {
  const { pressed, pressProps } = usePressed()
  const r = 20
  const circ = 2 * Math.PI * r
  const dash = Math.max(0.04, progress) * circ

  return (
    <div className="absolute top-[38%] left-[30%] z-20 -translate-x-1/2 -translate-y-1/2">
      <button
        ref={targetRef}
        type="button"
        {...pressProps}
        data-pressed={pressed ? 'true' : 'false'}
        onClick={onSpike}
        aria-label={`${copy.spikeTarget}. ${inWindow ? copy.windowOpen : copy.windowClosed}`}
        className={cn(
          'pressable spring flex min-h-16 min-w-16 flex-col items-center justify-center rounded-full border-4 px-1.5 py-1.5',
          inWindow ? 'cycle-pulse border-cool bg-cream text-navy' : 'border-cool bg-navy text-cream',
        )}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r={r} fill="none" stroke="#0B1424" strokeWidth="3" opacity="0.2" />
          <circle
            cx="24"
            cy="24"
            r={r}
            fill="none"
            stroke="#3D8FB5"
            strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 24 24)"
          />
        </svg>
        <span className="relative text-[10px] font-semibold tracking-[0.12em] uppercase">
          {inWindow ? copy.now : copy.clue.brain}
        </span>
      </button>
    </div>
  )
}

function BodyMiss({ onMiss, label }: { onMiss: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onMiss}
      tabIndex={-1}
      aria-label={label}
      className="absolute top-[40%] right-[8%] left-[48%] z-10 h-[38%] rounded-[42%] bg-transparent"
    />
  )
}

function GillTarget({
  done,
  onGill,
  onMiss,
  targetRef,
}: {
  done: boolean
  onGill: () => void
  onMiss?: () => void
  targetRef?: Ref<HTMLButtonElement>
}) {
  const { pressed, pressProps } = usePressed()
  const drag = useRefDrag(onGill)

  return (
    <>
      <div className="absolute top-[51%] left-[35.5%] z-20 -translate-x-1/2 -translate-y-1/2">
        <button
          ref={targetRef}
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
            'pressable spring flex min-h-16 min-w-16 flex-col items-center justify-center rounded-full border-4 px-2 py-1.5',
            done ? 'border-cool bg-cool text-navy' : 'border-cool bg-navy text-cream',
          )}
        >
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">{copy.clue.gill}</span>
        </button>
      </div>
      {onMiss && !done ? <BodyMiss onMiss={onMiss} label={copy.gillBodyMiss} /> : null}
    </>
  )
}

function useRefDrag(onComplete: () => void) {
  const state = useRef({
    active: false,
    startX: 0,
    startY: 0,
    done: false,
  })

  return {
    onDown: (event: PointerEvent<HTMLButtonElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId)
      state.current.active = true
      state.current.startX = event.clientX
      state.current.startY = event.clientY
      state.current.done = false
    },
    onMove: (event: PointerEvent<HTMLButtonElement>) => {
      if (!state.current.active || state.current.done) return
      const dist = Math.hypot(event.clientX - state.current.startX, event.clientY - state.current.startY)
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
