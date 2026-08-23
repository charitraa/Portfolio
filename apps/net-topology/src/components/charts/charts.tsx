import { useMemo } from 'react'

/** Deterministic PRNG so charts look identical on every render/reload. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/** Donut chart — language mix. */
export function DonutChart({
  data,
  size = 148,
  thickness = 16,
}: {
  data: Array<{ name: string; value: number; color: string }>
  size?: number
  thickness?: number
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius

  let offset = 0
  const segments = data.map((d) => {
    const fraction = d.value / total
    const seg = {
      ...d,
      dash: fraction * circumference,
      offset: -offset * circumference,
      percent: Math.round(fraction * 100),
    }
    offset += fraction
    return seg
  })

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width={size} height={size} role="img" aria-label="Language distribution">
        <g transform={`translate(${size / 2} ${size / 2}) rotate(-90)`}>
          <circle
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={thickness}
            opacity={0.35}
          />
          {segments.map((s) => (
            <circle
              key={s.name}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
            >
              <title>{`${s.name} — ${s.percent}%`}</title>
            </circle>
          ))}
        </g>
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          className="font-num"
          fill="var(--text)"
          fontSize="18"
          fontWeight="600"
        >
          {data.length}
        </text>
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          className="font-mono"
          fill="var(--muted)"
          fontSize="9"
          letterSpacing="1"
        >
          LANGS
        </text>
      </svg>
      <ul className="min-w-[130px] flex-1 space-y-1.5">
        {segments.map((s) => (
          <li key={s.name} className="flex items-center gap-2 font-mono text-[11px]">
            <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="flex-1 text-muted">{s.name}</span>
            <span className="text-ink">{s.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Vertical bars — projects shipped per year. */
export function BarChart({
  data,
  height = 120,
}: {
  data: Array<{ label: string; value: number }>
  height?: number
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="font-num text-[11px] text-muted">{d.value}</span>
          <div
            className="w-full rounded-t transition-[height] duration-700 ease-out"
            style={{
              height: `${(d.value / max) * (height - 34)}px`,
              background: `linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 25%, transparent))`,
              animationDelay: `${i * 60}ms`,
            }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="font-mono text-[10px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/** GitHub-style contribution grid. */
export function Heatmap({ weeks = 26, seed = 7 }: { weeks?: number; seed?: number }) {
  const cells = useMemo(() => {
    const rand = seeded(seed)
    return Array.from({ length: weeks * 7 }, () => {
      const r = rand()
      if (r > 0.86) return 4
      if (r > 0.68) return 3
      if (r > 0.44) return 2
      if (r > 0.24) return 1
      return 0
    })
  }, [weeks, seed])

  const shade = (level: number) =>
    level === 0
      ? 'color-mix(in srgb, var(--border) 45%, transparent)'
      : `color-mix(in srgb, var(--success) ${level * 24}%, transparent)`

  return (
    <div>
      <div
        className="grid grid-flow-col gap-[3px]"
        style={{ gridTemplateRows: 'repeat(7, 10px)' }}
        role="img"
        aria-label="Contribution activity over the last six months"
      >
        {cells.map((level, i) => (
          <span
            key={i}
            className="h-[10px] w-[10px] rounded-[2px]"
            style={{ background: shade(level) }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 font-mono text-[10px] text-muted">
        <span>less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: shade(l) }} />
        ))}
        <span>more</span>
      </div>
    </div>
  )
}

/** Rolling traffic sparkline for the dashboard. */
export function Sparkline({
  points,
  width = 260,
  height = 56,
  color = 'var(--cyan)',
}: {
  points: number[]
  width?: number
  height?: number
  color?: string
}) {
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const span = max - min || 1
  const step = width / Math.max(points.length - 1, 1)

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - ((p - min) / span) * (height - 6) - 3}`)
    .join(' ')
  const area = `${path} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}
