import { useMemo, useState } from 'react'
import { USE_LABEL, USE_RANK, skills, type Skill } from '@/data/portfolio'
import { Chip, Scroll, Sidebar, SidebarItem, SidebarLabel, StatusBar, Toolbar } from '@/os/ui'
import type { AppWindowProps } from '@/os/types'

const CATEGORIES = ['All', 'Languages', 'Frontend', 'Backend', 'Data', 'Infrastructure', 'Tools'] as const

const USE_TONE = { daily: 'good', regular: 'accent', occasional: 'neutral' } as const

/**
 * Skills as a package manager. There is deliberately no percentage anywhere:
 * a number like "Python 95%" implies a precision nobody has about their own
 * ability. What is shown instead is how often the thing is actually reached
 * for and how long it has been in use — both of which are checkable.
 */
export default function Skills(_: AppWindowProps) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Skill | null>(null)

  const filtered = useMemo(
    () =>
      skills
        .filter((s) => category === 'All' || s.category === category)
        .filter(
          (s) =>
            !query ||
            s.name.includes(query.toLowerCase()) ||
            s.summary.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) => USE_RANK[b.use] - USE_RANK[a.use] || a.name.localeCompare(b.name)),
    [category, query],
  )

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[13px] font-semibold">skillpkg</span>
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {skills.length} packages installed
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search packages…"
          aria-label="Search packages"
          className="ml-auto w-48 rounded-lg px-2.5 py-1 text-[12px] outline-none"
          style={{ background: 'color-mix(in oklab, var(--text) 8%, transparent)', color: 'var(--text)' }}
        />
      </Toolbar>

      <div className="flex min-h-0 flex-1">
        <Sidebar width={168}>
          <SidebarLabel>Repositories</SidebarLabel>
          {CATEGORIES.map((c) => (
            <SidebarItem
              key={c}
              active={category === c}
              onClick={() => setCategory(c)}
              trailing={
                <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                  {c === 'All' ? skills.length : skills.filter((s) => s.category === c).length}
                </span>
              }
            >
              {c}
            </SidebarItem>
          ))}
        </Sidebar>

        <Scroll className="p-3">
          <div className="space-y-1.5">
            {filtered.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => setSelected(selected?.name === s.name ? null : s)}
                aria-expanded={selected?.name === s.name}
                className="w-full rounded-xl p-3 text-left transition-colors"
                style={{
                  background:
                    selected?.name === s.name
                      ? 'var(--accent-soft)'
                      : 'color-mix(in oklab, var(--text) 5%, transparent)',
                }}
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-[13px] font-semibold" style={{ color: 'var(--accent)' }}>
                    {s.name}
                  </span>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>
                    {s.version}
                  </span>
                  <Chip tone={USE_TONE[s.use]}>{USE_LABEL[s.use]}</Chip>
                  <span className="ml-auto text-[10.5px]" style={{ color: 'var(--text-dim)' }}>
                    {s.category}
                  </span>
                </div>
                <p className="selectable mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  {s.summary}
                </p>

                {selected?.name === s.name && (
                  <div
                    className="selectable mt-3 grid gap-x-6 gap-y-1 rounded-lg p-3 font-mono text-[11px]"
                    style={{
                      background: 'color-mix(in oklab, #000 25%, transparent)',
                      gridTemplateColumns: 'max-content 1fr',
                    }}
                  >
                    <span style={{ color: 'var(--text-dim)' }}>Package</span>
                    <span>{s.name}</span>
                    <span style={{ color: 'var(--text-dim)' }}>Version</span>
                    <span>{s.version}</span>
                    <span style={{ color: 'var(--text-dim)' }}>Repository</span>
                    <span>{s.category.toLowerCase()}</span>
                    <span style={{ color: 'var(--text-dim)' }}>In use for</span>
                    <span>{s.since}</span>
                    <span style={{ color: 'var(--text-dim)' }}>Reached for</span>
                    <span>{USE_LABEL[s.use].toLowerCase()}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </Scroll>
      </div>

      <StatusBar>
        <span>
          {filtered.length} of {skills.length} packages
        </span>
        <span className="ml-auto">Frequency of use — not a self-scored percentage</span>
      </StatusBar>
    </div>
  )
}
