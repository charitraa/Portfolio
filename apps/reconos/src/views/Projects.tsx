import { ArrowDown, ArrowUp, ExternalLink, Filter, Search } from 'lucide-react'
import { Github } from '@/components/BrandIcons'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Empty, Panel, View, ViewHeader } from '@/components/ui'
import { cx } from '@/lib/style'
import { projects } from '@/data/projects'
import type { Project } from '@/data/types'
import { useApp } from '@/store/app'

const STATUSES = ['All', 'Completed', 'In Progress', 'Maintained', 'Archived'] as const

const STATUS_COLOR: Record<string, string> = {
  Completed: 'green',
  'In Progress': 'yellow',
  Maintained: 'blue',
  Archived: 'muted',
}

const COLUMNS: { key: keyof Project | 'links'; label: string; className?: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status', className: 'hidden sm:table-cell' },
  { key: 'language', label: 'Language', className: 'hidden md:table-cell' },
  { key: 'framework', label: 'Framework', className: 'hidden lg:table-cell' },
  { key: 'year', label: 'Year', className: 'hidden sm:table-cell' },
  { key: 'links', label: 'Links' },
]

export function Projects() {
  const navigate = useNavigate()
  const { projectQuery, projectStatus, projectSort, setProjectQuery, setProjectStatus, toggleProjectSort, log } =
    useApp()

  const rows = useMemo(() => {
    const q = projectQuery.trim().toLowerCase()
    const filtered = projects.filter((p) => {
      const matchesQuery =
        !q ||
        `${p.name} ${p.tagline} ${p.language} ${p.framework} ${p.stack.join(' ')}`
          .toLowerCase()
          .includes(q)
      const matchesStatus = projectStatus === 'All' || p.status === projectStatus
      return matchesQuery && matchesStatus
    })

    const { key, dir } = projectSort
    return [...filtered].sort((a, b) => {
      const av = String(a[key as keyof Project] ?? '')
      const bv = String(b[key as keyof Project] ?? '')
      return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }, [projectQuery, projectStatus, projectSort])

  const open = (p: Project) => {
    log(`Opening project record: ${p.name}`, 'info')
    navigate(`/projects/${p.id}`)
  }

  return (
    <View>
      <ViewHeader
        title="Projects"
        route="GET /api/v1/projects"
        desc="Case studies with architecture notes, the problems that actually cost time, and what I would do differently."
        actions={<Badge color="blue">{rows.length} / {projects.length} records</Badge>}
      />

      <Panel bodyClass="p-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line-soft p-2">
          <div className="flex h-7 min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-bg px-2 sm:max-w-xs">
            <Search size={13} className="shrink-0 text-muted" />
            <input
              value={projectQuery}
              onChange={(e) => setProjectQuery(e.target.value)}
              placeholder="Filter by name, stack, framework…"
              spellCheck={false}
              aria-label="Filter projects"
              className="w-full min-w-0 bg-transparent text-[12px] outline-none placeholder:text-muted"
            />
          </div>

          <div className="flex items-center gap-1">
            <Filter size={13} className="mr-0.5 text-muted" />
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setProjectStatus(s)}
                className={cx(
                  'rounded border px-2 py-1 font-mono text-[10.5px] transition-colors duration-150',
                  projectStatus === s
                    ? 'border-blue/50 bg-blue/15 text-blue'
                    : 'border-line text-muted hover:bg-hover hover:text-fg2',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-bg2">
                {COLUMNS.map((col) => {
                  const sortable = col.key !== 'links'
                  const active = projectSort.key === col.key
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      className={cx(
                        'px-3 py-2 text-[10.5px] font-semibold tracking-widest text-muted uppercase',
                        col.className,
                      )}
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleProjectSort(col.key)}
                          className={cx(
                            'flex items-center gap-1 transition-colors hover:text-fg',
                            active && 'text-blue',
                          )}
                        >
                          {col.label}
                          {active &&
                            (projectSort.dir === 'asc' ? (
                              <ArrowUp size={11} />
                            ) : (
                              <ArrowDown size={11} />
                            ))}
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => open(p)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && open(p)}
                  className="group cursor-pointer border-b border-line-soft transition-colors duration-150 last:border-0 hover:bg-hover"
                >
                  <td className="px-3 py-2">
                    <div className="text-[12.5px] font-medium text-fg group-hover:text-blue">
                      {p.name}
                    </div>
                    <div className="mt-0.5 line-clamp-1 max-w-md text-[11px] text-muted">
                      {p.tagline}
                    </div>
                  </td>
                  <td className="hidden px-3 py-2 sm:table-cell">
                    <Badge color={STATUS_COLOR[p.status]} dot>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="hidden px-3 py-2 font-mono text-[11.5px] text-fg2 md:table-cell">
                    {p.language}
                  </td>
                  <td className="hidden px-3 py-2 font-mono text-[11.5px] text-muted lg:table-cell">
                    {p.framework}
                  </td>
                  <td className="num hidden px-3 py-2 text-[11.5px] text-muted sm:table-cell">
                    {p.year}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {p.repo && (
                        <a
                          href={p.repo}
                          target="_blank"
                          rel="noreferrer noopener"
                          title="Repository"
                          className="grid size-6 place-items-center rounded text-muted hover:bg-active hover:text-fg"
                        >
                          <Github size={13} />
                        </a>
                      )}
                      {p.demo && (
                        <a
                          href={p.demo}
                          target="_blank"
                          rel="noreferrer noopener"
                          title="Live demo"
                          className="grid size-6 place-items-center rounded text-muted hover:bg-active hover:text-green"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <Empty>
            No records match the current filter.
            <div className="mt-2">
              <Button
                size="sm"
                onClick={() => {
                  setProjectQuery('')
                  setProjectStatus('All')
                }}
              >
                Reset filters
              </Button>
            </div>
          </Empty>
        )}
      </Panel>
    </View>
  )
}
