import { useState } from 'react'
import { techStack } from '@/data/portfolio'
import { Chip, Scroll, Sidebar, SidebarItem, SidebarLabel, StatusBar } from '@/os/ui'
import type { AppWindowProps } from '@/os/types'

const CATS = Object.keys(techStack)

/** The tech stack, presented as a software centre. */
export default function TechStack(_: AppWindowProps) {
  const [cat, setCat] = useState<string>('All')
  const shown = cat === 'All' ? CATS : [cat]
  const total = Object.values(techStack).flat().length

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1">
        <Sidebar width={176}>
          <SidebarLabel>Software Center</SidebarLabel>
          <SidebarItem glyph="🏠" active={cat === 'All'} onClick={() => setCat('All')}>
            All software
          </SidebarItem>
          <SidebarLabel>Categories</SidebarLabel>
          {CATS.map((c) => (
            <SidebarItem
              key={c}
              glyph="📦"
              active={cat === c}
              onClick={() => setCat(c)}
              trailing={
                <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                  {techStack[c].length}
                </span>
              }
            >
              {c}
            </SidebarItem>
          ))}
        </Sidebar>

        <Scroll className="px-5 py-4">
          {cat === 'All' && (
            <div
              className="mb-6 rounded-2xl p-5"
              style={{ background: 'linear-gradient(120deg, var(--accent-soft), transparent)' }}
            >
              <div className="text-[11px] font-semibold tracking-[0.09em] uppercase" style={{ color: 'var(--text-dim)' }}>
                Editor's choice
              </div>
              <div className="mt-1 text-xl font-bold tracking-tight">The stack behind everything here</div>
              <p className="mt-1 max-w-lg text-[12.5px]" style={{ color: 'var(--text-dim)' }}>
                Not a list of everything ever touched — the tools actually reached for when the work
                has to ship. Green means daily, blue means comfortable, grey means learning in the open.
              </p>
            </div>
          )}

          {shown.map((c) => (
            <section key={c} className="mb-7">
              <h2 className="mb-2.5 text-[13px] font-semibold tracking-tight">{c}</h2>
              <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
                {techStack[c].map((e) => (
                  <div
                    key={e.name}
                    className="rounded-xl p-3.5 transition-transform hover:-translate-y-0.5"
                    style={{
                      background: 'color-mix(in oklab, var(--text) 5.5%, transparent)',
                      boxShadow:
                        e.tier === 'core' ? 'inset 0 0 0 1px color-mix(in oklab, var(--accent) 45%, transparent)' : undefined,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none">{e.glyph}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-semibold">{e.name}</span>
                          <Chip tone={e.tier === 'core' ? 'good' : e.tier === 'working' ? 'accent' : 'neutral'}>
                            {e.tier === 'core' ? 'daily' : e.tier === 'working' ? 'comfortable' : 'learning'}
                          </Chip>
                        </div>
                        <p className="mt-1 text-[12px] leading-snug" style={{ color: 'var(--text-dim)' }}>
                          {e.blurb}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </Scroll>
      </div>

      <StatusBar>
        <span>{total} technologies across {CATS.length} categories</span>
      </StatusBar>
    </div>
  )
}
