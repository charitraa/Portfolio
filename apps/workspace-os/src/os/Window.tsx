import { memo, useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { getWorkarea, useWindows, type SnapEdge, type Win } from '@/store/windows'
import { appById } from '@/apps/registry'
import { useSystem } from '@/store/system'
import { toScreen } from '@/os/screen'

const MIN_W = 320
const MIN_H = 200
/** How close to an edge the pointer must get before a snap zone arms. */
const SNAP_MARGIN = 12

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

interface Props {
  win: Win
  focused: boolean
  onSnapPreview: (edge: SnapEdge) => void
}

function detectSnap(x: number, y: number): SnapEdge {
  const area = getWorkarea()
  const nearLeft = x <= area.x + SNAP_MARGIN
  const nearRight = x >= area.x + area.w - SNAP_MARGIN
  const nearTop = y <= area.y + SNAP_MARGIN
  const nearBottom = y >= area.y + area.h - SNAP_MARGIN

  if (nearTop && nearLeft) return 'top-left'
  if (nearTop && nearRight) return 'top-right'
  if (nearBottom && nearLeft) return 'bottom-left'
  if (nearBottom && nearRight) return 'bottom-right'
  if (nearLeft) return 'left'
  if (nearRight) return 'right'
  return null
}

function WindowFrame({ win, focused, onSnapPreview }: Props) {
  const { focus, close, minimize, toggleMaximize, setGeometry, snap } = useWindows()
  const animations = useSystem((s) => s.settings.animations)
  const meta = appById(win.appId)
  const frameRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)

  // Mutable drag bookkeeping — deliberately outside React state so pointermove
  // never queues a render it doesn't need.
  const gesture = useRef({
    startX: 0,
    startY: 0,
    origin: { x: 0, y: 0, w: 0, h: 0 },
    snapCandidate: null as SnapEdge,
    /** Geometry to restore to if a maximised window is dragged loose. */
    unmaximised: false,
  })

  const [shake, setShake] = useState(0)
  useEffect(() => {
    if (win.nudge === 0) return
    setShake((n) => n + 1)
    const t = setTimeout(() => setShake(0), 360)
    return () => clearTimeout(t)
  }, [win.nudge])

  const beginDrag = useCallback(
    (e: RPointerEvent<HTMLElement>) => {
      if (e.button !== 0) return
      // Buttons inside the titlebar handle their own clicks.
      if ((e.target as HTMLElement).closest('[data-no-drag]')) return
      e.currentTarget.setPointerCapture(e.pointerId)
      focus(win.id)
      const p = toScreen(e.clientX, e.clientY)
      gesture.current = {
        startX: p.x,
        startY: p.y,
        origin: { x: win.x, y: win.y, w: win.w, h: win.h },
        snapCandidate: null,
        unmaximised: false,
      }
      setDragging(true)
    },
    [focus, win.id, win.x, win.y, win.w, win.h],
  )

  const onDragMove = useCallback(
    (e: RPointerEvent<HTMLElement>) => {
      if (!dragging) return
      const g = gesture.current
      const p = toScreen(e.clientX, e.clientY)
      const dx = p.x - g.startX
      const dy = p.y - g.startY
      const area = getWorkarea()

      // Dragging a maximised or snapped window pops it back to its old size,
      // keeping the grab point roughly under the cursor.
      if ((win.maximized || win.snapped) && !g.unmaximised && Math.abs(dx) + Math.abs(dy) > 8) {
        const r = win.restore ?? { x: p.x - 300, y: area.y + 40, w: 900, h: 560 }
        const ratio = (p.x - win.x) / Math.max(1, win.w)
        g.origin = { x: p.x - r.w * ratio, y: p.y - 18, w: r.w, h: r.h }
        g.startX = p.x
        g.startY = p.y
        g.unmaximised = true
        setGeometry(win.id, { x: g.origin.x, y: g.origin.y, w: r.w, h: r.h })
        useWindows.setState((s) => ({
          windows: s.windows.map((w) =>
            w.id === win.id ? { ...w, maximized: false, snapped: null, restore: null } : w,
          ),
        }))
        return
      }

      const nextX = g.origin.x + dx
      // The titlebar must stay reachable: never let it go above the panel.
      const nextY = Math.max(area.y, g.origin.y + dy)
      setGeometry(win.id, { x: nextX, y: nextY })

      const candidate = detectSnap(p.x, p.y)
      if (candidate !== g.snapCandidate) {
        g.snapCandidate = candidate
        onSnapPreview(candidate)
      }
    },
    [dragging, onSnapPreview, setGeometry, win.id, win.maximized, win.snapped, win.restore, win.w, win.x],
  )

  const endDrag = useCallback(
    (e: RPointerEvent<HTMLElement>) => {
      if (!dragging) return
      e.currentTarget.releasePointerCapture(e.pointerId)
      setDragging(false)
      const candidate = gesture.current.snapCandidate
      onSnapPreview(null)
      gesture.current.snapCandidate = null

      if (candidate) {
        snap(win.id, candidate)
        return
      }
      // Keep at least a strip of the window on screen so it can't be lost.
      const area = getWorkarea()
      const x = Math.min(Math.max(win.x, area.x - win.w + 120), area.x + area.w - 120)
      const y = Math.min(Math.max(win.y, area.y), area.y + area.h - 40)
      if (x !== win.x || y !== win.y) setGeometry(win.id, { x, y })
    },
    [dragging, onSnapPreview, setGeometry, snap, win.id, win.w, win.x, win.y],
  )

  const beginResize = useCallback(
    (dir: ResizeDir) => (e: RPointerEvent<HTMLElement>) => {
      if (e.button !== 0) return
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)
      focus(win.id)
      const p = toScreen(e.clientX, e.clientY)
      gesture.current = {
        startX: p.x,
        startY: p.y,
        origin: { x: win.x, y: win.y, w: win.w, h: win.h },
        snapCandidate: null,
        unmaximised: false,
      }
      setResizing(true)
      ;(e.currentTarget as HTMLElement).dataset.dir = dir
    },
    [focus, win.id, win.x, win.y, win.w, win.h],
  )

  const onResizeMove = useCallback(
    (e: RPointerEvent<HTMLElement>) => {
      if (!resizing) return
      const dir = (e.currentTarget as HTMLElement).dataset.dir as ResizeDir | undefined
      if (!dir) return
      const g = gesture.current
      const p = toScreen(e.clientX, e.clientY)
      const dx = p.x - g.startX
      const dy = p.y - g.startY
      const area = getWorkarea()
      const minW = meta?.minSize?.w ?? MIN_W
      const minH = meta?.minSize?.h ?? MIN_H

      let { x, y, w, h } = g.origin

      if (dir.includes('e')) w = Math.max(minW, g.origin.w + dx)
      if (dir.includes('s')) h = Math.max(minH, g.origin.h + dy)
      if (dir.includes('w')) {
        // Anchor the right edge: shrinking past the minimum must not drift.
        const proposed = Math.max(minW, g.origin.w - dx)
        x = g.origin.x + (g.origin.w - proposed)
        w = proposed
      }
      if (dir.includes('n')) {
        const proposed = Math.max(minH, g.origin.h - dy)
        const proposedY = g.origin.y + (g.origin.h - proposed)
        y = Math.max(area.y, proposedY)
        h = proposedY < area.y ? g.origin.y + g.origin.h - area.y : proposed
      }

      setGeometry(win.id, { x, y, w, h })
    },
    [resizing, meta, setGeometry, win.id],
  )

  const endResize = useCallback(
    (e: RPointerEvent<HTMLElement>) => {
      if (!resizing) return
      e.currentTarget.releasePointerCapture(e.pointerId)
      setResizing(false)
      // A manual resize means the window is no longer "snapped".
      if (win.snapped || win.maximized) {
        useWindows.setState((s) => ({
          windows: s.windows.map((w) => (w.id === win.id ? { ...w, snapped: null, maximized: false } : w)),
        }))
      }
    },
    [resizing, win.id, win.snapped, win.maximized],
  )

  if (!meta) return null
  const Body = meta.component

  const handles: { dir: ResizeDir; className: string; cursor: string }[] = [
    { dir: 'n', className: 'top-0 left-3 right-3 h-1.5', cursor: 'ns-resize' },
    { dir: 's', className: 'bottom-0 left-3 right-3 h-1.5', cursor: 'ns-resize' },
    { dir: 'w', className: 'left-0 top-3 bottom-3 w-1.5', cursor: 'ew-resize' },
    { dir: 'e', className: 'right-0 top-3 bottom-3 w-1.5', cursor: 'ew-resize' },
    { dir: 'nw', className: 'left-0 top-0 w-3.5 h-3.5', cursor: 'nwse-resize' },
    { dir: 'ne', className: 'right-0 top-0 w-3.5 h-3.5', cursor: 'nesw-resize' },
    { dir: 'sw', className: 'left-0 bottom-0 w-3.5 h-3.5', cursor: 'nesw-resize' },
    { dir: 'se', className: 'right-0 bottom-0 w-3.5 h-3.5', cursor: 'nwse-resize' },
  ]

  return (
    <div
      ref={frameRef}
      role="dialog"
      aria-label={win.title}
      aria-modal={false}
      className={[
        'absolute flex flex-col overflow-hidden rounded-xl',
        shake ? 'nudge' : '',
        animations && !dragging && !resizing ? 'transition-[width,height,left,top] duration-150 ease-out' : '',
        focused ? 'shadow-[0_24px_70px_-12px_rgba(0,0,0,0.75)]' : 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]',
      ].join(' ')}
      style={{
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        zIndex: win.z,
        display: win.minimized ? 'none' : undefined,
        background: 'var(--chrome)',
        boxShadow: focused
          ? '0 28px 80px -14px rgba(0,0,0,.8), 0 0 0 .5px rgba(255,255,255,.16), inset 0 0 0 1px rgba(255,255,255,.05)'
          : '0 10px 30px -10px rgba(0,0,0,.6), 0 0 0 .5px rgba(0,0,0,.5), inset 0 0 0 1px var(--chrome-border)',
      }}
      onPointerDownCapture={() => focus(win.id)}
    >
      {/* Titlebar */}
      <header
        className="flex h-9 shrink-0 cursor-grab touch-none items-center gap-2 px-2 active:cursor-grabbing"
        style={{
          background: focused
            ? 'color-mix(in oklab, #fff 4%, var(--chrome))'
            : 'color-mix(in oklab, #000 14%, var(--chrome))',
          borderBottom: '1px solid var(--chrome-border)',
        }}
        onPointerDown={beginDrag}
        onPointerMove={onDragMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        {/*
          Traffic lights, on the left. The workstation this is modelled on runs
          KDE with `ButtonsOnLeft=XIA` and nothing on the right — close,
          minimise, maximise, in that order — so the shell matches it rather
          than the Windows convention it shipped with.

          The glyphs only appear on hover of the group, which is the behaviour
          the real decoration has and the reason the buttons read as dots.
        */}
        <div className="group/tl flex items-center gap-2 pr-1 pl-1.5" data-no-drag>
          <TrafficLight label="Close" color="#ff5f57" onClick={() => close(win.id)}>
            <path d="M2 2l4 4M6 2L2 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </TrafficLight>
          <TrafficLight label="Minimize" color="#febc2e" onClick={() => minimize(win.id)}>
            <path d="M1.8 4h4.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </TrafficLight>
          <TrafficLight
            label={win.maximized ? 'Restore' : 'Maximize'}
            color="#28c840"
            onClick={() => toggleMaximize(win.id)}
          >
            <path
              d={win.maximized ? 'M2.4 5.6h3.2v-3.2' : 'M2.2 2.2h3.6v3.6z'}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </TrafficLight>
        </div>

        <span className="text-[13px] leading-none opacity-90">{meta.glyph}</span>
        <span
          className="min-w-0 flex-1 truncate text-center text-[12.5px] font-medium tracking-tight"
          style={{ color: focused ? 'var(--text)' : 'var(--text-dim)' }}
        >
          {win.title}
        </span>

        {/* Balances the traffic lights so the title stays optically centred. */}
        <span aria-hidden className="w-[58px] shrink-0" />
      </header>

      {/* App surface. `pointer-events` is killed mid-gesture so an iframe-like
          child can't swallow the pointer stream. */}
      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ pointerEvents: dragging || resizing ? 'none' : undefined }}
      >
        <Body winId={win.id} props={win.props} />
      </div>

      {/* Resize handles */}
      {!win.maximized &&
        handles.map((h) => (
          <div
            key={h.dir}
            className={`absolute touch-none ${h.className}`}
            style={{ cursor: h.cursor }}
            onPointerDown={beginResize(h.dir)}
            onPointerMove={onResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
          />
        ))}
    </div>
  )
}

/**
 * One traffic light. Colour is always shown; the glyph fades in when the
 * pointer is anywhere over the group, matching the real decoration — which is
 * what makes three coloured dots legible as controls rather than decoration.
 */
function TrafficLight({
  children,
  onClick,
  label,
  color,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
  color: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-[12px] w-[12px] shrink-0 place-items-center rounded-full transition-[filter,background] hover:brightness-110"
      style={{ background: color, boxShadow: 'inset 0 0 0 .5px rgba(0,0,0,.28)' }}
    >
      <svg
        viewBox="0 0 8 8"
        className="h-2 w-2 opacity-0 transition-opacity group-hover/tl:opacity-100"
        style={{ color: 'rgba(0,0,0,.62)' }}
      >
        {children}
      </svg>
    </button>
  )
}

export default memo(WindowFrame)
