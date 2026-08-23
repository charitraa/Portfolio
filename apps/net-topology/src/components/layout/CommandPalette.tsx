import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { AnimatePresence, motion as m } from 'framer-motion'
import { CornerDownLeft, Search } from 'lucide-react'
import { devices } from '../../data/topology'
import { projects } from '../../data/projects'
import { services } from '../../data/services'
import { useApp, type PanelId } from '../../store/AppState'
import type { NodeId } from '../../data/types'
import { cn } from '../../utils/cn'

interface Command {
  id: string
  label: string
  group: string
  hint: string
  run: () => void
}

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, select, focusNode, pushLog } = useApp()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const commands = useMemo<Command[]>(() => {
    const open = (id: PanelId) => () => {
      if (id === 'dashboard' || id === 'settings') select(id)
      else focusNode(id as NodeId)
      setPaletteOpen(false)
      pushLog(`palette: jumped to ${id}`, 'info')
    }

    return [
      { id: 'dashboard', label: 'Dashboard', group: 'Views', hint: 'overview', run: open('dashboard') },
      { id: 'settings', label: 'Settings', group: 'Views', hint: 'theme, motion', run: open('settings') },
      ...devices
        .filter((device) => device.data.id !== 'client')
        .map((device) => ({
          id: device.data.id,
          label: `${device.data.section} — ${device.data.hostname}`,
          group: 'Nodes',
          hint: device.data.kind.toLowerCase(),
          run: open(device.data.id),
        })),
      ...projects.map((project) => ({
        id: project.id,
        label: project.name,
        group: 'Projects',
        hint: project.host,
        run: open('balancer'),
      })),
      ...services.map((service) => ({
        id: service.path,
        label: service.name,
        group: 'Services',
        hint: `${service.method} ${service.path}`,
        run: open('gateway'),
      })),
    ]
  }, [select, focusNode, setPaletteOpen, pushLog])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q),
    )
  }, [commands, query])

  useEffect(() => {
    if (paletteOpen) {
      setQuery('')
      setActive(0)
      // Focus after the entry animation has begun.
      const id = window.setTimeout(() => inputRef.current?.focus(), 40)
      return () => window.clearTimeout(id)
    }
  }, [paletteOpen])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    const el = listRef.current?.children[active] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function onKeyDown(event: ReactKeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (i + 1) % Math.max(results.length, 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (i - 1 + results.length) % Math.max(results.length, 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      results[active]?.run()
    }
  }

  return (
    <AnimatePresence>
      {paletteOpen && (
        <m.div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={() => setPaletteOpen(false)}
          />

          <m.div
            initial={{ y: -12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-bg-2/95 shadow-2xl"
            role="dialog"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-2.5 border-b px-3.5 py-3">
              <Search size={15} className="text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search node, project or service…"
                className="flex-1 bg-transparent font-mono text-[12.5px] text-ink outline-none placeholder:text-muted/60"
                aria-label="Search"
              />
              <kbd className="rounded border bg-bg px-1.5 py-0.5 font-mono text-[9.5px] text-muted">
                esc
              </kbd>
            </div>

            <ul ref={listRef} className="max-h-[52vh] overflow-y-auto p-1.5">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center font-mono text-[11.5px] text-muted">
                  404 — no matching route
                </li>
              )}
              {results.map((command, i) => (
                <li key={`${command.group}-${command.id}`}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={command.run}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                      i === active ? 'bg-accent/15' : 'hover:bg-panel/70',
                    )}
                  >
                    <span
                      className={cn(
                        'w-[62px] shrink-0 font-mono text-[9px] tracking-wider uppercase',
                        i === active ? 'text-accent' : 'text-muted/60',
                      )}
                    >
                      {command.group}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[12.5px] font-medium text-ink">
                        {command.label}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-muted">
                        {command.hint}
                      </span>
                    </span>
                    {i === active && <CornerDownLeft size={13} className="shrink-0 text-accent" />}
                  </button>
                </li>
              ))}
            </ul>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
