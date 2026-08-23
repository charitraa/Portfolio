import { motion } from 'framer-motion'
import { Check, Download, FileText, Mail, Printer } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Meter, Panel, View, ViewHeader } from '@/components/ui'
import { profile } from '@/data/profile'
import { certifications, experience, skillGroups } from '@/data/skills'
import { useApp } from '@/store/app'
import { withBase } from '@/lib/base'

export function Resume() {
  const [progress, setProgress] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const notify = useApp((s) => s.notify)
  const log = useApp((s) => s.log)

  /** Fakes a transfer bar, then hands off to the real file. */
  const download = () => {
    if (progress !== null) return
    log(`GET ${profile.resume.url} — 200 OK (${profile.resume.size})`, 'ok')
    setProgress(0)
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = (p ?? 0) + Math.random() * 22
        if (next >= 100) {
          clearInterval(timer)
          setDone(true)
          notify('Download complete', profile.resume.file, 'ok')
          const a = document.createElement('a')
          a.href = withBase(profile.resume.url)
          a.download = profile.resume.file
          a.click()
          setTimeout(() => {
            setProgress(null)
            setDone(false)
          }, 2400)
          return 100
        }
        return next
      })
    }, 180)
  }

  const topSkills = skillGroups.flatMap((g) => g.items).sort((a, b) => b.level - a.level).slice(0, 8)

  return (
    <View>
      <ViewHeader
        title="Resume"
        route="GET /files/resume.pdf"
        desc="One page, kept current. The download is the same document I send to recruiters."
        actions={
          <a href={`mailto:${profile.email}`}>
            <Button variant="secondary">
              <Mail size={13} /> Email me
            </Button>
          </a>
        }
      />

      <div className="grid gap-3 lg:grid-cols-3">
        {/* File card */}
        <Panel title="File" className="lg:col-span-1" icon={<FileText size={13} />}>
          <div className="flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-red/12 text-red ring-1 ring-red/25">
              <FileText size={22} />
            </span>
            <div className="min-w-0">
              <div className="truncate font-mono text-[13px] font-medium text-fg">
                {profile.resume.file}
              </div>
              <div className="num mt-0.5 text-[11px] text-muted">
                {profile.resume.size} · PDF · updated {profile.resume.updated}
              </div>
            </div>
          </div>

          <dl className="mt-3 space-y-1.5 border-t border-line-soft pt-3 font-mono text-[11.5px]">
            {[
              ['Content-Type', 'application/pdf'],
              ['Content-Length', '1 468 006'],
              ['Last-Modified', profile.resume.updated],
              ['X-Checksum', 'sha256:8f31…c0ab'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="shrink-0 text-blue">{k}</dt>
                <dd className="truncate text-muted">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 flex gap-2">
            <Button variant="primary" onClick={download} disabled={progress !== null}>
              {done ? <Check size={13} /> : <Download size={13} />}
              {done ? 'Downloaded' : progress !== null ? 'Downloading…' : 'Download'}
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer size={13} /> Print
            </Button>
          </div>

          {progress !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3"
            >
              <div className="mb-1 flex justify-between font-mono text-[10.5px] text-muted">
                <span>{profile.resume.file}</span>
                <span className="num">{Math.min(100, Math.round(progress))}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-bg2">
                <div
                  className="h-full rounded-full bg-green transition-[width] duration-150"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </motion.div>
          )}
        </Panel>

        {/* Inline summary so the page is useful without downloading. */}
        <Panel title="Summary" subtitle="inline preview" className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-[16px] font-semibold text-fg">{profile.name}</h3>
            <p className="font-mono text-[11.5px] text-blue">{profile.role}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              {profile.location} · {profile.email}
            </p>
            <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-fg2">{profile.bio}</p>
          </div>

          <div className="mb-4">
            <h4 className="mb-2 text-[11px] font-semibold tracking-widest text-muted uppercase">
              Experience
            </h4>
            <ul className="space-y-2">
              {experience.slice(0, 3).map((e) => (
                <li key={`${e.org}-${e.period}`} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[12.5px] font-medium text-fg">{e.role}</span>
                  <span className="text-[12px] text-blue">{e.org}</span>
                  <span className="num ml-auto text-[11px] text-muted">{e.period}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="mb-2 text-[11px] font-semibold tracking-widest text-muted uppercase">
              Core skills
            </h4>
            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {topSkills.map((s) => (
                <Meter key={s.name} label={s.name} value={s.level} />
              ))}
            </div>
          </div>

          {certifications.length > 0 && (
            <div>
              <h4 className="mb-2 text-[11px] font-semibold tracking-widest text-muted uppercase">
                Certifications
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {certifications.map((c) => (
                  <Badge key={c.name} color={c.status === 'Verified' ? 'green' : 'yellow'}>
                    {c.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>
    </View>
  )
}
