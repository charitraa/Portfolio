import { motion } from 'framer-motion'
import { Activity, ArrowUpRight, Cpu, Radio, ShieldCheck, Terminal } from 'lucide-react'
import { Suspense, lazy, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Meter, Panel, View, ViewHeader } from '@/components/ui'
import { ACCENT, cx } from '@/lib/style'
import { contributionWeeks, dashboardStats, profile, seedActivity, systemVitals } from '@/data/profile'
import { projects } from '@/data/projects'
import { hhmmss, useCountUp, useTypewriter } from '@/hooks'
import { useApp } from '@/store/app'

const TrafficChart = lazy(() =>
  import('@/views/dashboard/Charts').then((m) => ({ default: m.TrafficChart })),
)
const LanguageDonut = lazy(() =>
  import('@/views/dashboard/Charts').then((m) => ({ default: m.LanguageDonut })),
)

const ChartFallback = ({ height }: { height: number }) => (
  <div className="skeleton rounded-md" style={{ height }} />
)

/* ── Stat card ─────────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  accent,
  index,
}: {
  label: string
  value: number | string
  accent: string
  index: number
}) {
  const numeric = typeof value === 'number'
  const counted = useCountUp(numeric ? value : 0)
  const color = ACCENT[accent]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className={cx(
        'group relative overflow-hidden rounded-[10px] border border-line bg-panel p-3',
        'transition-[transform,box-shadow,border-color] duration-200 ease-[var(--ease-ui)]',
        'hover:-translate-y-0.5 hover:shadow-[0_6px_20px_var(--rc-shadow)]',
      )}
      style={{ borderTopColor: color, borderTopWidth: 2 }}
    >
      <div className="num text-[26px] leading-none font-bold" style={{ color }}>
        {numeric ? counted : value}
      </div>
      <div className="mt-1.5 truncate text-[11px] tracking-wide text-muted uppercase">
        {label}
      </div>
      <div
        className="pointer-events-none absolute -right-6 -bottom-6 size-16 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: color }}
      />
    </motion.div>
  )
}

/* ── About, rendered as an HTTP response ───────────────────────────────── */

function AboutResponse() {
  const { text, done } = useTypewriter('GET /api/v1/about', 30, 200)

  const body = {
    name: profile.name,
    role: profile.role,
    education: profile.university,
    location: profile.location,
    languages: profile.languages,
    interests: profile.interests,
    availability: profile.availability,
    career_goal: profile.careerGoal,
  }

  return (
    <Panel
      title="About"
      subtitle="application/json"
      icon={<Terminal size={13} />}
      actions={<Badge color="green">200 OK</Badge>}
      bodyClass="p-0"
    >
      <div className="border-b border-line-soft px-3 py-2 font-mono text-[11.5px]">
        <span className="text-green">{text.split(' ')[0]}</span>{' '}
        <span className={cx('text-fg2', !done && 'caret')}>
          {text.split(' ').slice(1).join(' ')}
        </span>
      </div>
      <pre className="scroll-y max-h-72 overflow-x-auto px-3 py-2 font-mono text-[11.5px] leading-relaxed">
        <span className="text-muted">{'{'}</span>
        {Object.entries(body).map(([k, v]) => (
          <div key={k} className="pl-4">
            <span className="text-blue">"{k}"</span>
            <span className="text-muted">: </span>
            {Array.isArray(v) ? (
              <span className="text-muted">
                [
                {v.map((item, i) => (
                  <span key={item}>
                    <span className="text-orange">"{item}"</span>
                    {i < v.length - 1 && ', '}
                  </span>
                ))}
                ]
              </span>
            ) : (
              <span className="text-orange">"{v}"</span>
            )}
            <span className="text-muted">,</span>
          </div>
        ))}
        <span className="text-muted">{'}'}</span>
      </pre>
    </Panel>
  )
}

/* ── Live activity feed ────────────────────────────────────────────────── */

const FEED_EVENTS = [
  'Visitor opened Resume',
  'Project AdsMitra viewed',
  'Contact page visited',
  'Tech Stack expanded — Cybersecurity',
  'Repository index refreshed',
  'Skills radar rendered',
  'Certification record verified',
  'Console command executed',
]

interface FeedItem {
  id: number
  time: string
  text: string
  kind: 'info' | 'ok'
}

function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>(() =>
    seedActivity.map((a, i) => ({ id: i, time: a.time, text: a.text, kind: a.kind })),
  )

  useEffect(() => {
    let id = 1000
    const timer = setInterval(() => {
      const text = FEED_EVENTS[Math.floor(Math.random() * FEED_EVENTS.length)]
      setItems((prev) =>
        [{ id: id++, time: hhmmss(new Date()), text, kind: 'info' as const }, ...prev].slice(0, 12),
      )
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Panel
      title="Activity"
      icon={<Activity size={13} />}
      actions={<Badge color="green" dot>live</Badge>}
      bodyClass="p-0"
      className="min-h-0"
    >
      <ul className="scroll-y max-h-72 divide-y divide-[var(--rc-border-soft)]">
        {items.map((item) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-baseline gap-2.5 px-3 py-1.5"
          >
            <span className="num shrink-0 text-[10.5px] text-muted">
              {item.time.startsWith('-') ? item.time : item.time.slice(0, 5)}
            </span>
            <span
              className="mt-1 size-1.5 shrink-0 rounded-full"
              style={{ background: item.kind === 'ok' ? ACCENT.green : ACCENT.blue }}
            />
            <span className="truncate text-[12px] text-fg2">{item.text}</span>
          </motion.li>
        ))}
      </ul>
    </Panel>
  )
}

/* ── Contribution heat strip ───────────────────────────────────────────── */

function ContributionStrip() {
  const cells = Array.from({ length: contributionWeeks * 7 }, (_, i) => {
    // Deterministic pseudo-random so the graph is stable across renders.
    const n = Math.sin(i * 12.9898) * 43758.5453
    return Math.floor(Math.abs(n - Math.floor(n)) * 5)
  })

  return (
    <Panel title="Contributions" subtitle={`last ${contributionWeeks} weeks`} icon={<Radio size={13} />}>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {Array.from({ length: contributionWeeks }, (_, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }, (_, d) => {
              const level = cells[w * 7 + d]
              return (
                <span
                  key={d}
                  title={`${level} contributions`}
                  className="size-[9px] shrink-0 rounded-[2px] transition-transform duration-150 hover:scale-125"
                  style={{
                    background:
                      level === 0
                        ? 'var(--rc-bg-2)'
                        : `color-mix(in srgb, var(--color-green) ${level * 24}%, var(--rc-bg-2))`,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-muted">
        Less
        {[0, 1, 2, 3, 4].map((l) => (
          <span
            key={l}
            className="size-[9px] rounded-[2px]"
            style={{
              background:
                l === 0
                  ? 'var(--rc-bg-2)'
                  : `color-mix(in srgb, var(--color-green) ${l * 24}%, var(--rc-bg-2))`,
            }}
          />
        ))}
        More
      </div>
    </Panel>
  )
}

/* ── Traffic panel ─────────────────────────────────────────────────────── */

function TrafficPanel() {
  return (
    <Panel title="Requests" subtitle="24h" icon={<Cpu size={13} />}>
      <Suspense fallback={<ChartFallback height={112} />}>
        <TrafficChart />
      </Suspense>
    </Panel>
  )
}

/* ── View ──────────────────────────────────────────────────────────────── */

export function Dashboard() {
  const notify = useApp((s) => s.notify)
  const featured = projects.filter((p) => p.featured || p.status === 'In Progress').slice(0, 3)

  return (
    <View>
      <ViewHeader
        title={`Welcome back — this is ${profile.name.split(' ')[0]}'s console`}
        route="GET /dashboard"
        desc={profile.bio}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {dashboardStats.map((s, i) => (
          <StatCard key={s.label} label={s.label} value={s.value} accent={s.accent} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <AboutResponse />
          <TrafficPanel />
          <ContributionStrip />
        </div>

        <div className="flex flex-col gap-3">
          <Panel title="System" subtitle="resource usage" icon={<Cpu size={13} />}>
            <div className="flex flex-col gap-3">
              {systemVitals.map((v) => (
                <Meter key={v.label} label={v.label} sub={v.sub} value={v.value} color={v.color} />
              ))}
            </div>
          </Panel>

          <Panel title="Language mix" icon={<Radio size={13} />}>
            <Suspense fallback={<ChartFallback height={128} />}>
              <LanguageDonut />
            </Suspense>
          </Panel>

          <ActivityFeed />

          <Panel title="Security" icon={<ShieldCheck size={13} />} actions={<Badge color="green">Secure</Badge>}>
            <ul className="space-y-1.5 font-mono text-[11.5px]">
              {[
                ['SSL certificate', 'Valid'],
                ['Firewall', 'Active'],
                ['Authentication', 'Passed'],
                ['Vulnerabilities', '0 found'],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center gap-2">
                  <span className="text-muted">{k}</span>
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-green">{v}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/target"
              onClick={() => notify('Scan queued', 'Opening the target surface view.', 'info')}
              className="mt-3 flex items-center gap-1 text-[11.5px] text-blue hover:underline"
            >
              Run full scan <ArrowUpRight size={12} />
            </Link>
          </Panel>
        </div>
      </div>

      <Panel title="Featured work" className="mt-3" icon={<Activity size={13} />}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="group rounded-[10px] border border-line bg-bg2 p-3 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-blue/60"
            >
              <div className="flex items-center gap-2">
                <span className="truncate text-[13px] font-semibold text-fg">{p.name}</span>
                <ArrowUpRight
                  size={13}
                  className="ml-auto shrink-0 text-muted transition-colors group-hover:text-blue"
                />
              </div>
              <p className="mt-1 line-clamp-2 text-[11.5px] text-muted">{p.tagline}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge color={p.accent ?? 'blue'}>{p.language}</Badge>
                <Badge color={p.status === 'Completed' ? 'green' : 'yellow'}>{p.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </Panel>
    </View>
  )
}
