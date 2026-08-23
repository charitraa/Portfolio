import { learningTracks, methodologies } from '@/data/portfolio'
import { Chip, Meter, Scroll, StatusBar, Toolbar } from '@/os/ui'
import type { AppWindowProps } from '@/os/types'

/**
 * Station 07. What is being learned and roughly how far through it is. The
 * meter here is honest in a way a skill percentage is not: it measures
 * progress through a defined body of material, not ability.
 */
export default function Knowledge(_: AppWindowProps) {
  const started = learningTracks.filter((t) => t.progress > 0).length

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[13px] font-semibold">Knowledge</span>
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          Station 07 · {learningTracks.length} tracks
        </span>
      </Toolbar>

      <Scroll className="p-5">
        <section>
          <h3 className="mb-3 text-[10.5px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-dim)' }}>
            Current tracks
          </h3>
          <div className="space-y-2.5">
            {learningTracks.map((t) => (
              <article
                key={t.id}
                className="rounded-xl p-4"
                style={{ background: 'color-mix(in oklab, var(--text) 5%, transparent)' }}
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <h4 className="text-[13.5px] font-semibold">{t.name}</h4>
                  <Chip tone={t.status === 'In progress' ? 'accent' : 'neutral'}>{t.status}</Chip>
                  <span className="ml-auto text-[11px]" style={{ color: 'var(--text-dim)' }}>
                    {t.provider}
                  </span>
                </div>

                <p className="selectable mt-1.5 text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  {t.summary}
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <Meter value={t.progress} height={5} />
                  <span className="w-20 shrink-0 text-right font-mono text-[10.5px]" style={{ color: 'var(--text-dim)' }}>
                    {t.progress > 0 ? `${t.progress}% read` : 'not set'}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {t.topics.map((topic) => (
                    <Chip key={topic}>{topic}</Chip>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="mb-3 text-[10.5px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-dim)' }}>
            Methodologies referenced
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {methodologies.map((m) => (
              <div
                key={m.name}
                className="rounded-xl p-3"
                style={{ background: 'color-mix(in oklab, var(--text) 5%, transparent)' }}
              >
                <div className="text-[12.5px] font-semibold">{m.name}</div>
                <p className="selectable mt-0.5 text-[11.5px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  {m.note}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            Referenced, not certified against — these are how the lab work is organised, and nothing more is claimed.
          </p>
        </section>
      </Scroll>

      <StatusBar>
        <span>
          {started} of {learningTracks.length} tracks with progress recorded
        </span>
        <span className="ml-auto">Self-assessed · not a credential</span>
      </StatusBar>
    </div>
  )
}
