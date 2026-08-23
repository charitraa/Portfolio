import { useEffect, useState } from 'react'
import { netLinks, netNodes, protocols, type NetNode } from '@/data/portfolio'
import { Chip, Scroll, StatusBar, Toolbar } from '@/os/ui'
import type { AppWindowProps } from '@/os/types'

const KIND_COLOR: Record<NetNode['kind'], string> = {
  internet: '#64748b',
  router: '#38bdf8',
  firewall: '#f59e0b',
  switch: '#a78bfa',
  server: '#34d399',
  workstation: '#22d3ee',
  target: '#f87171',
}

/**
 * Station 05. An interactive lab topology: click a node to see what it is and
 * what it listens on. The segmentation is the point — the database sits behind
 * the firewall on the LAN side, and the diagram is drawn so that reads at a
 * glance.
 */
/** SMIL animation is not affected by the reduced-motion CSS, so ask directly. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export default function Network(_: AppWindowProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [selectedId, setSelectedId] = useState<string | null>('web')
  const [tab, setTab] = useState<'topology' | 'protocols'>('topology')
  const selected = netNodes.find((n) => n.id === selectedId) ?? null

  const nodeAt = (id: string) => netNodes.find((n) => n.id === id)!

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[13px] font-semibold">Network</span>
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          Station 05 · lab topology
        </span>
        <div className="ml-auto flex gap-1">
          {(['topology', 'protocols'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="rounded-lg px-2.5 py-1 text-[11.5px] font-medium capitalize transition-colors"
              style={{
                background: tab === t ? 'var(--accent-soft)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text-dim)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </Toolbar>

      {tab === 'topology' ? (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="relative min-h-[300px] flex-1">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              {netLinks.map((l) => {
                const a = nodeAt(l.from)
                const b = nodeAt(l.to)
                const active = selectedId === l.from || selectedId === l.to
                return (
                  <line
                    key={`${l.from}-${l.to}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={active ? 'var(--accent)' : 'currentColor'}
                    strokeWidth={active ? 0.5 : 0.28}
                    strokeDasharray="1.4 1.2"
                    style={{ color: 'var(--text-dim)', opacity: active ? 1 : 0.5 }}
                    vectorEffect="non-scaling-stroke"
                  >
                    {!reducedMotion && (
                      <animate attributeName="stroke-dashoffset" from="0" to="-5.2" dur="2.4s" repeatCount="indefinite" />
                    )}
                  </line>
                )
              })}
            </svg>

            {netNodes.map((n) => {
              const active = n.id === selectedId
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedId(n.id)}
                  aria-pressed={active}
                  title={n.label}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-transform hover:scale-105"
                  style={{
                    left: `${n.x}%`,
                    top: `${n.y}%`,
                    background: active ? 'var(--accent-soft)' : 'color-mix(in oklab, var(--chrome) 88%, transparent)',
                    boxShadow: `inset 0 0 0 1px ${active ? KIND_COLOR[n.kind] : 'var(--chrome-border)'}`,
                  }}
                >
                  <span className="text-[15px] leading-none">{n.glyph}</span>
                  <span className="text-[10px] leading-none font-medium whitespace-nowrap">{n.label}</span>
                </button>
              )
            })}
          </div>

          <aside
            className="w-full shrink-0 lg:w-72"
            style={{ borderTop: '1px solid var(--chrome-border)' }}
          >
            <Scroll className="p-4">
              {selected ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">{selected.glyph}</span>
                    <div className="min-w-0">
                      <h3 className="truncate text-[14px] font-semibold">{selected.label}</h3>
                      <span className="text-[10.5px] capitalize" style={{ color: KIND_COLOR[selected.kind] }}>
                        {selected.kind}
                      </span>
                    </div>
                  </div>
                  <p className="selectable mt-2.5 text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                    {selected.detail}
                  </p>

                  {selected.ports && selected.ports.length > 0 && (
                    <>
                      <h4
                        className="mt-4 mb-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase"
                        style={{ color: 'var(--text-dim)' }}
                      >
                        Listening (illustrative)
                      </h4>
                      <ul className="selectable space-y-1">
                        {selected.ports.map((p) => (
                          <li
                            key={p.port}
                            className="flex items-baseline gap-2 rounded-lg px-2.5 py-1.5 font-mono text-[11.5px]"
                            style={{ background: 'color-mix(in oklab, #000 24%, transparent)' }}
                          >
                            <span style={{ color: 'var(--accent)' }}>{String(p.port).padStart(5, ' ')}</span>
                            <span style={{ color: 'var(--text-dim)' }}>{p.service}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              ) : (
                <p className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                  Select a node to inspect it.
                </p>
              )}

              <p className="mt-5 text-[11px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                A generic practice topology. No address, hostname or identifier from any real network appears here.
              </p>
            </Scroll>
          </aside>
        </div>
      ) : (
        <Scroll className="p-4">
          <div className="space-y-1.5">
            {protocols.map((p) => (
              <article
                key={p.name}
                className="rounded-xl p-3.5"
                style={{ background: 'color-mix(in oklab, var(--text) 5%, transparent)' }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold">{p.name}</span>
                  <Chip>{p.layer}</Chip>
                  {p.port !== '—' && (
                    <span className="font-mono text-[11px]" style={{ color: 'var(--accent)' }}>
                      {p.port}
                    </span>
                  )}
                </div>
                <p className="selectable mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  {p.note}
                </p>
              </article>
            ))}
          </div>
        </Scroll>
      )}

      <StatusBar>
        <span>
          {netNodes.length} nodes · {netLinks.length} links
        </span>
        <span className="ml-auto">Lab topology · not a real network</span>
      </StatusBar>
    </div>
  )
}
