import { AnimatePresence, motion } from 'framer-motion'
import { CornerDownLeft, FolderGit2, Search, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NAV } from '@/nav'
import { projects } from '@/data/projects'
import { profile } from '@/data/profile'
import { useSound } from '@/hooks'
import { useApp } from '@/store/app'
import { Kbd } from '@/components/ui'
import { cx } from '@/lib/style'

interface Command {
  id: string
  label: string
  hint?: string
  group: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  run: () => void
}

export function CommandPalette() {
  const open = useApp((s) => s.paletteOpen)
  const setOpen = useApp((s) => s.setPalette)
  const set = useApp((s) => s.set)
  const settings = useApp((s) => s.settings)
  const log = useApp((s) => s.log)
  const navigate = useNavigate()
  const beep = useSound()

  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const commands = useMemo<Command[]>(() => {
    const go = (path: string, title: string) => () => {
      navigate(path)
      log(`Navigated to ${title}`, 'info')
    }
    return [
      ...NAV.map((n) => ({
        id: `nav:${n.path}`,
        label: n.title,
        hint: n.hint,
        group: 'Go to',
        icon: n.icon,
        run: go(n.path, n.title),
      })),
      ...projects.map((p) => ({
        id: `proj:${p.id}`,
        label: p.name,
        hint: p.tagline,
        group: 'Projects',
        icon: FolderGit2,
        run: go(`/projects/${p.id}`, p.name),
      })),
      {
        id: 'act:theme',
        label: `Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} theme`,
        group: 'Actions',
        icon: Sparkles,
        run: () => set('theme', settings.theme === 'dark' ? 'light' : 'dark'),
      },
      {
        id: 'act:console',
        label: settings.consoleOpen ? 'Hide console' : 'Show console',
        group: 'Actions',
        icon: Sparkles,
        run: () => set('consoleOpen', !settings.consoleOpen),
      },
      {
        id: 'act:sound',
        label: settings.sound ? 'Disable interface sound' : 'Enable interface sound',
        group: 'Actions',
        icon: Sparkles,
        run: () => set('sound', !settings.sound),
      },
      {
        id: 'act:resume',
        label: 'Download resume',
        hint: profile.resume.file,
        group: 'Actions',
        icon: Sparkles,
        run: () => {
          navigate('/resume')
          log('Resume view opened', 'ok')
        },
      },
      {
        id: 'act:email',
        label: 'Copy email address',
        hint: profile.email,
        group: 'Actions',
        icon: Sparkles,
        run: () => {
          void navigator.clipboard?.writeText(profile.email)
          log(`Copied ${profile.email} to clipboard`, 'ok')
        },
      },
      {
        id: 'act:github',
        label: 'Open GitHub profile',
        group: 'Actions',
        icon: Sparkles,
        run: () => window.open(profile.socials.github, '_blank', 'noopener'),
      },
    ]
  }, [navigate, log, set, settings])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) =>
      `${c.label} ${c.hint ?? ''} ${c.group}`.toLowerCase().includes(q),
    )
  }, [commands, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      // Focus after the entrance animation has begun, so it does not jump.
      const id = setTimeout(() => inputRef.current?.focus(), 20)
      return () => clearTimeout(id)
    }
  }, [open])

  useEffect(() => setCursor(0), [query])

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  if (!open) return null

  const commit = (cmd?: Command) => {
    const target = cmd ?? results[cursor]
    if (!target) return
    target.run()
    beep('open')
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => (c + 1) % Math.max(1, results.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => (c - 1 + results.length) % Math.max(1, results.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  let lastGroup = ''

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
        role="presentation"
      >
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className="flex w-full max-w-xl flex-col overflow-hidden rounded-[10px] border border-line bg-panel shadow-[0_20px_60px_var(--rc-shadow)]"
        >
          <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
            <Search size={15} className="shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search views, projects and actions…"
              spellCheck={false}
              className="w-full bg-transparent text-[13px] text-fg outline-none placeholder:text-muted"
            />
            <Kbd>Esc</Kbd>
          </div>

          <ul ref={listRef} className="scroll-y max-h-80 py-1">
            {results.length === 0 && (
              <li className="px-3 py-6 text-center font-mono text-[11px] text-muted">
                No matches for “{query}”
              </li>
            )}
            {results.map((cmd, i) => {
              const header = cmd.group !== lastGroup ? cmd.group : null
              lastGroup = cmd.group
              const active = i === cursor
              return (
                <li key={cmd.id}>
                  {header && (
                    <div className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-widest text-muted uppercase">
                      {header}
                    </div>
                  )}
                  <button
                    type="button"
                    data-active={active}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => commit(cmd)}
                    className={cx(
                      'flex w-full items-center gap-2.5 px-3 py-1.5 text-left',
                      active ? 'bg-blue/15 text-fg' : 'text-fg2 hover:bg-hover',
                    )}
                  >
                    <cmd.icon size={14} className={active ? 'text-blue' : 'text-muted'} />
                    <span className="shrink-0 text-[12.5px]">{cmd.label}</span>
                    {cmd.hint && (
                      <span className="truncate font-mono text-[10.5px] text-muted">
                        {cmd.hint}
                      </span>
                    )}
                    {active && <CornerDownLeft size={12} className="ml-auto text-muted" />}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-3 border-t border-line px-3 py-1.5 font-mono text-[10px] text-muted">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd> select
            </span>
            <span className="ml-auto">{results.length} results</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
