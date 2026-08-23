import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { GROUPS, NAV } from '@/nav'
import { profile } from '@/data/profile'
import { cx } from '@/lib/style'

/** Bottom bar shortcuts — the five views worth one tap on a phone. */
const QUICK = ['/dashboard', '/projects', '/skills', '/resume', '/contact']

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const quick = QUICK.map((p) => NAV.find((n) => n.path === p)!).filter(Boolean)

  return (
    <>
      {/* Slide-over drawer, opened from the toolbar hamburger. */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/55 md:hidden"
            onClick={onClose}
          >
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-64 flex-col border-r border-line bg-sidebar"
              aria-label="Navigation"
            >
              <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-3">
                <span className="font-mono text-[13px] font-bold">{profile.handle}</span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close navigation"
                  className="ml-auto grid size-7 place-items-center rounded-md text-muted hover:bg-hover hover:text-fg"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="scroll-y flex-1 py-2">
                {GROUPS.map((group) => (
                  <div key={group.id}>
                    <div className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-widest text-muted uppercase">
                      {group.label}
                    </div>
                    {NAV.filter((n) => n.group === group.id).map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cx(
                            'flex items-center gap-3 px-3 py-2 text-[13px]',
                            isActive ? 'bg-active text-fg' : 'text-fg2 hover:bg-hover',
                          )
                        }
                      >
                        <item.icon size={16} className="text-muted" />
                        {item.title}
                      </NavLink>
                    ))}
                  </div>
                ))}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent bottom bar. */}
      <nav
        className="fixed inset-x-0 bottom-[22px] z-30 flex h-14 items-stretch border-t border-line bg-bg2 md:hidden"
        aria-label="Quick navigation"
      >
        {quick.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cx(
                'flex flex-1 flex-col items-center justify-center gap-1 text-[10px]',
                isActive ? 'text-blue' : 'text-muted',
              )
            }
          >
            <item.icon size={17} />
            <span className="truncate">{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
