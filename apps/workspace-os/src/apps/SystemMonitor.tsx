import { useEffect, useMemo, useRef, useState } from 'react'
import { experience, projects, skills, stations, techStack } from '@/data/portfolio'
import { Btn, Meter, Scroll, StatusBar, Toolbar } from '@/os/ui'
import { useWindows } from '@/store/windows'
import { useSystem } from '@/store/system'
import { appById } from '@/apps/registry'
import type { AppWindowProps } from '@/os/types'

const HISTORY = 60

/** Fixed-length ring of samples, newest last. */
function useSeries(sample: () => number, intervalMs = 1000) {
  // Pre-fill with real samples rather than zeros — otherwise the chart reads as
  // broken for the first minute while the window scrolls in from the right.
  const [data, setData] = useState<number[]>(() => Array.from({ length: HISTORY }, sample))
  const fn = useRef(sample)
  fn.current = sample
  useEffect(() => {
    const t = window.setInterval(() => setData((d) => [...d.slice(1), fn.current()]), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return data
}

function Sparkline({ data, color, max = 100 }: { data: number[]; color: string; max?: number }) {
  const w = 100
  const h = 34
  const path = data
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (data.length - 1)) * w},${h - (Math.min(v, max) / max) * h}`)
    .join(' ')
  const area = `${path} L${w},${h} L0,${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-9 w-full" aria-hidden>
      <path d={area} fill={color} opacity={0.18} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export default function SystemMonitor(_: AppWindowProps) {
  const windows = useWindows((s) => s.windows)
  const close = useWindows((s) => s.close)
  const focus = useWindows((s) => s.focus)
  const uptimeStart = useSystem((s) => s.uptimeStart)
  const wifi = useSystem((s) => s.wifiConnected)
  const [tab, setTab] = useState<'resources' | 'processes' | 'career'>('resources')

  // "Load" is genuinely a function of what the visitor has open.
  const cpu = useSeries(() => Math.min(96, 6 + windows.filter((w) => !w.minimized).length * 13 + Math.random() * 9))
  const mem = useSeries(() => Math.min(94, 22 + windows.length * 8 + Math.random() * 5))
  const net = useSeries(() => (wifi ? Math.random() * 45 + (windows.some((w) => w.appId === 'browser') ? 35 : 4) : 0))

  const cpuNow = cpu[cpu.length - 1]
  const memNow = mem[mem.length - 1]
  const netNow = net[net.length - 1]
  const diskUsed = 34 + projects.length * 3

  const [, forceTick] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const uptime = useMemo(() => {
    const s = Math.floor((Date.now() - uptimeStart) / 1000)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return `${h > 0 ? `${h}h ` : ''}${m}m ${s % 60}s`
  }, [uptimeStart])


  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <div className="flex rounded-lg p-0.5" style={{ background: 'color-mix(in oklab, var(--text) 8%, transparent)' }}>
          {(['resources', 'processes', 'career'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="rounded-md px-3 py-1 text-[11.5px] font-medium capitalize transition-colors"
              style={{ background: tab === t ? 'var(--accent)' : 'transparent', color: tab === t ? '#fff' : 'var(--text-dim)' }}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="ml-auto font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>
          uptime {uptime}
        </span>
      </Toolbar>

      {tab === 'resources' && (
        <Scroll className="space-y-3 p-4">
          <Gauge label="CPU" value={cpuNow} unit="%" color="#3b82f6" data={cpu} detail={`${windows.filter((w) => !w.minimized).length} visible windows`} />
          <Gauge label="Memory" value={memNow} unit="%" color="#a78bfa" data={mem} detail={`${((memNow / 100) * 16).toFixed(1)} GiB of 16.0 GiB`} />
          <Gauge label="Network" value={netNow} unit=" KB/s" color="#34d399" data={net} max={100} detail={wifi ? 'Connected — wlan0' : 'Disconnected'} />

          <div className="rounded-xl p-4" style={{ background: 'color-mix(in oklab, var(--text) 5.5%, transparent)' }}>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[12.5px] font-semibold">Disk — /dev/portfolio</span>
              <span className="font-mono text-[11px]" style={{ color: 'var(--text-dim)' }}>
                {diskUsed}% of 100 GB
              </span>
            </div>
            <Meter value={diskUsed} color="#f59e0b" height={8} />
            <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px]" style={{ color: 'var(--text-dim)' }}>
              <span>📁 Projects — {projects.length * 4} GB</span>
              <span>📦 Skills — {Math.round(skills.length * 0.8)} GB</span>
              <span>📄 Documents — 2 GB</span>
            </div>
          </div>
        </Scroll>
      )}

      {tab === 'processes' && (
        <Scroll>
          <table className="w-full text-[12px]">
            <thead className="sticky top-0" style={{ background: 'var(--chrome)' }}>
              <tr style={{ color: 'var(--text-dim)' }}>
                {['PID', 'Process', 'State', 'CPU', 'Memory', ''].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[10.5px] font-medium tracking-wide uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {windows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center" style={{ color: 'var(--text-dim)' }}>
                    No processes. Open something from the dock.
                  </td>
                </tr>
              )}
              {windows.map((w, i) => {
                const meta = appById(w.appId)
                return (
                  <tr key={w.id} className="cursor-default hover:bg-white/5" onDoubleClick={() => focus(w.id)}>
                    <td className="px-3 py-1.5 font-mono" style={{ color: 'var(--text-dim)' }}>
                      {1024 + i * 37}
                    </td>
                    <td className="px-3 py-1.5">
                      <span className="mr-2">{meta?.glyph}</span>
                      {w.title}
                    </td>
                    <td className="px-3 py-1.5" style={{ color: w.minimized ? 'var(--text-dim)' : '#4ade80' }}>
                      {w.minimized ? 'sleeping' : 'running'}
                    </td>
                    <td className="px-3 py-1.5 font-mono">{w.minimized ? '0.0' : (2 + (i % 5) * 1.7).toFixed(1)}%</td>
                    <td className="px-3 py-1.5 font-mono">{(40 + w.w * w.h * 0.00004).toFixed(0)} MB</td>
                    <td className="px-3 py-1.5 text-right">
                      <Btn onClick={() => close(w.id)}>End process</Btn>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Scroll>
      )}

      {tab === 'career' && (
        <Scroll className="space-y-3 p-4">
          <p className="text-[12.5px]" style={{ color: 'var(--text-dim)' }}>
            The same dials, pointed at the thing you actually came here to measure.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Projects shipped" value={String(projects.filter((p) => p.status === 'Shipped').length)} sub={`${projects.length} total in the repo`} />
            <Stat label="Workspace stations" value={String(stations.length)} sub="benches in this environment" />
            <Stat label="Technologies in use" value={String(Object.values(techStack).flat().length)} sub={`across ${Object.keys(techStack).length} categories`} />
            <Stat label="Skill packages" value={String(skills.length)} sub={`${skills.filter((s) => s.use === 'daily').length} reached for daily`} />
          </div>

          <div className="rounded-xl p-4" style={{ background: 'color-mix(in oklab, var(--text) 5.5%, transparent)' }}>
            <div className="mb-3 text-[12.5px] font-semibold">Where the time goes</div>
            {(['Languages', 'Frontend', 'Backend', 'Data', 'Infrastructure', 'Tools'] as const).map((cat) => {
              const list = skills.filter((s) => s.category === cat)
              if (!list.length) return null
              const daily = list.filter((s) => s.use === 'daily').length
              return (
                <div key={cat} className="mb-2.5 last:mb-0">
                  <div className="mb-1 flex justify-between text-[11.5px]">
                    <span>{cat}</span>
                    <span style={{ color: 'var(--text-dim)' }}>
                      {daily}/{list.length} daily
                    </span>
                  </div>
                  {/* Share of this category reached for daily — a count, not a self-scored level. */}
                  <Meter value={(daily / list.length) * 100} />
                </div>
              )
            })}
          </div>

          <div
            className="flex items-center gap-3 rounded-xl p-4"
            style={{ background: 'color-mix(in oklab, #34d399 13%, transparent)' }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#34d399' }} />
            <div>
              <div className="text-[12.5px] font-semibold">Availability: accepting work</div>
              <div className="text-[11.5px]" style={{ color: 'var(--text-dim)' }}>
                Currently {experience[0].role.toLowerCase()} at {experience[0].org}.
              </div>
            </div>
          </div>
        </Scroll>
      )}

      <StatusBar>
        <span>{windows.length} processes</span>
        <span>· CPU {cpuNow.toFixed(0)}%</span>
        <span>· Mem {memNow.toFixed(0)}%</span>
        <span className="ml-auto">{wifi ? 'Network up' : 'Network down'}</span>
      </StatusBar>
    </div>
  )
}

function Gauge({
  label,
  value,
  unit,
  color,
  data,
  detail,
  max = 100,
}: {
  label: string
  value: number
  unit: string
  color: string
  data: number[]
  detail: string
  max?: number
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'color-mix(in oklab, var(--text) 5.5%, transparent)' }}>
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] font-semibold">{label}</span>
        <span className="font-mono text-[13px]" style={{ color }}>
          {value.toFixed(1)}
          {unit}
        </span>
      </div>
      <div className="mt-1.5">
        <Sparkline data={data} color={color} max={max} />
      </div>
      <div className="mt-1 text-[11px]" style={{ color: 'var(--text-dim)' }}>
        {detail}
      </div>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'color-mix(in oklab, var(--text) 5.5%, transparent)' }}>
      <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
        {value}
      </div>
      <div className="text-[12px] font-medium">{label}</div>
      <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
        {sub}
      </div>
    </div>
  )
}
