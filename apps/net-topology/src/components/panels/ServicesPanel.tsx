import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { services } from '../../data/services'
import { MethodBadge, SectionTitle, StatusPill, Tag } from '../ui/primitives'
import { cn } from '../../utils/cn'

/** API gateway — services listed as routes. */
export function ServicesPanel() {
  const [open, setOpen] = useState<string | null>(services[0].path)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill label="gateway up" tone="ok" pulse />
        <StatusPill label={`${services.length} routes`} tone="purple" dot={false} />
        <StatusPill label="rate limit 60/min" tone="muted" dot={false} />
      </div>

      <div>
        <SectionTitle hint="expand a route">Routes</SectionTitle>
        <div className="space-y-2">
          {services.map((service) => {
            const expanded = open === service.path
            return (
              <div
                key={service.path}
                className={cn(
                  'overflow-hidden rounded-lg border transition-colors',
                  expanded ? 'border-accent/50 bg-panel' : 'bg-bg-2/60 hover:border-accent/35',
                )}
              >
                <button
                  onClick={() => setOpen(expanded ? null : service.path)}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
                  aria-expanded={expanded}
                >
                  <MethodBadge method={service.method} />
                  <span className="flex-1 truncate font-mono text-[11.5px] text-ink">
                    {service.path}
                  </span>
                  <span className="font-mono text-[10px] text-muted">{service.latency}</span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      'text-muted transition-transform duration-200',
                      expanded && 'rotate-180 text-accent',
                    )}
                  />
                </button>

                {expanded && (
                  <div className="anim-rise border-t border-line/60 px-3 py-3">
                    <h4 className="font-display text-[13px] font-semibold text-ink">
                      {service.name}
                    </h4>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                      {service.description}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {service.deliverables.map((d) => (
                        <Tag key={d}>{d}</Tag>
                      ))}
                    </div>
                    <div className="mt-3 rounded border border-line/60 bg-bg/60 p-2 font-mono text-[10.5px]">
                      <div className="text-muted">
                        <span className="text-ok">200</span> OK · content-type: application/json
                      </div>
                      <div className="mt-1 text-muted">
                        {'{ "service": "'}
                        <span className="text-cyan">{service.name}</span>
                        {'", "available": '}
                        <span className="text-ok">true</span>
                        {' }'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
