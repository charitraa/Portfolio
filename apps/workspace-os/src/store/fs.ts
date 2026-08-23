import { create } from 'zustand'
import type { AppId } from '@/os/types'
import {
  aboutMarkdown,
  aiRisks,
  certifications,
  learningTracks,
  methodologies,
  owaspTop10,
  owner,
  projects,
  securityPhases,
  securityTools,
  stations,
} from '@/data/portfolio'

export type NodeKind = 'dir' | 'file' | 'app' | 'link'

export interface FsNode {
  name: string
  kind: NodeKind
  children?: FsNode[]
  /** Plain-text payload for `file` nodes. */
  content?: string
  /** For `app` nodes — a launcher shortcut. */
  appId?: AppId
  /** Extra launch arguments passed to the app when opened. */
  args?: Record<string, unknown>
  /** For `link` nodes — an external URL, opened in the Browser app. */
  url?: string
  mime?: string
  size?: number
  modified: number
  /** System files refuse to be deleted or renamed. */
  locked?: boolean
  glyph?: string
}

export interface TrashItem {
  id: string
  node: FsNode
  /** Directory the node was deleted from, so restore can put it back. */
  origin: string
  deletedAt: number
}

export const HOME = `/home/${owner.username}`
export const DESKTOP = `${HOME}/Desktop`

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

export function normalize(path: string): string {
  const absolute = path.startsWith('/')
  const parts: string[] = []
  for (const seg of path.split('/')) {
    if (!seg || seg === '.') continue
    if (seg === '..') parts.pop()
    else parts.push(seg)
  }
  return (absolute ? '/' : '') + parts.join('/')
}

export function resolve(cwd: string, path: string): string {
  if (!path || path === '~') return HOME
  if (path.startsWith('~/')) return normalize(HOME + path.slice(1))
  if (path.startsWith('/')) return normalize(path)
  return normalize(`${cwd}/${path}`)
}

export function dirname(path: string): string {
  const n = normalize(path)
  const i = n.lastIndexOf('/')
  if (i <= 0) return '/'
  return n.slice(0, i)
}

export function basename(path: string): string {
  const n = normalize(path)
  return n.slice(n.lastIndexOf('/') + 1) || '/'
}

/** `/home/charitra/Projects` → `~/Projects`, for prompts and breadcrumbs. */
export function prettyPath(path: string): string {
  const n = normalize(path)
  if (n === HOME) return '~'
  if (n.startsWith(HOME + '/')) return '~' + n.slice(HOME.length)
  return n || '/'
}

function file(name: string, content: string, extra: Partial<FsNode> = {}): FsNode {
  return {
    name,
    kind: 'file',
    content,
    size: content.length,
    mime: 'text/plain',
    modified: Date.now(),
    ...extra,
  }
}

function dir(name: string, children: FsNode[], extra: Partial<FsNode> = {}): FsNode {
  return { name, kind: 'dir', children, modified: Date.now(), ...extra }
}

function app(name: string, appId: AppId, glyph: string, extra: Partial<FsNode> = {}): FsNode {
  return { name, kind: 'app', appId, glyph, modified: Date.now(), ...extra }
}

// ---------------------------------------------------------------------------
// The initial disk image
// ---------------------------------------------------------------------------

function projectFile(p: (typeof projects)[number]): FsNode {
  const body = [
    `# ${p.name}`,
    '',
    `${p.tagline}`,
    '',
    `Year:   ${p.year}`,
    `Status: ${p.status}`,
    `Stack:  ${p.stack.join(', ')}`,
    '',
    p.description,
    '',
    '## Highlights',
    ...p.highlights.map((h) => `  - ${h}`),
    '',
    p.repo ? `Repository: ${p.repo}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return file(`${p.id}.project`, body, {
    mime: 'application/x-project',
    glyph: p.glyph,
    args: { projectId: p.id },
  })
}

function buildRoot(): FsNode {
  return dir('/', [
    dir('bin', [], { locked: true }),
    dir(
      'etc',
      [
        file(
          'os-release',
          [
            `NAME="${owner.osName}"`,
            `VERSION="${owner.osVersion} (${owner.osCodename})"`,
            `ID=${owner.osName.toLowerCase()}`,
            `PRETTY_NAME="${owner.osName} ${owner.osVersion} ${owner.osCodename}"`,
            `HOME_URL="https://github.com/${owner.username}"`,
          ].join('\n'),
          { locked: true },
        ),
        file('hostname', owner.hostname, { locked: true }),
        file(
          'motd',
          [
            `Welcome to ${owner.osName} ${owner.osVersion} (${owner.osCodename})`,
            '',
            'You are logged in as a guest. Everything here is explorable.',
            "Type 'help' to see what this shell can do.",
          ].join('\n'),
          { locked: true },
        ),
      ],
      { locked: true },
    ),
    dir(
      'home',
      [
        dir(owner.username, [
          dir('Desktop', [
            app('Workspace', 'stations', '🧭'),
            app('Projects', 'projects', '📁'),
            app('Security Lab', 'seclab', '🛡️'),
            app('GitHub', 'github', '🐙'),
            app('Services', 'services', '🧾'),
            app('About Me', 'about', '📝'),
            app('Resume', 'resume', '📄'),
            app('Skills', 'skills', '📦'),
            app('Experience', 'experience', '🗓️'),
            app('Tech Stack', 'techstack', '🧰'),
            app('Contact', 'contact', '✉️'),
            app('Terminal', 'terminal', '❯'),
            app('Files', 'files', '🗂️'),
            app('Browser', 'browser', '🌐'),
          ]),
          dir('Projects', projects.map(projectFile)),
          dir('Documents', [
            file(
              'certifications.txt',
              certifications.length
                ? certifications
                    .map((c) => `${c.name}\n  Issuer: ${c.issuer}\n  Year:   ${c.year}\n  ID:     ${c.id}`)
                    .join('\n\n')
                : 'No certifications recorded yet.\n\nThis file stays honest rather than full.',
            ),
            file(
              'notes.md',
              [
                '# Scratch notes',
                '',
                '- The window manager reducer lives in src/store/windows.ts',
                '- Terminal commands are registered in src/apps/terminal/commands.ts',
                '- Everything a visitor reads comes from src/data/portfolio.ts',
                '',
                'If you are reading this, you found the file nobody was supposed to open.',
                'Fair enough. Try `sudo hire me` in the terminal.',
              ].join('\n'),
            ),
            file('todo.txt', ['[x] Build a window manager', '[x] Make the terminal real', '[ ] Sleep'].join('\n')),
          ]),
          dir('Cybersecurity', [
            app('Security Lab', 'seclab', '🛡️'),
            app('GitHub', 'github', '🐙'),
            app('Services', 'services', '🧾'),
            app('Web Security', 'websec', '🌐'),
            app('AI Security', 'aisec', '🧠'),
            app('Network', 'network', '🕸️'),
            file(
              'methodology.md',
              [
                '# Methodology',
                '',
                'The lab work is organised around published frameworks rather than',
                'an ad-hoc checklist. Referenced, not certified against:',
                '',
                ...methodologies.map((m) => `- **${m.name}** — ${m.note}`),
                '',
                '## Phases',
                '',
                ...securityPhases.map((ph) => `${ph.order}. ${ph.name} — ${ph.summary}`),
              ].join('\n'),
              { mime: 'text/markdown', glyph: '📝' },
            ),
            file(
              'toolkit.txt',
              securityTools.map((t) => `${t.name.padEnd(12)} ${t.purpose}`).join('\n'),
            ),
            file(
              'scope.txt',
              [
                'SCOPE AND AUTHORISATION',
                '',
                'Everything in this station is practised in deliberately vulnerable',
                'lab environments, or against systems I built myself.',
                '',
                'No technique here is run against a host without written permission.',
                'None of it is presented as paid or professional security work.',
              ].join('\n'),
              { locked: true },
            ),
          ]),
          dir('Labs', [
            file(
              'owasp-top-10.md',
              [
                '# OWASP Top 10 (2021) — working notes',
                '',
                ...owaspTop10.flatMap((v) => [
                  `## ${v.code} — ${v.name}`,
                  '',
                  v.summary,
                  '',
                  `**Test:** ${v.test}`,
                  '',
                  `**Defence:** ${v.defence}`,
                  '',
                ]),
              ].join('\n'),
              { mime: 'text/markdown', glyph: '📝' },
            ),
            file(
              'ai-security.md',
              [
                '# LLM application security — working notes',
                '',
                ...aiRisks.flatMap((r) => [`## ${r.name} (${r.category})`, '', r.summary, '', `**Mitigation:** ${r.mitigation}`, '']),
              ].join('\n'),
              { mime: 'text/markdown', glyph: '📝' },
            ),
          ]),
          dir('Research', [
            app('Knowledge', 'knowledge', '📚'),
            file(
              'learning.md',
              [
                '# Current tracks',
                '',
                ...learningTracks.map((t) => `- **${t.name}** (${t.provider}) — ${t.status}`),
                '',
                'Progress figures in the Knowledge app are self-assessed completion of',
                'material, not scores and not credentials.',
              ].join('\n'),
              { mime: 'text/markdown', glyph: '📝' },
            ),
          ]),
          dir(
            'Workspace',
            stations.map((st) =>
              file(
                `${st.index}-${st.id}.station`,
                [`# Station ${st.index} — ${st.name}`, '', st.blurb, '', '## On this bench', ...st.contents.map((c) => `- ${c}`)].join(
                  '\n',
                ),
                { mime: 'text/markdown', glyph: st.glyph },
              ),
            ),
          ),
          dir('Downloads', []),
          dir('Pictures', [
            file('setup-2026.png', 'A photo of the desk you are sitting at.', { mime: 'image/png', glyph: '🖼️' }),
            file('whiteboard.jpg', 'Architecture sketch for the streaming pipeline.', { mime: 'image/jpeg', glyph: '🖼️' }),
          ]),
          dir('Videos', []),
          file('About.md', aboutMarkdown, { mime: 'text/markdown', glyph: '📝' }),
          file('Resume.pdf', 'Rendered by the PDF viewer.', { mime: 'application/pdf', glyph: '📄' }),
          file(
            '.bashrc',
            ['# guest session', `export PS1="${owner.username}@${owner.hostname}:\\w$ "`, 'alias ll="ls -la"'].join('\n'),
          ),
        ]),
      ],
      { locked: true },
    ),
    dir('usr', [dir('share', [], { locked: true })], { locked: true }),
    dir('var', [dir('log', [file('boot.log', 'See the System Monitor for the live journal.')], { locked: true })], {
      locked: true,
    }),
  ])
}

// ---------------------------------------------------------------------------
// Immutable tree operations
// ---------------------------------------------------------------------------

function getNode(root: FsNode, path: string): FsNode | null {
  const n = normalize(path)
  if (n === '/' || n === '') return root
  let cur: FsNode = root
  for (const seg of n.split('/').filter(Boolean)) {
    if (cur.kind !== 'dir' || !cur.children) return null
    const next = cur.children.find((c) => c.name === seg)
    if (!next) return null
    cur = next
  }
  return cur
}

/**
 * Rebuilds the spine from root down to `path`, applying `fn` to the directory
 * at `path`. Returns the new root, or null when the path is not a directory.
 */
function updateDir(root: FsNode, path: string, fn: (d: FsNode) => FsNode): FsNode | null {
  const segs = normalize(path).split('/').filter(Boolean)

  const walk = (node: FsNode, depth: number): FsNode | null => {
    if (depth === segs.length) {
      if (node.kind !== 'dir') return null
      return fn(node)
    }
    if (node.kind !== 'dir' || !node.children) return null
    const name = segs[depth]
    const idx = node.children.findIndex((c) => c.name === name)
    if (idx === -1) return null
    const updated = walk(node.children[idx], depth + 1)
    if (!updated) return null
    const children = node.children.slice()
    children[idx] = updated
    return { ...node, children }
  }

  return walk(root, 0)
}

function uniqueName(existing: FsNode[], desired: string): string {
  if (!existing.some((c) => c.name === desired)) return desired
  const dot = desired.lastIndexOf('.')
  const stem = dot > 0 ? desired.slice(0, dot) : desired
  const ext = dot > 0 ? desired.slice(dot) : ''
  let i = 2
  while (existing.some((c) => c.name === `${stem} ${i}${ext}`)) i++
  return `${stem} ${i}${ext}`
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface FsState {
  root: FsNode
  trash: TrashItem[]
  trashSeq: number

  read: (path: string) => FsNode | null
  list: (path: string) => FsNode[] | null
  exists: (path: string) => boolean

  mkdir: (parent: string, name?: string) => string | null
  writeFile: (parent: string, name: string, content: string) => string | null
  updateFile: (path: string, content: string) => boolean
  rename: (path: string, next: string) => boolean
  move: (path: string, destDir: string) => boolean
  remove: (path: string) => boolean
  restoreFromTrash: (id: string) => boolean
  emptyTrash: () => void
  reset: () => void
}

export const useFs = create<FsState>((set, get) => ({
  root: buildRoot(),
  trash: [],
  trashSeq: 0,

  read: (path) => getNode(get().root, path),

  list: (path) => {
    const node = getNode(get().root, path)
    if (!node || node.kind !== 'dir') return null
    return node.children ?? []
  },

  exists: (path) => getNode(get().root, path) !== null,

  mkdir: (parent, name = 'New Folder') => {
    const root = get().root
    const parentNode = getNode(root, parent)
    if (!parentNode || parentNode.kind !== 'dir') return null
    const finalName = uniqueName(parentNode.children ?? [], name)
    const next = updateDir(root, parent, (d) => ({
      ...d,
      children: [...(d.children ?? []), dir(finalName, [])],
    }))
    if (!next) return null
    set({ root: next })
    return normalize(`${parent}/${finalName}`)
  },

  writeFile: (parent, name, content) => {
    const root = get().root
    const parentNode = getNode(root, parent)
    if (!parentNode || parentNode.kind !== 'dir') return null
    const existing = (parentNode.children ?? []).find((c) => c.name === name)
    if (existing) {
      const ok = get().updateFile(normalize(`${parent}/${name}`), content)
      return ok ? normalize(`${parent}/${name}`) : null
    }
    const next = updateDir(root, parent, (d) => ({
      ...d,
      children: [...(d.children ?? []), file(name, content)],
    }))
    if (!next) return null
    set({ root: next })
    return normalize(`${parent}/${name}`)
  },

  updateFile: (path, content) => {
    const parent = dirname(path)
    const name = basename(path)
    const next = updateDir(get().root, parent, (d) => ({
      ...d,
      children: (d.children ?? []).map((c) =>
        c.name === name ? { ...c, content, size: content.length, modified: Date.now() } : c,
      ),
    }))
    if (!next) return false
    set({ root: next })
    return true
  },

  rename: (path, nextName) => {
    const node = getNode(get().root, path)
    if (!node || node.locked) return false
    const parent = dirname(path)
    const parentNode = getNode(get().root, parent)
    if (!parentNode?.children) return false
    const name = basename(path)
    const finalName = uniqueName(
      parentNode.children.filter((c) => c.name !== name),
      nextName,
    )
    const next = updateDir(get().root, parent, (d) => ({
      ...d,
      children: (d.children ?? []).map((c) => (c.name === name ? { ...c, name: finalName } : c)),
    }))
    if (!next) return false
    set({ root: next })
    return true
  },

  move: (path, destDir) => {
    const node = getNode(get().root, path)
    if (!node || node.locked) return false
    const from = dirname(path)
    const to = normalize(destDir)
    if (from === to) return true
    // Refuse to move a directory into itself.
    if (to === normalize(path) || to.startsWith(normalize(path) + '/')) return false

    const detached = updateDir(get().root, from, (d) => ({
      ...d,
      children: (d.children ?? []).filter((c) => c.name !== node.name),
    }))
    if (!detached) return false

    const destNode = getNode(detached, to)
    if (!destNode || destNode.kind !== 'dir') return false
    const finalName = uniqueName(destNode.children ?? [], node.name)

    const attached = updateDir(detached, to, (d) => ({
      ...d,
      children: [...(d.children ?? []), { ...node, name: finalName }],
    }))
    if (!attached) return false
    set({ root: attached })
    return true
  },

  remove: (path) => {
    const node = getNode(get().root, path)
    if (!node || node.locked) return false
    const parent = dirname(path)
    const next = updateDir(get().root, parent, (d) => ({
      ...d,
      children: (d.children ?? []).filter((c) => c.name !== node.name),
    }))
    if (!next) return false
    const seq = get().trashSeq + 1
    set({
      root: next,
      trashSeq: seq,
      trash: [{ id: `trash-${seq}`, node, origin: parent, deletedAt: Date.now() }, ...get().trash],
    })
    return true
  },

  restoreFromTrash: (id) => {
    const item = get().trash.find((t) => t.id === id)
    if (!item) return false
    let root = get().root
    // The original directory may itself have been deleted since; fall back home.
    const target = getNode(root, item.origin)?.kind === 'dir' ? item.origin : HOME
    const destNode = getNode(root, target)
    const finalName = uniqueName(destNode?.children ?? [], item.node.name)
    const next = updateDir(root, target, (d) => ({
      ...d,
      children: [...(d.children ?? []), { ...item.node, name: finalName }],
    }))
    if (!next) return false
    root = next
    set({ root, trash: get().trash.filter((t) => t.id !== id) })
    return true
  },

  emptyTrash: () => set({ trash: [] }),

  reset: () => set({ root: buildRoot(), trash: [], trashSeq: 0 }),
}))

/** Icon for a node, used by Files, Desktop and the Trash app. */
export function iconFor(node: FsNode): string {
  if (node.glyph) return node.glyph
  if (node.kind === 'dir') return '📁'
  if (node.kind === 'app') return '🚀'
  if (node.kind === 'link') return '🔗'
  if (node.mime === 'application/pdf') return '📄'
  if (node.mime?.startsWith('image/')) return '🖼️'
  if (node.name.endsWith('.md')) return '📝'
  if (node.name.startsWith('.')) return '⚙️'
  return '📃'
}

export function formatSize(node: FsNode): string {
  if (node.kind === 'dir') return `${node.children?.length ?? 0} items`
  const bytes = node.size ?? node.content?.length ?? 0
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
