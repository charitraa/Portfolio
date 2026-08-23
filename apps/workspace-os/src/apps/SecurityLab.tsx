import { useMemo, useState } from 'react'
import {
  DEPTH_LABEL,
  DEPTH_TONE,
  securityPhases,
  securityTools,
  type SecurityPhase,
} from '@/data/portfolio'
import { Chip, Scroll, Sidebar, SidebarItem, SidebarLabel, StatusBar, Toolbar } from '@/os/ui'
import type { AppWindowProps } from '@/os/types'

/**
 * The security bench, laid out the way an engagement actually runs: phases in
 * order down the left, and for each phase what is done and what it is done
 * with. Every tool carries the depth label from the data file — the app has no
 * way to say "expert", because the data has no way to claim it.
 */
export default function SecurityLab(_: AppWindowProps) {
  const [phaseId, setPhaseId] = useState(securityPhases[0].id)
  const phase = securityPhases.find((p) => p.id === phaseId) as SecurityPhase

  const tools = useMemo(
    () => phase.tools.map((id) => securityTools.find((t) => t.id === id)).filter(Boolean),
    [phase],
  )

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[13px] font-semibold">Security Lab</span>
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          Station 02 · {securityPhases.length} phases
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[10.5px]" style={{ color: 'var(--text-dim)' }}>
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }}
          />
          Lab environment · isolated
        </span>
      </Toolbar>

      <div className="flex min-h-0 flex-1">
        <Sidebar width={188}>
          <SidebarLabel>Engagement phases</SidebarLabel>
          {securityPhases.map((p) => (
            <SidebarItem
              key={p.id}
              active={p.id === phaseId}
              onClick={() => setPhaseId(p.id)}
              glyph={p.glyph}
              trailing={
                <span className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>
                  {String(p.order).padStart(2, '0')}
                </span>
              }
            >
              {p.name}
            </SidebarItem>
          ))}
        </Sidebar>

        <Scroll className="p-5">
          <header className="mb-5">
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-[11px]" style={{ color: 'var(--accent)' }}>
                PHASE {String(phase.order).padStart(2, '0')}
              </span>
              <h2 className="text-[19px] font-semibold tracking-tight">{phase.name}</h2>
            </div>
            <p className="selectable mt-2 max-w-2xl text-[13px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              {phase.summary}
            </p>
          </header>

          <section className="mb-6">
            <h3 className="mb-2.5 text-[10.5px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-dim)' }}>
              Practised at this phase
            </h3>
            <ul className="space-y-1.5">
              {phase.activities.map((a) => (
                <li
                  key={a}
                  className="selectable flex gap-2.5 rounded-lg px-3 py-2 text-[12.5px]"
                  style={{ background: 'color-mix(in oklab, var(--text) 5%, transparent)' }}
                >
                  <span style={{ color: 'var(--accent)' }}>▸</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </section>

          {tools.length > 0 && (
            <section>
              <h3 className="mb-2.5 text-[10.5px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-dim)' }}>
                Tooling
              </h3>
              <div className="space-y-2">
                {tools.map((t) => (
                  <article
                    key={t!.id}
                    className="rounded-xl p-3"
                    style={{ background: 'color-mix(in oklab, var(--text) 5%, transparent)' }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-semibold">{t!.name}</span>
                      <Chip tone={DEPTH_TONE[t!.depth]} title="How far this has actually been taken">
                        {DEPTH_LABEL[t!.depth]}
                      </Chip>
                    </div>
                    <p className="selectable mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                      {t!.purpose}
                    </p>
                    {t!.example && (
                      <pre
                        className="selectable mt-2 overflow-x-auto rounded-lg px-3 py-2 font-mono text-[11px]"
                        style={{ background: 'color-mix(in oklab, #000 32%, transparent)', color: '#7dd3a0' }}
                      >
                        <span style={{ color: 'var(--text-dim)' }}>$ </span>
                        {t!.example}
                      </pre>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          <p
            className="selectable mt-6 rounded-lg px-3 py-2.5 text-[11.5px] leading-relaxed"
            style={{ background: 'color-mix(in oklab, #f59e0b 10%, transparent)', color: 'var(--text-dim)' }}
          >
            <strong style={{ color: 'var(--text)' }}>Scope note.</strong> Everything described here is practised in
            deliberately vulnerable lab environments and against systems I built myself. None of it is a claim of paid
            or professional security work, and none of it is run against a target without written permission.
          </p>
        </Scroll>
      </div>

      <StatusBar>
        <span>
          Phase {phase.order} of {securityPhases.length}
        </span>
        <span className="ml-auto">{securityTools.length} tools catalogued</span>
      </StatusBar>
    </div>
  )
}
