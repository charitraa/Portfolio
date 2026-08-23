import { motion } from 'framer-motion'
import { Briefcase, MapPin } from 'lucide-react'
import { Badge, Panel, View, ViewHeader } from '@/components/ui'
import { experience } from '@/data/skills'

export function Experience() {
  return (
    <View>
      <ViewHeader
        title="Experience"
        route="GET /api/v1/experience"
        desc="Roles in reverse chronological order, with outcomes rather than responsibilities."
      />

      <Panel bodyClass="p-4 sm:p-5">
        <ol className="relative ml-1 border-l border-line">
          {experience.map((item, i) => (
            <motion.li
              key={`${item.org}-${item.period}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06 }}
              className="relative mb-7 pl-6 last:mb-0"
            >
              <span
                className="absolute top-1 -left-[6.5px] size-3 rounded-full border-2 border-panel"
                style={{
                  background: item.current ? 'var(--color-green)' : 'var(--color-blue)',
                  animation: item.current ? 'rc-pulse-ring 2.4s ease-out infinite' : undefined,
                }}
              />

              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <h3 className="text-[14px] font-semibold text-fg">{item.role}</h3>
                {item.current && <Badge color="green" dot>current</Badge>}
              </div>

              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
                <span className="flex items-center gap-1 text-blue">
                  <Briefcase size={11} /> {item.org}
                </span>
                <span>{item.period}</span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {item.location}
                </span>
              </div>

              <ul className="mt-2.5 space-y-1.5">
                {item.points.map((p) => (
                  <li key={p} className="flex gap-2.5 text-[12.5px] leading-relaxed text-fg2">
                    <span className="mt-[7px] size-1 shrink-0 rounded-full bg-muted" />
                    {p}
                  </li>
                ))}
              </ul>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </motion.li>
          ))}
        </ol>
      </Panel>
    </View>
  )
}
