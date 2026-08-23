import type { ReactNode } from 'react'
import {
  DEPTH_LABEL,
  aiRisks,
  fortunes,
  learningTracks,
  links,
  owaspTop10,
  owner,
  projects,
  securityPhases,
  securityTools,
  skills,
  stations,
  techStack,
} from '@/data/portfolio'
import {
  HOME,
  basename,
  dirname,
  formatSize,
  prettyPath,
  resolve,
  useFs,
  type FsNode,
} from '@/store/fs'
import { useSystem } from '@/store/system'
import { useWindows } from '@/store/windows'
import { notify } from '@/store/notifications'
import { apps } from '@/apps/registry'
import { stations3d, stationById } from '@/world/stations3d'
import { services as servicesList } from '@/data/portfolio'
import { useWorld } from '@/world/player'
import { useDiscovery } from '@/store/discovery'
import { launchApp } from '@/os/launch'
import type { AppId } from '@/os/types'

export interface CmdCtx {
  args: string[]
  raw: string
  cwd: string
  setCwd: (path: string) => void
  print: (node: ReactNode) => void
  clear: () => void
  /** Ends the terminal session (closes the window). */
  exit: () => void
}

export interface Command {
  desc: string
  usage?: string
  hidden?: boolean
  run: (ctx: CmdCtx) => void | Promise<void>
}

// --- little render helpers -------------------------------------------------

const Dim = ({ children }: { children: ReactNode }) => (
  <span style={{ color: 'var(--text-dim)' }}>{children}</span>
)
const Acc = ({ children }: { children: ReactNode }) => (
  <span style={{ color: 'var(--accent)' }}>{children}</span>
)
const Err = ({ children }: { children: ReactNode }) => (
  <span style={{ color: '#f87171' }}>{children}</span>
)
const Good = ({ children }: { children: ReactNode }) => (
  <span style={{ color: '#4ade80' }}>{children}</span>
)

function Rows({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <div className="grid gap-x-6 gap-y-0.5" style={{ gridTemplateColumns: 'max-content 1fr' }}>
      {rows.map(([a, b], i) => (
        <div key={i} className="contents">
          <div>{a}</div>
          <div style={{ color: 'var(--text-dim)' }}>{b}</div>
        </div>
      ))}
    </div>
  )
}

function openApp(appId: AppId, props?: Record<string, unknown>) {
  launchApp(appId, props)
}

function nodeColor(n: FsNode): ReactNode {
  const name = n.kind === 'dir' ? `${n.name}/` : n.name
  if (n.kind === 'dir') return <span style={{ color: '#60a5fa', fontWeight: 600 }}>{name}</span>
  if (n.kind === 'app') return <span style={{ color: '#4ade80', fontWeight: 600 }}>{name}*</span>
  if (n.kind === 'link') return <span style={{ color: '#22d3ee' }}>{name}@</span>
  return <span>{name}</span>
}

// --- commands --------------------------------------------------------------

export const commands: Record<string, Command> = {
  help: {
    desc: 'List available commands',
    run: ({ print }) => {
      const visible = Object.entries(commands).filter(([, c]) => !c.hidden)
      print(
        <div className="space-y-2">
          <div>
            <Acc>{owner.osName}</Acc> shell — {visible.length} commands available.
          </div>
          <Rows rows={visible.map(([name, c]) => [<Acc key={name}>{c.usage ?? name}</Acc>, c.desc])} />
          <Dim>
            Tab completes. ↑/↓ walks history. Ctrl+L clears. Try <Acc>stations</Acc>, then{' '}
            <Acc>cyber</Acc> or <Acc>projects</Acc>.
          </Dim>
        </div>,
      )
    },
  },

  about: {
    desc: 'Who you are talking to',
    run: ({ print }) => {
      print(
        <div className="space-y-1">
          <div className="text-base font-semibold">{owner.name}</div>
          <div>
            <Acc>{owner.role}</Acc> <Dim>· {owner.location}</Dim>
          </div>
          <div className="pt-1">{owner.tagline}</div>
          <Dim>
            Run <Acc>open about</Acc> to read the full file in the editor.
          </Dim>
        </div>,
      )
    },
  },

  projects: {
    desc: 'List projects',
    usage: 'projects',
    run: ({ print }) => {
      print(
        <div className="space-y-1.5">
          {projects.map((p) => (
            <div key={p.id}>
              <span className="mr-2">{p.glyph}</span>
              <Acc>{p.id.padEnd(18)}</Acc>
              <span>{p.tagline}</span>{' '}
              <Dim>
                [{p.year} · {p.status}]
              </Dim>
            </div>
          ))}
          <Dim>
            Open one with <Acc>project &lt;name&gt;</Acc>, e.g. <Acc>project {projects[0].id}</Acc>
          </Dim>
        </div>,
      )
    },
  },

  project: {
    desc: 'Open a project in the Project Manager',
    usage: 'project <name>',
    run: ({ args, print }) => {
      const id = args[0]
      if (!id) return print(<Err>usage: project &lt;name&gt;</Err>)
      const p = projects.find((x) => x.id === id || x.name.toLowerCase() === id.toLowerCase())
      if (!p) return print(<Err>project: {id}: no such project. Try `projects`.</Err>)
      openApp('projects', { projectId: p.id })
      print(
        <span>
          Opening <Acc>{p.name}</Acc>…
        </span>,
      )
    },
  },

  skills: {
    desc: 'Installed skill packages',
    run: ({ print }) => {
      const byCat = new Map<string, typeof skills>()
      for (const s of skills) {
        const list = byCat.get(s.category) ?? []
        list.push(s)
        byCat.set(s.category, list)
      }
      print(
        <div className="space-y-2">
          {[...byCat].map(([cat, list]) => (
            <div key={cat}>
              <Dim>{cat}</Dim>
              <div className="flex flex-wrap gap-x-4">
                {list.map((s) => (
                  <span key={s.name}>
                    <Acc>{s.name}</Acc>
                    <Dim>/{s.version}</Dim>
                  </span>
                ))}
              </div>
            </div>
          ))}
          <Dim>
            <Acc>open skills</Acc> for the full package manager.
          </Dim>
        </div>,
      )
    },
  },

  tech: {
    desc: 'Tech stack summary',
    run: ({ print }) => {
      print(
        <div className="space-y-1.5">
          {Object.entries(techStack).map(([cat, entries]) => (
            <div key={cat}>
              <Acc>{cat}</Acc>
              <Dim> — {entries.map((e) => e.name).join(', ')}</Dim>
            </div>
          ))}
        </div>,
      )
    },
  },

  contact: {
    desc: 'How to reach me',
    run: ({ print }) => {
      print(
        <div className="space-y-1">
          <Rows
            rows={[
              ['email', owner.email],
              ['github', links.github],
              ['linkedin', links.linkedin],
              ['website', links.website],
            ]}
          />
          <Dim>
            <Acc>open contact</Acc> composes a message without leaving the desktop.
          </Dim>
        </div>,
      )
    },
  },

  resume: {
    desc: 'Open the résumé (and download it)',
    run: ({ print }) => {
      openApp('resume')
      notify({ title: 'Résumé opened', body: `${owner.name} — ${owner.role}`, glyph: '📄' })
      print(
        <span>
          <Good>✓</Good> Opening Resume.pdf in the document viewer.
        </span>,
      )
    },
  },

  github: {
    desc: 'Public repositories, fetched live from GitHub',
    run: ({ print }) => {
      openApp('github')
      print(
        <span>
          Fetching public repositories for <Acc>{links.github}</Acc>. <Dim>Live from the API, not a snapshot.</Dim>
        </span>,
      )
    },
  },

  open: {
    desc: 'Launch an application',
    usage: 'open <app>',
    run: ({ args, print }) => {
      const name = args[0]
      if (!name) {
        return print(
          <div>
            <Err>usage: open &lt;app&gt;</Err>
            <div className="mt-1">
              <Dim>available: {apps.map((a) => a.id).join(', ')}</Dim>
            </div>
          </div>,
        )
      }
      const meta = apps.find((a) => a.id === name.toLowerCase() || a.name.toLowerCase() === name.toLowerCase())
      if (!meta) return print(<Err>open: {name}: no such application</Err>)
      openApp(meta.id)
      print(
        <span>
          Launching <Acc>{meta.name}</Acc>…
        </span>,
      )
    },
  },

  // --- filesystem ---------------------------------------------------------

  stations: {
    desc: 'List the workstation stations',
    usage: 'stations',
    run: ({ print }) => {
      openApp('stations')
      print(
        <div className="space-y-1.5">
          {stations.map((st) => (
            <div key={st.id}>
              <span className="mr-2">{st.glyph}</span>
              <Dim>{st.index}</Dim> <Acc>{st.id.padEnd(14)}</Acc>
              <span>{st.blurb}</span>
            </div>
          ))}
          <Dim>
            Opening the workspace map. Try <Acc>cyber</Acc>, <Acc>web</Acc>, <Acc>ai</Acc>, <Acc>net</Acc> or{' '}
            <Acc>learn</Acc>.
          </Dim>
        </div>,
      )
    },
  },

  cyber: {
    desc: 'Open the Security Lab',
    usage: 'cyber',
    run: ({ print }) => {
      openApp('seclab')
      print(
        <div className="space-y-1.5">
          <Good>Security Lab — station 02</Good>
          {securityPhases.map((ph) => (
            <div key={ph.id}>
              <Dim>{String(ph.order).padStart(2, '0')}</Dim> <Acc>{ph.name.padEnd(22)}</Acc>
              <Dim>{ph.tools.length} tools</Dim>
            </div>
          ))}
          <Dim>
            {securityTools.length} tools catalogued. Every one carries a depth label — {DEPTH_LABEL.reading},{' '}
            {DEPTH_LABEL.lab} or {DEPTH_LABEL.project}. Nothing here claims professional security work.
          </Dim>
        </div>,
      )
    },
  },

  web: {
    desc: 'Open Web Security (OWASP Top 10)',
    usage: 'web',
    run: ({ print }) => {
      openApp('websec')
      print(
        <div className="space-y-0.5">
          <Good>Web Security — station 03</Good>
          {owaspTop10.map((v) => (
            <div key={v.id}>
              <Acc>{v.code}</Acc> <span>{v.name}</span>
            </div>
          ))}
        </div>,
      )
    },
  },

  ai: {
    desc: 'Open AI Security',
    usage: 'ai',
    run: ({ print }) => {
      openApp('aisec')
      print(
        <div className="space-y-0.5">
          <Good>AI Security — station 04</Good>
          {aiRisks.map((r) => (
            <div key={r.id}>
              <Dim>{r.category.padEnd(7)}</Dim> <Acc>{r.name}</Acc>
            </div>
          ))}
        </div>,
      )
    },
  },

  net: {
    desc: 'Open the network topology',
    usage: 'net',
    run: ({ print }) => {
      openApp('network')
      print(
        <span>
          Opening the lab topology. <Dim>Generic practice network — no real address or hostname appears in it.</Dim>
        </span>,
      )
    },
  },

  learn: {
    desc: 'What is currently being learned',
    usage: 'learn',
    run: ({ print }) => {
      openApp('knowledge')
      print(
        <div className="space-y-1">
          <Good>Knowledge — station 07</Good>
          {learningTracks.map((t) => (
            <div key={t.id}>
              <Acc>{t.provider.padEnd(16)}</Acc>
              <span>{t.name}</span> <Dim>[{t.status}]</Dim>
            </div>
          ))}
        </div>,
      )
    },
  },

  explore: {
    desc: 'Get up and walk around the room',
    usage: 'explore',
    run: ({ print }) => {
      const sys = useSystem.getState()
      if (sys.settings.display !== 'panel') {
        return print(
          <Err>
            The display is popped out, so there is no room to stand in. Settings → Interface → put the display back on
            the desk first.
          </Err>,
        )
      }
      sys.setView('explore')
      print(
        <span>
          Standing up. <Dim>WASD to walk, E to use a station, M for the map.</Dim>
        </span>,
      )
    },
  },

  goto: {
    desc: 'Walk to a station in the room',
    usage: 'goto <station>',
    run: ({ args, print }) => {
      const id = args[0]?.toLowerCase()
      if (!id) {
        return print(
          <div className="space-y-1">
            <Err>usage: goto &lt;station&gt;</Err>
            <div>
              <Dim>Known places: </Dim>
              {stations3d.map((s, i) => (
                <span key={s.id}>
                  {i > 0 && <Dim>, </Dim>}
                  <Acc>{s.id}</Acc>
                </span>
              ))}
            </div>
          </div>,
        )
      }

      const st =
        stationById.get(id) ??
        stations3d.find((s) => s.name.toLowerCase().includes(id) || s.id.startsWith(id))
      if (!st) return print(<Err>goto: {id}: no such station. Run `goto` for the list.</Err>)

      const sys = useSystem.getState()
      if (sys.settings.display !== 'panel') {
        return print(<Err>goto: the display is popped out — there is no room to walk around in.</Err>)
      }

      // Walking there counts as finding it, however you got there.
      useDiscovery.getState().discover(st.id)
      sys.setView('explore')
      useWorld.getState().goTo(st.id)
      print(
        <span>
          {st.glyph} Walking to <Acc>{st.name}</Acc>. <Dim>{st.blurb}</Dim>
        </span>,
      )
    },
  },

  services: {
    desc: 'What I can be hired to build',
    usage: 'services',
    run: ({ print }) => {
      openApp('services')
      print(
        <div className="space-y-0.5">
          {servicesList.map((sv) => (
            <div key={sv.id}>
              <span className="mr-2">{sv.glyph}</span>
              <Acc>{sv.id.padEnd(18)}</Acc>
              <span>{sv.summary}</span>
            </div>
          ))}
        </div>,
      )
    },
  },

  ls: {
    desc: 'List directory contents',
    usage: 'ls [-l] [path]',
    run: ({ args, cwd, print }) => {
      const long = args.includes('-l') || args.includes('-la') || args.includes('-al')
      const showAll = args.some((a) => a.startsWith('-') && a.includes('a'))
      const target = resolve(cwd, args.find((a) => !a.startsWith('-')) ?? '.')
      const node = useFs.getState().read(target)
      if (!node) return print(<Err>ls: cannot access '{prettyPath(target)}': No such file or directory</Err>)
      if (node.kind !== 'dir') return print(nodeColor(node))

      const children = (node.children ?? []).filter((c) => showAll || !c.name.startsWith('.'))
      if (children.length === 0) return print(<Dim>(empty)</Dim>)

      const sorted = [...children].sort((a, b) =>
        a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'dir' ? -1 : 1,
      )

      if (long) {
        return print(
          <Rows
            rows={sorted.map((c) => [
              <span key={c.name}>
                <Dim>{(c.kind === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--') + '  ' + formatSize(c).padStart(9)}</Dim>{' '}
                {nodeColor(c)}
              </span>,
              new Date(c.modified).toLocaleDateString(),
            ])}
          />,
        )
      }
      print(
        <div className="flex flex-wrap gap-x-5 gap-y-0.5">
          {sorted.map((c) => (
            <span key={c.name}>{nodeColor(c)}</span>
          ))}
        </div>,
      )
    },
  },

  cd: {
    desc: 'Change directory',
    usage: 'cd [path]',
    run: ({ args, cwd, setCwd, print }) => {
      const target = resolve(cwd, args[0] ?? '~')
      const node = useFs.getState().read(target)
      if (!node) return print(<Err>cd: {args[0]}: No such file or directory</Err>)
      if (node.kind !== 'dir') return print(<Err>cd: {args[0]}: Not a directory</Err>)
      setCwd(target)
    },
  },

  pwd: {
    desc: 'Print working directory',
    run: ({ cwd, print }) => print(<span>{cwd}</span>),
  },

  cat: {
    desc: 'Print a file',
    usage: 'cat <file>',
    run: ({ args, cwd, print }) => {
      if (!args[0]) return print(<Err>usage: cat &lt;file&gt;</Err>)
      const target = resolve(cwd, args[0])
      const node = useFs.getState().read(target)
      if (!node) return print(<Err>cat: {args[0]}: No such file or directory</Err>)
      if (node.kind === 'dir') return print(<Err>cat: {args[0]}: Is a directory</Err>)
      if (node.kind === 'app')
        return print(
          <Dim>
            {node.name} is an application shortcut. Try <Acc>open {node.appId}</Acc>.
          </Dim>,
        )
      print(<pre className="whitespace-pre-wrap">{node.content ?? ''}</pre>)
    },
  },

  tree: {
    desc: 'Show the directory tree',
    usage: 'tree [path]',
    run: ({ args, cwd, print }) => {
      const target = resolve(cwd, args[0] ?? '.')
      const root = useFs.getState().read(target)
      if (!root) return print(<Err>tree: {args[0]}: No such file or directory</Err>)
      const lines: ReactNode[] = []
      const walk = (node: FsNode, prefix: string, depth: number) => {
        if (depth > 3) return
        const kids = (node.children ?? []).filter((c) => !c.name.startsWith('.'))
        kids.forEach((c, i) => {
          const last = i === kids.length - 1
          lines.push(
            <div key={prefix + c.name}>
              <Dim>{prefix + (last ? '└── ' : '├── ')}</Dim>
              {nodeColor(c)}
            </div>,
          )
          if (c.kind === 'dir') walk(c, prefix + (last ? '    ' : '│   '), depth + 1)
        })
      }
      lines.push(<div key="root">{prettyPath(target)}</div>)
      walk(root, '', 0)
      print(<div>{lines}</div>)
    },
  },

  mkdir: {
    desc: 'Create a directory',
    usage: 'mkdir <name>',
    run: ({ args, cwd, print }) => {
      if (!args[0]) return print(<Err>usage: mkdir &lt;name&gt;</Err>)
      const created = useFs.getState().mkdir(cwd, args[0])
      if (!created) return print(<Err>mkdir: cannot create directory '{args[0]}'</Err>)
      print(<Dim>created {prettyPath(created)}</Dim>)
    },
  },

  touch: {
    desc: 'Create an empty file',
    usage: 'touch <name>',
    run: ({ args, cwd, print }) => {
      if (!args[0]) return print(<Err>usage: touch &lt;name&gt;</Err>)
      const created = useFs.getState().writeFile(cwd, args[0], '')
      if (!created) return print(<Err>touch: cannot create '{args[0]}'</Err>)
    },
  },

  rm: {
    desc: 'Move a file to the trash',
    usage: 'rm <file>',
    run: ({ args, cwd, print }) => {
      const targetArg = args.find((a) => !a.startsWith('-'))
      if (!targetArg) return print(<Err>usage: rm &lt;file&gt;</Err>)
      const target = resolve(cwd, targetArg)
      if (target === '/' || target === HOME) return print(<Err>rm: refusing to remove '{targetArg}'</Err>)
      const node = useFs.getState().read(target)
      if (!node) return print(<Err>rm: cannot remove '{targetArg}': No such file or directory</Err>)
      if (node.locked) return print(<Err>rm: cannot remove '{targetArg}': Operation not permitted</Err>)
      useFs.getState().remove(target)
      print(
        <Dim>
          moved '{basename(target)}' to trash — recover it from the Trash app or with{' '}
          <Acc>open trash</Acc>
        </Dim>,
      )
    },
  },

  mv: {
    desc: 'Move or rename',
    usage: 'mv <src> <dest>',
    run: ({ args, cwd, print }) => {
      if (args.length < 2) return print(<Err>usage: mv &lt;src&gt; &lt;dest&gt;</Err>)
      const src = resolve(cwd, args[0])
      const destPath = resolve(cwd, args[1])
      const fs = useFs.getState()
      if (!fs.read(src)) return print(<Err>mv: cannot stat '{args[0]}': No such file or directory</Err>)
      const destNode = fs.read(destPath)
      const ok =
        destNode?.kind === 'dir' ? fs.move(src, destPath) : dirname(src) === dirname(destPath)
          ? fs.rename(src, basename(destPath))
          : fs.move(src, dirname(destPath)) && fs.rename(`${dirname(destPath)}/${basename(src)}`, basename(destPath))
      if (!ok) print(<Err>mv: failed to move '{args[0]}'</Err>)
    },
  },

  echo: {
    desc: 'Print text',
    usage: 'echo <text>',
    run: ({ args, print }) => print(<span>{args.join(' ')}</span>),
  },

  // --- system -------------------------------------------------------------

  whoami: {
    desc: 'Print the current user',
    run: ({ print }) =>
      print(
        <div>
          <div>{owner.name}</div>
          <Dim>
            {owner.role} · guest session · uid=1000({owner.username})
          </Dim>
        </div>,
      ),
  },

  hostname: { desc: 'Print the hostname', hidden: true, run: ({ print }) => print(<span>{owner.hostname}</span>) },

  uname: {
    desc: 'Print system information',
    hidden: true,
    run: ({ print }) =>
      print(
        <span>
          {owner.osName} {owner.hostname} {owner.osVersion}-web x86_64 GNU/Browser
        </span>,
      ),
  },

  date: { desc: 'Print the current date and time', run: ({ print }) => print(<span>{new Date().toString()}</span>) },

  uptime: {
    desc: 'How long this session has been running',
    run: ({ print }) => {
      const ms = Date.now() - useSystem.getState().uptimeStart
      const s = Math.floor(ms / 1000)
      const m = Math.floor(s / 60)
      const h = Math.floor(m / 60)
      print(
        <span>
          up {h > 0 ? `${h}h ` : ''}
          {m % 60}m {s % 60}s, 1 user, load average: 0.14, 0.09, 0.05
        </span>,
      )
    },
  },

  df: {
    desc: 'Report filesystem usage',
    hidden: true,
    run: ({ print }) =>
      print(
        <Rows
          rows={[
            [<Dim key="h">Filesystem       Size  Used  Avail  Use%</Dim>, ''],
            ['/dev/portfolio    100G   45G    55G   45%', 'mounted on /'],
            ['tmpfs             2.0G  128M   1.9G    7%', 'mounted on /tmp'],
          ]}
        />,
      ),
  },

  free: {
    desc: 'Show memory usage',
    hidden: true,
    run: ({ print }) =>
      print(
        <pre className="whitespace-pre">{`              total    used    free
Mem:          16.0G   6.2G    9.8G
Swap:          8.0G     0B    8.0G`}</pre>,
      ),
  },

  ps: {
    desc: 'List running applications',
    hidden: true,
    run: ({ print }) => {
      const wins = useWindows.getState().windows
      if (wins.length === 0) return print(<Dim>no windows open</Dim>)
      print(
        <Rows
          rows={[
            [<Dim key="h">PID</Dim>, <Dim key="h2">COMMAND</Dim>],
            ...wins.map(
              (w) => [<span key={w.id}>{w.id.replace('win-', '10')}</span>, `${w.appId} — ${w.title}`] as [ReactNode, ReactNode],
            ),
          ]}
        />,
      )
    },
  },

  neofetch: {
    desc: 'System information, with flair',
    run: ({ print }) => {
      const s = useSystem.getState()
      const ms = Date.now() - s.uptimeStart
      const mins = Math.max(1, Math.floor(ms / 60000))
      const logo = [
        '        .---.        ',
        '       /     \\       ',
        '       \\.@-@./       ',
        '       /`\\_/`\\       ',
        '      //  _  \\\\      ',
        "     | \\     )|_     ",
        "    /`\\_`>  <_/ \\    ",
        '    \\__/`---`\\__/    ',
      ]
      const info: [string, string][] = [
        ['OS', `${owner.osName} ${owner.osVersion} ${owner.osCodename}`],
        ['Host', owner.hostname],
        ['Kernel', `${owner.osVersion}.0-web-react`],
        ['Uptime', `${mins} min${mins === 1 ? '' : 's'}`],
        ['Packages', `${skills.length} (skillpkg)`],
        ['Shell', 'charsh 1.0'],
        ['DE', `${owner.osName} Shell`],
        ['WM', 'React Window Manager'],
        ['Theme', s.settings.wallpaper],
        ['Terminal', 'charterm'],
        ['CPU', 'Human Brain (1) @ 3.2GHz'],
        ['Memory', '6144MiB / 16384MiB'],
      ]
      print(
        <div className="flex gap-6">
          <pre className="whitespace-pre" style={{ color: 'var(--accent)' }}>
            {logo.join('\n')}
          </pre>
          <div>
            <div>
              <Acc>
                {owner.username}@{owner.hostname}
              </Acc>
            </div>
            <Dim>{'-'.repeat(owner.username.length + owner.hostname.length + 1)}</Dim>
            {info.map(([k, v]) => (
              <div key={k}>
                <Acc>{k}:</Acc> {v}
              </div>
            ))}
            <div className="mt-2 flex gap-1">
              {['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'].map((c) => (
                <span key={c} className="inline-block h-3 w-5 rounded-[2px]" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>,
      )
    },
  },

  clear: { desc: 'Clear the screen', run: ({ clear }) => clear() },

  exit: {
    desc: 'Close this terminal',
    run: ({ exit }) => exit(),
  },

  man: {
    desc: 'Show help for a command',
    usage: 'man <command>',
    hidden: true,
    run: ({ args, print }) => {
      const c = commands[args[0]]
      if (!c) return print(<Err>No manual entry for {args[0] ?? ''}</Err>)
      print(
        <div>
          <div>
            <Acc>{args[0].toUpperCase()}(1)</Acc>
          </div>
          <div className="mt-1">
            <Dim>NAME</Dim>
            <div className="pl-4">
              {args[0]} — {c.desc}
            </div>
          </div>
          {c.usage && (
            <div className="mt-1">
              <Dim>SYNOPSIS</Dim>
              <div className="pl-4">{c.usage}</div>
            </div>
          )}
        </div>,
      )
    },
  },

  fortune: {
    desc: 'A programming aphorism',
    run: ({ print }) => print(<span>{fortunes[Math.floor(Math.random() * fortunes.length)]}</span>),
  },

  sudo: {
    desc: 'Execute as superuser',
    usage: 'sudo <command>',
    run: ({ args, print }) => {
      const rest = args.join(' ').toLowerCase()
      if (rest.startsWith('hire')) {
        notify({ title: 'Permission granted', body: `${owner.name} is open to offers.`, glyph: '🎉' })
        return print(
          <div>
            <Good>[sudo] password for guest: ********</Good>
            <div className="mt-1">
              <Good>✓ Permission granted.</Good>
            </div>
            <div className="mt-1">
              {owner.name} is available for work. Reach out: <Acc>{owner.email}</Acc>
            </div>
            <Dim>
              Or run <Acc>open contact</Acc> to send a message from here.
            </Dim>
          </div>,
        )
      }
      if (rest.includes('coffee')) return print(<Err>sudo: coffee: command not found (try the mug on the desk)</Err>)
      if (rest.startsWith('rm -rf'))
        return print(
          <div>
            <Err>sudo: nice try.</Err>
            <Dim>
              This filesystem has a trash can for a reason. Use <Acc>rm</Acc> like a civilised person.
            </Dim>
          </div>,
        )
      if (!rest) return print(<Err>usage: sudo &lt;command&gt;</Err>)
      print(
        <div>
          <Dim>[sudo] password for guest:</Dim>
          <Err>guest is not in the sudoers file. This incident has been reported.</Err>
        </div>,
      )
    },
  },

  matrix: {
    desc: 'There is no spoon',
    hidden: true,
    run: ({ print }) => {
      const chars = 'アイウエオカキクケコｱｲｳｴｵ01'
      const rows = Array.from({ length: 10 }, () =>
        Array.from({ length: 46 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
      )
      print(
        <pre className="whitespace-pre" style={{ color: '#22c55e' }}>
          {rows.join('\n')}
        </pre>,
      )
    },
  },

  reboot: {
    desc: 'Restart the machine',
    hidden: true,
    run: ({ print }) => {
      print(<Dim>Broadcast message: The system is going down for reboot NOW!</Dim>)
      setTimeout(() => useSystem.getState().reboot(), 700)
    },
  },

  shutdown: {
    desc: 'Power off',
    hidden: true,
    run: ({ print }) => {
      print(<Dim>The system is going down for poweroff NOW!</Dim>)
      setTimeout(() => useSystem.getState().shutdown(), 700)
    },
  },
}

/** Split a command line, honouring simple double quotes. */
export function tokenize(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (const ch of line) {
    if (ch === '"') quoted = !quoted
    else if (ch === ' ' && !quoted) {
      if (cur) out.push(cur)
      cur = ''
    } else cur += ch
  }
  if (cur) out.push(cur)
  return out
}

/** Tab completion: command names in position 0, filesystem entries after. */
export function complete(line: string, cwd: string): string[] {
  const parts = tokenize(line)
  const trailingSpace = line.endsWith(' ')
  const word = trailingSpace ? '' : (parts[parts.length - 1] ?? '')

  if (parts.length <= 1 && !trailingSpace) {
    return Object.keys(commands).filter((c) => c.startsWith(word))
  }

  const slash = word.lastIndexOf('/')
  const dirPart = slash >= 0 ? word.slice(0, slash + 1) : ''
  const stem = slash >= 0 ? word.slice(slash + 1) : word
  const listing = useFs.getState().list(resolve(cwd, dirPart || '.')) ?? []
  return listing
    .filter((n) => n.name.startsWith(stem) && (stem.startsWith('.') || !n.name.startsWith('.')))
    .map((n) => dirPart + n.name + (n.kind === 'dir' ? '/' : ''))
}
