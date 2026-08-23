import { useState } from 'react'
import WindowFrame from './Window'
import { getWorkarea, useWindows, type SnapEdge } from '@/store/windows'

/** Preview rectangle shown while a window is dragged into a snap zone. */
function snapRect(edge: Exclude<SnapEdge, null>) {
  const a = getWorkarea()
  const hw = Math.round(a.w / 2)
  const hh = Math.round(a.h / 2)
  switch (edge) {
    case 'left':
      return { left: a.x, top: a.y, width: hw, height: a.h }
    case 'right':
      return { left: a.x + hw, top: a.y, width: a.w - hw, height: a.h }
    case 'top-left':
      return { left: a.x, top: a.y, width: hw, height: hh }
    case 'top-right':
      return { left: a.x + hw, top: a.y, width: a.w - hw, height: hh }
    case 'bottom-left':
      return { left: a.x, top: a.y + hh, width: hw, height: a.h - hh }
    case 'bottom-right':
      return { left: a.x + hw, top: a.y + hh, width: a.w - hw, height: a.h - hh }
  }
}

export default function WindowLayer() {
  const windows = useWindows((s) => s.windows)
  const focusedId = useWindows((s) => s.focusedId)
  const [snapPreview, setSnapPreview] = useState<SnapEdge>(null)

  return (
    <>
      {snapPreview && (
        <div
          className="pointer-events-none absolute z-[5] rounded-xl transition-all duration-100"
          style={{
            ...snapRect(snapPreview),
            background: 'color-mix(in oklab, var(--accent) 22%, transparent)',
            boxShadow: 'inset 0 0 0 2px var(--accent)',
          }}
        />
      )}

      {windows.map((w) => (
        <WindowFrame key={w.id} win={w} focused={w.id === focusedId} onSnapPreview={setSnapPreview} />
      ))}
    </>
  )
}
