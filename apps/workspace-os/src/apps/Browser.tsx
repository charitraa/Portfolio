import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { experience, links, owner, projects, skills } from '@/data/portfolio'
import { Chip, IconBtn, Scroll, Toolbar } from '@/os/ui'
import { useWindows } from '@/store/windows'
import { notify } from '@/store/notifications'
import type { AppWindowProps } from '@/os/types'

/**
 * Real sites can't be framed (X-Frame-Options), and a screenshot would be a
 * lie. So the browser renders first-party pages built from the same data as
 * the rest of the OS, and offers a one-click escape hatch to the live URL.
 */

interface Page {
  url: string
  title: string
  favicon: string
  render: () => ReactNode
}

const NEW_TAB = 'about:newtab'

function Site({ children }: { children: ReactNode }) {
  return <div className="selectable mx-auto max-w-3xl px-8 py-10 text-[13.5px] leading-relaxed">{children}</div>
}

function H1({ children }: { children: ReactNode }) {
  return <h1 className="mb-1 text-2xl font-bold tracking-tight">{children}</h1>
}

function ExternalNote({ url }: { url: string }) {
  return (
    <div
      className="mt-8 flex items-center gap-3 rounded-xl p-3 text-[12px]"
      style={{ background: 'color-mix(in oklab, var(--accent) 12%, transparent)' }}
    >
      <span className="text-base">🔗</span>
      <span className="flex-1" style={{ color: 'var(--text-dim)' }}>
        This page is rendered by {owner.osName}. The live site is at <span style={{ color: 'var(--text)' }}>{url}</span>.
      </span>
      <button
        type="button"
        onClick={() => {
          window.open(url, '_blank', 'noopener,noreferrer')
          notify({ title: 'Opened in a new tab', body: url, glyph: '🌐' })
        }}
        className="rounded-lg px-3 py-1.5 text-[12px] font-medium"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        Open for real
      </button>
    </div>
  )
}

const PAGES: Page[] = [
  {
    url: links.website,
    title: `${owner.name} — ${owner.role}`,
    favicon: '🏠',
    render: () => (
      <Site>
        <H1>{owner.name}</H1>
        <p style={{ color: 'var(--text-dim)' }}>
          {owner.role} · {owner.location}
        </p>
        <p className="mt-5">{owner.tagline}</p>
        <p className="mt-3" style={{ color: 'var(--text-dim)' }}>
          You are currently browsing inside a desktop environment that is itself a portfolio. If that
          sounds recursive, it is. Close this browser and the rest of the OS is still there.
        </p>
        <h2 className="mt-8 mb-3 text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--text-dim)' }}>
          Selected work
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <div key={p.id} className="rounded-xl p-4" style={{ background: 'color-mix(in oklab, var(--text) 6%, transparent)' }}>
              <div className="mb-1 text-lg">{p.glyph}</div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                {p.tagline}
              </div>
            </div>
          ))}
        </div>
        <ExternalNote url={links.website} />
      </Site>
    ),
  },
  {
    url: links.github,
    title: `${owner.username} · GitHub`,
    favicon: '🐙',
    render: () => (
      <Site>
        <div className="flex items-center gap-4">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-xl font-bold"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {owner.avatarInitials}
          </div>
          <div>
            <H1>{owner.username}</H1>
            <p style={{ color: 'var(--text-dim)' }}>
              {owner.name} · {owner.role}
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="rounded-xl p-4" style={{ boxShadow: 'inset 0 0 0 1px var(--chrome-border)' }}>
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                  {p.id}
                </span>
                <Chip>{p.status}</Chip>
              </div>
              <div className="mt-1 text-[12.5px]" style={{ color: 'var(--text-dim)' }}>
                {p.tagline}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px]" style={{ color: 'var(--text-dim)' }}>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
                  {p.stack[0]}
                </span>
                <span>★ {20 + p.name.length * 3}</span>
                <span>Updated {p.year}</span>
              </div>
            </div>
          ))}
        </div>
        <ExternalNote url={links.github} />
      </Site>
    ),
  },
  {
    url: links.linkedin,
    title: `${owner.name} | LinkedIn`,
    favicon: '💼',
    render: () => (
      <Site>
        <div
          className="-mx-8 -mt-10 mb-4 h-28"
          style={{ background: 'linear-gradient(120deg, var(--accent), color-mix(in oklab, var(--accent) 40%, #000))' }}
        />
        <H1>{owner.name}</H1>
        <p style={{ color: 'var(--text-dim)' }}>
          {owner.role} · {owner.location}
        </p>
        <h2 className="mt-7 mb-2 font-semibold">Experience</h2>
        <div className="space-y-4">
          {experience
            .filter((e) => e.kind === 'work')
            .map((e) => (
              <div key={e.id}>
                <div className="font-medium">{e.role}</div>
                <div className="text-[12.5px]" style={{ color: 'var(--text-dim)' }}>
                  {e.org} · {e.start} – {e.end}
                </div>
                <p className="mt-1 text-[12.5px]">{e.summary}</p>
              </div>
            ))}
        </div>
        <h2 className="mt-7 mb-2 font-semibold">Skills</h2>
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 14).map((s) => (
            <Chip key={s.name}>{s.name}</Chip>
          ))}
        </div>
        <ExternalNote url={links.linkedin} />
      </Site>
    ),
  },
  {
    url: links.blog,
    title: 'Blog',
    favicon: '✍️',
    render: () => (
      <Site>
        <H1>Notes</H1>
        <p style={{ color: 'var(--text-dim)' }}>Things I worked out the hard way.</p>
        <div className="mt-6 space-y-5">
          {[
            {
              t: 'Writing a window manager in 400 lines of React',
              d: 'Pointer capture, z-order as a monotonic counter, and why `transition` on `left` is a trap.',
              date: 'Jul 2026',
            },
            {
              t: 'Streaming translation without the awkward pause',
              d: 'Voice-activity chunking beats fixed windows, and overlapping stages beats a faster model.',
              date: 'Apr 2026',
            },
            {
              t: 'The database was fine, the query was not',
              d: 'A postmortem about an index that existed but was never used.',
              date: 'Jan 2026',
            },
          ].map((post) => (
            <article key={post.t}>
              <div className="text-[11px] tracking-wide uppercase" style={{ color: 'var(--text-dim)' }}>
                {post.date}
              </div>
              <div className="text-base font-semibold" style={{ color: 'var(--accent)' }}>
                {post.t}
              </div>
              <p className="text-[12.5px]" style={{ color: 'var(--text-dim)' }}>
                {post.d}
              </p>
            </article>
          ))}
        </div>
        <ExternalNote url={links.blog} />
      </Site>
    ),
  },
]

const BOOKMARKS = [
  { url: links.website, label: 'Portfolio', glyph: '🏠' },
  { url: links.github, label: 'GitHub', glyph: '🐙' },
  { url: links.linkedin, label: 'LinkedIn', glyph: '💼' },
  { url: links.blog, label: 'Blog', glyph: '✍️' },
]

interface Tab {
  id: number
  url: string
  history: string[]
  idx: number
}

function findPage(url: string): Page | null {
  const clean = url.replace(/\/+$/, '')
  return PAGES.find((p) => p.url.replace(/\/+$/, '') === clean) ?? null
}

export default function Browser({ winId, props }: AppWindowProps) {
  const setTitle = useWindows((s) => s.setTitle)
  const start = (props.url as string) ?? NEW_TAB

  const [tabs, setTabs] = useState<Tab[]>([{ id: 1, url: start, history: [start], idx: 0 }])
  const [activeId, setActiveId] = useState(1)
  const [seq, setSeq] = useState(1)
  const [address, setAddress] = useState(start === NEW_TAB ? '' : start)
  const [visited, setVisited] = useState<string[]>(start === NEW_TAB ? [] : [start])

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0]
  const page = useMemo(() => findPage(active.url), [active.url])

  // A re-launch with a url (e.g. `github` in the terminal) navigates the tab.
  useEffect(() => {
    const u = props.url as string | undefined
    if (u && u !== active.url) go(u)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.url])

  useEffect(() => {
    setTitle(winId, `${page?.title ?? (active.url === NEW_TAB ? 'New Tab' : active.url)} — Browser`)
    setAddress(active.url === NEW_TAB ? '' : active.url)
  }, [active.url, page, setTitle, winId])

  function go(url: string) {
    let target = url.trim()
    if (!target) return
    if (target !== NEW_TAB && !/^https?:\/\//.test(target)) {
      // Treat anything unrecognised as a search, like a real omnibox.
      const match = PAGES.find((p) => p.title.toLowerCase().includes(target.toLowerCase()) || p.url.includes(target))
      target = match ? match.url : `https://${target}`
    }
    setTabs((ts) =>
      ts.map((t) =>
        t.id === activeId ? { ...t, url: target, history: [...t.history.slice(0, t.idx + 1), target], idx: t.idx + 1 } : t,
      ),
    )
    setVisited((v) => [target, ...v.filter((u) => u !== target)].slice(0, 25))
  }

  function nav(delta: number) {
    setTabs((ts) =>
      ts.map((t) => {
        if (t.id !== activeId) return t
        const idx = Math.max(0, Math.min(t.history.length - 1, t.idx + delta))
        return { ...t, idx, url: t.history[idx] }
      }),
    )
  }

  function newTab(url = NEW_TAB) {
    const id = seq + 1
    setSeq(id)
    setTabs((ts) => [...ts, { id, url, history: [url], idx: 0 }])
    setActiveId(id)
  }

  function closeTab(id: number) {
    setTabs((ts) => {
      const next = ts.filter((t) => t.id !== id)
      if (next.length === 0) return [{ id: id + 1, url: NEW_TAB, history: [NEW_TAB], idx: 0 }]
      if (id === activeId) setActiveId(next[next.length - 1].id)
      return next
    })
  }

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--chrome)' }}>
      {/* Tab strip */}
      <div
        className="flex h-9 shrink-0 items-end gap-1 px-2 pt-1.5"
        style={{ background: 'color-mix(in oklab, #000 18%, var(--chrome))' }}
      >
        {tabs.map((t) => {
          const p = findPage(t.url)
          return (
            <div
              key={t.id}
              onPointerDown={() => setActiveId(t.id)}
              className="group flex h-[30px] max-w-[190px] min-w-0 cursor-default items-center gap-2 rounded-t-lg px-3 text-[12px]"
              style={{
                background: t.id === activeId ? 'var(--chrome)' : 'transparent',
                color: t.id === activeId ? 'var(--text)' : 'var(--text-dim)',
              }}
            >
              <span className="shrink-0">{p?.favicon ?? '🌐'}</span>
              <span className="min-w-0 flex-1 truncate">{p?.title ?? (t.url === NEW_TAB ? 'New Tab' : t.url)}</span>
              <button
                type="button"
                aria-label="Close tab"
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(t.id)
                }}
                className="grid h-4 w-4 shrink-0 place-items-center rounded opacity-0 group-hover:opacity-100 hover:bg-white/15"
              >
                ✕
              </button>
            </div>
          )
        })}
        <button
          type="button"
          aria-label="New tab"
          onClick={() => newTab()}
          className="mb-0.5 grid h-6 w-6 place-items-center rounded-md hover:bg-white/10"
          style={{ color: 'var(--text-dim)' }}
        >
          +
        </button>
      </div>

      <Toolbar>
        <IconBtn title="Back" disabled={active.idx === 0} onClick={() => nav(-1)}>
          ←
        </IconBtn>
        <IconBtn title="Forward" disabled={active.idx >= active.history.length - 1} onClick={() => nav(1)}>
          →
        </IconBtn>
        <IconBtn title="Reload" onClick={() => go(active.url)}>
          ⟳
        </IconBtn>
        <form
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: 'color-mix(in oklab, var(--text) 8%, transparent)' }}
          onSubmit={(e) => {
            e.preventDefault()
            go(address)
          }}
        >
          <span className="text-[11px]" style={{ color: '#4ade80' }}>
            🔒
          </span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search or enter address"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none"
            style={{ color: 'var(--text)' }}
          />
        </form>
      </Toolbar>

      {/* Bookmarks bar */}
      <div
        className="flex h-8 shrink-0 items-center gap-1 px-2"
        style={{ borderBottom: '1px solid var(--chrome-border)' }}
      >
        {BOOKMARKS.map((b) => (
          <button
            key={b.url}
            type="button"
            onClick={() => go(b.url)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] hover:bg-white/10"
            style={{ color: 'var(--text-dim)' }}
          >
            <span>{b.glyph}</span>
            {b.label}
          </button>
        ))}
      </div>

      <Scroll>
        {active.url === NEW_TAB ? (
          <NewTab visited={visited} onGo={go} />
        ) : page ? (
          page.render()
        ) : (
          <div className="grid h-full place-items-center p-10 text-center">
            <div>
              <div className="mb-3 text-4xl">🌐</div>
              <div className="text-[14px] font-semibold">This page isn’t part of {owner.osName}</div>
              <p className="mx-auto mt-2 max-w-sm text-[12.5px]" style={{ color: 'var(--text-dim)' }}>
                A sandboxed browser can’t frame arbitrary sites, and a fake screenshot would be
                dishonest. Open <span style={{ color: 'var(--text)' }}>{active.url}</span> in a real tab
                instead.
              </p>
              <button
                type="button"
                onClick={() => window.open(active.url, '_blank', 'noopener,noreferrer')}
                className="mt-4 rounded-lg px-4 py-2 text-[12.5px] font-medium"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Open {active.url}
              </button>
            </div>
          </div>
        )}
      </Scroll>
    </div>
  )
}

function NewTab({ visited, onGo }: { visited: string[]; onGo: (url: string) => void }) {
  return (
    <div className="mx-auto max-w-2xl px-8 py-14">
      <div className="mb-8 text-center">
        <div className="text-3xl font-bold tracking-tight">{owner.osName} Browser</div>
        <p className="mt-1 text-[12.5px]" style={{ color: 'var(--text-dim)' }}>
          Four bookmarks. No telemetry. No cookie banner.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BOOKMARKS.map((b) => (
          <button
            key={b.url}
            type="button"
            onClick={() => onGo(b.url)}
            className="flex flex-col items-center gap-2 rounded-xl p-4 transition-transform hover:-translate-y-0.5"
            style={{ background: 'color-mix(in oklab, var(--text) 7%, transparent)' }}
          >
            <span className="text-2xl">{b.glyph}</span>
            <span className="text-[12px] font-medium">{b.label}</span>
          </button>
        ))}
      </div>
      {visited.length > 0 && (
        <>
          <div className="mt-9 mb-2 text-[11px] font-semibold tracking-wide uppercase" style={{ color: 'var(--text-dim)' }}>
            History
          </div>
          <div className="space-y-0.5">
            {visited.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => onGo(u)}
                className="block w-full truncate rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-white/8"
                style={{ color: 'var(--text-dim)' }}
              >
                {findPage(u)?.favicon ?? '🌐'} {u}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
