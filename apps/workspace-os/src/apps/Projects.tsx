import { useEffect, useState } from 'react'
import { projects, type Project } from '@/data/portfolio'
import { Chip, Scroll, Sidebar, SidebarItem, SidebarLabel, StatusBar } from '@/os/ui'
import { Markdown } from '@/os/markdown'
import { launchApp } from '@/os/launch'
import { useWindows } from '@/store/windows'
import { notify } from '@/store/notifications'
import type { AppWindowProps } from '@/os/types'

export default function Projects({ winId, props }: AppWindowProps) {
  const setTitle = useWindows((s) => s.setTitle)
  const requested = props.projectId as string | undefined
  const [activeId, setActiveId] = useState(requested ?? projects[0].id)

  // Launching again with a different project (from the terminal or Files)
  // should navigate rather than sit on the old selection.
  useEffect(() => {
    if (requested && requested !== activeId) setActiveId(requested)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested])

  const active = projects.find((p) => p.id === activeId) ?? projects[0]

  useEffect(() => {
    setTitle(winId, `${active.name} — Project Manager`)
  }, [active.name, setTitle, winId])

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1">
        <Sidebar width={210}>
          <SidebarLabel>Projects ({projects.length})</SidebarLabel>
          {projects.map((p) => (
            <SidebarItem key={p.id} glyph={p.glyph} active={p.id === active.id} onClick={() => setActiveId(p.id)}>
              <span className="block truncate">{p.name}</span>
            </SidebarItem>
          ))}
        </Sidebar>

        <Scroll>
          <Detail project={active} />
        </Scroll>
      </div>
      <StatusBar>
        <span>{active.status}</span>
        <span>· {active.year}</span>
        <span className="ml-auto">{active.stack.length} technologies</span>
      </StatusBar>
    </div>
  )
}

function Detail({ project: p }: { project: Project }) {
  return (
    <div className="pb-10">
      {/* Hero */}
      <div
        className="relative flex h-40 items-end p-6"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${p.accent} 45%, transparent), color-mix(in oklab, ${p.accent} 8%, transparent))`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="relative">
          <div className="mb-2 text-4xl">{p.glyph}</div>
          <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-dim)' }}>
            {p.tagline}
          </p>
        </div>
      </div>

      <div className="px-6 pt-5">
        {p.draft && (
          <p
            className="selectable mb-4 rounded-lg px-3 py-2.5 text-[11.5px] leading-relaxed"
            style={{ background: 'color-mix(in oklab, #f59e0b 12%, transparent)' }}
          >
            <strong>Not written up yet.</strong> This project is real, but its description here is a placeholder —
            listing it with invented detail would be worse than listing it empty.
          </p>
        )}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {p.draft && <Chip tone="warn">Draft</Chip>}
          <Chip tone={p.status === 'Shipped' ? 'good' : p.status === 'In development' ? 'accent' : 'neutral'}>
            {p.status}
          </Chip>
          <Chip>{p.year}</Chip>
          {p.stack.map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>

        {p.metrics && (
          <div className="mb-6 grid gap-3" style={{ gridTemplateColumns: `repeat(${p.metrics.length}, minmax(0,1fr))` }}>
            {p.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl px-4 py-3"
                style={{ background: 'color-mix(in oklab, var(--text) 6%, transparent)' }}
              >
                <div className="text-lg font-semibold tracking-tight" style={{ color: p.accent }}>
                  {m.value}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        )}

        <Markdown source={p.description} />

        <h2 className="mt-7 mb-2 text-[11px] font-semibold tracking-[0.09em] uppercase" style={{ color: 'var(--text-dim)' }}>
          What made it work
        </h2>
        <ul className="space-y-1.5">
          {p.highlights.map((h) => (
            <li key={h} className="flex gap-2.5 text-[13px] leading-relaxed">
              <span className="mt-[3px] shrink-0" style={{ color: p.accent }}>
                ▸
              </span>
              <span className="selectable">{h}</span>
            </li>
          ))}
        </ul>

        {/* Gallery — placeholder tiles until real screenshots are dropped in. */}
        <h2 className="mt-7 mb-2 text-[11px] font-semibold tracking-[0.09em] uppercase" style={{ color: 'var(--text-dim)' }}>
          Screens
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {['Dashboard', 'Detail view', 'Settings'].map((label, i) => (
            <div
              key={label}
              className="grid aspect-[16/10] place-items-center rounded-lg text-[11px]"
              style={{
                background: `linear-gradient(${140 + i * 40}deg, color-mix(in oklab, ${p.accent} 22%, transparent), color-mix(in oklab, ${p.accent} 6%, transparent))`,
                color: 'var(--text-dim)',
                boxShadow: 'inset 0 0 0 1px var(--chrome-border)',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {p.repo && (
            <button
              type="button"
              onClick={() => launchApp('browser', { url: p.repo })}
              className="rounded-lg px-4 py-2 text-[12.5px] font-medium"
              style={{ background: p.accent, color: '#0b0d12' }}
            >
              🐙 View source
            </button>
          )}
          {p.demo && (
            <button
              type="button"
              onClick={() => window.open(p.demo, '_blank', 'noopener,noreferrer')}
              className="rounded-lg px-4 py-2 text-[12.5px] font-medium"
              style={{ background: 'color-mix(in oklab, var(--text) 12%, transparent)' }}
            >
              ↗ Live demo
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              launchApp('contact', { subject: `About ${p.name}` })
              notify({ title: 'Compose', body: `Drafting a message about ${p.name}`, glyph: '✉️' })
            }}
            className="rounded-lg px-4 py-2 text-[12.5px] font-medium"
            style={{ background: 'color-mix(in oklab, var(--text) 12%, transparent)' }}
          >
            ✉️ Ask about this
          </button>
        </div>
      </div>
    </div>
  )
}
