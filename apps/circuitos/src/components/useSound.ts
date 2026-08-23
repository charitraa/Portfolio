import { useCallback, useRef } from 'react'

export type SoundKind = 'click' | 'tick' | 'ready' | 'hover' | 'open'

const RECIPE: Record<SoundKind, { freq: number; dur: number; type: OscillatorType; gain: number }> = {
  click: { freq: 180, dur: 0.09, type: 'square', gain: 0.06 },
  tick: { freq: 1400, dur: 0.02, type: 'square', gain: 0.02 },
  ready: { freq: 880, dur: 0.35, type: 'sine', gain: 0.07 },
  hover: { freq: 2200, dur: 0.015, type: 'sine', gain: 0.012 },
  open: { freq: 520, dur: 0.12, type: 'triangle', gain: 0.05 },
}

/** Synthesised POST beeps — no audio assets, and silent until the user opts in. */
export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)

  return useCallback(
    (kind: SoundKind) => {
      if (!enabled) return
      try {
        if (!ctxRef.current) {
          const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
          if (!Ctor) return
          ctxRef.current = new Ctor()
        }
        const ctx = ctxRef.current
        if (ctx.state === 'suspended') void ctx.resume()
        const { freq, dur, type, gain } = RECIPE[kind]
        const osc = ctx.createOscillator()
        const amp = ctx.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        if (kind === 'ready') osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + dur)
        amp.gain.setValueAtTime(gain, ctx.currentTime)
        amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
        osc.connect(amp).connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + dur)
      } catch {
        /* audio is decorative — never let it break the board */
      }
    },
    [enabled],
  )
}
