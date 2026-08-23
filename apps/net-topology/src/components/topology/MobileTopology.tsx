import { ChevronRight } from 'lucide-react'
import { devices } from '../../data/topology'
import { useApp } from '../../store/AppState'
import { cn } from '../../utils/cn'

const accentVar = {
  accent: 'var(--accent)',
  purple: 'var(--purple)',
  cyan: 'var(--cyan)',
  ok: 'var(--success)',
  warn: 'var(--warning)',
} as const

/**
 * Phones get the same route as a vertical stack — pan-and-zoom on a
 * 400px-wide screen is nobody's idea of a good time.
 */
export function MobileTopology() {
  const { select, selected, pushLog } = useApp()

  return (
    <div className="h-full overflow-y-auto px-4 py-5">
      <div className="mb-4">
        <h1 className="font-display text-lg font-bold text-ink">Network path</h1>
        <p className="font-mono text-[11px] text-muted">
          tap a device to inspect it — top to bottom is the route your request takes
        </p>
      </div>

      <ol className="relative space-y-2.5">
        {devices.map((device, i) => {
          const color = accentVar[device.data.accent]
          const Icon = device.data.icon
          const active = selected === device.data.id
          return (
            <li key={device.data.id} className="relative">
              {i < devices.length - 1 && (
                <span
                  className="absolute top-[52px] left-[27px] h-[calc(100%-38px)] w-px"
                  style={{ background: 'var(--border)' }}
                />
              )}
              <button
                onClick={() => {
                  select(device.data.id)
                  pushLog(`${device.data.hostname} → ${device.data.section} requested`, 'ok')
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border bg-panel/70 px-3 py-3 text-left transition-colors',
                  active && 'border-accent/60 bg-panel',
                )}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border"
                  style={{
                    color,
                    borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
                    background: `color-mix(in srgb, ${color} 12%, transparent)`,
                  }}
                >
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[9px] tracking-[0.14em] text-muted uppercase">
                    {device.data.kind}
                  </span>
                  <span className="block truncate font-display text-[13.5px] font-semibold text-ink">
                    {device.data.section}
                  </span>
                  <span className="block truncate font-mono text-[10px] text-muted">
                    {device.data.hostname} · {device.data.metric}
                  </span>
                </span>
                <ChevronRight size={15} className="shrink-0 text-muted" />
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
