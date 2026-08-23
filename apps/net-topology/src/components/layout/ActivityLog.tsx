import { useEffect, useRef, useState } from 'react'
import { ChevronUp, Radio } from 'lucide-react'
import { useApp } from '../../store/AppState'
import { cn } from '../../utils/cn'

/** Background chatter so the log never looks dead. */
const ambient: Array<[string, 'info' | 'ok' | 'warn']> = [
  ['health check: all backends responding', 'ok'],
  ['tls session resumed, 0-RTT', 'info'],
  ['cache hit ratio 94% at edge', 'ok'],
  ['db-primary: 3 active connections', 'info'],
  ['fw-edge-01: 1 packet dropped (policy)', 'warn'],
  ['api-gw-01: 6 routes advertised', 'info'],
  ['lb-01: rebalanced backend weights', 'info'],
  ['bgp session established with upstream', 'ok'],
]

const levelColor = {
  info: 'var(--muted)',
  ok: 'var(--success)',
  warn: 'var(--warning)',
  err: 'var(--error)',
} as const

export function ActivityLog() {
  const { log, pushLog, motion } = useApp()
  const [expanded, setExpanded] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const cursor = useRef(0)

  // Opening lines, then periodic ambient traffic.
  useEffect(() => {
    pushLog('client connected from 103.94.128.42', 'ok')
    pushLog('dns resolved charitra.dev', 'info')
    pushLog('firewall passed: ACCEPT tcp/443', 'ok')
  }, [pushLog])

  useEffect(() => {
    if (!motion) return
    const id = window.setInterval(() => {
      const [message, level] = ambient[cursor.current % ambient.length]
      cursor.current += 1
      pushLog(message, level)
    }, 6500)
    return () => window.clearInterval(id)
  }, [motion, pushLog])

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log, expanded])

  const latest = log.slice(-1)[0]

  return (
    <footer
      className={cn(
        'z-30 shrink-0 border-t bg-bg-2/85 backdrop-blur-md transition-[height] duration-200',
        expanded ? 'h-40' : 'h-9',
      )}
    >
      <div className="flex h-9 items-center gap-3 px-3 sm:px-4">
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] tracking-wider text-muted uppercase">
          <Radio size={11} className="text-ok" />
          <span className="hidden sm:inline">live activity</span>
        </span>

        {!expanded && latest && (
          <span className="flex min-w-0 flex-1 items-center gap-2 font-mono text-[10.5px]">
            <span className="shrink-0 text-muted/70 tabular-nums">{latest.time}</span>
            <span className="truncate" style={{ color: levelColor[latest.level] }}>
              {latest.message}
            </span>
          </span>
        )}

        {expanded && <span className="flex-1" />}

        <span className="shrink-0 font-mono text-[10px] text-muted/60">{log.length} events</span>

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse activity log' : 'Expand activity log'}
          className="grid h-6 w-6 shrink-0 place-items-center rounded border text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          <ChevronUp
            size={12}
            className={cn('transition-transform duration-200', expanded && 'rotate-180')}
          />
        </button>
      </div>

      {expanded && (
        <div ref={scroller} className="h-[calc(10rem-2.25rem)] overflow-y-auto px-3 pb-2 sm:px-4">
          <ul className="space-y-0.5 font-mono text-[10.5px]">
            {log.map((entry) => (
              <li key={entry.id} className="flex gap-2.5">
                <span className="shrink-0 text-muted/60 tabular-nums">{entry.time}</span>
                <span style={{ color: levelColor[entry.level] }}>{entry.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </footer>
  )
}
