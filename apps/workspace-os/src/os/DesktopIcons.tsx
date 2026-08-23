import { useCallback, useEffect, useRef, useState } from 'react'
import { DESKTOP, iconFor, resolve, useFs, type FsNode } from '@/store/fs'
import { openNode } from '@/os/launch'
import { menu } from '@/os/ContextMenu'
import { PANEL_H, DOCK_H } from '@/store/windows'
import { isScreenActive, toScreen, useScreen } from '@/os/screen'

const CELL_W = 92
const CELL_H = 96
const PAD = 10

interface Pos {
  x: number
  y: number
}

/** Column-major auto-arrange, the way every desktop lays icons out by default. */
function autoPosition(index: number, screenH: number): Pos {
  const usable = screenH - PANEL_H - DOCK_H - PAD
  const perColumn = Math.max(1, Math.floor(usable / CELL_H))
  return {
    x: PAD + Math.floor(index / perColumn) * CELL_W,
    y: PANEL_H + PAD + (index % perColumn) * CELL_H,
  }
}

export default function DesktopIcons({ marquee }: { marquee: DOMRect | null }) {
  const fs = useFs()
  const entries = fs.list(DESKTOP) ?? []

  const [positions, setPositions] = useState<Record<string, Pos>>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [renaming, setRenaming] = useState<string | null>(null)
  const [removing, setRemoving] = useState<Set<string>>(new Set())
  const dragRef = useRef<{ name: string; dx: number; dy: number; moved: boolean } | null>(null)
  const { w: screenW, h: screenH } = useScreen()

  const positionOf = useCallback(
    (name: string, index: number): Pos => positions[name] ?? autoPosition(index, screenH),
    [positions, screenH],
  )

  // Marquee selection is driven by the parent, which owns the pointer gesture.
  // Cells are hit-tested from their laid-out position rather than a measured
  // rect: the display may be scaled onto a monitor, so a client rect is in the
  // wrong coordinate space.
  useEffect(() => {
    if (!marquee) return
    const hit = new Set<string>()
    entries.forEach((node, i) => {
      const p = positionOf(node.name, i)
      if (
        p.x < marquee.right &&
        p.x + CELL_W - 8 > marquee.left &&
        p.y < marquee.bottom &&
        p.y + CELL_H - 8 > marquee.top
      ) {
        hit.add(node.name)
      }
    })
    setSelected(hit)
    // `entries` is rebuilt every render; the marquee is what actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marquee, positionOf])

  // Clicking bare desktop clears the selection.
  useEffect(() => {
    const clear = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('[data-desktop-icon]')) {
        setSelected(new Set())
        setRenaming(null)
      }
    }
    window.addEventListener('pointerdown', clear)
    return () => window.removeEventListener('pointerdown', clear)
  }, [])

  const remove = useCallback(
    (names: string[]) => {
      // Fade out first so deleting doesn't feel like the icon blinked away.
      setRemoving(new Set(names))
      setTimeout(() => {
        names.forEach((n) => fs.remove(resolve(DESKTOP, n)))
        setRemoving(new Set())
        setSelected(new Set())
      }, 180)
    },
    [fs],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isScreenActive()) return
      const el = e.target as HTMLElement
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return
      if (e.key === 'Delete' && selected.size) {
        remove([...selected].filter((n) => !entries.find((x) => x.name === n)?.locked))
      }
      if (e.key === 'F2' && selected.size === 1) setRenaming([...selected][0])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entries, remove, selected])

  function beginDrag(e: React.PointerEvent, node: FsNode, index: number) {
    if (e.button !== 0) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const p = positionOf(node.name, index)
    const c = toScreen(e.clientX, e.clientY)
    dragRef.current = { name: node.name, dx: c.x - p.x, dy: c.y - p.y, moved: false }

    if (!selected.has(node.name)) {
      setSelected(e.ctrlKey || e.metaKey ? new Set([...selected, node.name]) : new Set([node.name]))
    } else if (e.ctrlKey || e.metaKey) {
      const next = new Set(selected)
      next.delete(node.name)
      setSelected(next)
    }
  }

  function onDragMove(e: React.PointerEvent) {
    const d = dragRef.current
    if (!d) return
    d.moved = true
    const c = toScreen(e.clientX, e.clientY)
    const x = Math.max(0, Math.min(screenW - CELL_W, c.x - d.dx))
    const y = Math.max(PANEL_H, Math.min(screenH - DOCK_H - CELL_H + 20, c.y - d.dy))
    setPositions((p) => ({ ...p, [d.name]: { x, y } }))
  }

  function endDrag(e: React.PointerEvent) {
    const d = dragRef.current
    if (d) (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    dragRef.current = null
  }

  return (
    <>
      {entries.map((node, i) => {
        const pos = positionOf(node.name, i)
        const isSelected = selected.has(node.name)
        return (
          <div
            key={node.name}
            data-desktop-icon
            className="absolute flex touch-none flex-col items-center gap-1 rounded-lg px-1.5 py-2 text-center"
            style={{
              left: pos.x,
              top: pos.y,
              width: CELL_W - 8,
              background: isSelected ? 'color-mix(in oklab, var(--accent) 34%, transparent)' : 'transparent',
              boxShadow: isSelected ? 'inset 0 0 0 1px color-mix(in oklab, var(--accent) 60%, transparent)' : undefined,
              opacity: removing.has(node.name) ? 0 : 1,
              transform: removing.has(node.name) ? 'scale(.82)' : 'none',
              transition: 'opacity 180ms ease, transform 180ms ease',
              cursor: 'default',
            }}
            onPointerDown={(e) => beginDrag(e, node, i)}
            onPointerMove={onDragMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDoubleClick={() => openNode(node, resolve(DESKTOP, node.name))}
            onContextMenu={menu([
              { label: 'Open', glyph: '↗', onClick: () => openNode(node, resolve(DESKTOP, node.name)) },
              { separator: true },
              { label: 'Rename', glyph: '✏️', hint: 'F2', disabled: node.locked, onClick: () => setRenaming(node.name) },
              {
                label: 'Move to Trash',
                glyph: '🗑️',
                hint: 'Del',
                danger: true,
                disabled: node.locked,
                onClick: () => remove([node.name]),
              },
            ])}
          >
            <span
              className="text-[32px] leading-none"
              style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.55))' }}
            >
              {iconFor(node)}
            </span>

            {renaming === node.name ? (
              <input
                autoFocus
                defaultValue={node.name}
                onPointerDown={(e) => e.stopPropagation()}
                onBlur={(e) => {
                  const v = e.target.value.trim()
                  if (v && v !== node.name) fs.rename(resolve(DESKTOP, node.name), v)
                  setRenaming(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                  if (e.key === 'Escape') setRenaming(null)
                }}
                className="w-full rounded px-1 text-center text-[11px] outline-none"
                style={{ background: 'var(--chrome)', color: 'var(--text)', boxShadow: '0 0 0 1.5px var(--accent)' }}
              />
            ) : (
              <span
                className="line-clamp-2 text-[11.5px] leading-tight font-medium break-words text-white"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,.85), 0 0 12px rgba(0,0,0,.5)' }}
              >
                {node.name}
              </span>
            )}
          </div>
        )
      })}
    </>
  )
}
