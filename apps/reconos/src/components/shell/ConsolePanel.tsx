import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Trash2, TerminalSquare } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NAV } from '@/nav'
import { profile } from '@/data/profile'
import { projects } from '@/data/projects'
import { useSound } from '@/hooks'
import { useApp, type LogKind } from '@/store/app'
import { cx } from '@/lib/style'

const KIND_COLOR: Record<LogKind, string> = {
  info: 'text-fg2',
  ok: 'text-green',
  warn: 'text-yellow',
  error: 'text-red',
  cmd: 'text-blue',
}

const KIND_TAG: Record<LogKind, string> = {
  info: 'INFO',
  ok: ' OK ',
  warn: 'WARN',
  error: 'FAIL',
  cmd: 'CMD ',
}

const MIN_H = 120
const MAX_H = 460

export function ConsolePanel() {
  const open = useApp((s) => s.settings.consoleOpen)
  const set = useApp((s) => s.set)
  const logs = useApp((s) => s.logs)
  const log = useApp((s) => s.log)
  const clearLogs = useApp((s) => s.clearLogs)
  const navigate = useNavigate()
  const beep = useSound()

  const [height, setHeight] = useState(176)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const bodyRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  // Keep the newest line in view as output streams in.
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [logs, open, height])

  const onDragStart = useCallback(() => {
    dragging.current = true
    document.body.style.cursor = 'ns-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const next = window.innerHeight - e.clientY - 22
      setHeight(Math.min(MAX_H, Math.max(MIN_H, next)))
    }
    const onUp = () => {
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const run = (raw: string) => {
    const cmd = raw.trim()
    if (!cmd) return
    log(`$ ${cmd}`, 'cmd')
    setHistory((h) => [...h, cmd])
    setHistIdx(-1)

    const [verb, ...rest] = cmd.toLowerCase().split(/\s+/)
    const arg = rest.join(' ')

    switch (verb) {
      case 'help':
        log('Commands: help, ls, open <view>, whoami, projects, scan, clear, contact, theme', 'info')
        break
      case 'ls':
        log(NAV.map((n) => n.path.slice(1)).join('  '), 'info')
        break
      case 'open': {
        const target = NAV.find(
          (n) => n.path.slice(1) === arg || n.title.toLowerCase() === arg,
        )
        if (target) {
          navigate(target.path)
          log(`Opening ${target.title}…`, 'ok')
        } else {
          log(`open: no such view: ${arg || '<empty>'}`, 'error')
        }
        break
      }
      case 'whoami':
        log(`${profile.name} — ${profile.role}`, 'ok')
        break
      case 'projects':
        projects.forEach((p) =>
          log(`${p.name.padEnd(16)} ${p.status.padEnd(12)} ${p.language}`, 'info'),
        )
        break
      case 'scan':
        navigate('/target')
        log('Launching surface scan…', 'ok')
        break
      case 'contact':
        navigate('/contact')
        log('Opening contact form.', 'ok')
        break
      case 'theme': {
        const el = document.documentElement
        const next = el.dataset.theme === 'dark' ? 'light' : 'dark'
        set('theme', next)
        log(`Theme set to ${next}.`, 'ok')
        break
      }
      case 'clear':
        clearLogs()
        break
      default:
        log(`command not found: ${verb}  (try 'help')`, 'error')
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input)
      setInput('')
      beep('ok')
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1)
      if (history[idx] !== undefined) {
        setHistIdx(idx)
        setInput(history[idx])
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx === -1) return
      const idx = histIdx + 1
      if (idx >= history.length) {
        setHistIdx(-1)
        setInput('')
      } else {
        setHistIdx(idx)
        setInput(history[idx])
      }
    }
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.section
          initial={{ height: 0, opacity: 0 }}
          animate={{ height, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          // Hidden on phones, where the bottom nav owns that strip of screen.
          className="relative hidden shrink-0 flex-col border-t border-line bg-bg2 md:flex"
          aria-label="Console"
        >
          {/* Resize handle */}
          <div
            onMouseDown={onDragStart}
            className="absolute inset-x-0 -top-0.5 z-10 hidden h-1 cursor-ns-resize hover:bg-blue/60 md:block"
            role="separator"
            aria-orientation="horizontal"
          />

          <header className="flex h-7 shrink-0 items-center gap-2 border-b border-line-soft px-3">
            <TerminalSquare size={13} className="text-muted" />
            <span className="text-[11px] font-semibold tracking-wide text-fg2 uppercase">
              Console
            </span>
            <span className="num text-[10px] text-muted">{logs.length} lines</span>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={clearLogs}
                title="Clear console"
                className="grid size-5 place-items-center rounded text-muted hover:bg-hover hover:text-fg"
              >
                <Trash2 size={12} />
              </button>
              <button
                type="button"
                onClick={() => set('consoleOpen', false)}
                title="Hide console"
                className="grid size-5 place-items-center rounded text-muted hover:bg-hover hover:text-fg"
              >
                <ChevronDown size={13} />
              </button>
            </div>
          </header>

          <div ref={bodyRef} className="scroll-y flex-1 px-3 py-1.5 font-mono text-[11.5px] leading-[1.65]">
            {logs.map((l) => (
              <div key={l.id} className="flex gap-2">
                <span className="num shrink-0 text-muted">
                  {new Date(l.at).toLocaleTimeString('en-GB', { hour12: false })}
                </span>
                <span className={cx('shrink-0 opacity-80', KIND_COLOR[l.kind])}>
                  [{KIND_TAG[l.kind]}]
                </span>
                <span className={cx('break-all whitespace-pre-wrap', KIND_COLOR[l.kind])}>
                  {l.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex h-7 shrink-0 items-center gap-2 border-t border-line-soft px-3">
            <span className="shrink-0 font-mono text-[11.5px] text-green">
              visitor@reconos:~$
            </span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              placeholder="type 'help'"
              aria-label="Console input"
              className="w-full min-w-0 bg-transparent font-mono text-[11.5px] text-fg outline-none placeholder:text-muted/60"
            />
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
