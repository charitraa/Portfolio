import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { commands, complete, tokenize, type CmdCtx } from './commands'
import { HOME, prettyPath } from '@/store/fs'
import { owner } from '@/data/portfolio'
import { useWindows } from '@/store/windows'
import type { AppWindowProps } from '@/os/types'

interface Line {
  id: number
  node: ReactNode
}

const BANNER = (
  <div className="space-y-1">
    <pre className="whitespace-pre text-[11px] leading-[1.15]" style={{ color: 'var(--accent)' }}>
      {String.raw`   ___ _                _ _              ___  ___
  / __| |_  __ _ _ _(_) |_ _ _ __ _ / _ \/ __|
 | (__| ' \/ _` + '`' + ` | '_| |  _| '_/ _` + '`' + ` | (_) \\__ \\
  \___|_||_\__,_|_| |_|\__|_| \__,_|\___/|___/`}
    </pre>
    <div style={{ color: 'var(--text-dim)' }}>
      {owner.osName} {owner.osVersion} ({owner.osCodename}) · guest session
    </div>
    <div style={{ color: 'var(--text-dim)' }}>
      Type <span style={{ color: 'var(--accent)' }}>help</span> for commands,{' '}
      <span style={{ color: 'var(--accent)' }}>neofetch</span> for a look around, or{' '}
      <span style={{ color: 'var(--accent)' }}>projects</span> to get to the point.
    </div>
  </div>
)

export default function Terminal({ winId, props }: AppWindowProps) {
  const close = useWindows((s) => s.close)
  const setTitle = useWindows((s) => s.setTitle)

  const [cwd, setCwd] = useState<string>((props.cwd as string) ?? HOME)
  const [lines, setLines] = useState<Line[]>([{ id: 0, node: BANNER }])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [completions, setCompletions] = useState<string[]>([])

  const seq = useRef(1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const push = useCallback((node: ReactNode) => {
    setLines((ls) => [...ls, { id: seq.current++, node }])
  }, [])

  useEffect(() => {
    setTitle(winId, `${owner.username}@${owner.hostname}: ${prettyPath(cwd)}`)
  }, [cwd, setTitle, winId])

  // Keep the prompt pinned to the bottom as output arrives.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const run = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      const promptEcho = (
        <div className="flex gap-2">
          <Prompt cwd={cwd} />
          <span className="min-w-0 break-all">{raw}</span>
        </div>
      )
      push(promptEcho)
      setCompletions([])

      if (!trimmed) return

      setHistory((h) => (h[h.length - 1] === trimmed ? h : [...h, trimmed]))
      setHistoryIdx(-1)

      const parts = tokenize(trimmed)
      const name = parts[0]
      const cmd = commands[name]

      if (!cmd) {
        const near = Object.keys(commands).filter((c) => c.startsWith(name.slice(0, 2)) && !commands[c].hidden)
        push(
          <div>
            <span style={{ color: '#f87171' }}>charsh: command not found: {name}</span>
            {near.length > 0 && (
              <div style={{ color: 'var(--text-dim)' }}>
                Did you mean: {near.slice(0, 4).join(', ')}?
              </div>
            )}
          </div>,
        )
        return
      }

      const ctx: CmdCtx = {
        args: parts.slice(1),
        raw: trimmed,
        cwd,
        setCwd,
        print: push,
        clear: () => setLines([]),
        exit: () => close(winId),
      }

      try {
        const result = cmd.run(ctx)
        if (result instanceof Promise) {
          result.catch((err: unknown) =>
            push(<span style={{ color: '#f87171' }}>{name}: {String(err)}</span>),
          )
        }
      } catch (err) {
        push(
          <span style={{ color: '#f87171' }}>
            {name}: {err instanceof Error ? err.message : String(err)}
          </span>,
        )
      }
    },
    [close, cwd, push, winId],
  )

  // A command may be handed in at launch, e.g. from the app launcher.
  const initial = props.command as string | undefined
  const ranInitial = useRef(false)
  useEffect(() => {
    if (initial && !ranInitial.current) {
      ranInitial.current = true
      run(initial)
    }
  }, [initial, run])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input)
      setInput('')
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const matches = complete(input, cwd)
      if (matches.length === 1) {
        const parts = tokenize(input)
        const trailing = input.endsWith(' ')
        if (parts.length <= 1 && !trailing) setInput(matches[0] + ' ')
        else {
          if (trailing) setInput(input + matches[0])
          else setInput([...parts.slice(0, -1), matches[0]].join(' '))
        }
        setCompletions([])
      } else if (matches.length > 1) {
        setCompletions(matches)
      }
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const next = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1)
      setHistoryIdx(next)
      setInput(history[next])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx === -1) return
      const next = historyIdx + 1
      if (next >= history.length) {
        setHistoryIdx(-1)
        setInput('')
      } else {
        setHistoryIdx(next)
        setInput(history[next])
      }
      return
    }
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault()
      setLines([])
      return
    }
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      // Only cancel the line when there's nothing selected to copy.
      if (!window.getSelection()?.toString()) {
        e.preventDefault()
        push(
          <div className="flex gap-2">
            <Prompt cwd={cwd} />
            <span>{input}^C</span>
          </div>,
        )
        setInput('')
        setCompletions([])
      }
      return
    }
    if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault()
      close(winId)
    }
  }

  return (
    <div
      className="selectable flex h-full flex-col font-mono text-[12.5px] leading-[1.55]"
      style={{ background: '#0a0d12', color: '#d7dee9' }}
      onPointerDown={(e) => {
        // Clicking blank space focuses the prompt, but don't steal a selection.
        if (!window.getSelection()?.toString() && !(e.target as HTMLElement).closest('a'))
          inputRef.current?.focus()
      }}
    >
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
        {lines.map((l) => (
          <div key={l.id} className="mb-0.5 break-words">
            {l.node}
          </div>
        ))}

        {completions.length > 0 && (
          <div className="mb-1 flex flex-wrap gap-x-4" style={{ color: 'var(--text-dim)' }}>
            {completions.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Prompt cwd={cwd} />
          <div className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full bg-transparent outline-none"
              style={{ caretColor: 'var(--accent)', color: 'inherit' }}
              aria-label="Terminal input"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Prompt({ cwd }: { cwd: string }) {
  return (
    <span className="shrink-0 whitespace-nowrap select-none">
      <span style={{ color: '#4ade80' }}>
        {owner.username}@{owner.hostname}
      </span>
      <span style={{ color: 'var(--text-dim)' }}>:</span>
      <span style={{ color: '#60a5fa' }}>{prettyPath(cwd)}</span>
      <span style={{ color: 'var(--text-dim)' }}>$</span>
    </span>
  )
}
