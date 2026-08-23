import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { ACCENT_HEX, NODE_MAP } from './layout'
import type { BoardNode, ComponentId } from './layout'
import { identity, projects, skillBanks, smallSkills, softSkills, stats } from '../data/content'

type ShellProps = {
  node: BoardNode
  live: boolean
  dimmed: boolean
  focused: boolean
  onHover: (id: ComponentId | null) => void
  onSelect: (id: ComponentId) => void
  children: ReactNode
}

function NodeShell({ node, live, dimmed, focused, onHover, onSelect, children }: ShellProps) {
  const hex = ACCENT_HEX[node.accent]
  return (
    <motion.button
      type="button"
      aria-label={`${node.label} — ${node.section}`}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(node.id)}
      initial={false}
      animate={{
        opacity: live ? (dimmed ? 0.25 : 1) : 0.12,
        y: focused ? -6 : 0,
        scale: focused ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      whileTap={{ scale: 0.99 }}
      className="node-surface group absolute cursor-pointer rounded-lg text-left outline-none"
      style={{
        left: node.x,
        top: node.y,
        width: node.w,
        height: node.h,
        boxShadow: focused
          ? `0 0 0 1px ${hex}, 0 0 34px -4px ${hex}88, 0 18px 40px -18px #000`
          : undefined,
      }}
    >
      {/* Silkscreen designator */}
      <span
        className="pointer-events-none absolute -top-4 left-1 font-mono text-[9px] tracking-widest"
        style={{ color: focused ? hex : '#64748b' }}
      >
        {node.ref}
      </span>
      {children}
      {/* Status LED */}
      <span
        className={`pointer-events-none absolute right-2 top-2 h-1.5 w-1.5 rounded-full ${live ? 'led' : ''}`}
        style={{ background: live ? hex : '#334155', boxShadow: live ? `0 0 8px ${hex}` : undefined }}
      />
    </motion.button>
  )
}

function Caption({ node }: { node: BoardNode }) {
  // Narrow parts only get room for the silkscreen name; the section reads in the panel.
  const roomForSection = node.w >= 170
  return (
    <div className="pointer-events-none absolute bottom-1.5 left-2 right-2 flex items-end justify-between gap-2">
      <span className="truncate font-display text-[10px] font-semibold tracking-[0.18em] text-slate-400">
        {node.label}
      </span>
      {roomForSection && (
        <span className="shrink-0 font-mono text-[9px] text-slate-500">{node.section}</span>
      )}
    </div>
  )
}

/* ── Individual component artwork ─────────────────────────────────────── */

function CpuArt({ focused }: { focused: boolean }) {
  const pins = Array.from({ length: 13 })
  return (
    <div className="absolute inset-0 p-3">
      <div className="relative h-full w-full rounded-md border border-slate-600/70 bg-[linear-gradient(135deg,#334155_0%,#1e293b_50%,#0f172a_100%)]">
        {/* pin fields */}
        {(['top', 'bottom'] as const).map((edge) => (
          <div
            key={edge}
            className="absolute left-4 right-4 flex justify-between"
            style={{ [edge]: 3 } as React.CSSProperties}
          >
            {pins.map((_, i) => (
              <span key={i} className="h-1 w-1 rounded-[1px] bg-amber-500/70" />
            ))}
          </div>
        ))}
        {(['left', 'right'] as const).map((edge) => (
          <div
            key={edge}
            className="absolute bottom-4 top-4 flex flex-col justify-between"
            style={{ [edge]: 3 } as React.CSSProperties}
          >
            {pins.slice(0, 11).map((_, i) => (
              <span key={i} className="h-1 w-1 rounded-[1px] bg-amber-500/70" />
            ))}
          </div>
        ))}

        {/* orientation triangle */}
        <span className="absolute left-2.5 top-2.5 h-0 w-0 border-b-[7px] border-l-[7px] border-b-transparent border-l-amber-400/80" />

        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <span className="font-mono text-[9px] tracking-[0.35em] text-electric/80" style={{ color: '#60a5fa' }}>
            {identity.socket}
          </span>
          <span
            className={`font-display text-[26px] font-bold tracking-[0.14em] text-white ${focused ? 'text-glow-electric' : ''}`}
          >
            {identity.name}
          </span>
          <span className="mt-0.5 font-sans text-[11px] text-slate-300">{identity.role}</span>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="breathe h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#22c55e]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-green-400">
              {identity.status}
            </span>
          </div>
          <span className="mt-1.5 font-mono text-[9px] text-slate-500">
            {identity.cores} · {identity.clock}
          </span>
        </div>
      </div>
    </div>
  )
}

function RamArt() {
  return (
    <div className="absolute inset-0 flex gap-2 p-3 pb-6">
      {skillBanks.map((bank) => {
        const hex = ACCENT_HEX[bank.color]
        return (
          <div
            key={bank.slot}
            className="relative flex-1 rounded-sm border border-slate-600/70 bg-[linear-gradient(180deg,#2b3547,#151d2c)]"
          >
            {/* heat spreader ridge */}
            <div className="absolute inset-x-1 top-1 h-1/3 rounded-[2px]" style={{ background: `${hex}22` }} />
            {/* chips */}
            <div className="absolute inset-x-1.5 top-[38%] flex flex-col gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="h-2.5 rounded-[1px] bg-slate-800/90 ring-1 ring-slate-700/60" />
              ))}
            </div>
            {/* gold fingers + notch */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(90deg,#f59e0b_0_2px,transparent_2px_4px)] opacity-70" />
            <div className="absolute bottom-0 left-[38%] h-2 w-1.5 bg-[#151d2c]" />
            <span
              className="absolute inset-x-0 top-[26%] text-center font-mono text-[7px] tracking-widest"
              style={{ color: hex }}
            >
              {bank.capacity}
            </span>
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <span
                className="whitespace-nowrap font-mono text-[8px] tracking-wide text-slate-300"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {bank.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function GpuArt({ focused }: { focused: boolean }) {
  return (
    <div className="absolute inset-0 p-2.5 pb-6">
      <div className="relative h-full w-full overflow-hidden rounded-md border border-slate-600/60 bg-[linear-gradient(160deg,#28313f,#141b26)]">
        {/* heatsink fins */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(148,163,184,0.10)_0_2px,transparent_2px_7px)]" />
        {/* fans */}
        <div className="absolute inset-y-3 left-4 flex items-center gap-5">
          {[0, 1].map((i) => (
            <svg key={i} width="112" height="112" viewBox="0 0 100 100" className="drop-shadow">
              <circle cx="50" cy="50" r="46" fill="#0b111c" stroke="#334155" strokeWidth="2" />
              <g className={focused ? 'fan-spin-fast' : 'fan-spin'} style={{ transformOrigin: '50px 50px' }}>
                {Array.from({ length: 9 }).map((_, b) => (
                  <path
                    key={b}
                    d="M50 50 L 74 26 A 34 34 0 0 1 78 46 Z"
                    fill="#475569"
                    opacity="0.85"
                    transform={`rotate(${b * 40} 50 50)`}
                  />
                ))}
              </g>
              <circle cx="50" cy="50" r="13" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="4" fill="#8b5cf6" opacity={focused ? 1 : 0.6} />
            </svg>
          ))}
        </div>
        {/* RGB strip */}
        <div
          className="absolute right-3 top-3 h-2 w-40 rounded-full"
          style={{
            background: 'linear-gradient(90deg,#8b5cf6,#3b82f6,#22c55e,#f59e0b)',
            opacity: focused ? 1 : 0.45,
            filter: focused ? 'drop-shadow(0 0 8px #8b5cf6)' : undefined,
          }}
        />
        <div className="absolute bottom-3 right-4 text-right">
          <div className="font-display text-lg font-bold tracking-wide text-slate-200">RTX-PROJECTS</div>
          <div className="font-mono text-[9px] tracking-[0.2em] text-violet-400">
            GDDR6 · {projects.length} BUILDS LOADED
          </div>
        </div>
      </div>
    </div>
  )
}

function SsdArt() {
  return (
    <div className="absolute inset-0 p-3 pb-6">
      <div className="relative h-full w-full rounded-sm border border-slate-600/60 bg-[linear-gradient(180deg,#243044,#131b28)]">
        <div className="absolute inset-y-2 left-2 flex w-[68%] gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex-1 rounded-[2px] bg-slate-800 ring-1 ring-slate-700/70" />
          ))}
        </div>
        <div className="absolute inset-y-3 right-3 w-14 rounded-[2px] bg-slate-900 ring-1 ring-green-500/30" />
        <div className="absolute bottom-0 left-2 h-1.5 w-16 bg-[repeating-linear-gradient(90deg,#f59e0b_0_2px,transparent_2px_4px)] opacity-70" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[8px] text-green-400">R/W</span>
      </div>
    </div>
  )
}

function BiosArt() {
  return (
    <div className="absolute inset-0 grid place-items-center p-4 pb-6">
      <div className="relative h-[62px] w-[76px] rounded-[3px] bg-[linear-gradient(150deg,#1c2432,#0d131d)] ring-1 ring-slate-600">
        <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400/80" />
        {(['left', 'right'] as const).map((side) => (
          <div
            key={side}
            className="absolute bottom-1.5 top-1.5 flex flex-col justify-between"
            style={{ [side]: -4 } as React.CSSProperties}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="h-0.5 w-2 rounded-[1px] bg-amber-500/70" />
            ))}
          </div>
        ))}
        <span className="absolute inset-0 grid place-items-center font-mono text-[9px] tracking-widest text-slate-400">
          UEFI
        </span>
      </div>
    </div>
  )
}

function NicArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-3 p-3 pb-6">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="relative h-[62px] w-[52px] rounded-sm bg-[#0a1018] ring-1 ring-slate-600 shadow-inner"
        >
          <span className="absolute left-1/2 top-0 h-2.5 w-3 -translate-x-1/2 rounded-b-[2px] bg-slate-700" />
          <div className="absolute inset-x-1.5 top-4 h-7 rounded-[2px] bg-[repeating-linear-gradient(90deg,#f59e0b_0_1.5px,transparent_1.5px_6px)] opacity-60" />
          <span className="led absolute bottom-1.5 left-2 h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#22c55e]" />
          <span className="absolute bottom-1.5 right-2 h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
        </div>
      ))}
    </div>
  )
}

function UsbArt() {
  return (
    <div className="absolute inset-0 grid grid-cols-3 content-center gap-2 p-3 pb-7">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="relative h-6 rounded-[2px] bg-[#0a1018] ring-1 ring-slate-600">
          <span
            className="absolute inset-x-1 bottom-1 h-2 rounded-[1px]"
            style={{ background: i % 3 === 2 ? '#3b82f6' : '#1e293b' }}
          />
        </div>
      ))}
    </div>
  )
}

function PcieArt() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-3.5 p-3 pb-7">
      {[1, 0.72, 0.48, 0.3].map((w, i) => (
        <div key={i} className="relative h-6 rounded-[2px] bg-[#12182a] ring-1 ring-slate-600" style={{ width: `${w * 100}%` }}>
          <div className="absolute inset-x-1 inset-y-1 rounded-[1px] bg-[repeating-linear-gradient(90deg,#f59e0b_0_2px,transparent_2px_5px)] opacity-45" />
          <span className="absolute right-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-slate-700" />
        </div>
      ))}
    </div>
  )
}

function PsuArt() {
  const total = stats.reduce((n, s) => n + (Number.isFinite(s.value) ? s.value : 0), 0)
  return (
    <div className="absolute inset-0 p-3 pb-6">
      <div className="relative h-full w-full rounded-sm bg-[#0b111c] ring-1 ring-slate-600">
        <div className="grid h-full grid-cols-6 grid-rows-4 gap-[3px] p-1.5 pt-5">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className="rounded-[1px] bg-slate-700/80 ring-1 ring-slate-600/60" />
          ))}
        </div>
        <span className="absolute left-2 top-1 font-numeric text-[9px] tracking-wider text-amber-400">
          {total}W · 24-PIN
        </span>
      </div>
    </div>
  )
}

function VrmArt({ focused }: { focused: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-around px-3 pb-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span
            className="h-4 w-6 rounded-[2px] bg-slate-700 ring-1 ring-slate-600"
            style={{ boxShadow: focused ? '0 0 8px rgba(239,68,68,0.6)' : undefined }}
          />
          <span
            className="h-2.5 w-5 rounded-[1px] bg-[#1b2433] ring-1 ring-red-500/30"
            style={{ opacity: focused ? 1 : 0.7 }}
          />
        </div>
      ))}
    </div>
  )
}

function FanArt({ focused }: { focused: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center pb-4 pt-3">
      <svg width="74" height="74" viewBox="0 0 100 100">
        <rect x="2" y="2" width="96" height="96" rx="10" fill="#0d1420" stroke="#334155" strokeWidth="2" />
        <g className={focused ? 'fan-spin-fast' : 'fan-spin'} style={{ transformOrigin: '50px 50px' }}>
          {Array.from({ length: 7 }).map((_, b) => (
            <path
              key={b}
              d="M50 50 L 76 30 A 32 32 0 0 1 76 54 Z"
              fill="#3b82f6"
              opacity="0.45"
              transform={`rotate(${b * 51.4} 50 50)`}
            />
          ))}
        </g>
        <circle cx="50" cy="50" r="11" fill="#111827" stroke="#3b82f6" strokeWidth="1.5" />
      </svg>
      <span className="absolute left-0 right-0 top-1 text-center font-numeric text-[8px] text-blue-400">
        {focused ? softSkills[2].rpm + 400 : softSkills[2].rpm} RPM
      </span>
    </div>
  )
}

function CmosArt() {
  return (
    <div className="absolute inset-0 grid place-items-center pb-5">
      <div className="relative grid h-[62px] w-[62px] place-content-center justify-items-center rounded-full bg-[linear-gradient(145deg,#cbd5e1,#64748b)] ring-2 ring-slate-500">
        <span className="font-mono text-[8px] font-bold text-slate-800">CR2032</span>
        <span className="font-mono text-[7px] font-bold text-slate-700">3V</span>
      </div>
    </div>
  )
}

function AudioArt() {
  return (
    <div className="absolute inset-0 flex items-center gap-2 px-3 pb-5">
      <div className="grid h-9 w-9 place-items-center rounded-[3px] bg-[#0d131d] ring-1 ring-violet-500/40">
        <span className="font-mono text-[7px] text-violet-300">ALC</span>
      </div>
      <div className="flex flex-1 items-end gap-1">
        {[10, 18, 26, 14, 30, 20, 12, 24].map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-t-[1px] bg-violet-500/60"
            style={{ height: h, animation: `breathe ${1.8 + i * 0.18}s ease-in-out infinite` }}
          />
        ))}
      </div>
    </div>
  )
}

function CapsArt() {
  return (
    <div className="absolute inset-0 grid grid-cols-3 content-center gap-2 p-3 pb-6">
      {smallSkills.slice(0, 9).map((s, i) => (
        <div
          key={s}
          className="cap-glow grid h-8 place-items-center rounded-full bg-[linear-gradient(180deg,#334155,#111827)] ring-1 ring-amber-600/40"
          style={{ animationDelay: `${i * 0.22}s` }}
        >
          <span className="h-2 w-[1px] bg-amber-500/70" />
        </div>
      ))}
    </div>
  )
}

function ExpansionArt() {
  return (
    <div className="absolute inset-0 p-2.5 pb-6">
      <div className="relative h-full w-full rounded-sm border border-slate-600/60 bg-[linear-gradient(160deg,#2a2230,#151019)]">
        <div className="absolute left-0 top-0 h-full w-3 rounded-l-sm bg-slate-600/50" />
        <div className="absolute inset-y-3 left-6 right-3 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-6 flex-1 rounded-[2px] bg-slate-800 ring-1 ring-red-500/30" />
          ))}
        </div>
        <div className="absolute bottom-0 left-6 h-1.5 w-24 bg-[repeating-linear-gradient(90deg,#f59e0b_0_2px,transparent_2px_4px)] opacity-70" />
      </div>
    </div>
  )
}

function PortsArt() {
  return (
    <div className="absolute inset-0 grid grid-cols-2 content-center gap-2 p-3 pb-7">
      {['DP', 'HDMI', 'USB-C', 'LAN'].map((p) => (
        <div key={p} className="grid h-7 place-items-center rounded-[2px] bg-[#0a1018] ring-1 ring-slate-600">
          <span className="font-mono text-[8px] tracking-widest text-slate-400">{p}</span>
        </div>
      ))}
    </div>
  )
}

function M2Art() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="h-3 w-[80%] rounded-full bg-[repeating-linear-gradient(90deg,#ef4444_0_2px,transparent_2px_5px)] opacity-50" />
      <span className="absolute bottom-1 font-mono text-[8px] tracking-widest text-red-400">UNPOPULATED</span>
    </div>
  )
}

/* ── Dispatcher ───────────────────────────────────────────────────────── */

const ART: Record<ComponentId, (p: { focused: boolean }) => ReactNode> = {
  cpu: CpuArt,
  ram: RamArt,
  gpu: GpuArt,
  ssd: SsdArt,
  bios: BiosArt,
  nic: NicArt,
  usb: UsbArt,
  pcie: PcieArt,
  psu: PsuArt,
  vrm: VrmArt,
  fan: FanArt,
  cmos: CmosArt,
  audio: AudioArt,
  caps: CapsArt,
  expansion: ExpansionArt,
  ports: PortsArt,
  m2: M2Art,
}

type NodesProps = {
  energised: Set<ComponentId>
  active: ComponentId | null
  hovered: ComponentId | null
  m2Revealed: boolean
  onHover: (id: ComponentId | null) => void
  onSelect: (id: ComponentId) => void
}

export function Nodes({ energised, active, hovered, m2Revealed, onHover, onSelect }: NodesProps) {
  const focus = active ?? hovered

  return (
    <>
      {Object.values(NODE_MAP).map((node) => {
        if (node.secret && !m2Revealed) return null
        const Art = ART[node.id]
        const focused = focus === node.id
        return (
          <NodeShell
            key={node.id}
            node={node}
            live={energised.has(node.id)}
            // The CPU is the hub of every link, so it never fades out.
            dimmed={focus !== null && !focused && node.id !== 'cpu'}
            focused={focused}
            onHover={onHover}
            onSelect={onSelect}
          >
            <Art focused={focused} />
            {node.id !== 'cpu' && <Caption node={node} />}
          </NodeShell>
        )
      })}
    </>
  )
}
