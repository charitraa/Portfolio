import { ACCENT_HEX, BOARD_H, BOARD_W, FILLER_TRACES, TRACES, VIAS } from './layout'
import type { ComponentId } from './layout'

type Props = {
  /** Traces energise in boot order; anything past this index stays dark. */
  energised: Set<ComponentId>
  active: ComponentId | null
  hovered: ComponentId | null
  powerUp: boolean
}

export function Traces({ energised, active, hovered, powerUp }: Props) {
  const focus = active ?? hovered

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
      aria-hidden="true"
    >
      <defs>
        <filter id="trace-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="via-fill">
          <stop offset="0%" stopColor="#f8d38a" />
          <stop offset="70%" stopColor="#b4762a" />
          <stop offset="100%" stopColor="#5c3a12" />
        </radialGradient>
      </defs>

      {/* Filler copper — always dim, never interactive. */}
      <g opacity={powerUp ? 0.4 : 0.16}>
        {FILLER_TRACES.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#8a5a1f" strokeWidth={1.4} strokeLinecap="round" />
        ))}
      </g>

      {/* Via pads. */}
      <g>
        {VIAS.map((v, i) => (
          <circle
            key={i}
            cx={v.x}
            cy={v.y}
            r={2.6}
            fill="url(#via-fill)"
            opacity={powerUp ? 0.5 : 0.22}
          />
        ))}
      </g>

      {TRACES.map((t) => {
        const live = energised.has(t.to)
        const isFocus = focus === t.to
        const dimmed = focus !== null && !isFocus
        const hex = ACCENT_HEX[t.accent]

        return (
          <g key={t.id} opacity={dimmed ? 0.18 : 1} style={{ transition: 'opacity 260ms' }}>
            {/* Copper substrate — visible even unpowered. */}
            <path
              id={t.id}
              d={t.d}
              fill="none"
              stroke={live ? '#a16207' : '#3f3218'}
              strokeWidth={t.weight + 1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'stroke 600ms' }}
            />
            {/* Energised signal layer. */}
            <path
              d={t.d}
              fill="none"
              stroke={hex}
              strokeWidth={isFocus ? t.weight + 0.8 : t.weight}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={live ? (isFocus ? 0.95 : 0.4) : 0}
              filter={isFocus ? 'url(#trace-glow)' : undefined}
              style={{ transition: 'opacity 500ms, stroke-width 220ms' }}
            />
            {/* Data flowing along the bus. */}
            {live && (
              <path
                d={t.d}
                fill="none"
                stroke="#ffffff"
                strokeWidth={t.weight * 0.7}
                strokeLinecap="round"
                className={`trace-flow ${isFocus ? 'trace-flow-fast' : ''}`}
                opacity={isFocus ? 0.85 : 0.28}
              />
            )}
            {/* Packet. */}
            {live && (
              <circle r={isFocus ? 4 : 2.6} fill={hex} filter="url(#trace-glow)" opacity={isFocus ? 1 : 0.7}>
                <animateMotion dur={isFocus ? '1.1s' : '3.6s'} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
                  <mpath href={`#${t.id}`} />
                </animateMotion>
              </circle>
            )}
          </g>
        )
      })}
    </svg>
  )
}
