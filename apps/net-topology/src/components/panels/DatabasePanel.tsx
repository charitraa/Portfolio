import { useState } from 'react'
import { Award, BookOpen, ScrollText, Table2 } from 'lucide-react'
import { credentials, projectsPerYear } from '../../data/experience'
import { projects } from '../../data/projects'
import type { Credential } from '../../data/types'
import { BarChart, Heatmap } from '../charts/charts'
import { KeyValue, SectionTitle, StatusPill } from '../ui/primitives'
import { cn } from '../../utils/cn'

type TableName = 'education' | 'certificates' | 'awards' | 'projects'

const tabs: Array<{ id: TableName; label: string; rows: number }> = [
  { id: 'education', label: 'education', rows: credentials.filter((c) => c.kind === 'education').length },
  { id: 'certificates', label: 'certificates', rows: credentials.filter((c) => c.kind === 'certificate').length },
  { id: 'awards', label: 'awards', rows: credentials.filter((c) => c.kind === 'award').length },
  { id: 'projects', label: 'projects', rows: projects.length },
]

const kindIcon = {
  education: BookOpen,
  certificate: ScrollText,
  award: Award,
} as const

/** Database — education, certificates and achievements as tables. */
export function DatabasePanel() {
  const [table, setTable] = useState<TableName>('education')

  const rows: Credential[] =
    table === 'projects'
      ? projects.map((p) => ({
          kind: 'certificate' as const,
          title: p.name,
          issuer: p.stack.slice(0, 3).join(', '),
          year: p.year,
          detail: p.tagline,
        }))
      : credentials.filter((c) => c.kind === table.replace(/s$/, ''))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill label="connected" tone="ok" pulse />
        <StatusPill label="encrypted" tone="purple" dot={false} />
        <StatusPill label="postgres 16" tone="muted" dot={false} />
      </div>

      <div>
        <SectionTitle hint="\dt">Tables</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTable(t.id)}
              className={cn(
                'flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[10.5px] transition-colors',
                table === t.id
                  ? 'border-cyan/60 bg-cyan/15 text-cyan'
                  : 'bg-bg-2/60 text-muted hover:border-cyan/40 hover:text-ink',
              )}
            >
              <Table2 size={11} />
              {t.label}
              <span className="opacity-60">({t.rows})</span>
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-lg border bg-bg-2/50 p-2 font-mono text-[10.5px] text-muted">
          <span className="text-cyan">SELECT</span> * <span className="text-cyan">FROM</span>{' '}
          {table} <span className="text-cyan">ORDER BY</span> year <span className="text-cyan">DESC</span>;
        </div>

        <div className="mt-3 space-y-2">
          {rows.map((row) => {
            const Icon = kindIcon[row.kind]
            return (
              <div key={row.title} className="rounded-lg border bg-panel/60 p-3">
                <div className="flex items-start gap-2.5">
                  <Icon size={14} className="mt-0.5 shrink-0 text-cyan" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="font-display text-[13px] font-semibold text-ink">
                        {row.title}
                      </h4>
                      <span className="font-num text-[11px] whitespace-nowrap text-muted">
                        {row.year}
                      </span>
                    </div>
                    <div className="font-mono text-[10.5px] text-accent">{row.issuer}</div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{row.detail}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <SectionTitle hint="rows per year">Projects shipped</SectionTitle>
        <BarChart data={projectsPerYear} />
      </div>

      <div>
        <SectionTitle hint="last 26 weeks">Commit activity</SectionTitle>
        <Heatmap />
      </div>

      <div>
        <SectionTitle hint="pg_stat">Instance</SectionTitle>
        <KeyValue k="size" v="112 MB" />
        <KeyValue k="connections" v="3 / 100" />
        <KeyValue k="replication" v="streaming" tone="ok" />
        <KeyValue k="last backup" v="2 hours ago" tone="ok" />
      </div>
    </div>
  )
}
