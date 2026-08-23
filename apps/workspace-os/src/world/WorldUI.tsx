import { useEffect, useState } from 'react'
import { stationById, stations3d } from './stations3d'
import { BOUNDS } from './collision'
import { pose, useWorld } from './player'
import { TOTAL_STATIONS, useDiscovery } from '@/store/discovery'

/**
 * The overlay drawn over the 3D room while exploring.
 *
 * Kept to four corners and a prompt: the world is the thing being looked at,
 * and a HUD that competes with it defeats the point. Nothing here is required
 * to use the room — every station is reachable by walking to it, and the map
 * exists so that nobody has to.
 */
export default function WorldUI({
  onInteract,
  onExit,
}: {
  onInteract: (stationId: string) => void
  onExit: () => void
}) {
  const near = useWorld((s) => s.near)
  const here = useWorld((s) => s.here)
  const locked = useWorld((s) => s.locked)
  const mapOpen = useWorld((s) => s.mapOpen)
  const toggleMap = useWorld((s) => s.toggleMap)
  const goTo = useWorld((s) => s.goTo)
  const found = useDiscovery((s) => s.found)
  const [showHelp, setShowHelp] = useState(false)

  const nearStation = near ? stationById.get(near) : null
  const hereStation = here ? stationById.get(here) : null

  // M toggles the map; Escape closes it before it releases the pointer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const code = e.code.toLowerCase()
      if (code === 'keym') {
        e.preventDefault()
        toggleMap()
      } else if (code === 'slash' && e.shiftKey) {
        e.preventDefault()
        setShowHelp((v) => !v)
      } else if (code === 'escape' && useWorld.getState().mapOpen) {
        toggleMap(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleMap])

  return (
    <div className="pointer-events-none absolute inset-0 z-[40] select-none" style={{ color: '#dbe6f7' }}>
      {/* Top left — where you are */}
      <div className="absolute top-4 left-4 flex items-center gap-2.5">
        <span
          className="rounded-lg px-2.5 py-1 font-mono text-[10.5px] tracking-[0.16em]"
          style={{ background: 'rgba(8,11,16,.66)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.14)' }}
        >
          CHARITRAOS · WORKSPACE
        </span>
      </div>

      {/* Top right — controls */}
      <div className="pointer-events-auto absolute top-4 right-4 flex items-center gap-1.5">
        <HudButton onClick={() => toggleMap()} active={mapOpen} title="Workspace map (M)">
          Map
        </HudButton>
        <HudButton onClick={() => setShowHelp((v) => !v)} active={showHelp} title="Controls (?)">
          ?
        </HudButton>
        <HudButton onClick={onExit} title="Leave the room and use the desktop directly">
          Exit ↩
        </HudButton>
      </div>

      {/* Crosshair — only while the pointer is captured, so it never sits over
          a page the visitor is trying to click. */}
      {locked && !mapOpen && (
        <div
          className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'rgba(255,255,255,.55)' }}
        />
      )}

      {/* Bottom centre — the interaction prompt */}
      {nearStation && !mapOpen && (
        <button
          type="button"
          onClick={() => onInteract(nearStation.id)}
          className="pointer-events-auto absolute bottom-24 left-1/2 -translate-x-1/2 rounded-xl px-4 py-2.5 text-center transition-transform hover:scale-[1.03]"
          style={{ background: 'rgba(8,11,16,.82)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.18)' }}
        >
          <span className="flex items-center gap-2.5 text-[13px]">
            <kbd
              className="rounded-md px-1.5 py-0.5 font-mono text-[11px]"
              style={{ background: 'rgba(255,255,255,.14)' }}
            >
              E
            </kbd>
            <span className="font-medium">
              {nearStation.verb} {nearStation.name}
            </span>
          </span>
          <span className="mt-0.5 block text-[11px]" style={{ color: '#8fa0b6' }}>
            {nearStation.blurb}
          </span>
        </button>
      )}

      {/* Bottom left — location + discovery */}
      <div className="absolute bottom-4 left-4 font-mono text-[10.5px] leading-relaxed" style={{ color: '#8fa0b6' }}>
        <div style={{ color: '#c3d0e2' }}>{hereStation ? hereStation.name : 'Walking'}</div>
        <div>
          DISCOVERED {found.length} / {TOTAL_STATIONS}
        </div>
      </div>

      {/* Bottom right — the one hint, and only until the pointer is grabbed */}
      {!locked && !mapOpen && (
        <div
          className="absolute right-4 bottom-4 rounded-lg px-3 py-2 text-[11.5px]"
          style={{ background: 'rgba(8,11,16,.7)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.14)' }}
        >
          Click to look around · <span className="font-mono">WASD</span> to walk
        </div>
      )}

      {showHelp && <Controls onClose={() => setShowHelp(false)} />}
      {mapOpen && <WorldMap onClose={() => toggleMap(false)} onGo={goTo} found={found} />}
    </div>
  )
}

function HudButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition-colors"
      style={{
        background: active ? 'rgba(90,140,255,.3)' : 'rgba(8,11,16,.66)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.14)',
        color: '#dbe6f7',
      }}
    >
      {children}
    </button>
  )
}

function Controls({ onClose }: { onClose: () => void }) {
  const rows: [string, string][] = [
    ['W A S D / ↑ ← ↓ →', 'Walk'],
    ['Shift', 'Sprint'],
    ['Mouse', 'Look (click to capture)'],
    ['E / Enter', 'Use the station in front of you'],
    ['M', 'Workspace map and fast travel'],
    ['Esc', 'Release the pointer'],
    ['?', 'This list'],
  ]
  return (
    <div
      className="pointer-events-auto absolute inset-0 grid place-items-center"
      style={{ background: 'rgba(4,6,10,.62)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl px-6 py-5"
        style={{ background: 'rgba(12,16,22,.95)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.16)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-[11px] font-semibold tracking-[0.16em] uppercase" style={{ color: '#8fa0b6' }}>
          Controls
        </h2>
        <div className="grid gap-x-8 gap-y-1.5" style={{ gridTemplateColumns: 'max-content 1fr' }}>
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <span className="font-mono text-[11.5px]" style={{ color: '#9fc3ff' }}>
                {k}
              </span>
              <span className="text-[12px]">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Plan view of the room. Coordinates come straight from `BOUNDS` and the
 * station table, so the map cannot drift out of step with the world — moving a
 * station moves its pin.
 */
function WorldMap({
  onClose,
  onGo,
  found,
}: {
  onClose: () => void
  onGo: (id: string) => boolean
  found: string[]
}) {
  const w = BOUNDS.maxX - BOUNDS.minX
  const d = BOUNDS.maxZ - BOUNDS.minZ
  const toPct = (x: number, z: number) => ({
    left: `${((x - BOUNDS.minX) / w) * 100}%`,
    top: `${((z - BOUNDS.minZ) / d) * 100}%`,
  })

  return (
    <div
      className="pointer-events-auto absolute inset-0 grid place-items-center p-6"
      style={{ background: 'rgba(4,6,10,.72)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl p-5"
        style={{ background: 'rgba(12,16,22,.96)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.16)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase" style={{ color: '#8fa0b6' }}>
            Workspace map
          </h2>
          <span className="font-mono text-[10.5px]" style={{ color: '#8fa0b6' }}>
            {found.length}/{TOTAL_STATIONS} discovered
          </span>
        </div>

        <div
          className="relative mb-4 w-full rounded-xl"
          style={{
            aspectRatio: `${w} / ${d}`,
            background: 'rgba(255,255,255,.03)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.12)',
          }}
        >
          {stations3d.map((s) => {
            const seen = found.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onGo(s.id)}
                title={seen ? `Go to ${s.name}` : 'Not discovered yet — walk here first'}
                disabled={!seen}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-lg px-1.5 py-1 text-[10.5px] whitespace-nowrap transition-transform enabled:hover:scale-110 disabled:opacity-35"
                style={{
                  ...toPct(s.at[0], s.at[1]),
                  background: seen ? 'rgba(90,140,255,.24)' : 'rgba(255,255,255,.07)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.16)',
                }}
              >
                <span>{s.glyph}</span>
                <span>{seen ? s.name : '???'}</span>
              </button>
            )
          })}

          {/* The visitor. Read once when the map opens — it does not move
              while the map is up, so there is nothing to animate. */}
          <div
            className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              ...toPct(pose.x, pose.z),
              background: '#7dd3a0',
              boxShadow: '0 0 0 3px rgba(125,211,160,.25)',
            }}
          />
        </div>

        <p className="text-[11.5px]" style={{ color: '#8fa0b6' }}>
          Click a discovered station to travel there. Walk to the greyed-out ones first.
        </p>
      </div>
    </div>
  )
}
