import { stations, type Station } from '@/data/portfolio'
import { appById } from '@/apps/registry'
import { launchApp } from '@/os/launch'
import { Scroll, StatusBar, Toolbar } from '@/os/ui'
import type { AppId, AppWindowProps } from '@/os/types'

/**
 * The workspace overview: every bench in the room, what is on it, and the way
 * in. This is the map — the one place a visitor can see the whole workspace at
 * once instead of discovering it icon by icon.
 */
export default function Stations(_: AppWindowProps) {
  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[13px] font-semibold">Workspace</span>
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {stations.length} stations
        </span>
      </Toolbar>

      <Scroll className="p-4">
        <p className="selectable mb-4 max-w-2xl text-[12.5px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          The workspace is organised into benches. Each one groups the applications belonging to one area of the work —
          open a station to go straight to it.
        </p>

        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))' }}>
          {stations.map((s) => (
            <StationCard key={s.id} station={s} />
          ))}
        </div>
      </Scroll>

      <StatusBar>
        <span>Click a station to open its applications</span>
      </StatusBar>
    </div>
  )
}

function StationCard({ station }: { station: Station }) {
  const apps = station.apps.map((id) => appById(id as AppId)).filter(Boolean)

  return (
    <article
      className="flex flex-col rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
      style={{
        background: 'color-mix(in oklab, var(--text) 5%, transparent)',
        boxShadow: `inset 0 0 0 1px var(--chrome-border), inset 0 2px 0 0 ${station.accent}`,
      }}
    >
      <header className="flex items-start gap-2.5">
        <span className="text-[22px] leading-none">{station.glyph}</span>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] tracking-[0.12em]" style={{ color: station.accent }}>
            STATION {station.index}
          </div>
          <h3 className="text-[14px] font-semibold tracking-tight">{station.name}</h3>
        </div>
      </header>

      <p className="selectable mt-2 text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
        {station.blurb}
      </p>

      <ul className="mt-3 mb-3 space-y-0.5">
        {station.contents.map((c) => (
          <li key={c} className="flex gap-2 text-[11.5px]" style={{ color: 'var(--text-dim)' }}>
            <span style={{ color: station.accent }}>·</span>
            {c}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap gap-1.5">
        {apps.map((a) => (
          <button
            key={a!.id}
            type="button"
            onClick={() => launchApp(a!.id)}
            title={a!.description}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11.5px] font-medium transition-colors hover:brightness-125"
            style={{ background: 'color-mix(in oklab, var(--text) 9%, transparent)' }}
          >
            <span>{a!.glyph}</span>
            {a!.name}
          </button>
        ))}
      </div>
    </article>
  )
}
