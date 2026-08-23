import { useEffect, useRef, useState, type ReactNode } from 'react'
import { create } from 'zustand'
import { rectToScreen, screenSize, toScreen } from '@/os/screen'

export interface MenuItem {
  label?: string
  glyph?: ReactNode
  hint?: string
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  /** Renders a divider; `label` is ignored. */
  separator?: boolean
  children?: MenuItem[]
}

interface MenuState {
  open: boolean
  x: number
  y: number
  items: MenuItem[]
  show: (x: number, y: number, items: MenuItem[]) => void
  hide: () => void
}

export const useContextMenu = create<MenuState>((set) => ({
  open: false,
  x: 0,
  y: 0,
  items: [],
  show: (x, y, items) => set({ open: true, x, y, items }),
  hide: () => set({ open: false, items: [] }),
}))

/** Convenience for components: `onContextMenu={menu(items)}`. */
export function menu(items: MenuItem[]) {
  return (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const p = toScreen(e.clientX, e.clientY)
    useContextMenu.getState().show(p.x, p.y, items)
  }
}

export function ContextMenuLayer() {
  const { open, x, y, items, hide } = useContextMenu()

  useEffect(() => {
    if (!open) return
    const onDown = () => hide()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && hide()
    const onScroll = () => hide()
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onScroll)
    }
  }, [open, hide])

  if (!open) return null
  return <Menu items={items} x={x} y={y} onDismiss={hide} />
}

function Menu({
  items,
  x,
  y,
  onDismiss,
  nested,
}: {
  items: MenuItem[]
  x: number
  y: number
  onDismiss: () => void
  nested?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x, y })
  const [openSub, setOpenSub] = useState<number | null>(null)
  const [subPos, setSubPos] = useState({ x: 0, y: 0 })

  // Flip the menu back on screen if it would overflow.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const r = rectToScreen(el.getBoundingClientRect())
    const screen = screenSize()
    let nx = x
    let ny = y
    if (x + r.w > screen.w - 8) nx = Math.max(8, x - r.w)
    if (y + r.h > screen.h - 8) ny = Math.max(8, screen.h - r.h - 8)
    setPos({ x: nx, y: ny })
  }, [x, y])

  return (
    <>
      <div
        ref={ref}
        className="glass absolute z-[9999] min-w-[196px] rounded-xl py-1.5 shadow-2xl"
        style={{
          left: pos.x,
          top: pos.y,
          boxShadow: '0 18px 50px -12px rgba(0,0,0,.7), inset 0 0 0 1px var(--chrome-border)',
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {items.map((item, i) =>
          item.separator ? (
            <div key={i} className="my-1.5 h-px" style={{ background: 'var(--chrome-border)' }} />
          ) : (
            <button
              key={i}
              type="button"
              disabled={item.disabled}
              onPointerEnter={(e) => {
                if (item.children) {
                  const r = rectToScreen((e.currentTarget as HTMLElement).getBoundingClientRect())
                  setSubPos({ x: r.right - 4, y: r.y - 6 })
                  setOpenSub(i)
                } else setOpenSub(null)
              }}
              onClick={() => {
                if (item.children) return
                item.onClick?.()
                onDismiss()
              }}
              className="flex w-full items-center gap-2.5 px-3 py-[7px] text-left text-[12.5px] transition-colors disabled:opacity-35"
              style={{
                color: item.danger ? '#f87171' : 'var(--text)',
                background: openSub === i ? 'color-mix(in oklab, var(--text) 9%, transparent)' : undefined,
              }}
              onPointerLeave={(e) => {
                if (!item.children) e.currentTarget.style.background = 'transparent'
              }}
              onPointerOver={(e) => {
                if (!item.disabled) e.currentTarget.style.background = 'var(--accent-soft)'
              }}
              onPointerOut={(e) => {
                e.currentTarget.style.background = openSub === i ? 'color-mix(in oklab, var(--text) 9%, transparent)' : 'transparent'
              }}
            >
              <span className="w-4 shrink-0 text-center text-[12px] opacity-80">{item.glyph}</span>
              <span className="flex-1 whitespace-nowrap">{item.label}</span>
              {item.hint && (
                <span className="ml-4 text-[10.5px]" style={{ color: 'var(--text-dim)' }}>
                  {item.hint}
                </span>
              )}
              {item.children && <span style={{ color: 'var(--text-dim)' }}>›</span>}
            </button>
          ),
        )}
      </div>

      {openSub !== null && items[openSub]?.children && !nested && (
        <Menu items={items[openSub].children} x={subPos.x} y={subPos.y} onDismiss={onDismiss} nested />
      )}
    </>
  )
}
