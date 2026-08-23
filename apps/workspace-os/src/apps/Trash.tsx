import { iconFor, prettyPath, useFs } from '@/store/fs'
import { Btn, EmptyState, Scroll, StatusBar, Toolbar } from '@/os/ui'
import { menu } from '@/os/ContextMenu'
import { notify } from '@/store/notifications'
import type { AppWindowProps } from '@/os/types'

export default function Trash(_: AppWindowProps) {
  const { trash, restoreFromTrash, emptyTrash } = useFs()

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[13px] font-semibold">Trash</span>
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {trash.length} item{trash.length === 1 ? '' : 's'}
        </span>
        <div className="ml-auto flex gap-2">
          <Btn
            disabled={trash.length === 0}
            onClick={() => {
              trash.forEach((t) => restoreFromTrash(t.id))
              notify({ title: 'Trash restored', body: 'Everything is back where it was.', glyph: '↩️' })
            }}
          >
            Restore all
          </Btn>
          <Btn
            disabled={trash.length === 0}
            onClick={() => {
              emptyTrash()
              notify({ title: 'Trash emptied', glyph: '🗑️' })
            }}
          >
            Empty Trash
          </Btn>
        </div>
      </Toolbar>

      <Scroll className="p-3">
        {trash.length === 0 ? (
          <EmptyState
            glyph="🗑️"
            title="Trash is empty"
            body="Delete something in Files or run `rm` in the terminal — it will land here, and you can put it back."
          />
        ) : (
          <div className="space-y-1">
            {trash.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{ background: 'color-mix(in oklab, var(--text) 5%, transparent)' }}
                onContextMenu={menu([
                  { label: 'Restore', glyph: '↩️', onClick: () => restoreFromTrash(t.id) },
                ])}
              >
                <span className="text-xl">{iconFor(t.node)}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-medium">{t.node.name}</div>
                  <div className="truncate text-[11px]" style={{ color: 'var(--text-dim)' }}>
                    from {prettyPath(t.origin)} · {new Date(t.deletedAt).toLocaleTimeString()}
                  </div>
                </div>
                <Btn onClick={() => restoreFromTrash(t.id)}>Put back</Btn>
              </div>
            ))}
          </div>
        )}
      </Scroll>

      <StatusBar>
        <span>Deleted items stay here until you empty the trash.</span>
      </StatusBar>
    </div>
  )
}
