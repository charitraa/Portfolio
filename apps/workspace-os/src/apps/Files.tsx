import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DESKTOP,
  HOME,
  basename,
  dirname,
  formatSize,
  iconFor,
  prettyPath,
  resolve,
  useFs,
  type FsNode,
} from '@/store/fs'
import { openNode } from '@/os/launch'
import { menu } from '@/os/ContextMenu'
import { EmptyState, IconBtn, Scroll, Sidebar, SidebarItem, SidebarLabel, StatusBar, Toolbar } from '@/os/ui'
import { useWindows } from '@/store/windows'
import type { AppWindowProps } from '@/os/types'
import { owner } from '@/data/portfolio'

type View = 'grid' | 'list'
type Sort = 'name' | 'size' | 'modified' | 'kind'

const PLACES: { path: string; label: string; glyph: string }[] = [
  { path: HOME, label: 'Home', glyph: '🏠' },
  { path: DESKTOP, label: 'Desktop', glyph: '🖥️' },
  { path: `${HOME}/Projects`, label: 'Projects', glyph: '📁' },
  { path: `${HOME}/Documents`, label: 'Documents', glyph: '📄' },
  { path: `${HOME}/Downloads`, label: 'Downloads', glyph: '⬇️' },
  { path: `${HOME}/Pictures`, label: 'Pictures', glyph: '🖼️' },
  { path: `${HOME}/Videos`, label: 'Videos', glyph: '🎬' },
]

export default function Files({ winId, props }: AppWindowProps) {
  const fs = useFs()
  const setTitle = useWindows((s) => s.setTitle)

  const [path, setPath] = useState<string>((props.path as string) ?? HOME)
  const [history, setHistory] = useState<string[]>([(props.path as string) ?? HOME])
  const [histIdx, setHistIdx] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [renaming, setRenaming] = useState<string | null>(null)
  const [view, setView] = useState<View>('grid')
  const [sort, setSort] = useState<Sort>('kind')
  const [query, setQuery] = useState('')
  const [showHidden, setShowHidden] = useState(false)
  const renameRef = useRef<HTMLInputElement>(null)

  // Re-open with a different path (e.g. "reveal in Files") should navigate.
  useEffect(() => {
    const p = props.path as string | undefined
    if (p && p !== path) navigate(p)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.path])

  useEffect(() => {
    setTitle(winId, `${basename(path) === '/' ? 'Filesystem' : basename(path)} — Files`)
  }, [path, setTitle, winId])

  useEffect(() => {
    if (renaming) renameRef.current?.select()
  }, [renaming])

  function navigate(next: string, recordHistory = true) {
    const node = fs.read(next)
    if (!node || node.kind !== 'dir') return
    setPath(next)
    setSelected(new Set())
    setQuery('')
    if (recordHistory) {
      setHistory((h) => [...h.slice(0, histIdx + 1), next])
      setHistIdx((i) => i + 1)
    }
  }

  const entries = useMemo(() => {
    const list = fs.list(path) ?? []
    const filtered = list
      .filter((n) => showHidden || !n.name.startsWith('.'))
      .filter((n) => !query || n.name.toLowerCase().includes(query.toLowerCase()))
    return [...filtered].sort((a, b) => {
      if (sort === 'kind' && a.kind !== b.kind) return a.kind === 'dir' ? -1 : b.kind === 'dir' ? 1 : 0
      if (sort === 'size') return (b.size ?? 0) - (a.size ?? 0)
      if (sort === 'modified') return b.modified - a.modified
      return a.name.localeCompare(b.name)
    })
  }, [fs, path, query, showHidden, sort])

  const canBack = histIdx > 0
  const canForward = histIdx < history.length - 1
  const canUp = path !== '/'

  function activate(node: FsNode) {
    const full = resolve(path, node.name)
    if (node.kind === 'dir') navigate(full)
    else openNode(node, full)
  }

  function del(node: FsNode) {
    fs.remove(resolve(path, node.name))
    setSelected(new Set())
  }

  const itemMenu = (node: FsNode) =>
    menu([
      { label: node.kind === 'dir' ? 'Open' : 'Open', glyph: '↗', onClick: () => activate(node) },
      ...(node.kind === 'dir'
        ? [{ label: 'Open in new window', glyph: '🗂️', onClick: () => openNode(node, resolve(path, node.name)) }]
        : []),
      { separator: true },
      {
        label: 'Rename',
        glyph: '✏️',
        hint: 'F2',
        disabled: node.locked,
        onClick: () => setRenaming(node.name),
      },
      {
        label: 'Move to Trash',
        glyph: '🗑️',
        hint: 'Del',
        danger: true,
        disabled: node.locked,
        onClick: () => del(node),
      },
      { separator: true },
      {
        label: 'Properties',
        glyph: 'ⓘ',
        onClick: () =>
          useWindows.getState().open('editor', {
            title: `${node.name} — Properties`,
            props: {
              inlineContent: [
                `Name:      ${node.name}`,
                `Location:  ${prettyPath(path)}`,
                `Type:      ${node.kind}${node.mime ? ` (${node.mime})` : ''}`,
                `Size:      ${formatSize(node)}`,
                `Modified:  ${new Date(node.modified).toLocaleString()}`,
                `Permissions: ${node.locked ? 'read-only (system)' : 'read/write'}`,
              ].join('\n'),
              readOnly: true,
            },
            size: { w: 460, h: 300 },
          }),
      },
    ])

  const blankMenu = menu([
    { label: 'New Folder', glyph: '📁', onClick: () => fs.mkdir(path) },
    {
      label: 'New File',
      glyph: '📄',
      onClick: () => fs.writeFile(path, 'untitled.txt', ''),
    },
    { separator: true },
    {
      label: 'Open Terminal Here',
      glyph: '❯',
      onClick: () => useWindows.getState().open('terminal', { title: 'Terminal', props: { cwd: path } }),
    },
    { separator: true },
    {
      label: view === 'grid' ? 'List view' : 'Grid view',
      glyph: view === 'grid' ? '☰' : '▦',
      onClick: () => setView(view === 'grid' ? 'list' : 'grid'),
    },
    {
      label: showHidden ? 'Hide hidden files' : 'Show hidden files',
      glyph: '👁️',
      hint: 'Ctrl+H',
      onClick: () => setShowHidden((v) => !v),
    },
    {
      label: 'Sort by',
      glyph: '↕',
      children: (['kind', 'name', 'size', 'modified'] as Sort[]).map((s) => ({
        label: s[0].toUpperCase() + s.slice(1),
        glyph: sort === s ? '•' : '',
        onClick: () => setSort(s),
      })),
    },
  ])

  const crumbs = useMemo(() => {
    const rel = path.startsWith(HOME) ? path.slice(HOME.length) : path
    const base = path.startsWith(HOME) ? [{ label: owner.username, path: HOME, glyph: '🏠' }] : [{ label: '/', path: '/', glyph: '💾' }]
    let acc = base[0].path
    for (const seg of rel.split('/').filter(Boolean)) {
      acc = resolve(acc, seg)
      base.push({ label: seg, path: acc, glyph: '' })
    }
    return base
  }, [path])

  return (
    <div
      className="flex h-full flex-col"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Delete' && selected.size) {
          entries.filter((n) => selected.has(n.name) && !n.locked).forEach(del)
        }
        if (e.key === 'F2' && selected.size === 1) setRenaming([...selected][0])
        if (e.key === 'Escape') {
          setSelected(new Set())
          setRenaming(null)
        }
        if (e.ctrlKey && e.key === 'h') {
          e.preventDefault()
          setShowHidden((v) => !v)
        }
        if (e.ctrlKey && e.key === 'a') {
          e.preventDefault()
          setSelected(new Set(entries.map((n) => n.name)))
        }
      }}
    >
      <Toolbar>
        <IconBtn
          title="Back"
          disabled={!canBack}
          onClick={() => {
            const i = histIdx - 1
            setHistIdx(i)
            navigate(history[i], false)
          }}
        >
          ←
        </IconBtn>
        <IconBtn
          title="Forward"
          disabled={!canForward}
          onClick={() => {
            const i = histIdx + 1
            setHistIdx(i)
            navigate(history[i], false)
          }}
        >
          →
        </IconBtn>
        <IconBtn title="Up one level" disabled={!canUp} onClick={() => navigate(dirname(path))}>
          ↑
        </IconBtn>

        <div
          className="mx-1 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto rounded-lg px-2 py-1"
          style={{ background: 'color-mix(in oklab, var(--text) 8%, transparent)' }}
        >
          {crumbs.map((c, i) => (
            <span key={c.path} className="flex items-center gap-0.5">
              {i > 0 && (
                <span className="px-0.5 text-[11px]" style={{ color: 'var(--text-dim)' }}>
                  ›
                </span>
              )}
              <button
                type="button"
                onClick={() => navigate(c.path)}
                className="rounded px-1.5 py-0.5 text-[12px] whitespace-nowrap hover:bg-white/10"
                style={{ color: i === crumbs.length - 1 ? 'var(--text)' : 'var(--text-dim)', fontWeight: i === crumbs.length - 1 ? 600 : 400 }}
              >
                {c.glyph} {c.label}
              </button>
            </span>
          ))}
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-36 rounded-lg px-2.5 py-1 text-[12px] outline-none"
          style={{ background: 'color-mix(in oklab, var(--text) 8%, transparent)', color: 'var(--text)' }}
        />
        <IconBtn title={view === 'grid' ? 'List view' : 'Grid view'} onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>
          {view === 'grid' ? '☰' : '▦'}
        </IconBtn>
      </Toolbar>

      <div className="flex min-h-0 flex-1">
        <Sidebar>
          <SidebarLabel>Places</SidebarLabel>
          {PLACES.filter((p) => fs.exists(p.path)).map((p) => (
            <SidebarItem key={p.path} glyph={p.glyph} active={path === p.path} onClick={() => navigate(p.path)}>
              {p.label}
            </SidebarItem>
          ))}
          <SidebarLabel>System</SidebarLabel>
          <SidebarItem glyph="💾" active={path === '/'} onClick={() => navigate('/')}>
            Filesystem
          </SidebarItem>
          <SidebarItem glyph="🗑️" onClick={() => useWindows.getState().open('trash', { title: 'Trash', singleInstance: true })}>
            Trash
          </SidebarItem>
        </Sidebar>

        <Scroll>
          <div className="min-h-full p-3" onContextMenu={blankMenu} onPointerDown={() => setSelected(new Set())}>
            {entries.length === 0 ? (
              <EmptyState
                glyph={query ? '🔍' : '📂'}
                title={query ? 'No matches' : 'This folder is empty'}
                body={query ? `Nothing here matches “${query}”.` : 'Right-click to create a folder.'}
              />
            ) : view === 'grid' ? (
              <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))' }}>
                {entries.map((node) => (
                  <GridItem
                    key={node.name}
                    node={node}
                    selected={selected.has(node.name)}
                    renaming={renaming === node.name}
                    renameRef={renameRef}
                    onSelect={(additive) =>
                      setSelected((s) => {
                        const next = additive ? new Set(s) : new Set<string>()
                        if (additive && s.has(node.name)) next.delete(node.name)
                        else next.add(node.name)
                        return next
                      })
                    }
                    onOpen={() => activate(node)}
                    onContextMenu={itemMenu(node)}
                    onRename={(name) => {
                      if (name && name !== node.name) fs.rename(resolve(path, node.name), name)
                      setRenaming(null)
                    }}
                  />
                ))}
              </div>
            ) : (
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr style={{ color: 'var(--text-dim)' }}>
                    {(['name', 'size', 'modified'] as const).map((col) => (
                      <th
                        key={col}
                        className="cursor-pointer px-2 py-1.5 text-left text-[11px] font-medium"
                        onClick={() => setSort(col === 'name' ? 'name' : col)}
                      >
                        {col[0].toUpperCase() + col.slice(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((node) => (
                    <tr
                      key={node.name}
                      onPointerDown={(e) => {
                        e.stopPropagation()
                        setSelected(new Set([node.name]))
                      }}
                      onDoubleClick={() => activate(node)}
                      onContextMenu={itemMenu(node)}
                      className="cursor-default rounded"
                      style={{ background: selected.has(node.name) ? 'var(--accent-soft)' : undefined }}
                    >
                      <td className="px-2 py-1.5">
                        <span className="mr-2">{iconFor(node)}</span>
                        {node.name}
                      </td>
                      <td className="px-2 py-1.5" style={{ color: 'var(--text-dim)' }}>
                        {formatSize(node)}
                      </td>
                      <td className="px-2 py-1.5" style={{ color: 'var(--text-dim)' }}>
                        {new Date(node.modified).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Scroll>
      </div>

      <StatusBar>
        <span>
          {entries.length} item{entries.length === 1 ? '' : 's'}
        </span>
        {selected.size > 0 && <span>· {selected.size} selected</span>}
        <span className="ml-auto">{prettyPath(path)}</span>
      </StatusBar>
    </div>
  )
}

function GridItem({
  node,
  selected,
  renaming,
  renameRef,
  onSelect,
  onOpen,
  onContextMenu,
  onRename,
}: {
  node: FsNode
  selected: boolean
  renaming: boolean
  renameRef: React.RefObject<HTMLInputElement | null>
  onSelect: (additive: boolean) => void
  onOpen: () => void
  onContextMenu: (e: React.MouseEvent) => void
  onRename: (name: string) => void
}) {
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.stopPropagation()
        onSelect(e.ctrlKey || e.metaKey)
      }}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
      className="flex flex-col items-center gap-1 rounded-lg px-1.5 py-2.5 text-center transition-colors"
      style={{ background: selected ? 'var(--accent-soft)' : undefined }}
      title={node.name}
    >
      <span className="text-[30px] leading-none">{iconFor(node)}</span>
      {renaming ? (
        <input
          ref={renameRef}
          defaultValue={node.name}
          autoFocus
          onPointerDown={(e) => e.stopPropagation()}
          onBlur={(e) => onRename(e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onRename((e.target as HTMLInputElement).value.trim())
            if (e.key === 'Escape') onRename(node.name)
          }}
          className="w-full rounded px-1 text-center text-[11px] outline-none"
          style={{ background: 'var(--chrome)', color: 'var(--text)', boxShadow: '0 0 0 1.5px var(--accent)' }}
        />
      ) : (
        <span
          className="line-clamp-2 text-[11.5px] leading-tight break-words"
          style={{ color: selected ? 'var(--text)' : 'var(--text-dim)' }}
        >
          {node.name}
        </span>
      )}
    </button>
  )
}
