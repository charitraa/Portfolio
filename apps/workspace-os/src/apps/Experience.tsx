import { useState } from 'react'
import { certifications, experience, type TimelineEntry } from '@/data/portfolio'
import { Chip, Scroll, StatusBar, Toolbar } from '@/os/ui'
import type { AppWindowProps } from '@/os/types'

type Filter = 'all' | 'work' | 'education' | 'milestone'

const KIND_META: Record<TimelineEntry['kind'], { glyph: string; label: string; color: string }> = {
  work: { glyph: '💼', label: 'Work', color: '#3b82f6' },
  education: { glyph: '🎓', label: 'Education', color: '#a78bfa' },
  milestone: { glyph: '⭐', label: 'Milestone', color: '#f59e0b' },
}

/** Experience, presented as a timeline application. */
export default function Experience(_: AppWindowProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const entries = experience.filter((e) => filter === 'all' || e.kind === filter)

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <div className="flex rounded-lg p-0.5" style={{ background: 'color-mix(in oklab, var(--text) 8%, transparent)' }}>
          {(['all', 'work', 'education', 'milestone'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="rounded-md px-2.5 py-1 text-[11.5px] font-medium capitalize transition-colors"
              style={{
                background: filter === f ? 'var(--accent)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--text-dim)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {entries.length} entries
        </span>
      </Toolbar>

      <Scroll className="px-6 py-5">
        <div className="relative mx-auto max-w-2xl">
          {/* The spine */}
          <div
            className="absolute top-2 bottom-2 left-[15px] w-px"
            style={{ background: 'var(--chrome-border)' }}
          />

          {entries.map((e) => {
            const meta = KIND_META[e.kind]
            return (
              <article key={e.id} className="relative mb-7 pl-11 last:mb-2">
                <div
                  className="absolute top-0.5 left-0 grid h-8 w-8 place-items-center rounded-full text-[14px]"
                  style={{
                    background: 'var(--chrome)',
                    boxShadow: `inset 0 0 0 1.5px ${meta.color}`,
                  }}
                >
                  {meta.glyph}
                </div>

                <div className="flex flex-wrap items-baseline gap-x-2.5">
                  <h3 className="text-[15px] font-semibold tracking-tight">{e.role}</h3>
                  {e.end === 'Present' && <Chip tone="good">current</Chip>}
                </div>
                <div className="mt-0.5 text-[12.5px]" style={{ color: 'var(--text-dim)' }}>
                  <span style={{ color: meta.color }}>{e.org}</span>
                  {' · '}
                  {e.start} – {e.end}
                  {e.location !== '—' && ` · ${e.location}`}
                </div>

                <p className="selectable mt-2 text-[13px] leading-relaxed">{e.summary}</p>

                {e.bullets.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {e.bullets.map((b) => (
                      <li key={b} className="selectable flex gap-2.5 text-[12.5px] leading-relaxed">
                        <span className="mt-[2px] shrink-0" style={{ color: meta.color }}>
                          ▸
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {e.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {e.tags.map((t) => (
                      <Chip key={t}>{t}</Chip>
                    ))}
                  </div>
                )}
              </article>
            )
          })}

          {filter === 'all' && certifications.length > 0 && (
            <section className="mt-9 border-t pt-5" style={{ borderColor: 'var(--chrome-border)' }}>
              <h2 className="mb-3 text-[11px] font-semibold tracking-[0.09em] uppercase" style={{ color: 'var(--text-dim)' }}>
                Certifications
              </h2>
              <div className="space-y-2">
                {certifications.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-3 rounded-xl p-3"
                    style={{ background: 'color-mix(in oklab, var(--text) 5.5%, transparent)' }}
                  >
                    <span className="text-xl">🏅</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-medium">{c.name}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                        {c.issuer} · {c.year} · {c.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </Scroll>

      <StatusBar>
        <span>
          {experience.filter((e) => e.kind === 'work').length} roles ·{' '}
          {experience.filter((e) => e.kind === 'education').length} qualifications ·{' '}
          {certifications.length} certifications
        </span>
      </StatusBar>
    </div>
  )
}
