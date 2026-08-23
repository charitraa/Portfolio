import { Maximize2, Minus, Plus, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import type { ComponentId } from '../board/layout'
import { NODE_MAP } from '../board/layout'
import { identity } from '../data/content'

const QUICK: ComponentId[] = ['cpu', 'ram', 'gpu', 'ssd', 'pcie', 'usb', 'nic', 'bios']

type Props = {
  ready: boolean
  active: ComponentId | null
  sound: boolean
  rgb: boolean
  onSelect: (id: ComponentId) => void
  onToggleSound: () => void
  onReboot: () => void
  onZoom: (delta: number) => void
  onResetView: () => void
}

export function PowerBar({
  ready,
  active,
  sound,
  rgb,
  onSelect,
  onToggleSound,
  onReboot,
  onZoom,
  onResetView,
}: Props) {
  return (
    <header
      className="z-30 shrink-0 border-b border-slate-800 bg-[#0b1120]/95 backdrop-blur"
      style={{ opacity: ready ? 1 : 0.25, transition: 'opacity 700ms' }}
    >
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="led h-2 w-2 rounded-full bg-green-400"
            style={{ boxShadow: '0 0 8px #22c55e' }}
          />
          <span className="font-display text-sm font-bold tracking-[0.24em] text-slate-100">
            CIRCUIT<span className="text-amber-400">OS</span>
          </span>
          <span className="hidden font-mono text-[10px] tracking-[0.2em] text-slate-600 sm:inline">
            / {identity.name}
          </span>
        </div>

        <nav className="scrollbar-thin ml-2 hidden flex-1 items-center gap-1 overflow-x-auto lg:flex">
          {QUICK.map((id) => {
            const n = NODE_MAP[id]
            const on = active === id
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className={`shrink-0 rounded border px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] transition ${
                  on
                    ? 'border-blue-500/60 bg-blue-500/15 text-blue-300'
                    : 'border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                {n.section.toUpperCase()}
              </button>
            )
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {rgb && (
            <span className="mr-1 hidden rounded border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 font-mono text-[9px] tracking-[0.18em] text-violet-300 sm:inline">
              RGB ON
            </span>
          )}
          <IconBtn label="Zoom out" onClick={() => onZoom(-0.15)}>
            <Minus className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Zoom in" onClick={() => onZoom(0.15)}>
            <Plus className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Fit board" onClick={onResetView}>
            <Maximize2 className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label={sound ? 'Mute' : 'Unmute'} onClick={onToggleSound}>
            {sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </IconBtn>
          <IconBtn label="Reboot" onClick={onReboot}>
            <RotateCcw className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      </div>
    </header>
  )
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded border border-slate-800 p-1.5 text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
    >
      {children}
    </button>
  )
}
