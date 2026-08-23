import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Activity, Cpu, Gauge, HardDrive, Wifi } from 'lucide-react'
import { profile } from '../../data/profile'
import { languageMix } from '../../data/skills'
import { projectsPerYear } from '../../data/experience'
import { BarChart, DonutChart, Heatmap, Sparkline } from '../charts/charts'
import { Meter, SectionTitle, StatTile, StatusPill } from '../ui/primitives'
import { useApp } from '../../store/AppState'

/** Control plane — the overview widgets. */
export function DashboardPanel() {
  const { telemetry, motion } = useApp()
  const [series, setSeries] = useState<number[]>(() =>
    Array.from({ length: 28 }, (_, i) => 40 + Math.sin(i / 2.4) * 18 + i * 0.4),
  )
  const last = useRef(telemetry.connections)

  // Roll the sparkline forward whenever telemetry ticks.
  useEffect(() => {
    if (!motion) return
    if (telemetry.connections === last.current) return
    last.current = telemetry.connections
    setSeries((prev) => [...prev.slice(1), telemetry.connections])
  }, [telemetry.connections, motion])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill label="all systems normal" tone="ok" pulse />
        <StatusPill label="uptime 99.99%" tone="accent" dot={false} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Visitors" value={profile.stats.visitors} tone="accent" />
        <StatTile label="Projects" value={profile.stats.projects} tone="cyan" />
        <StatTile label="Years" value={profile.stats.years} tone="purple" />
        <StatTile label="Technologies" value={profile.stats.technologies} tone="ok" />
        <StatTile label="GitHub repos" value={profile.stats.repos} tone="warn" />
        <StatTile label="Open conns" value={telemetry.connections} tone="cyan" animate={false} />
      </div>

      <div>
        <SectionTitle hint="last 28 samples">
          <span className="inline-flex items-center gap-1.5">
            <Activity size={12} /> Active connections
          </span>
        </SectionTitle>
        <div className="rounded-lg border bg-bg-2/60 p-2">
          <Sparkline points={series} />
        </div>
      </div>

      <div>
        <SectionTitle hint="node exporter">Host metrics</SectionTitle>
        <div className="space-y-3 rounded-lg border bg-bg-2/60 p-3">
          <MetricRow icon={<Cpu size={12} />} label="CPU" value={telemetry.cpu} unit="%" tone="accent" />
          <MetricRow icon={<HardDrive size={12} />} label="Memory" value={telemetry.memory} unit="%" tone="purple" />
          <MetricRow icon={<Gauge size={12} />} label="Server load" value={telemetry.load} unit="%" tone="cyan" />
          <div className="grid grid-cols-3 gap-2 border-t border-line/50 pt-3">
            <MiniStat icon={<Wifi size={11} />} label="ping" value={`${telemetry.ping} ms`} />
            <MiniStat label="bandwidth" value={`${telemetry.bandwidth} Gbps`} />
            <MiniStat label="latency" value="normal" tone="var(--success)" />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle hint="by volume">Languages</SectionTitle>
        <DonutChart data={languageMix} />
      </div>

      <div>
        <SectionTitle hint="per year">Projects shipped</SectionTitle>
        <BarChart data={projectsPerYear} />
      </div>

      <div>
        <SectionTitle hint="last 26 weeks">Contributions</SectionTitle>
        <Heatmap />
      </div>
    </div>
  )
}

function MetricRow({
  icon,
  label,
  value,
  unit,
  tone,
}: {
  icon: ReactNode
  label: string
  value: number
  unit: string
  tone: 'accent' | 'purple' | 'cyan'
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-wide text-muted uppercase">
          {icon}
          {label}
        </span>
        <span className="font-num text-[12px] text-ink">
          {value}
          {unit}
        </span>
      </div>
      <Meter value={value} tone={tone} label={label} />
    </div>
  )
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon?: ReactNode
  label: string
  value: string
  tone?: string
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-1 font-mono text-[9.5px] tracking-wider text-muted uppercase">
        {icon}
        {label}
      </div>
      <div className="font-num text-[12px]" style={{ color: tone ?? 'var(--text)' }}>
        {value}
      </div>
    </div>
  )
}
