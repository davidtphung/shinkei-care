export type Cue = 'window' | 'spike' | 'miss' | 'gill' | 'ice' | 'combo' | 'seal'

type Tone = {
  freq: number
  dur: number
  type: OscillatorType
  gain: number
  at: number
  slide?: number
}

let ctx: AudioContext | null = null
let muted = false

function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function unlockAudio(): void {
  audioContext()
}

export function applyMute(next: boolean): void {
  muted = next
}

export function isMuted(): boolean {
  return muted
}

function tone(ac: AudioContext, spec: Tone): void {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  const start = spec.at
  osc.type = spec.type
  osc.frequency.setValueAtTime(spec.freq, start)
  if (spec.slide) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, spec.slide), start + spec.dur)
  }
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(spec.gain, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + spec.dur)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(start)
  osc.stop(start + spec.dur + 0.03)
}

function tick(ac: AudioContext, at: number, freq: number, gain = 0.045): void {
  tone(ac, { freq, dur: 0.045, type: 'square', gain, at })
}

export function playCue(cue: Cue): void {
  if (muted) return
  const ac = audioContext()
  if (!ac) return
  const t = ac.currentTime

  switch (cue) {
    case 'window':
      tick(ac, t, 880, 0.04)
      tick(ac, t + 0.055, 1174, 0.035)
      break
    case 'spike':
      tone(ac, { freq: 392, dur: 0.08, type: 'triangle', gain: 0.07, at: t })
      tone(ac, { freq: 523, dur: 0.1, type: 'triangle', gain: 0.06, at: t + 0.05 })
      tone(ac, { freq: 784, dur: 0.16, type: 'sine', gain: 0.05, at: t + 0.11 })
      break
    case 'miss':
      tone(ac, { freq: 196, dur: 0.14, type: 'square', gain: 0.04, at: t, slide: 110 })
      tone(ac, { freq: 98, dur: 0.18, type: 'triangle', gain: 0.05, at: t + 0.02 })
      break
    case 'gill':
      tone(ac, { freq: 698, dur: 0.05, type: 'sawtooth', gain: 0.03, at: t, slide: 420 })
      tone(ac, { freq: 330, dur: 0.12, type: 'triangle', gain: 0.05, at: t + 0.04 })
      break
    case 'ice':
      tone(ac, { freq: 1046, dur: 0.08, type: 'sine', gain: 0.045, at: t })
      tone(ac, { freq: 1568, dur: 0.1, type: 'sine', gain: 0.03, at: t + 0.04 })
      break
    case 'combo':
      tone(ac, { freq: 523, dur: 0.07, type: 'triangle', gain: 0.045, at: t })
      tone(ac, { freq: 659, dur: 0.07, type: 'triangle', gain: 0.045, at: t + 0.06 })
      tone(ac, { freq: 784, dur: 0.12, type: 'sine', gain: 0.05, at: t + 0.12 })
      break
    case 'seal':
      tone(ac, { freq: 262, dur: 0.18, type: 'sine', gain: 0.04, at: t })
      tone(ac, { freq: 330, dur: 0.2, type: 'sine', gain: 0.035, at: t + 0.04 })
      tone(ac, { freq: 392, dur: 0.24, type: 'triangle', gain: 0.04, at: t + 0.08 })
      break
    default:
      break
  }
}
