import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Meter, Panel, View, ViewHeader } from '@/components/ui'
import { competencyRadar, skillGroups } from '@/data/skills'

const CHART_TOOLTIP = {
  background: 'var(--rc-panel)',
  border: '1px solid var(--rc-border)',
  borderRadius: 8,
  fontSize: 11,
  color: 'var(--rc-text)',
}

const COLORS = ['blue', 'green', 'purple', 'orange', 'yellow'] as const

/** Renders a level as filled/empty blocks — the terminal-gauge look. */
function BlockGauge({ level }: { level: number }) {
  const filled = Math.round(level / 10)
  return (
    <span className="font-mono text-[11px] tracking-tighter">
      <span className="text-blue">{'█'.repeat(filled)}</span>
      <span className="text-muted/40">{'█'.repeat(10 - filled)}</span>
    </span>
  )
}

export function Skills() {
  const barData = skillGroups
    .flatMap((g) => g.items.map((i) => ({ name: i.name, level: i.level })))
    .sort((a, b) => b.level - a.level)
    .slice(0, 10)

  return (
    <View>
      <ViewHeader
        title="Skills"
        route="GET /api/v1/skills"
        desc="Self-assessed proficiency. Numbers are honest rather than flattering — anything above 85 means I have shipped and maintained it in production."
      />

      <div className="mb-3 grid gap-3 lg:grid-cols-2">
        <Panel title="Competency profile" subtitle="radar">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={competencyRadar} outerRadius="72%">
                <PolarGrid stroke="var(--rc-border)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fontSize: 10.5, fill: 'var(--rc-text-2)' }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: 'var(--rc-muted)' }}
                  axisLine={false}
                />
                <Radar
                  dataKey="value"
                  stroke="var(--color-blue)"
                  fill="var(--color-blue)"
                  fillOpacity={0.28}
                  strokeWidth={1.5}
                />
                <Tooltip contentStyle={CHART_TOOLTIP} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Top proficiencies" subtitle="ranked">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 34, right: 12, top: 4 }}>
                <CartesianGrid horizontal={false} stroke="var(--rc-border)" strokeDasharray="2 4" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: 'var(--rc-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={92}
                  tick={{ fontSize: 10, fill: 'var(--rc-text-2)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: 'var(--rc-hover)' }} />
                <Bar dataKey="level" fill="var(--color-blue)" radius={[0, 3, 3, 0]} barSize={11} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {skillGroups.map((group, gi) => (
          <Panel key={group.category} title={group.category} subtitle={`${group.items.length} entries`}>
            <div className="flex flex-col gap-3">
              {group.items.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="truncate text-[12.5px] text-fg2">{item.name}</span>
                    <BlockGauge level={item.level} />
                    <span className="num ml-auto text-[11px] text-muted">{item.level}%</span>
                  </div>
                  {item.note && (
                    <div className="mb-1 font-mono text-[10.5px] text-muted">{item.note}</div>
                  )}
                  <Meter
                    value={item.level}
                    color={COLORS[gi % COLORS.length]}
                    showValue={false}
                  />
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </View>
  )
}
