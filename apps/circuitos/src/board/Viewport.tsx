import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react'
import type { ReactNode } from 'react'
import { BOARD_H, BOARD_W } from './layout'

export type ViewportHandle = {
  zoomBy: (delta: number) => void
  reset: () => void
  focusOn: (x: number, y: number) => void
}

type Props = { children: ReactNode; interactive: boolean }

const MIN_ZOOM = 0.6
const MAX_ZOOM = 4
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))

/**
 * Fits the 1400x900 board into whatever space is available, then layers a
 * user-controlled pan/zoom on top (drag with a mouse, pinch on touch).
 */
export const Viewport = forwardRef<ViewportHandle, Props>(function Viewport({ children, interactive }, ref) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ dist: number; zoom: number } | null>(null)
  const dragged = useRef(0)
  const homeZoom = useRef(1)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    let initialised = false
    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      const f = Math.min(width / BOARD_W, height / BOARD_H) * 0.94
      setFit(f)
      // A whole ATX board scaled to a phone screen is unreadable, so narrow
      // viewports start zoomed in and the visitor pans around instead.
      if (!initialised && width > 0) {
        initialised = true
        if (width < 900) {
          homeZoom.current = clampZoom((height / (BOARD_H * f)) * 0.92)
          setZoom(homeZoom.current)
        }
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useImperativeHandle(ref, () => ({
    zoomBy: (delta) => setZoom((z) => clampZoom(z + delta)),
    reset: () => {
      setZoom(homeZoom.current)
      setPan({ x: 0, y: 0 })
    },
    focusOn: (x, y) => {
      setZoom(1.5)
      setPan({ x: (BOARD_W / 2 - x) * fit * 1.5, y: (BOARD_H / 2 - y) * fit * 1.5 })
    },
  }))

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive) return
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      dragged.current = 0
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()]
        pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom }
      }
    },
    [interactive, zoom],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || !pointers.current.has(e.pointerId)) return
      const prev = pointers.current.get(e.pointerId)!
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointers.current.size === 2 && pinch.current) {
        const [a, b] = [...pointers.current.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        setZoom(clampZoom(pinch.current.zoom * (dist / pinch.current.dist)))
        dragged.current += 10
        return
      }

      const dx = e.clientX - prev.x
      const dy = e.clientY - prev.y
      dragged.current += Math.abs(dx) + Math.abs(dy)
      if (e.buttons === 0 && e.pointerType === 'mouse') return
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
    },
    [interactive],
  )

  const endPointer = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
  }, [])

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!interactive) return
      setZoom((z) => clampZoom(z - Math.sign(e.deltaY) * 0.12))
    },
    [interactive],
  )

  // Swallow the click that ends a drag so panning never opens a panel.
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (dragged.current > 8) {
      e.stopPropagation()
      e.preventDefault()
    }
  }, [])

  const scale = fit * zoom

  return (
    <div
      ref={hostRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={endPointer}
      onWheel={onWheel}
      onClickCapture={onClickCapture}
      className="relative flex-1 touch-none overflow-hidden"
      style={{ cursor: interactive ? 'grab' : 'default' }}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: BOARD_W,
          height: BOARD_H,
          transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: pointers.current.size ? 'none' : 'transform 260ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        {children}
      </div>
    </div>
  )
})
