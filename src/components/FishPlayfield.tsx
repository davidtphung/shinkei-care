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
            pose === 'success' ? 'fish-flail' : null,
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
          : 'Side-view fish with eye, gill bone, and lateral line'
      }
    >
      <ellipse cx="176" cy="176" rx="108" ry="8" fill="#0B1424" opacity="0.12" />

      <g className="fish-tail">
        <polygon points="286,102 348,66 336,102 348,138" fill="#0B1424" />
        <polygon points="292,102 336,76 328,102 336,128" fill="#FFEBD0" />
      </g>

      <g className="fish-fin-dorsal">
        <polygon points="168,40 216,76 150,78" fill="#FF4400" />
        <polygon points="174,48 206,74 158,74" fill="#0B1424" />
        <rect x="180" y="50" width="6" height="20" fill="#FFEBD0" />
        <rect x="190" y="54" width="6" height="16" fill="#FFEBD0" />
      </g>

      <ellipse cx="176" cy="106" rx="112" ry="46" fill="#0B1424" />
      <ellipse cx="174" cy="106" rx="102" ry="38" fill="#FF4400" />
      <ellipse cx="178" cy="124" rx="82" ry="16" fill="#FFEBD0" />

      <rect x="148" y="90" width="10" height="8" fill="#0B1424" opacity="0.22" />
      <rect x="168" y="96" width="10" height="8" fill="#0B1424" opacity="0.22" />
      <rect x="188" y="90" width="10" height="8" fill="#0B1424" opacity="0.22" />
      <rect x="208" y="96" width="10" height="8" fill="#0B1424" opacity="0.22" />
      <rect x="228" y="90" width="10" height="8" fill="#0B1424" opacity="0.22" />

      <ellipse cx="86" cy="104" rx="40" ry="30" fill="#0B1424" />
      <ellipse cx="86" cy="104" rx="34" ry="24" fill="#FF4400" />
      <polygon points="44,104 70,86 70,122" fill="#FF4400" />
      <polygon points="40,104 58,92 58,116" fill="#0B1424" />

      <g className="fish-mouth">
        <rect x="36" y="98" width="22" height="5" fill="#0B1424" />
        <rect className="fish-jaw-lower" x="36" y="106" width="20" height="4" fill="#0B1424" />
        <rect className="fish-mouth-gap spring" x="38" y="102" width="16" height="6" fill="#FFEBD0" />
      </g>

      <circle cx="80" cy="90" r="12" fill="#0B1424" />
      <circle cx="80" cy="90" r="8" fill="#FFEBD0" />
      <circle cx="77" cy="88" r="3.2" fill="#0B1424" />

      <path
        d="M108 76 C122 88, 122 122, 108 136"
        fill="none"
        stroke="#0B1424"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M114 80 C128 92, 128 118, 114 132"
        fill="none"
        stroke="#0B1424"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M122 84 C138 96, 138 118, 122 130"
        fill={mode === 'gill' || gillDone ? '#3D8FB5' : 'none'}
        fillOpacity={mode === 'gill' || gillDone ? 0.28 : 0}
        stroke="#3D8FB5"
        strokeWidth={mode === 'gill' ? 4 : 2.5}
        strokeLinecap="round"
      />

      <line
        x1="118"
        y1="104"
        x2="268"
        y2="104"
        stroke="#0B1424"
        strokeWidth="2.4"
        strokeDasharray="7 5"
        strokeLinecap="round"
      />
      <circle cx="118" cy="104" r="3.4" fill="#3D8FB5" />

      <g className="fish-fin-pectoral">
        <polygon points="132,118 172,142 126,134" fill="#FF4400" />
        <polygon points="136,122 164,138 130,132" fill="#0B1424" />
      </g>

      <polygon points="206,142 236,142 218,160" fill="#FF4400" />
      <polygon points="210,144 230,144 218,156" fill="#0B1424" />
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
    <div className="absolute top-[52%] left-[32.8%] z-20 -translate-x-1/2 -translate-y-1/2">
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
      className="absolute top-[34%] right-[10%] left-[46%] z-10 h-[42%] rounded-[42%] bg-transparent"
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
      <div className="absolute top-[53%] left-[36.2%] z-20 -translate-x-1/2 -translate-y-1/2">
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
