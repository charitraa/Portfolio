import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Menu, Moon, PanelBottom, Radar, Search, Sun } from 'lucide-react'
import { useState } from 'react'
import { Github, Linkedin } from '@/components/BrandIcons'
import { profile } from '@/data/profile'
import { hhmmss, useClock, useSound } from '@/hooks'
import { useApp } from '@/store/app'
import { Kbd } from '@/components/ui'
import { cx } from '@/lib/style'

function IconButton({
  label,
  onClick,
  active,
  children,
  href,
}: {
  label: string
  onClick?: () => void
  active?: boolean
  children: React.ReactNode
  href?: string
}) {
  const cls = cx(
    'grid size-7 place-items-center rounded-md border border-transparent text-muted',
    'transition-colors duration-150 ease-[var(--ease-ui)] hover:bg-hover hover:text-fg',
    active && 'border-line bg-active text-fg',
  )
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" title={label} aria-label={label} className={cls}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={cls}>
      {children}
    </button>
  )
}

export function Toolbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const now = useClock()
  const { settings, set, setPalette, logs, clearLogs } = useApp()
  const [bellOpen, setBellOpen] = useState(false)
  const beep = useSound()

  const recent = logs.slice(-6).reverse()

  const toggleTheme = () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark'
    set('theme', next)
    beep('open')
  }

  return (
    <header className="relative z-40 flex h-11 shrink-0 items-center gap-2 border-b border-line bg-bg2 px-2 md:px-3">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
        className="grid size-7 place-items-center rounded-md text-muted hover:bg-hover hover:text-fg md:hidden"
      >
        <Menu size={15} />
      </button>

      {/* Brand */}
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-[6px] bg-blue/15 text-blue ring-1 ring-blue/30">
          <Radar size={14} />
        </span>
        <span className="font-mono text-[13px] font-bold tracking-tight text-fg">
          {profile.handle}
        </span>
        <span className="hidden font-mono text-[10px] text-muted sm:inline">v2.4.0</span>
      </div>

      <span className="mx-1 hidden h-4 w-px bg-line sm:block" />

      {/* Connection status */}
      <div className="hidden items-center gap-1.5 sm:flex">
        <span
          className="size-1.5 rounded-full bg-green"
          style={{ animation: 'rc-pulse-ring 2.4s ease-out infinite' }}
          aria-hidden
        />
        <span className="font-mono text-[11px] text-green">Online</span>
      </div>

      {/* Search / palette trigger */}
      <button
        type="button"
        onClick={() => setPalette(true)}
        className={cx(
          'group mx-auto flex h-7 w-full max-w-md items-center gap-2 rounded-md border border-line',
          'bg-bg px-2 text-left text-muted transition-colors duration-150 hover:border-blue/50 hover:text-fg2',
        )}
      >
        <Search size={13} />
        <span className="truncate text-[12px]">Search projects, skills, commands…</span>
        <span className="ml-auto hidden shrink-0 gap-1 sm:flex">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-0.5">
        <span className="num mr-1 hidden text-[12px] text-fg2 tabular-nums lg:inline">
          {hhmmss(now)}
        </span>

        <IconButton
          label={settings.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleTheme}
        >
          {settings.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </IconButton>

        <IconButton
          label="Toggle console"
          active={settings.consoleOpen}
          onClick={() => set('consoleOpen', !settings.consoleOpen)}
        >
          <PanelBottom size={15} />
        </IconButton>

        <div className="relative">
          <IconButton label="Notifications" active={bellOpen} onClick={() => setBellOpen((v) => !v)}>
            <Bell size={15} />
            {recent.length > 0 && (
              <span className="absolute top-1 right-1 size-1.5 rounded-full bg-orange" />
            )}
          </IconButton>

          <AnimatePresence>
            {bellOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-50 mt-1.5 w-72 overflow-hidden rounded-[10px] border border-line bg-panel shadow-[0_8px_24px_var(--rc-shadow)]"
                >
                  <div className="flex items-center border-b border-line-soft px-3 py-2">
                    <span className="text-[11px] font-semibold tracking-wide text-fg2 uppercase">
                      Notifications
                    </span>
                    <button
                      type="button"
                      onClick={clearLogs}
                      className="ml-auto font-mono text-[10px] text-muted hover:text-blue"
                    >
                      clear
                    </button>
                  </div>
                  <ul className="max-h-64 overflow-y-auto">
                    {recent.length === 0 && (
                      <li className="px-3 py-4 text-center font-mono text-[11px] text-muted">
                        No events yet.
                      </li>
                    )}
                    {recent.map((l) => (
                      <li
                        key={l.id}
                        className="flex gap-2 border-b border-line-soft px-3 py-2 last:border-0"
                      >
                        <span className="num shrink-0 text-[10px] text-muted">
                          {new Date(l.at).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-[11px] text-fg2">{l.text}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <span className="mx-1 hidden h-4 w-px bg-line sm:block" />

        <IconButton label="GitHub" href={profile.socials.github}>
          <Github size={15} />
        </IconButton>
        <IconButton label="LinkedIn" href={profile.socials.linkedin}>
          <Linkedin size={15} />
        </IconButton>
      </div>
    </header>
  )
}
