import { testimonials } from '@/data/portfolio'
import { Scroll, StatusBar, Toolbar } from '@/os/ui'
import { launchApp } from '@/os/launch'
import type { AppWindowProps } from '@/os/types'

/**
 * Testimonials — currently none, deliberately.
 *
 * The empty state is the feature. A made-up quote attributed to a named person
 * is the worst thing that can go on a portfolio, and there is no safe
 * placeholder version of one, so this app says "none yet" rather than showing
 * filler. Add real entries to `testimonials` in the data file and the list
 * replaces this automatically.
 */
export default function Testimonials(_: AppWindowProps) {
  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[13px] font-semibold">Testimonials</span>
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {testimonials.length === 0 ? 'none yet' : `${testimonials.length} collected`}
        </span>
      </Toolbar>

      <Scroll className="p-5">
        {testimonials.length === 0 ? (
          <div className="mx-auto max-w-md py-6 text-center">
            <div className="mb-3 text-4xl opacity-35">💬</div>
            <h2 className="text-[15px] font-semibold">No testimonials yet</h2>
            <p className="selectable mx-auto mt-2 text-[12.5px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              Nothing is shown here because nothing real has been collected yet. Inventing a quote and attributing it
              to a person would be worse than an empty page, so this stays empty until there is something to put in it.
            </p>

            <div
              className="selectable mt-5 rounded-xl px-4 py-3.5 text-left"
              style={{ background: 'color-mix(in oklab, var(--text) 5%, transparent)' }}
            >
              <h3 className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-dim)' }}>
                What a real one needs
              </h3>
              <ul className="mt-2 space-y-1 text-[12px]" style={{ color: 'var(--text-dim)' }}>
                <li>· The person's name, role and organisation</li>
                <li>· Their exact words, as they agreed them</li>
                <li>· How you actually worked together</li>
                <li>· Their permission to publish it</li>
              </ul>
              <p className="mt-2.5 text-[11.5px]" style={{ color: 'var(--text-dim)' }}>
                A public LinkedIn recommendation is the easiest kind to source, because a reader can go and check it.
              </p>
            </div>

            <button
              type="button"
              onClick={() => launchApp('projects')}
              className="mt-5 rounded-xl px-4 py-2.5 text-[12.5px] font-medium"
              style={{ background: 'color-mix(in oklab, var(--text) 10%, transparent)' }}
            >
              Look at the work instead →
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {testimonials.map((t) => (
              <figure
                key={t.id}
                className="rounded-2xl p-4"
                style={{ background: 'color-mix(in oklab, var(--text) 5%, transparent)' }}
              >
                <blockquote className="selectable text-[13px] leading-relaxed">“{t.quote}”</blockquote>
                <figcaption className="mt-2.5 text-[11.5px]" style={{ color: 'var(--text-dim)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>
                    {t.name}
                  </span>{' '}
                  — {t.role}, {t.org}
                  <span className="mt-0.5 block">{t.context}</span>
                  {t.source && (
                    <a href={t.source} target="_blank" rel="noreferrer noopener" style={{ color: 'var(--accent)' }}>
                      Source ↗
                    </a>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Scroll>

      <StatusBar>
        <span>Empty until something real exists</span>
      </StatusBar>
    </div>
  )
}
