import { useEffect, useState } from 'react'
import { USE_RANK, certifications, experience, links, owner, resume, skills } from '@/data/portfolio'
import { IconBtn, Scroll, StatusBar, Toolbar } from '@/os/ui'
import { notify } from '@/store/notifications'
import { withBase } from '@/lib/base'
import type { AppWindowProps } from '@/os/types'

type Source = 'checking' | 'pdf' | 'generated'

/**
 * If `public/resume.pdf` exists it is displayed with the browser's own PDF
 * viewer. Otherwise the structured résumé data is typeset as a document, so
 * the app is useful before any file has been added.
 */
export default function ResumeViewer(_: AppWindowProps) {
  const [source, setSource] = useState<Source>('checking')
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    let cancelled = false
    fetch(withBase(links.resumePdf), { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') ?? ''
        if (!cancelled) setSource(r.ok && type.includes('pdf') ? 'pdf' : 'generated')
      })
      .catch(() => !cancelled && setSource('generated'))
    return () => {
      cancelled = true
    }
  }, [])

  function download() {
    if (source === 'pdf') {
      const a = document.createElement('a')
      a.href = withBase(links.resumePdf)
      a.download = `${owner.name.replace(/\s+/g, '-')}-resume.pdf`
      a.click()
      notify({ title: 'Résumé downloaded', body: `${owner.name} — ${owner.role}`, glyph: '⬇️' })
      return
    }
    // No PDF on disk: hand over a plain-text résumé rather than nothing.
    const text = buildPlainText()
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${owner.name.replace(/\s+/g, '-')}-resume.txt`
    a.click()
    URL.revokeObjectURL(url)
    notify({ title: 'Résumé downloaded', body: 'Plain-text version', glyph: '⬇️' })
  }

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[12.5px] font-medium">
          {owner.name.replace(/\s+/g, '-')}-resume.{source === 'pdf' ? 'pdf' : 'txt'}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <IconBtn title="Zoom out" disabled={source === 'pdf'} onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}>
            −
          </IconBtn>
          <span className="w-11 text-center text-[11px]" style={{ color: 'var(--text-dim)' }}>
            {Math.round(zoom * 100)}%
          </span>
          <IconBtn title="Zoom in" disabled={source === 'pdf'} onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}>
            +
          </IconBtn>
          <button
            type="button"
            onClick={download}
            className="ml-2 rounded-lg px-3 py-1.5 text-[12px] font-medium"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            ⬇ Download
          </button>
        </div>
      </Toolbar>

      {source === 'pdf' ? (
        <iframe title="Résumé" src={withBase(links.resumePdf)} className="min-h-0 flex-1 border-0" />
      ) : (
        <Scroll className="p-6" >
          <div style={{ background: '#4a4f58' }} className="mx-auto w-fit rounded p-6">
            <Paper zoom={zoom} />
          </div>
        </Scroll>
      )}

      <StatusBar>
        <span>{source === 'pdf' ? 'PDF document' : 'Generated from portfolio data'}</span>
        <span className="ml-auto">
          {source === 'generated' ? 'Drop a file at public/resume.pdf to show the real thing' : links.resumePdf}
        </span>
      </StatusBar>
    </div>
  )
}

function Paper({ zoom }: { zoom: number }) {
  const work = experience.filter((e) => e.kind === 'work')
  const edu = experience.filter((e) => e.kind === 'education')
  const top = [...skills].sort((a, b) => USE_RANK[b.use] - USE_RANK[a.use]).slice(0, 12)

  return (
    <div
      className="selectable origin-top bg-white text-black shadow-2xl"
      style={{
        width: 760,
        minHeight: 1000,
        padding: '52px 56px',
        transform: `scale(${zoom})`,
        marginBottom: zoom < 1 ? 0 : (zoom - 1) * 1000,
      }}
    >
      <header className="border-b-2 border-black pb-3">
        <h1 className="text-[30px] leading-none font-bold tracking-tight">{owner.name}</h1>
        <p className="mt-1.5 text-[13px] font-medium tracking-wide uppercase">{owner.role}</p>
        <p className="mt-2 text-[11.5px] text-neutral-600">
          {owner.email} · {owner.location} · {links.github.replace('https://', '')} ·{' '}
          {links.linkedin.replace('https://', '')}
        </p>
      </header>

      <Section title="Summary">
        <p className="text-[12px] leading-relaxed">{resume.summary}</p>
      </Section>

      <Section title="Experience">
        {work.map((e) => (
          <div key={e.id} className="mb-4 last:mb-0">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[13px] font-bold">{e.role}</span>
              <span className="shrink-0 text-[11px] text-neutral-600">
                {e.start} – {e.end}
              </span>
            </div>
            <div className="text-[11.5px] text-neutral-700 italic">
              {e.org} · {e.location}
            </div>
            <ul className="mt-1.5 space-y-0.5">
              {e.bullets.map((b) => (
                <li key={b} className="flex gap-2 text-[11.5px] leading-snug">
                  <span>•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title="Education">
        {edu.map((e) => (
          <div key={e.id} className="mb-2">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[13px] font-bold">{e.role}</span>
              <span className="shrink-0 text-[11px] text-neutral-600">
                {e.start} – {e.end}
              </span>
            </div>
            <div className="text-[11.5px] text-neutral-700 italic">{e.org}</div>
          </div>
        ))}
      </Section>

      <Section title="Technical Skills">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          {['Languages', 'Frontend', 'Backend', 'Data', 'Infrastructure', 'Tools'].map((cat) => {
            const list = top.filter((s) => s.category === cat)
            if (list.length === 0) return null
            return (
              <div key={cat} className="text-[11.5px]">
                <span className="font-bold">{cat}: </span>
                {list.map((s) => s.name).join(', ')}
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Focus Areas">
        <p className="text-[11.5px]">{resume.focusAreas.join(' · ')}</p>
      </Section>

      {certifications.length > 0 && (
        <Section title="Certifications">
          {certifications.map((c) => (
            <div key={c.name} className="flex items-baseline justify-between text-[11.5px]">
              <span>
                <span className="font-semibold">{c.name}</span> — {c.issuer}
              </span>
              <span className="text-neutral-600">{c.year}</span>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 border-b border-neutral-300 pb-1 text-[11px] font-bold tracking-[0.14em] uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

function buildPlainText(): string {
  const line = '='.repeat(64)
  return [
    owner.name.toUpperCase(),
    owner.role,
    `${owner.email} | ${owner.location} | ${links.github} | ${links.linkedin}`,
    line,
    '',
    'SUMMARY',
    resume.summary,
    '',
    'EXPERIENCE',
    ...experience
      .filter((e) => e.kind === 'work')
      .flatMap((e) => [
        `${e.role} — ${e.org} (${e.start} – ${e.end})`,
        ...e.bullets.map((b) => `  - ${b}`),
        '',
      ]),
    'EDUCATION',
    ...experience.filter((e) => e.kind === 'education').map((e) => `${e.role} — ${e.org} (${e.start} – ${e.end})`),
    '',
    'SKILLS',
    ...['Languages', 'Frontend', 'Backend', 'Data', 'Infrastructure', 'Tools'].map(
      (cat) => `${cat}: ${skills.filter((s) => s.category === cat).map((s) => s.name).join(', ')}`,
    ),
    '',
    'CERTIFICATIONS',
    ...certifications.map((c) => `${c.name} — ${c.issuer} (${c.year})`),
  ].join('\n')
}
