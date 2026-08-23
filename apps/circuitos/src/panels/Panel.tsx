import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { ACCENT_HEX, NODE_MAP } from '../board/layout'
import type { ComponentId } from '../board/layout'
import { SECTION_BODY } from './sections'

export function Panel({ id, onClose }: { id: ComponentId | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const node = id ? NODE_MAP[id] : null
  const Body = id ? SECTION_BODY[id] : null
  const hex = node ? ACCENT_HEX[node.accent] : '#3b82f6'

  return (
    <AnimatePresence>
      {node && Body && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#050810]/70 backdrop-blur-[2px]"
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={node.section}
            initial={{ x: '100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col border-l border-slate-700 bg-[#0d1424] shadow-[-30px_0_80px_-30px_#000]"
          >
            {/* header */}
            <header
              className="relative shrink-0 border-b border-slate-800 px-5 py-4"
              style={{ background: `linear-gradient(90deg, ${hex}18, transparent)` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.24em]" style={{ color: hex }}>
                    {node.ref} · {node.label}
                  </div>
                  <h2 className="font-display text-2xl font-bold tracking-wide text-slate-50">
                    {node.section}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close panel"
                  className="rounded-md border border-slate-700 p-1.5 text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <span
                className="absolute bottom-0 left-0 h-px w-full"
                style={{ background: `linear-gradient(90deg, ${hex}, transparent)` }}
              />
            </header>

            <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-5">
              <Body />
            </div>

            <footer className="shrink-0 border-t border-slate-800 px-5 py-2.5 font-mono text-[10px] text-slate-600">
              LINK ACTIVE · CPU ⇄ {node.label} · ESC to disconnect
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
