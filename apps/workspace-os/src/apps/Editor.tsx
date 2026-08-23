import { useEffect, useMemo, useState } from 'react'
import { basename, useFs } from '@/store/fs'
import { Markdown } from '@/os/markdown'
import { Btn, EmptyState, Scroll, StatusBar, Toolbar } from '@/os/ui'
import { useWindows } from '@/store/windows'
import { notify } from '@/store/notifications'
import type { AppWindowProps } from '@/os/types'

/**
 * Doubles as the About viewer and the generic text editor. Markdown renders
 * formatted by default; the Source tab is a real editor that writes back to
 * the virtual filesystem.
 */
export default function Editor({ winId, props }: AppWindowProps) {
  const fs = useFs()
  const setTitle = useWindows((s) => s.setTitle)

  const path = props.path as string | undefined
  const inlineContent = props.inlineContent as string | undefined
  const readOnly = Boolean(props.readOnly) || !path
  const isImage = props.preview === 'image'

  const node = useMemo(() => (path ? fs.read(path) : null), [fs, path])
  const source = inlineContent ?? node?.content ?? ''

  const [draft, setDraft] = useState(source)
  const [mode, setMode] = useState<'rendered' | 'source'>(
    path?.endsWith('.md') || (!path && !inlineContent) ? 'rendered' : 'source',
  )
  const dirty = !readOnly && draft !== source

  useEffect(() => setDraft(source), [source])

  useEffect(() => {
    const name = path ? basename(path) : (props.title as string) ?? 'Untitled'
    setTitle(winId, `${dirty ? '• ' : ''}${name} — Text Editor`)
  }, [dirty, path, props.title, setTitle, winId])

  function save() {
    if (!path) return
    fs.updateFile(path, draft)
    notify({ title: 'Saved', body: basename(path), glyph: '💾', timeout: 2200 })
  }

  if (isImage) {
    return (
      <div className="flex h-full flex-col">
        <Toolbar>
          <span className="text-[12.5px] font-medium">{node?.name}</span>
          <span className="ml-auto text-[11px]" style={{ color: 'var(--text-dim)' }}>
            {node?.mime}
          </span>
        </Toolbar>
        <div className="grid min-h-0 flex-1 place-items-center p-8" style={{ background: '#0b0e13' }}>
          <div className="text-center">
            <div
              className="mx-auto mb-4 grid h-44 w-72 place-items-center rounded-lg text-5xl"
              style={{ background: 'linear-gradient(135deg, var(--accent-soft), transparent)' }}
            >
              🖼️
            </div>
            <p className="text-[12.5px]" style={{ color: 'var(--text-dim)' }}>
              {node?.content}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!source && !path) {
    return <EmptyState glyph="📝" title="Nothing to show" body="This editor was opened without a document." />
  }

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <div
          className="flex rounded-lg p-0.5"
          style={{ background: 'color-mix(in oklab, var(--text) 8%, transparent)' }}
        >
          {(['rendered', 'source'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="rounded-md px-2.5 py-1 text-[11.5px] font-medium capitalize transition-colors"
              style={{
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-dim)',
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {readOnly ? 'read-only' : dirty ? 'unsaved changes' : 'saved'}
        </span>
        {!readOnly && (
          <Btn primary={dirty} disabled={!dirty} onClick={save}>
            Save
          </Btn>
        )}
      </Toolbar>

      {mode === 'rendered' ? (
        <Scroll className="px-7 py-6">
          <Markdown source={draft} />
        </Scroll>
      ) : (
        <textarea
          value={draft}
          readOnly={readOnly}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
              e.preventDefault()
              save()
            }
          }}
          spellCheck={false}
          className="selectable min-h-0 flex-1 resize-none p-5 font-mono text-[12.5px] leading-[1.65] outline-none"
          style={{ background: 'color-mix(in oklab, #000 22%, var(--chrome))', color: 'var(--text)' }}
        />
      )}

      <StatusBar>
        <span>{draft.split('\n').length} lines</span>
        <span>· {draft.split(/\s+/).filter(Boolean).length} words</span>
        <span className="ml-auto">{path ?? 'in-memory buffer'}</span>
      </StatusBar>
    </div>
  )
}
