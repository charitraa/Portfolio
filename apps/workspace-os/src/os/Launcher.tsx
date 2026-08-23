import { useEffect, useMemo, useRef, useState } from 'react'
import { launcherApps } from '@/apps/registry'
import { launchApp, openNode } from '@/os/launch'
import { HOME, iconFor, prettyPath, resolve, useFs, type FsNode } from '@/store/fs'
import {
  aiRisks,
  learningTracks,
  netNodes,
  owaspTop10,
  projects,
  securityPhases,
  securityTools,
  services,
  skills,
  stations,
} from '@/data/portfolio'
import { useWindows } from '@/store/windows'
import type { AppId } from '@/os/types'

interface Result {
  key: string
  glyph: string
  title: string
  subtitle: string
  category: string
  run: () => void
}

/** Depth-limited walk of the home directory, for the search index. */
function walkHome(fs: ReturnType<typeof useFs.getState>): { node: FsNode; path: string }[] {
  const out: { node: FsNode; path: string }[] = []
  const visit = (path: string, depth: number) => {
    if (depth > 3) return
    for (const child of fs.list(path) ?? []) {
      if (child.name.startsWith('.')) continue
      const full = resolve(path, child.name)
      out.push({ node: child, path: full })
      if (child.kind === 'dir') visit(full, depth + 1)
    }
  }
  visit(HOME, 0)
  return out
}

export default function Launcher({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const fs = useFs()
  const windows = useWindows((s) => s.windows)
  const focus = useWindows((s) => s.focus)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const out: Result[] = []

    for (const a of launcherApps) {
      if (a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.id.includes(q)) {
        out.push({
          key: `app-${a.id}`,
          glyph: a.glyph,
          title: a.name,
          subtitle: a.description,
          category: 'Applications',
          run: () => launchApp(a.id),
        })
      }
    }

    for (const w of windows) {
      if (w.title.toLowerCase().includes(q)) {
        out.push({
          key: `win-${w.id}`,
          glyph: '🪟',
          title: w.title,
          subtitle: 'Switch to this window',
          category: 'Open windows',
          run: () => focus(w.id),
        })
      }
    }

    for (const p of projects) {
      if (p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.stack.join(' ').toLowerCase().includes(q)) {
        out.push({
          key: `proj-${p.id}`,
          glyph: p.glyph,
          title: p.name,
          subtitle: p.tagline,
          category: 'Projects',
          run: () => launchApp('projects', { projectId: p.id }),
        })
      }
    }

    for (const s of skills) {
      if (s.name.includes(q)) {
        out.push({
          key: `skill-${s.name}`,
          glyph: '📦',
          title: s.name,
          subtitle: `${s.category} · ${s.summary}`,
          category: 'Skills',
          run: () => launchApp('skills'),
        })
      }
    }

    for (const st of stations) {
      if (st.name.toLowerCase().includes(q) || st.blurb.toLowerCase().includes(q) || st.contents.join(' ').toLowerCase().includes(q)) {
        out.push({
          key: `station-${st.id}`,
          glyph: st.glyph,
          title: st.name,
          subtitle: `Station ${st.index} · ${st.blurb}`,
          category: 'Stations',
          run: () => launchApp('stations'),
        })
      }
    }

    for (const ph of securityPhases) {
      if (ph.name.toLowerCase().includes(q) || ph.summary.toLowerCase().includes(q) || ph.activities.join(' ').toLowerCase().includes(q)) {
        out.push({
          key: `secphase-${ph.id}`,
          glyph: ph.glyph,
          title: ph.name,
          subtitle: 'Security Lab phase',
          category: 'Security',
          run: () => launchApp('seclab'),
        })
      }
    }

    for (const t of securityTools) {
      if (t.name.toLowerCase().includes(q) || t.purpose.toLowerCase().includes(q)) {
        out.push({
          key: `sectool-${t.id}`,
          glyph: '🛠️',
          title: t.name,
          subtitle: t.purpose,
          category: 'Security',
          run: () => launchApp('seclab'),
        })
      }
    }

    for (const v of owaspTop10) {
      if (v.name.toLowerCase().includes(q) || v.code.toLowerCase().includes(q) || v.summary.toLowerCase().includes(q)) {
        out.push({
          key: `owasp-${v.id}`,
          glyph: '🌐',
          title: `${v.code} — ${v.name}`,
          subtitle: v.summary,
          category: 'Web Security',
          run: () => launchApp('websec'),
        })
      }
    }

    for (const r of aiRisks) {
      if (r.name.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q)) {
        out.push({
          key: `airisk-${r.id}`,
          glyph: '🧠',
          title: r.name,
          subtitle: `${r.category} · ${r.summary}`,
          category: 'AI Security',
          run: () => launchApp('aisec'),
        })
      }
    }

    for (const n of netNodes) {
      if (n.label.toLowerCase().includes(q) || n.kind.includes(q)) {
        out.push({
          key: `net-${n.id}`,
          glyph: n.glyph,
          title: n.label,
          subtitle: `${n.kind} · lab topology`,
          category: 'Network',
          run: () => launchApp('network'),
        })
      }
    }

    for (const t of learningTracks) {
      if (t.name.toLowerCase().includes(q) || t.topics.join(' ').toLowerCase().includes(q) || t.provider.toLowerCase().includes(q)) {
        out.push({
          key: `learn-${t.id}`,
          glyph: '📚',
          title: t.name,
          subtitle: `${t.provider} · ${t.status}`,
          category: 'Knowledge',
          run: () => launchApp('knowledge'),
        })
      }
    }

    for (const sv of services) {
      if (sv.name.toLowerCase().includes(q) || sv.summary.toLowerCase().includes(q) || sv.includes.join(' ').toLowerCase().includes(q)) {
        out.push({
          key: `svc-${sv.id}`,
          glyph: sv.glyph,
          title: sv.name,
          subtitle: sv.summary,
          category: 'Services',
          run: () => launchApp('services'),
        })
      }
    }

    for (const { node, path } of walkHome(fs)) {
      if (node.name.toLowerCase().includes(q)) {
        out.push({
          key: `file-${path}`,
          glyph: iconFor(node),
          title: node.name,
          subtitle: prettyPath(path),
          category: 'Files',
          run: () => openNode(node, path),
        })
      }
    }

    out.push({
      key: 'term-run',
      glyph: '❯',
      title: `Run “${query.trim()}” in the terminal`,
      subtitle: 'Opens a shell and executes the command',
      category: 'Actions',
      run: () => launchApp('terminal', { command: query.trim() }),
    })

    return out.slice(0, 40)
  }, [query, fs, windows, focus])

  useEffect(() => setCursor(0), [query])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof launcherApps>()
    for (const a of launcherApps) {
      const list = map.get(a.category) ?? []
      list.push(a)
      map.set(a.category, list)
    }
    return [...map]
  }, [])

  function activate(r: Result) {
    r.run()
    onClose()
  }

  return (
    <div
      className="absolute inset-0 z-[2000] flex flex-col"
      style={{ background: 'color-mix(in oklab, #05070b 74%, transparent)', backdropFilter: 'blur(26px)' }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="mx-auto mt-16 w-full max-w-2xl px-6">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') return onClose()
            if (!results.length) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setCursor((c) => (c + 1) % results.length)
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              setCursor((c) => (c - 1 + results.length) % results.length)
            }
            if (e.key === 'Enter') {
              e.preventDefault()
              activate(results[cursor])
            }
          }}
          placeholder="Search CharitraOS — stations, projects, security, files, skills…"
          className="w-full rounded-2xl px-5 py-3.5 text-[15px] outline-none"
          style={{
            background: 'color-mix(in oklab, var(--chrome) 85%, transparent)',
            color: 'var(--text)',
            boxShadow: 'inset 0 0 0 1px var(--chrome-border), 0 18px 50px -16px rgba(0,0,0,.7)',
          }}
          aria-label="Search"
        />
      </div>

      <div className="mx-auto mt-6 w-full max-w-4xl flex-1 overflow-y-auto px-6 pb-10">
        {query.trim() ? (
          results.length === 0 ? (
            <p className="mt-14 text-center text-[13px]" style={{ color: 'var(--text-dim)' }}>
              Nothing matches “{query}”.
            </p>
          ) : (
            <div className="mx-auto max-w-2xl space-y-0.5">
              {results.map((r, i) => (
                <button
                  key={r.key}
                  type="button"
                  onPointerEnter={() => setCursor(i)}
                  onClick={() => activate(r)}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left"
                  style={{ background: i === cursor ? 'var(--accent-soft)' : 'transparent' }}
                >
                  <span className="w-6 shrink-0 text-center text-[17px]">{r.glyph}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{r.title}</span>
                    <span className="block truncate text-[11.5px]" style={{ color: 'var(--text-dim)' }}>
                      {r.subtitle}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10.5px] tracking-wide uppercase" style={{ color: 'var(--text-dim)' }}>
                    {r.category}
                  </span>
                </button>
              ))}
            </div>
          )
        ) : (
          grouped.map(([category, list]) => (
            <section key={category} className="mb-8">
              <h2 className="mb-3 text-[11px] font-semibold tracking-[0.11em] uppercase" style={{ color: 'var(--text-dim)' }}>
                {category}
              </h2>
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))' }}>
                {list.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    title={a.description}
                    onClick={() => {
                      launchApp(a.id as AppId)
                      onClose()
                    }}
                    className="flex flex-col items-center gap-2 rounded-2xl px-2 py-4 transition-transform hover:-translate-y-1"
                    style={{ background: 'color-mix(in oklab, var(--text) 6%, transparent)' }}
                  >
                    <span className="text-[30px] leading-none">{a.glyph}</span>
                    <span className="text-center text-[11.5px] leading-tight font-medium">{a.name}</span>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <div className="pb-4 text-center text-[11px]" style={{ color: 'var(--text-dim)' }}>
        <kbd>↑↓</kbd> navigate · <kbd>Enter</kbd> open · <kbd>Esc</kbd> close
      </div>
    </div>
  )
}
