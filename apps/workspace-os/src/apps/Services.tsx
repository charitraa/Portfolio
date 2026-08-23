import { useState } from 'react'
import { services, servicesNote, skills, type Service } from '@/data/portfolio'
import { Chip, Scroll, StatusBar, Toolbar } from '@/os/ui'
import { launchApp } from '@/os/launch'
import type { AppWindowProps } from '@/os/types'

/**
 * What you can be hired for, as a service catalogue.
 *
 * Each entry lists the stack it draws on by skill id, and those are resolved
 * against `skills` at render — so a service cannot quietly advertise something
 * that is not in the package manager next door.
 */
export default function Services(_: AppWindowProps) {
  const [openId, setOpenId] = useState<string | null>(services[0]?.id ?? null)

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[13px] font-semibold">Services</span>
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {services.length} available
        </span>
      </Toolbar>

      <Scroll className="p-4">
        <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} open={openId === s.id} onToggle={() => setOpenId(openId === s.id ? null : s.id)} />
          ))}
        </div>

        <p
          className="selectable mt-4 rounded-xl px-3.5 py-3 text-[11.5px] leading-relaxed"
          style={{ background: 'color-mix(in oklab, var(--text) 5%, transparent)', color: 'var(--text-dim)' }}
        >
          {servicesNote}
        </p>

        <button
          type="button"
          onClick={() => launchApp('contact')}
          className="mt-3 rounded-xl px-4 py-2.5 text-[12.5px] font-medium transition-transform hover:scale-[1.02]"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Get in touch →
        </button>
      </Scroll>

      <StatusBar>
        <span>Capability, not a client list</span>
      </StatusBar>
    </div>
  )
}

function ServiceCard({ service, open, onToggle }: { service: Service; open: boolean; onToggle: () => void }) {
  // Only advertise stack that is actually installed next door.
  const stack = service.stack.map((id) => skills.find((s) => s.name === id)).filter(Boolean)

  return (
    <article
      className="rounded-2xl p-4"
      style={{
        background: 'color-mix(in oklab, var(--text) 5%, transparent)',
        boxShadow: `inset 0 0 0 1px var(--chrome-border), inset 0 2px 0 0 ${service.accent}`,
      }}
    >
      <header className="flex items-start gap-2.5">
        <span className="text-[20px] leading-none">{service.glyph}</span>
        <h3 className="min-w-0 flex-1 text-[13.5px] font-semibold tracking-tight">{service.name}</h3>
      </header>

      <p className="selectable mt-1.5 text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
        {service.summary}
      </p>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="mt-2.5 text-[11.5px] font-medium"
        style={{ color: service.accent }}
      >
        {open ? 'Less' : "What's involved"} {open ? '▴' : '▾'}
      </button>

      {open && (
        <>
          <ul className="selectable mt-2 space-y-1">
            {service.includes.map((i) => (
              <li key={i} className="flex gap-2 text-[12px]" style={{ color: 'var(--text-dim)' }}>
                <span style={{ color: service.accent }}>·</span>
                {i}
              </li>
            ))}
          </ul>
          {stack.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {stack.map((s) => (
                <Chip key={s!.name} title={s!.summary}>
                  {s!.name}
                </Chip>
              ))}
            </div>
          )}
        </>
      )}
    </article>
  )
}
