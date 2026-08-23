/** Tiny classname joiner — no dependency needed for what we do here. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Deterministic-ish jitter around a base value, for the fake telemetry. */
export function drift(base: number, spread: number, min = 0, max = 100): number {
  return clamp(base + (Math.random() - 0.5) * spread * 2, min, max)
}

export function formatClock(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour12: false })
}
