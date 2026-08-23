import { useEffect, useState } from 'react'
import { Github, Linkedin, Menu, Palette, Search } from 'lucide-react'
import { profile } from '../../data/profile'
import { useApp, type ThemeName } from '../../store/AppState'
import { formatClock } from '../../utils/cn'

const themeOrder: ThemeName[] = ['noc', 'cloud', 'blueprint']

export function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { setPaletteOpen, theme, setTheme, telemetry } = useApp()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-bg-2/80 px-3 backdrop-blur-md sm:px-4">
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
        className="grid h-8 w-8 place-items-center rounded-md border text-muted transition-colors hover:border-accent/50 hover:text-accent md:hidden"
      >
        <Menu size={15} />
      </button>

      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md border border-accent/40 bg-accent/10">
          <span className="anim-pulse h-2 w-2 rounded-full bg-accent" />
        </span>
        <span className="font-mono text-[13px] font-bold tracking-tight text-ink">
          NET<span className="text-accent">://</span>CHARITRA
        </span>
      </div>

      <button
        onClick={() => setPaletteOpen(true)}
        className="mx-auto hidden max-w-md flex-1 items-center gap-2 rounded-lg border bg-bg/60 px-3 py-1.5 text-left transition-colors hover:border-accent/50 sm:flex"
      >
        <Search size={13} className="text-muted" />
        <span className="flex-1 font-mono text-[11px] text-muted">Search node…</span>
        <kbd className="rounded border bg-bg-2 px-1.5 py-0.5 font-mono text-[9.5px] text-muted">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setPaletteOpen(true)}
          aria-label="Search nodes"
          className="grid h-8 w-8 place-items-center rounded-md border text-muted transition-colors hover:border-accent/50 hover:text-accent sm:hidden"
        >
          <Search size={14} />
        </button>

        <span className="hidden items-center gap-1.5 font-mono text-[10.5px] tracking-wider text-ok lg:flex">
          <span className="anim-blink h-1.5 w-1.5 rounded-full bg-ok" />
          ONLINE
          <span className="text-muted">· {telemetry.ping}ms</span>
        </span>

        <a
          href={profile.socials.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="grid h-8 w-8 place-items-center rounded-md border text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          <Github size={14} />
        </a>
        <a
          href={profile.socials.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          className="grid h-8 w-8 place-items-center rounded-md border text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          <Linkedin size={14} />
        </a>
        <button
          onClick={() => setTheme(themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length])}
          aria-label="Switch theme"
          title={`Theme: ${theme}`}
          className="grid h-8 w-8 place-items-center rounded-md border text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          <Palette size={14} />
        </button>

        <span className="hidden font-mono text-[11px] tabular-nums text-muted md:block">
          {formatClock(now)}
        </span>
      </div>
    </header>
  )
}
