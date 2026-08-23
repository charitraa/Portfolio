import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { navByPath } from '@/nav'
import { FolderGit2 } from 'lucide-react'
import { useApp } from '@/store/app'
import { useSound } from '@/hooks'
import { cx } from '@/lib/style'

export function TabBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const tabs = useApp((s) => s.tabs)
  const closeTab = useApp((s) => s.closeTab)
  const beep = useSound()

  const onClose = (e: React.MouseEvent, path: string) => {
    e.stopPropagation()
    const next = closeTab(path)
    beep('key')
    if (path === pathname && next) navigate(next)
  }

  return (
    <div
      className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-line bg-bg2"
      role="tablist"
      aria-label="Open views"
    >
      <AnimatePresence initial={false}>
        {tabs.map((tab) => {
          const active = tab.path === pathname
          const Icon = navByPath(tab.path)?.icon ?? FolderGit2
          return (
            <motion.div
              key={tab.path}
              layout
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="relative shrink-0 overflow-hidden"
            >
              <div
                role="tab"
                tabIndex={0}
                aria-selected={active}
                onClick={() => navigate(tab.path)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(tab.path)}
                onAuxClick={(e) => e.button === 1 && onClose(e, tab.path)}
                className={cx(
                  'group flex h-9 cursor-pointer items-center gap-2 border-r border-line pr-1.5 pl-3',
                  'transition-colors duration-150 ease-[var(--ease-ui)] select-none',
                  active
                    ? 'bg-bg text-fg'
                    : 'text-muted hover:bg-hover hover:text-fg2',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="tab-top-marker"
                    className="absolute inset-x-0 top-0 h-0.5 bg-blue"
                    transition={{ duration: 0.18 }}
                  />
                )}
                <Icon size={13} className={active ? 'text-blue' : ''} />
                <span className="max-w-40 truncate text-[12px]">{tab.title}</span>
                <button
                  type="button"
                  aria-label={`Close ${tab.title}`}
                  onClick={(e) => onClose(e, tab.path)}
                  className={cx(
                    'grid size-4 place-items-center rounded text-muted',
                    'opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:bg-active hover:text-fg',
                    active && 'opacity-60',
                  )}
                >
                  <X size={11} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
      <div className="flex-1 border-b border-line" />
    </div>
  )
}
