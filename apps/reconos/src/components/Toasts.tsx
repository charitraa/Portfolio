import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useApp, type LogKind } from '@/store/app'

const ICON: Record<LogKind, React.ComponentType<{ size?: number }>> = {
  ok: CheckCircle2,
  info: Info,
  warn: AlertTriangle,
  error: XCircle,
  cmd: Info,
}

const COLOR: Record<LogKind, string> = {
  ok: 'var(--color-green)',
  info: 'var(--color-blue)',
  warn: 'var(--color-yellow)',
  error: 'var(--color-red)',
  cmd: 'var(--color-blue)',
}

export function Toasts() {
  const toasts = useApp((s) => s.toasts)
  const dismiss = useApp((s) => s.dismiss)

  return (
    <div className="pointer-events-none fixed right-3 bottom-8 z-50 flex w-[290px] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICON[t.kind]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex gap-2.5 rounded-[10px] border border-line bg-panel p-2.5 shadow-[0_8px_24px_var(--rc-shadow)]"
              role="status"
            >
              <span className="mt-px shrink-0" style={{ color: COLOR[t.kind] }}>
                <Icon size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-fg">{t.title}</div>
                {t.body && <div className="mt-0.5 text-[11px] text-muted">{t.body}</div>}
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
                className="h-fit shrink-0 rounded p-0.5 text-muted hover:bg-hover hover:text-fg"
              >
                <X size={12} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
