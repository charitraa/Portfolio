import { useState } from 'react'
import { DEPTH_LABEL, DEPTH_TONE, owaspTop10 } from '@/data/portfolio'
import { Chip, Scroll, StatusBar, Toolbar } from '@/os/ui'
import type { AppWindowProps } from '@/os/types'

/**
 * Station 03. The OWASP Top 10 as a working reference rather than a poster:
 * for each class, how you look for it and what actually fixes it. Split view —
 * the list stays navigable while one entry is expanded.
 */
export default function WebSecurity(_: AppWindowProps) {
  const [openId, setOpenId] = useState<string | null>(owaspTop10[0].id)

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[13px] font-semibold">Web Security</span>
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          Station 03 · OWASP Top 10 (2021)
        </span>
      </Toolbar>

      <Scroll className="p-4">
        <p className="selectable mb-4 max-w-2xl text-[12.5px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          The categories most web findings get reported in. Each one lists how the class is tested for and the control
          that removes it — the depth badge says how far I have personally taken it.
        </p>

        <div className="space-y-1.5">
          {owaspTop10.map((v) => {
            const open = openId === v.id
            return (
              <article
                key={v.id}
                className="overflow-hidden rounded-xl"
                style={{ background: 'color-mix(in oklab, var(--text) 5%, transparent)' }}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : v.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors"
                  style={{ background: open ? 'var(--accent-soft)' : 'transparent' }}
                >
                  <span
                    className="shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold"
                    style={{ background: 'color-mix(in oklab, #000 30%, transparent)', color: 'var(--accent)' }}
                  >
                    {v.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{v.name}</span>
                    <span className="block truncate text-[11.5px]" style={{ color: 'var(--text-dim)' }}>
                      {v.summary}
                    </span>
                  </span>
                  <Chip tone={DEPTH_TONE[v.depth]}>{DEPTH_LABEL[v.depth]}</Chip>
                  <span
                    className="shrink-0 text-[11px] transition-transform"
                    style={{ color: 'var(--text-dim)', transform: open ? 'rotate(90deg)' : 'none' }}
                  >
                    ▸
                  </span>
                </button>

                {open && (
                  <div className="selectable grid gap-3 px-3.5 pt-1 pb-4 sm:grid-cols-2">
                    <div>
                      <h4 className="mb-1 text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ color: '#f59e0b' }}>
                        How it is tested
                      </h4>
                      <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                        {v.test}
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-1 text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ color: '#34d399' }}>
                        What removes it
                      </h4>
                      <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                        {v.defence}
                      </p>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </Scroll>

      <StatusBar>
        <span>{owaspTop10.length} categories</span>
        <span className="ml-auto">Reference · OWASP Top 10 2021</span>
      </StatusBar>
    </div>
  )
}
