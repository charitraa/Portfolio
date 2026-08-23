import { memo } from 'react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import type { DeviceNodeData } from '../../data/types'
import { cn } from '../../utils/cn'

export type DeviceFlowNode = Node<DeviceNodeData, 'device'>

const accentVar: Record<DeviceNodeData['accent'], string> = {
  accent: 'var(--accent)',
  purple: 'var(--purple)',
  cyan: 'var(--cyan)',
  ok: 'var(--success)',
  warn: 'var(--warning)',
}

const healthColor: Record<DeviceNodeData['health'], string> = {
  healthy: 'var(--success)',
  degraded: 'var(--warning)',
  offline: 'var(--error)',
}

const sides = [
  { pos: Position.Top, key: 'top' },
  { pos: Position.Bottom, key: 'bottom' },
  { pos: Position.Left, key: 'left' },
  { pos: Position.Right, key: 'right' },
] as const

/**
 * One box on the map. Hover behaviour is per-device-class: the router turns,
 * the firewall pulses, the database glows, servers blink an LED.
 */
function DeviceNodeView({ data, selected }: NodeProps<DeviceFlowNode>) {
  const Icon = data.icon
  const color = accentVar[data.accent]

  return (
    <div
      className={cn(
        'group relative w-[216px] rounded-xl border bg-panel/85 backdrop-blur-sm',
        'px-3 py-2.5 transition-all duration-200',
        'hover:-translate-y-0.5',
      )}
      style={{
        borderColor: selected ? color : 'var(--border)',
        boxShadow: selected
          ? `0 0 0 1px ${color}, 0 0 0 5px color-mix(in srgb, ${color} 18%, transparent), 0 10px 30px -14px ${color}`
          : '0 6px 18px -14px rgba(0,0,0,0.9)',
      }}
    >
      {sides.map(({ pos, key }) => (
        <div key={key}>
          <Handle type="target" id={`t-${key}`} position={pos} />
          <Handle type="source" id={`s-${key}`} position={pos} />
        </div>
      ))}

      {/* Hover glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(120% 90% at 50% 0%, ${color}22, transparent 70%)` }}
      />

      <div className="relative flex items-start gap-2.5">
        <div
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-transform duration-300',
            data.id === 'router' && 'group-hover:rotate-[18deg]',
            data.id === 'firewall' && 'group-hover:scale-110',
            data.id === 'balancer' && 'group-hover:rotate-180',
          )}
          style={{
            color,
            borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
          }}
        >
          <Icon size={17} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] tracking-[0.14em] text-muted uppercase">
              {data.kind}
            </span>
            <span
              className={cn(
                'ml-auto h-1.5 w-1.5 rounded-full',
                data.id === 'app' || data.id === 'database' ? 'anim-blink' : 'anim-pulse',
              )}
              style={{ background: healthColor[data.health] }}
            />
          </div>
          <div className="truncate font-display text-[13px] font-semibold text-ink">
            {data.section}
          </div>
          <div className="truncate font-mono text-[10px] text-muted">{data.hostname}</div>
        </div>
      </div>

      <div className="relative mt-2 flex items-center justify-between border-t border-line/50 pt-1.5">
        <span className="font-mono text-[10px] text-muted">{data.metric}</span>
        <span className="font-mono text-[9px] tracking-wider" style={{ color: healthColor[data.health] }}>
          {data.health.toUpperCase()}
        </span>
      </div>

      {/* Firewall gets a scanning sweep on hover. */}
      {data.id === 'firewall' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl opacity-0 group-hover:opacity-100">
          <div
            className="anim-sweep h-full w-1/3"
            style={{ background: `linear-gradient(90deg, transparent, ${color}22, transparent)` }}
          />
        </div>
      )}
    </div>
  )
}

export const DeviceNode = memo(DeviceNodeView)
