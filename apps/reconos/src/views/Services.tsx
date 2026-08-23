import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, View, ViewHeader } from '@/components/ui'
import { cx } from '@/lib/style'
import { services } from '@/data/skills'
import { iconByName } from '@/icons'

const ACCENTS = ['blue', 'green', 'purple', 'orange', 'yellow', 'red'] as const

export function Services() {
  return (
    <View>
      <ViewHeader
        title="Services"
        route="GET /api/v1/services"
        desc="What I take on, and what you actually get delivered. Fixed scope, written handover, no mystery."
        actions={
          <Link to="/contact">
            <Button variant="primary">Start a project</Button>
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {services.map((s, i) => {
          const Icon = iconByName(s.icon)
          const accent = `var(--color-${ACCENTS[i % ACCENTS.length]})`
          return (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className={cx(
                'group flex flex-col rounded-[10px] border border-line bg-panel p-3.5',
                'transition-[transform,box-shadow,border-color] duration-200 ease-[var(--ease-ui)]',
                'hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--rc-shadow)]',
              )}
              style={{ ['--hue' as string]: accent }}
            >
              <span
                className="mb-3 grid size-9 place-items-center rounded-[8px] transition-transform duration-200 group-hover:scale-105"
                style={{
                  color: accent,
                  background: `color-mix(in srgb, ${accent} 14%, transparent)`,
                  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 30%, transparent)`,
                }}
              >
                <Icon size={17} />
              </span>

              <h3 className="text-[14px] font-semibold text-fg">{s.title}</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">{s.blurb}</p>

              <ul className="mt-3 space-y-1.5 border-t border-line-soft pt-3">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[11.5px] text-fg2">
                    <Check size={12} className="mt-0.5 shrink-0" style={{ color: accent }} />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.article>
          )
        })}
      </div>
    </View>
  )
}
