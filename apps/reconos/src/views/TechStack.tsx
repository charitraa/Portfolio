import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Badge, Panel, View, ViewHeader } from '@/components/ui'
import { cx } from '@/lib/style'
import { stackCategories } from '@/data/skills'
import { iconByName } from '@/icons'

const ACCENTS = ['blue', 'green', 'purple', 'orange', 'yellow', 'red', 'blue', 'purple'] as const

export function TechStack() {
  const [openId, setOpenId] = useState<string | null>('frontend')

  return (
    <View>
      <ViewHeader
        title="Tech Stack"
        route="GET /api/v1/stack"
        desc="Grouped by layer. Click a category to expand it — these are tools I have shipped with, not a list I copied from a roadmap."
        actions={
          <Badge color="blue">
            {stackCategories.reduce((n, c) => n + c.items.length, 0)} technologies
          </Badge>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stackCategories.map((cat, i) => {
          const Icon = iconByName(cat.icon)
          const accent = `var(--color-${ACCENTS[i % ACCENTS.length]})`
          const open = openId === cat.id
          return (
            <motion.div
              key={cat.id}
              layout
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={cx(
                'overflow-hidden rounded-[10px] border bg-panel',
                open ? 'border-blue/50' : 'border-line',
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : cat.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-2.5 p-3 text-left transition-colors duration-150 hover:bg-hover"
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-[8px]"
                  style={{
                    color: accent,
                    background: `color-mix(in srgb, ${accent} 14%, transparent)`,
                  }}
                >
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-fg">
                    {cat.name}
                  </span>
                  <span className="block truncate font-mono text-[10.5px] text-muted">
                    {cat.items.length} items
                  </span>
                </span>
                <ChevronRight
                  size={14}
                  className={cx(
                    'shrink-0 text-muted transition-transform duration-200',
                    open && 'rotate-90',
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-line-soft p-3">
                      <p className="mb-2.5 text-[11.5px] text-muted">{cat.blurb}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map((item) => (
                          <span
                            key={item}
                            className="rounded border border-line bg-bg2 px-2 py-1 font-mono text-[11px] text-fg2 transition-[transform,color,border-color] duration-150 hover:-translate-y-0.5"
                            style={{ ['--tw-border-opacity' as string]: 1 }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = accent
                              e.currentTarget.style.color = accent
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = ''
                              e.currentTarget.style.color = ''
                            }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <Panel title="How I choose" className="mt-3">
        <div className="grid gap-4 text-[12.5px] leading-relaxed text-fg2 md:grid-cols-3">
          <p>
            <span className="font-semibold text-fg">Boring by default.</span> A tool earns its place
            by having good docs, an active maintainer, and an obvious exit path if it stops being
            maintained.
          </p>
          <p>
            <span className="font-semibold text-fg">One new thing per project.</span> Learning a
            framework and a language and a deploy target at once is how deadlines slip.
          </p>
          <p>
            <span className="font-semibold text-fg">Measure before switching.</span> If I cannot
            show a benchmark for why the new thing is better, the old thing stays.
          </p>
        </div>
      </Panel>
    </View>
  )
}
