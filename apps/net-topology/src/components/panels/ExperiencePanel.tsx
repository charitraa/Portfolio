import { timeline } from '../../data/experience'
import { KeyValue, SectionTitle, StatusPill, Tag } from '../ui/primitives'
import { useApp } from '../../store/AppState'

/** Application server — experience as a process timeline. */
export function ExperiencePanel() {
  const { telemetry } = useApp()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill label="running" tone="ok" pulse />
        <StatusPill label="pid 1" tone="muted" dot={false} />
      </div>

      <div>
        <SectionTitle hint="process">Runtime</SectionTitle>
        <KeyValue k="uptime" v="5 years" tone="ok" />
        <KeyValue k="cpu" v={`${telemetry.cpu}%`} />
        <KeyValue k="memory" v={`${telemetry.memory}%`} />
        <KeyValue k="workers" v="4" />
        <KeyValue k="restarts" v="0" tone="ok" />
      </div>

      <div>
        <SectionTitle hint="chronological">Timeline</SectionTitle>
        <ol className="relative space-y-5 border-l border-line/70 pl-5">
          {timeline.map((entry, i) => (
            <li key={entry.year} className="relative">
              <span
                className="absolute top-1 -left-[25px] grid h-3 w-3 place-items-center rounded-full border-2 border-bg"
                style={{
                  background: i === timeline.length - 1 ? 'var(--success)' : 'var(--accent)',
                }}
              />
              <div className="flex items-baseline gap-2">
                <span className="font-num text-[13px] font-semibold text-accent">{entry.year}</span>
                <span className="font-mono text-[10px] text-muted">{entry.org}</span>
              </div>
              <h4 className="font-display text-[13.5px] font-semibold text-ink">{entry.title}</h4>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{entry.detail}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
