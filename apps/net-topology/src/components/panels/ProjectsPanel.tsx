import { useState } from 'react'
import { ArrowLeft, ExternalLink, Github, Server } from 'lucide-react'
import { projects } from '../../data/projects'
import type { Project } from '../../data/types'
import { Card, KeyValue, Meter, SectionTitle, StatusPill, Tag } from '../ui/primitives'
import { useApp } from '../../store/AppState'

/** Load balancer — each project is a backend server in the pool. */
export function ProjectsPanel() {
  const [open, setOpen] = useState<Project | null>(null)
  const { pushLog } = useApp()

  if (open) {
    return <ProjectDetail project={open} onBack={() => setOpen(null)} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill label="pool healthy" tone="ok" pulse />
        <StatusPill label="round-robin" tone="accent" dot={false} />
        <StatusPill label={`${projects.length}/${projects.length} up`} tone="ok" dot={false} />
      </div>

      <div>
        <SectionTitle hint="click a backend">Backend pool</SectionTitle>
        <div className="space-y-2.5">
          {projects.map((project) => (
            <Card
              key={project.id}
              onClick={() => {
                setOpen(project)
                pushLog(`${project.host} — ${project.name} opened`, 'info')
              }}
              className="group"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-ok/30 bg-ok/10 text-ok">
                  <Server size={15} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-[13px] font-semibold text-ink">
                      {project.name}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[10px] text-ok">
                      <span className="anim-blink h-1.5 w-1.5 rounded-full bg-ok" />
                      HEALTHY
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-muted">
                    {project.host} · {project.requests}
                  </div>
                  <p className="mt-1 text-[12px] text-muted">{project.tagline}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Meter value={project.load} tone="cyan" height={4} label={`${project.name} load`} />
                    <span className="font-num text-[10px] text-muted">{project.load}%</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 font-mono text-[11px] text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={13} /> back to pool
      </button>

      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-bold text-ink">{project.name}</h2>
          <StatusPill label="healthy" tone="ok" />
        </div>
        <p className="font-mono text-[11px] text-muted">
          {project.host} · {project.year}
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">{project.summary}</p>
      </div>

      <div>
        <SectionTitle hint="node info">Server</SectionTitle>
        <KeyValue k="role" v={project.role} />
        <KeyValue k="traffic" v={project.requests} />
        <KeyValue k="pool weight" v={`${project.load}%`} tone="cyan" />
        <KeyValue k="status" v="200 OK" tone="ok" />
      </div>

      <div>
        <SectionTitle>Tech stack</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle hint="topology">Architecture</SectionTitle>
        <ol className="space-y-2">
          {project.architecture.map((line, i) => (
            <li key={line} className="flex gap-2.5 text-[12.5px] leading-relaxed text-muted">
              <span className="mt-0.5 font-mono text-[10px] text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              {line}
            </li>
          ))}
        </ol>
      </div>

      <div>
        <SectionTitle hint="incidents">Challenges</SectionTitle>
        <div className="space-y-2">
          {project.challenges.map((c) => (
            <div key={c} className="rounded-lg border border-warn/25 bg-warn/5 p-2.5">
              <p className="text-[12.5px] leading-relaxed text-muted">{c}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle hint="post-mortem">Lessons</SectionTitle>
        <ul className="space-y-1.5">
          {project.lessons.map((l) => (
            <li key={l} className="flex gap-2 text-[12.5px] leading-relaxed text-muted">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ok" />
              {l}
            </li>
          ))}
        </ul>
      </div>

      {(project.repo || project.demo) && (
        <div className="flex flex-wrap gap-2">
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-accent/60 hover:text-accent"
            >
              <Github size={13} /> repository
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-accent/60 hover:text-accent"
            >
              <ExternalLink size={13} /> live demo
            </a>
          )}
        </div>
      )}
    </div>
  )
}
