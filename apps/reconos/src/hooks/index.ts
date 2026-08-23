import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/store/app'

/** Ticking wall clock, updated once per second. */
export function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export const hhmmss = (d: Date) =>
  d.toLocaleTimeString('en-GB', { hour12: false })

export const hhmm = (d: Date) =>
  d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

/** Types `text` out one character at a time. Respects the animations setting. */
export function useTypewriter(text: string, speed = 24, startDelay = 0) {
  const enabled = useApp((s) => s.settings.animations)
  const [out, setOut] = useState(enabled ? '' : text)

  useEffect(() => {
    if (!enabled) {
      setOut(text)
      return
    }
    setOut('')
    let i = 0
    let interval: ReturnType<typeof setInterval>
    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1
        setOut(text.slice(0, i))
        if (i >= text.length) clearInterval(interval)
      }, speed)
    }, startDelay)
    return () => {
      clearTimeout(start)
      clearInterval(interval)
    }
  }, [text, speed, startDelay, enabled])

  return { text: out, done: out.length >= text.length }
}

/** Eases a number from 0 → `to` once, for stat counters. */
export function useCountUp(to: number, duration = 900) {
  const enabled = useApp((s) => s.settings.animations)
  const [value, setValue] = useState(enabled ? 0 : to)
  const raf = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setValue(to)
      return
    }
    const started = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - started) / duration)
      // easeOutCubic
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [to, duration, enabled])

  return value
}

/**
 * Short synthesised UI blips via WebAudio — no asset files, and silent unless
 * the user opts in from Settings.
 */
export function useSound() {
  const enabled = useApp((s) => s.settings.sound)
  const ctxRef = useRef<AudioContext | null>(null)

  return (kind: 'key' | 'ok' | 'open' | 'error' = 'key') => {
    if (!enabled) return
    try {
      ctxRef.current ??= new AudioContext()
      const ctx = ctxRef.current
      if (ctx.state === 'suspended') void ctx.resume()

      const freq = { key: 620, ok: 880, open: 440, error: 220 }[kind]
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = kind === 'key' ? 'square' : 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch {
      /* Audio is decorative — never let it break an interaction. */
    }
  }
}

/** True once the component has been mounted for `ms`, for skeleton states. */
export function useDelayedReady(ms = 450) {
  const skip = !useApp((s) => s.settings.animations)
  const [ready, setReady] = useState(skip)
  useEffect(() => {
    if (skip) return
    const id = setTimeout(() => setReady(true), ms)
    return () => clearTimeout(id)
  }, [ms, skip])
  return ready
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}
