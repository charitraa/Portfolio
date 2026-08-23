import { motion } from 'framer-motion'
import { Flag, Mic, Trophy } from 'lucide-react'
import { Github } from '@/components/BrandIcons'
import { Badge, Empty, Panel, View, ViewHeader } from '@/components/ui'
import { achievements } from '@/data/skills'
import type { Achievement } from '@/data/types'

type IconComponent = React.ComponentType<{ size?: number; className?: string }>

const KIND: Record<Achievement['kind'], { icon: IconComponent; color: string; label: string }> = {
  award: { icon: Trophy, color: 'var(--color-yellow)', label: 'Award' },
  ctf: { icon: Flag, color: 'var(--color-red)', label: 'CTF' },
  oss: { icon: Github, color: 'var(--color-green)', label: 'Open Source' },
  talk: { icon: Mic, color: 'var(--color-purple)', label: 'Speaking' },
}

export function Achievements() {
  return (
    <View>
      <ViewHeader
        title="Achievements"
        route="GET /api/v1/achievements"
        desc="Competitions, disclosures and the occasional trophy."
        actions={<Badge color="yellow">{achievements.length} entries</Badge>}
      />

      {achievements.length === 0 && (
        <Panel bodyClass="p-0">
          <Empty>
            <div className="text-red">HTTP/1.1 204 No Content</div>
            <div className="mt-2 text-muted">
              No entries yet — add awards, competitions, talks or disclosures in{' '}
              <span className="text-blue">src/data/skills.ts</span>
            </div>
          </Empty>
        </Panel>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {achievements.map((a, i) => {
          const meta = KIND[a.kind]
          return (
            <motion.article
              key={a.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-[10px] border border-line bg-panel p-3.5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--rc-shadow)]"
            >
              <div className="flex items-start gap-3">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-[8px]"
                  style={{
                    color: meta.color,
                    background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
                  }}
                >
                  <meta.icon size={17} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[13.5px] leading-snug font-semibold text-fg">{a.title}</h3>
                  <div className="num mt-0.5 text-[10.5px] text-muted">{a.date}</div>
                </div>
              </div>
              <p className="mt-2.5 text-[12px] leading-relaxed text-muted">{a.detail}</p>
              <div
                className="mt-3 inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px]"
                style={{
                  color: meta.color,
                  borderColor: `color-mix(in srgb, ${meta.color} 35%, transparent)`,
                }}
              >
                {meta.label}
              </div>
            </motion.article>
          )
        })}
      </div>
    </View>
  )
}
