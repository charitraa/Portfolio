import { useEffect, useMemo, useState } from 'react'
import { links } from '@/data/portfolio'
import { Chip, EmptyState, Scroll, StatusBar, Toolbar } from '@/os/ui'
import type { AppWindowProps } from '@/os/types'

/**
 * Real repositories, fetched from the public GitHub API at runtime.
 *
 * Nothing here is hard-coded, because a hard-coded repo list is a fabricated
 * one the day after it is written. The unauthenticated API is rate-limited to
 * 60 requests an hour per IP, so a failure is expected occasionally and is
 * shown as a failure rather than papered over with placeholder cards.
 *
 * The contribution heatmap most portfolios show is deliberately absent: daily
 * contribution counts are not in the public REST API, and drawing a plausible
 * grid from repository timestamps would be inventing data. What is shown
 * instead is push activity by month, which is derived from `pushed_at` and is
 * therefore real — and is labelled as what it is.
 */

interface Repo {
  id: number
  name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  pushed_at: string
  fork: boolean
  archived: boolean
  topics?: string[]
}

type State = { status: 'loading' } | { status: 'ok'; repos: Repo[] } | { status: 'error'; message: string }

/** `https://github.com/charitraa` → `charitraa`. */
function usernameFrom(url: string): string | null {
  const m = url.match(/github\.com\/([^/?#]+)/i)
  return m ? m[1] : null
}

const LANG_COLOR: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Dart: '#00B4AB',
  Shell: '#89e051',
  Go: '#00ADD8',
  C: '#555555',
  'C++': '#f34b7d',
  PHP: '#4F5D95',
}

export default function GitHub(_: AppWindowProps) {
  const user = usernameFrom(links.github)
  const [state, setState] = useState<State>({ status: 'loading' })
  const [sort, setSort] = useState<'recent' | 'stars' | 'name'>('recent')

  useEffect(() => {
    if (!user) {
      setState({ status: 'error', message: 'No GitHub account is set in the portfolio data.' })
      return
    }
    const ac = new AbortController()
    fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`, {
      signal: ac.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then(async (r) => {
        if (r.status === 403) throw new Error('GitHub rate limit reached — try again in a little while.')
        if (r.status === 404) throw new Error(`No public account at github.com/${user}.`)
        if (!r.ok) throw new Error(`GitHub returned ${r.status}.`)
        return (await r.json()) as Repo[]
      })
      .then((repos) => setState({ status: 'ok', repos }))
      .catch((e: unknown) => {
        if (ac.signal.aborted) return
        setState({ status: 'error', message: e instanceof Error ? e.message : 'Could not reach GitHub.' })
      })
    return () => ac.abort()
  }, [user])

  const repos = state.status === 'ok' ? state.repos : []

  const shown = useMemo(() => {
    const list = repos.filter((r) => !r.fork)
    if (sort === 'stars') return [...list].sort((a, b) => b.stargazers_count - a.stargazers_count)
    if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name))
    return [...list].sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at))
  }, [repos, sort])

  const languages = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of shown) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1)
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [shown])

  /** Pushes per month over the last year — derived from real timestamps. */
  const activity = useMemo(() => {
    const months: { key: string; label: string; count: number }[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString(undefined, { month: 'short' }),
        count: 0,
      })
    }
    const index = new Map(months.map((m, i) => [m.key, i]))
    for (const r of shown) {
      const d = new Date(r.pushed_at)
      const i = index.get(`${d.getFullYear()}-${d.getMonth()}`)
      if (i !== undefined) months[i].count++
    }
    return months
  }, [shown])

  const peak = Math.max(1, ...activity.map((m) => m.count))

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[13px] font-semibold">GitHub</span>
        {user && (
          <a
            href={links.github}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[11px] hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            @{user} ↗
          </a>
        )}
        <div className="ml-auto flex gap-1">
          {(['recent', 'stars', 'name'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              className="rounded-lg px-2 py-1 text-[11px] font-medium capitalize transition-colors"
              style={{
                background: sort === s ? 'var(--accent-soft)' : 'transparent',
                color: sort === s ? 'var(--text)' : 'var(--text-dim)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </Toolbar>

      {state.status === 'loading' && (
        <div className="grid flex-1 place-items-center">
          <div className="text-center">
            <div
              className="mx-auto mb-3 h-6 w-6 rounded-full border-2 border-transparent spin-slow"
              style={{ borderTopColor: 'var(--accent)' }}
            />
            <p className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
              Fetching repositories from GitHub…
            </p>
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex-1">
          <EmptyState glyph="⚠️" title="Could not load from GitHub" body={state.message} />
          <div className="pb-6 text-center">
            <a
              href={links.github}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-lg px-3.5 py-2 text-[12px] font-medium"
              style={{ background: 'color-mix(in oklab, var(--text) 10%, transparent)' }}
            >
              Open the profile on github.com ↗
            </a>
          </div>
        </div>
      )}

      {state.status === 'ok' && (
        <Scroll className="p-4">
          {/* Push activity — real timestamps, not a contribution heatmap. */}
          <section className="mb-5">
            <h3 className="mb-2 text-[10.5px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-dim)' }}>
              Repositories pushed, by month
            </h3>
            <div className="flex items-end gap-1.5" style={{ height: 64 }}>
              {activity.map((m) => (
                <div key={m.key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <div
                    title={`${m.count} repo${m.count === 1 ? '' : 's'} pushed in ${m.label}`}
                    className="w-full rounded-[3px] transition-[height] duration-500"
                    style={{
                      height: `${Math.max(3, (m.count / peak) * 48)}px`,
                      background: m.count ? 'var(--accent)' : 'color-mix(in oklab, var(--text) 12%, transparent)',
                      opacity: m.count ? 0.45 + (m.count / peak) * 0.55 : 1,
                    }}
                  />
                  <span className="truncate text-[9px]" style={{ color: 'var(--text-dim)' }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[10.5px]" style={{ color: 'var(--text-dim)' }}>
              Derived from each repository's last push. This is not a commit-contribution graph — those counts are not
              available from the public API, and drawing one would mean inventing it.
            </p>
          </section>

          {languages.length > 0 && (
            <section className="mb-5">
              <h3 className="mb-2 text-[10.5px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-dim)' }}>
                Languages across {shown.length} repositories
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {languages.map(([lang, n]) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-[3px] text-[10.5px] font-medium"
                    style={{ background: 'color-mix(in oklab, var(--text) 8%, transparent)' }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: LANG_COLOR[lang] ?? 'var(--text-dim)' }}
                    />
                    {lang} <span style={{ color: 'var(--text-dim)' }}>{n}</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          <div className="space-y-1.5">
            {shown.map((r) => (
              <a
                key={r.id}
                href={r.html_url}
                target="_blank"
                rel="noreferrer noopener"
                className="block rounded-xl p-3 transition-colors"
                style={{ background: 'color-mix(in oklab, var(--text) 5%, transparent)' }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--accent)' }}>
                    {r.name}
                  </span>
                  {r.archived && <Chip tone="warn">archived</Chip>}
                  {r.stargazers_count > 0 && <Chip>★ {r.stargazers_count}</Chip>}
                  <span className="ml-auto text-[10.5px]" style={{ color: 'var(--text-dim)' }}>
                    pushed {new Date(r.pushed_at).toLocaleDateString()}
                  </span>
                </div>
                {r.description && (
                  <p className="mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                    {r.description}
                  </p>
                )}
                {r.language && (
                  <span className="mt-1.5 inline-flex items-center gap-1.5 text-[10.5px]" style={{ color: 'var(--text-dim)' }}>
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: LANG_COLOR[r.language] ?? 'var(--text-dim)' }}
                    />
                    {r.language}
                  </span>
                )}
              </a>
            ))}
          </div>
        </Scroll>
      )}

      <StatusBar>
        <span>
          {state.status === 'ok' ? `${shown.length} public repositories (forks hidden)` : 'github.com public API'}
        </span>
        <span className="ml-auto">Live — not a snapshot</span>
      </StatusBar>
    </div>
  )
}
