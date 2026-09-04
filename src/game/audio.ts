export type Cue = 'confirm' | 'window' | 'spike' | 'miss' | 'gill' | 'ice' | 'combo' | 'seal'

type Tone = {
  freq: number
  dur: number
  type: OscillatorType
  gain: number
  at: number
  slide?: number
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = false
let unlocking: Promise<boolean> | null = null

function Ctor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null
  return window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || null
}

function ensureGraph(): AudioContext | null {
  const Audio = Ctor()
  if (!Audio) return null
  if (!ctx) {
    ctx = new Audio()
    master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)
  }
  return ctx
}

export async function unlockAudio(): Promise<boolean> {
  const ac = ensureGraph()
  if (!ac) return false
  if (ac.state === 'running') return true
  if (!unlocking) {
    unlocking = ac
      .resume()
      .then(() => ac.state === 'running')
      .catch(() => false)
      .finally(() => {
        unlocking = null
      })
  }
  return unlocking
}

export function applyMute(next: boolean): void {
  muted = next
}

export function isMuted(): boolean {
  return muted
}

function tone(ac: AudioContext, spec: Tone): void {
  if (!master) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  const start = spec.at
  osc.type = spec.type
  osc.frequency.setValueAtTime(spec.freq, start)
  if (spec.slide) {
    osc.frequency.linearRampToValueAtTime(Math.max(40, spec.slide), start + spec.dur)
  }
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.linearRampToValueAtTime(spec.gain, start + 0.014)
  gain.gain.linearRampToValueAtTime(0.0001, start + spec.dur)
  osc.connect(gain)
  gain.connect(master)
  osc.start(start)
  osc.stop(start + spec.dur + 0.04)
}

export function playCue(cue: Cue): void {
  if (muted) return
  const ac = ensureGraph()
  if (!ac) return
  if (ac.state !== 'running') {
    void unlockAudio().then((ok) => {
      if (ok) playCue(cue)
    })
    return
  }

  const t = ac.currentTime + 0.012

  switch (cue) {
    case 'confirm':
      tone(ac, { freq: 660, dur: 0.07, type: 'square', gain: 0.22, at: t })
      tone(ac, { freq: 880, dur: 0.1, type: 'triangle', gain: 0.2, at: t + 0.06 })
      break
    case 'window':
      tone(ac, { freq: 880, dur: 0.06, type: 'square', gain: 0.18, at: t })
      tone(ac, { freq: 1174, dur: 0.07, type: 'square', gain: 0.16, at: t + 0.055 })
      break
    case 'spike':
      tone(ac, { freq: 392, dur: 0.09, type: 'triangle', gain: 0.24, at: t })
      tone(ac, { freq: 523, dur: 0.11, type: 'triangle', gain: 0.22, at: t + 0.05 })
      tone(ac, { freq: 784, dur: 0.16, type: 'sine', gain: 0.2, at: t + 0.11 })
      break
    case 'miss':
      tone(ac, { freq: 196, dur: 0.16, type: 'square', gain: 0.18, at: t, slide: 110 })
      tone(ac, { freq: 98, dur: 0.2, type: 'triangle', gain: 0.2, at: t + 0.02 })
      break
    case 'gill':
      tone(ac, { freq: 698, dur: 0.07, type: 'sawtooth', gain: 0.14, at: t, slide: 420 })
      tone(ac, { freq: 330, dur: 0.14, type: 'triangle', gain: 0.2, at: t + 0.04 })
      break
    case 'ice':
      tone(ac, { freq: 1046, dur: 0.09, type: 'sine', gain: 0.2, at: t })
      tone(ac, { freq: 1568, dur: 0.12, type: 'sine', gain: 0.16, at: t + 0.04 })
      break
    case 'combo':
      tone(ac, { freq: 523, dur: 0.08, type: 'triangle', gain: 0.18, at: t })
      tone(ac, { freq: 659, dur: 0.08, type: 'triangle', gain: 0.18, at: t + 0.06 })
      tone(ac, { freq: 784, dur: 0.14, type: 'sine', gain: 0.2, at: t + 0.12 })
      break
    case 'seal':
      tone(ac, { freq: 262, dur: 0.2, type: 'sine', gain: 0.18, at: t })
      tone(ac, { freq: 330, dur: 0.22, type: 'sine', gain: 0.16, at: t + 0.04 })
      tone(ac, { freq: 392, dur: 0.26, type: 'triangle', gain: 0.18, at: t + 0.08 })
      break
    default:
      break
  }
}

export function playConfirm(): void {
  void unlockAudio().then((ok) => {
    if (ok) playCue('confirm')
  })
}
