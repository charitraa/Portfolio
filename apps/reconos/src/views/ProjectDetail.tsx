import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Layers,
  Lightbulb,
  Network,
  TriangleAlert,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Github } from '@/components/BrandIcons'
import { Badge, Button, Panel, View } from '@/components/ui'
import { ACCENT, cx } from '@/lib/style'
import { projectById, projects } from '@/data/projects'
import { NotFound } from '@/views/NotFound'

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'architecture', label: 'Architecture', icon: Network },
  { id: 'stack', label: 'Tech Stack', icon: Layers },
  { id: 'challenges', label: 'Challenges', icon: TriangleAlert },
  { id: 'lessons', label: 'Lessons', icon: Lightbulb },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

/**
 * These two sections are the interviewer bait of any case study, and they only
 * work in the author's own voice — so they ship empty with a prompt rather than
 * filled with something plausible that was never true.
 */
function NotWritten({ what }: { what: string }) {
  return (
    <div className="font-mono text-[12px] leading-relaxed">
      <div className="text-yellow">HTTP/1.1 206 Partial Content</div>
      <p className="mt-2 max-w-xl text-muted">
        Not written up yet. Describe {what} in{' '}
        <span className="text-blue">src/data/projects.ts</span> — this is the section
        interviewers read first.
      </p>
    </div>
  )
}

export function ProjectDetail() {
  const { id } = useParams()
  const project = id ? projectById(id) : undefined
  const [section, setSection] = useState<SectionId>('overview')

  if (!project) return <NotFound />

  const accent = ACCENT[project.accent ?? 'blue']
  const siblings = projects.filter((p) => p.id !== project.id).slice(0, 3)

  return (
    <View>
      <Link
        to="/projects"
        className="mb-3 inline-flex items-center gap-1.5 font-mono text-[11.5px] text-muted transition-colors hover:text-blue"
      >
        <ArrowLeft size={13} /> back to index
      </Link>

      {/* Header */}
      <div
        className="mb-4 overflow-hidden rounded-[10px] border border-line bg-panel"
        style={{ borderTopColor: accent, borderTopWidth: 2 }}
      >
        <div className="flex flex-wrap items-start gap-4 p-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 font-mono text-[11px]" style={{ color: accent }}>
              GET /api/v1/projects/{project.id}
            </div>
            <h1 className="text-[22px] leading-tight font-semibold text-fg">{project.name}</h1>
            <p className="mt-1 max-w-2xl text-[13px] text-muted">{project.tagline}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Badge color={project.status === 'Completed' ? 'green' : 'yellow'} dot>
                {project.status}
              </Badge>
              <Badge color={project.accent ?? 'blue'}>{project.language}</Badge>
              <Badge>{project.framework}</Badge>
              <Badge>{project.year}</Badge>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noreferrer noopener">
                <Button variant="secondary">
                  <Github size={13} /> Source
                </Button>
              </a>
            )}
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noreferrer noopener">
                <Button variant="primary">
                  <ExternalLink size={13} /> Live demo
                </Button>
              </a>
            )}
          </div>
        </div>

        {project.metrics && (
          <div className="grid grid-cols-2 divide-x divide-[var(--rc-border-soft)] border-t border-line-soft sm:grid-cols-3">
            {project.metrics.map((m) => (
              <div key={m.label} className="px-4 py-2.5">
                <div className="num text-[16px] font-semibold text-fg">{m.value}</div>
                <div className="text-[10.5px] tracking-wide text-muted uppercase">{m.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section switcher */}
      <div className="mb-3 flex gap-1 overflow-x-auto border-b border-line">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={cx(
              'relative flex shrink-0 items-center gap-1.5 px-3 py-2 text-[12px] transition-colors duration-150',
              section === s.id ? 'text-fg' : 'text-muted hover:text-fg2',
            )}
          >
            <s.icon size={13} />
            {s.label}
            {section === s.id && (
              <motion.span
                layoutId="detail-underline"
                className="absolute inset-x-0 -bottom-px h-0.5"
                style={{ background: accent }}
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>

      <motion.div
        key={section}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        {section === 'overview' && (
          <Panel title="Overview">
            <p className="max-w-3xl text-[13.5px] leading-relaxed text-fg2">{project.overview}</p>
          </Panel>
        )}

        {section === 'architecture' && (
          <Panel title="Architecture" subtitle="request path, top to bottom">
            <ol className="relative ml-3 space-y-3 border-l border-line pl-5">
              {project.architecture.map((line, i) => (
                <li key={line} className="relative">
                  <span
                    className="absolute top-1 -left-[26px] grid size-4 place-items-center rounded-full border border-line bg-panel font-mono text-[9px]"
                    style={{ color: accent }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-[13px] text-fg2">{line}</p>
                </li>
              ))}
            </ol>
          </Panel>
        )}

        {section === 'stack' && (
          <Panel title="Tech stack">
            <div className="flex flex-wrap gap-2">
              {project.stack.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-line bg-bg2 px-2.5 py-1.5 font-mono text-[11.5px] text-fg2 transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-blue/60"
                >
                  {t}
                </span>
              ))}
            </div>
          </Panel>
        )}

        {section === 'challenges' &&
          (project.challenges.length === 0 ? (
            <Panel title="Challenges">
              <NotWritten what="the problems that actually cost you time on this build" />
            </Panel>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {project.challenges.map((c) => (
                <Panel key={c.title} title={c.title} icon={<TriangleAlert size={13} />}>
                  <p className="text-[13px] leading-relaxed text-fg2">{c.body}</p>
                </Panel>
              ))}
            </div>
          ))}

        {section === 'lessons' &&
          (project.lessons.length === 0 ? (
            <Panel title="Lessons learned">
              <NotWritten what="what you'd do differently next time" />
            </Panel>
          ) : (
            <Panel title="Lessons learned">
              <ul className="space-y-2">
                {project.lessons.map((l) => (
                  <li key={l} className="flex gap-2.5 text-[13px] text-fg2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: accent }} />
                    {l}
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
      </motion.div>

      <Panel title="Related work" className="mt-3">
        <div className="grid gap-2 sm:grid-cols-3">
          {siblings.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="rounded-md border border-line bg-bg2 p-2.5 transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-blue/60"
            >
              <div className="truncate text-[12.5px] font-medium text-fg">{p.name}</div>
              <div className="mt-0.5 line-clamp-1 text-[11px] text-muted">{p.tagline}</div>
            </Link>
          ))}
        </div>
      </Panel>
    </View>
  )
}
