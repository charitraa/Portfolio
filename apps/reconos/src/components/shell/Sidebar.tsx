import { motion } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { GROUPS, NAV } from '@/nav'
import { profile } from '@/data/profile'
import { useApp } from '@/store/app'
import { cx } from '@/lib/style'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const collapsed = useApp((s) => s.settings.sidebarCollapsed)
  const set = useApp((s) => s.set)

  return (
    <nav
      className={cx(
        'flex h-full shrink-0 flex-col border-r border-line bg-sidebar',
        'transition-[width] duration-200 ease-[var(--ease-ui)]',
        collapsed ? 'w-13' : 'w-52',
      )}
      aria-label="Primary"
    >
      <div className="scroll-y flex-1 py-2">
        {GROUPS.map((group) => {
          const items = NAV.filter((n) => n.group === group.id)
          return (
            <div key={group.id} className="mb-1">
              {!collapsed && (
                <div className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-widest text-muted uppercase">
                  {group.label}
                </div>
              )}
              {collapsed && group.id !== 'main' && (
                <div className="mx-3 my-2 h-px bg-line" />
              )}
              <ul>
                {items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onNavigate}
                      title={collapsed ? item.title : item.hint}
                      className={({ isActive }) =>
                        cx(
                          'group relative flex items-center gap-2.5 px-3 py-1.5 text-[12.5px]',
                          'transition-colors duration-150 ease-[var(--ease-ui)]',
                          isActive
                            ? 'bg-active text-fg'
                            : 'text-fg2 hover:bg-hover hover:text-fg',
                          collapsed && 'justify-center px-0',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.span
                              layoutId="sidebar-marker"
                              className="absolute inset-y-0 left-0 w-0.5 bg-blue"
                              transition={{ duration: 0.18 }}
                            />
                          )}
                          <item.icon
                            size={15}
                            className={cx('shrink-0', isActive ? 'text-blue' : 'text-muted group-hover:text-fg2')}
                          />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="shrink-0 border-t border-line p-2">
        {!collapsed && (
          <div className="mb-2 px-1">
            <div className="truncate text-[12px] font-medium text-fg2">{profile.name}</div>
            <div className="truncate font-mono text-[10px] text-muted">{profile.location}</div>
          </div>
        )}
        <button
          type="button"
          onClick={() => set('sidebarCollapsed', !collapsed)}
          className={cx(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-muted',
            'hover:bg-hover hover:text-fg',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </nav>
  )
}
