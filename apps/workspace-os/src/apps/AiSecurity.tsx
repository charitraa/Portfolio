import { useMemo, useState } from 'react'
import { DEPTH_LABEL, DEPTH_TONE, aiRisks, type AiRisk } from '@/data/portfolio'
import { Chip, Scroll, Sidebar, SidebarItem, SidebarLabel, StatusBar, Toolbar } from '@/os/ui'
import type { AppWindowProps } from '@/os/types'

const CATEGORIES: (AiRisk['category'] | 'All')[] = ['All', 'Input', 'Model', 'Agent', 'Output']

/**
 * Station 04. Where language-model applications break, grouped by the point in
 * the pipeline the failure enters — which is also the point a control has to
 * sit. Defensive framing throughout: what goes wrong and what stops it.
 */
export default function AiSecurity(_: AppWindowProps) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All')
  const [selected, setSelected] = useState<string | null>(aiRisks[0].id)

  const filtered = useMemo(
    () => aiRisks.filter((r) => category === 'All' || r.category === category),
    [category],
  )
  const risk = aiRisks.find((r) => r.id === selected) ?? filtered[0]

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[13px] font-semibold">AI Security</span>
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          Station 04 · {aiRisks.length} failure modes
        </span>
      </Toolbar>

      <div className="flex min-h-0 flex-1">
        <Sidebar width={168}>
          <SidebarLabel>Pipeline stage</SidebarLabel>
          {CATEGORIES.map((c) => (
            <SidebarItem
              key={c}
              active={category === c}
              onClick={() => setCategory(c)}
              trailing={
                <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                  {c === 'All' ? aiRisks.length : aiRisks.filter((r) => r.category === c).length}
                </span>
              }
            >
              {c}
            </SidebarItem>
          ))}
        </Sidebar>

        <Scroll className="p-4">
          <div className="space-y-1.5">
            {filtered.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r.id === selected ? null : r.id)}
                className="w-full rounded-xl p-3.5 text-left transition-colors"
                style={{
                  background:
                    r.id === selected ? 'var(--accent-soft)' : 'color-mix(in oklab, var(--text) 5%, transparent)',
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold">{r.name}</span>
                  <Chip>{r.category}</Chip>
                  <Chip tone={DEPTH_TONE[r.depth]}>{DEPTH_LABEL[r.depth]}</Chip>
                </div>
                <p className="selectable mt-1.5 text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  {r.summary}
                </p>

                {r.id === selected && (
                  <div className="selectable mt-3 space-y-2.5">
                    <div
                      className="rounded-lg px-3 py-2.5"
                      style={{ background: 'color-mix(in oklab, #f87171 12%, transparent)' }}
                    >
                      <h4 className="mb-1 text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ color: '#fca5a5' }}>
                        How it shows up
                      </h4>
                      <p className="text-[12px] leading-relaxed">{r.example}</p>
                    </div>
                    <div
                      className="rounded-lg px-3 py-2.5"
                      style={{ background: 'color-mix(in oklab, #34d399 12%, transparent)' }}
                    >
                      <h4 className="mb-1 text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ color: '#6ee7b7' }}>
                        Mitigation
                      </h4>
                      <p className="text-[12px] leading-relaxed">{r.mitigation}</p>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <p
            className="selectable mt-5 rounded-lg px-3 py-2.5 text-[11.5px] leading-relaxed"
            style={{ background: 'color-mix(in oklab, var(--text) 6%, transparent)', color: 'var(--text-dim)' }}
          >
            Written from the defender's side. The interesting property of this area is that the model cannot reliably
            separate instructions from data, so nearly every control has to live in the system around it rather than in
            the prompt.
          </p>
        </Scroll>
      </div>

      <StatusBar>
        <span>{filtered.length} shown</span>
        {risk && <span className="ml-auto">Stage: {risk.category}</span>}
      </StatusBar>
    </div>
  )
}
