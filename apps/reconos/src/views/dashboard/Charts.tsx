import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { languageUsage } from '@/data/skills'

/**
 * Recharts is by far the heaviest dependency here, so both chart panels live
 * in their own chunk and the dashboard streams them in after first paint.
 */

const TOOLTIP = {
  background: 'var(--rc-panel)',
  border: '1px solid var(--rc-border)',
  borderRadius: 8,
  fontSize: 11,
  color: 'var(--rc-text)',
}

const traffic = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, '0')}:00`,
  req: Math.round(40 + Math.sin(i / 2.4) * 28 + (i % 5) * 6),
}))

export function TrafficChart() {
  return (
    <div className="h-28">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={traffic} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
          <defs>
            <linearGradient id="reqFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-blue)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--color-blue)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="h"
            tick={{ fontSize: 9, fill: 'var(--rc-muted)' }}
            tickLine={false}
            axisLine={false}
            interval={5}
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'var(--rc-muted)' }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip contentStyle={TOOLTIP} labelStyle={{ color: 'var(--rc-muted)' }} />
          <Area
            type="monotone"
            dataKey="req"
            stroke="var(--color-blue)"
            strokeWidth={1.5}
            fill="url(#reqFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function LanguageDonut() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-32 w-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={languageUsage}
              dataKey="value"
              innerRadius={32}
              outerRadius={54}
              paddingAngle={2}
              stroke="none"
            >
              {languageUsage.map((e) => (
                <Cell key={e.name} fill={e.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP} formatter={(v, n) => [`${v}%`, String(n)]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="min-w-0 flex-1 space-y-1">
        {languageUsage.map((l) => (
          <li key={l.name} className="flex items-center gap-2 text-[11.5px]">
            <span className="size-2 shrink-0 rounded-[2px]" style={{ background: l.color }} />
            <span className="truncate text-fg2">{l.name}</span>
            <span className="num ml-auto text-muted">{l.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
