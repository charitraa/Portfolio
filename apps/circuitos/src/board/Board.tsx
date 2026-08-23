import { BOARD_H, BOARD_W } from './layout'
import type { ComponentId } from './layout'
import { Nodes } from './Nodes'
import { Traces } from './Traces'
import { identity } from '../data/content'

type Props = {
  energised: Set<ComponentId>
  active: ComponentId | null
  hovered: ComponentId | null
  powerUp: boolean
  m2Revealed: boolean
  onHover: (id: ComponentId | null) => void
  onSelect: (id: ComponentId) => void
}

const MOUNTS = [
  { x: 26, y: 26 },
  { x: BOARD_W - 26, y: 26 },
  { x: 26, y: BOARD_H - 26 },
  { x: BOARD_W - 26, y: BOARD_H - 26 },
  { x: BOARD_W / 2, y: 26 },
  { x: BOARD_W / 2, y: BOARD_H - 26 },
]

export function Board(props: Props) {
  return (
    <div
      className="board-canvas solder-mask relative rounded-2xl ring-1 ring-slate-700/70"
      style={{
        width: BOARD_W,
        height: BOARD_H,
        boxShadow: '0 60px 120px -40px rgba(0,0,0,0.95), inset 0 0 120px rgba(0,0,0,0.5)',
      }}
    >
      <div className="pcb-grid pointer-events-none absolute inset-0 rounded-2xl opacity-40" />

      {/* mounting holes */}
      {MOUNTS.map((m, i) => (
        <span
          key={i}
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#060a12] ring-2 ring-slate-500/50"
          style={{ left: m.x, top: m.y }}
        />
      ))}

      {/* silkscreen */}
      <span className="pointer-events-none absolute bottom-3 left-8 font-mono text-[10px] tracking-[0.3em] text-slate-600">
        CIRCUITOS · REV 1.0 · {identity.name}
      </span>
      <span className="pointer-events-none absolute bottom-3 right-8 font-mono text-[10px] tracking-[0.3em] text-slate-600">
        MADE IN {identity.location.split(',').pop()?.trim().toUpperCase()}
      </span>
      <span className="pointer-events-none absolute left-3 top-1/2 -rotate-90 font-mono text-[10px] tracking-[0.3em] text-slate-700">
        ATX FORM FACTOR
      </span>

      <Traces
        energised={props.energised}
        active={props.active}
        hovered={props.hovered}
        powerUp={props.powerUp}
      />
      <Nodes
        energised={props.energised}
        active={props.active}
        hovered={props.hovered}
        m2Revealed={props.m2Revealed}
        onHover={props.onHover}
        onSelect={props.onSelect}
      />
    </div>
  )
}
