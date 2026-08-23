import { useState } from 'react'
import { ShieldCheck, ShieldX } from 'lucide-react'
import { deniedRules, skills } from '../../data/skills'
import type { Skill } from '../../data/types'
import { Meter, SectionTitle, StatusPill } from '../ui/primitives'
import { cn } from '../../utils/cn'

const groups: Array<{ id: Skill['group'] | 'all'; label: string }> = [
  { id: 'all', label: 'ALL' },
  { id: 'frontend', label: 'FRONTEND' },
  { id: 'backend', label: 'BACKEND' },
  { id: 'mobile', label: 'MOBILE' },
  { id: 'infra', label: 'INFRA' },
  { id: 'tooling', label: 'TOOLING' },
]

/** Firewall — skills as ALLOW rules with bandwidth bars. */
export function SkillsPanel() {
  const [group, setGroup] = useState<Skill['group'] | 'all'>('all')
  const visible = group === 'all' ? skills : skills.filter((s) => s.group === group)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill label="secured" tone="ok" />
        <StatusPill label={`${skills.length} allow rules`} tone="accent" dot={false} />
        <StatusPill label={`${deniedRules.length} deny`} tone="err" dot={false} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setGroup(g.id)}
            className={cn(
              'rounded border px-2 py-1 font-mono text-[10px] tracking-wider transition-colors',
              group === g.id
                ? 'border-accent/60 bg-accent/15 text-accent'
                : 'bg-bg-2/60 text-muted hover:border-accent/40 hover:text-ink',
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div>
        <SectionTitle hint="chain: INPUT">Allowed</SectionTitle>
        <div className="space-y-3">
          {visible.map((skill) => (
            <div key={skill.name} className="group">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-ok" />
                  <span className="font-display text-[13px] font-semibold text-ink">
                    {skill.name}
                  </span>
                  <span className="font-mono text-[10px] text-muted opacity-0 transition-opacity group-hover:opacity-100">
                    {skill.port}
                  </span>
                </div>
                <span className="font-num text-[12px] text-muted">{skill.level}%</span>
              </div>
              <div className="mt-1.5">
                <Meter value={skill.level} label={skill.name} />
              </div>
              <p className="mt-1 max-h-0 overflow-hidden font-mono text-[10px] text-muted transition-all duration-300 group-hover:max-h-8">
                ACCEPT — {skill.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle hint="chain: DROP">Denied</SectionTitle>
        <div className="space-y-2">
          {deniedRules.map((rule) => (
            <div
              key={rule.name}
              className="flex items-center justify-between rounded border border-err/25 bg-err/5 px-2.5 py-1.5"
            >
              <span className="flex items-center gap-2 text-[12px] text-ink">
                <ShieldX size={13} className="text-err" />
                {rule.name}
              </span>
              <span className="font-mono text-[10px] text-muted">{rule.reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
