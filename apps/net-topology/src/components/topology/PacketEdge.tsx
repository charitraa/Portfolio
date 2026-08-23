import { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react'
import { useApp } from '../../store/AppState'

export interface PacketEdgeData extends Record<string, unknown> {
  label: string
  dashed: boolean
}

export type PacketFlowEdge = Edge<PacketEdgeData, 'packet'>

/**
 * A link between two devices. Solid links carry a travelling packet; dashed
 * links (DNS lookups, static asset fetches, SMTP) are side channels and stay
 * quiet unless you hover one of their endpoints.
 */
function PacketEdgeView({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<PacketFlowEdge>) {
  const { hovered, motion, packets } = useApp()
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 14,
  })

  const active = hovered === source || hovered === target
  const dashed = Boolean(data?.dashed)
  const stroke = active ? 'var(--accent)' : 'var(--border)'
  const showPacket = motion && packets && (!dashed || active)

  return (
    <>
      {/* Glow underlay, only while an endpoint is hovered. */}
      {active && (
        <path
          d={edgePath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={7}
          strokeOpacity={0.16}
          strokeLinecap="round"
        />
      )}

      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke,
          strokeWidth: active ? 2 : 1.4,
          strokeDasharray: dashed ? '5 6' : undefined,
          transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
        }}
      />

      {showPacket && (
        <>
          <circle
            className="packet-dot"
            r={7}
            fill="var(--cyan)"
            opacity={0.18}
          >
            <animateMotion dur="3.4s" repeatCount="indefinite" path={edgePath} />
          </circle>
          <circle className="packet-dot" r={2.8} fill="var(--cyan)">
            <animateMotion dur="3.4s" repeatCount="indefinite" path={edgePath} />
          </circle>
        </>
      )}

      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-none absolute rounded border bg-bg-2/90 px-1.5 py-0.5 font-mono text-[9px] tracking-wide transition-colors"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            color: active ? 'var(--accent)' : 'var(--muted)',
            borderColor: active ? 'var(--accent)' : 'var(--border)',
            opacity: active ? 1 : 0.75,
          }}
        >
          {data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export const PacketEdge = memo(PacketEdgeView)
