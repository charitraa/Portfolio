import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Tone = 'ok' | 'warn' | 'err' | 'accent' | 'purple' | 'cyan' | 'muted'

const toneVar: Record<Tone, string> = {
  ok: 'var(--success)',
  warn: 'var(--warning)',
  err: 'var(--error)',
  accent: 'var(--accent)',
  purple: 'var(--purple)',
  cyan: 'var(--cyan)',
  muted: 'var(--muted)',
}

/** Status chip: ● HEALTHY, ● SECURED, ● 200 OK … */
export function StatusPill({
  label,
  tone = 'ok',
  dot = true,
  pulse = false,
}: {
  label: string
  tone?: Tone
  dot?: boolean
  pulse?: boolean
}) {
  const color = toneVar[tone]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider uppercase"
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', pulse && 'anim-blink')}
          style={{ background: color }}
        />
      )}
      {label}
    </span>
  )
}

export function SectionTitle({
  children,
  hint,
}: {
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="font-display text-xs font-semibold tracking-[0.14em] text-muted uppercase">
        {children}
      </h3>
      {hint && <span className="font-mono text-[10px] text-muted/70">{hint}</span>}
    </div>
  )
}

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const interactive = Boolean(onClick)
  return (
    <div
      className={cn(
        'rounded-lg border bg-panel/60 p-3 transition-colors',
        interactive && 'cursor-pointer hover:border-accent/60 hover:bg-panel',
        className,
      )}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}

/** Terminal-style key/value row used all over the detail panels. */
export function KeyValue({ k, v, tone }: { k: string; v: ReactNode; tone?: Tone }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/40 py-1.5 last:border-0">
      <span className="font-mono text-[11px] tracking-wide text-muted">{k}</span>
      <span
        className="text-right font-mono text-[12px] font-medium"
        style={tone ? { color: toneVar[tone] } : undefined}
      >
        {v}
      </span>
    </div>
  )
}

/** Counts up to `value` once, then tracks it directly. */
export function CountUp({
  value,
  duration = 900,
  decimals = 0,
}: {
  value: number
  duration?: number
  decimals?: number
}) {
  const [shown, setShown] = useState(0)
  const frame = useRef(0)

  useEffect(() => {
    const reduced =
      document.documentElement.dataset.motion === 'off' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setShown(value)
      return
    }
    const start = performance.now()
    const from = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(from + (value - from) * eased)
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [value, duration])

  return <>{shown.toFixed(decimals)}</>
}

/** Small dashboard tile: label, big number, optional trailing unit. */
export function StatTile({
  label,
  value,
  unit,
  tone = 'accent',
  decimals = 0,
  animate = true,
}: {
  label: string
  value: number
  unit?: string
  tone?: Tone
  decimals?: number
  animate?: boolean
}) {
  return (
    <div className="rounded-lg border bg-bg-2/70 px-3 py-2.5">
      <div className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-num text-2xl font-semibold" style={{ color: toneVar[tone] }}>
          {animate ? <CountUp value={value} decimals={decimals} /> : value.toFixed(decimals)}
        </span>
        {unit && <span className="font-mono text-[11px] text-muted">{unit}</span>}
      </div>
    </div>
  )
}

/** Horizontal meter used for skills, load and memory. */
export function Meter({
  value,
  tone = 'accent',
  height = 6,
  label,
}: {
  value: number
  tone?: Tone
  height?: number
  label?: string
}) {
  const color = toneVar[tone]
  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{ background: 'color-mix(in srgb, var(--border) 55%, transparent)', height }}
      role="meter"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${value}%`,
          background: `linear-gradient(90deg, color-mix(in srgb, ${color} 55%, transparent), ${color})`,
        }}
      />
    </div>
  )
}

export function MethodBadge({ method }: { method: string }) {
  const tone: Tone = method === 'GET' ? 'ok' : method === 'POST' ? 'accent' : 'warn'
  return (
    <span
      className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider"
      style={{
        color: toneVar[tone],
        background: `color-mix(in srgb, ${toneVar[tone]} 14%, transparent)`,
      }}
    >
      {method}
    </span>
  )
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-line/70 bg-bg-2/60 px-1.5 py-0.5 font-mono text-[10px] text-muted">
      {children}
    </span>
  )
}
