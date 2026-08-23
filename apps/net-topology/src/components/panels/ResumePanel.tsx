import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { profile } from '../../data/profile'
import { KeyValue, SectionTitle, StatusPill } from '../ui/primitives'
import { useApp } from '../../store/AppState'
import { withBase } from '../../utils/base'

type Phase = 'idle' | 'transferring' | 'done'

/** Object storage — résumé download, dressed as an HTTP GET. */
export function ResumePanel() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const { pushLog } = useApp()

  function startTransfer() {
    if (phase === 'transferring') return
    setPhase('transferring')
    setProgress(0)
    pushLog('GET /resume.pdf — transfer started', 'info')

    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = current + 6 + Math.random() * 14
        if (next >= 100) {
          window.clearInterval(timer)
          setPhase('done')
          pushLog('GET /resume.pdf — 200 OK, résumé downloaded', 'ok')
          // Hand off to the browser once the "transfer" completes.
          const link = document.createElement('a')
          link.href = withBase(profile.resume.file)
          link.download = 'charitra-shrestha-resume.pdf'
          link.click()
          return 100
        }
        return next
      })
    }, 160)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill label="available" tone="ok" />
        <StatusPill label="cached at edge" tone="warn" dot={false} />
      </div>

      <div className="rounded-lg border bg-bg-2/70 p-3 font-mono text-[11px]">
        <div className="flex items-center gap-2 text-muted">
          <span className="rounded bg-ok/15 px-1.5 py-0.5 font-bold text-ok">GET</span>
          <span className="text-ink">{profile.resume.file}</span>
        </div>
        <div className="mt-2 space-y-1 text-muted">
          <div className="flex justify-between">
            <span>content-type</span>
            <span className="text-ink">application/pdf</span>
          </div>
          <div className="flex justify-between">
            <span>content-length</span>
            <span className="text-ink">{profile.resume.size}</span>
          </div>
          <div className="flex justify-between">
            <span>last-modified</span>
            <span className="text-ink">{profile.resume.updated}</span>
          </div>
          <div className="flex justify-between">
            <span>status</span>
            <span className={phase === 'done' ? 'text-ok' : 'text-muted'}>
              {phase === 'idle' ? '— idle —' : phase === 'transferring' ? '206 Partial' : '200 OK'}
            </span>
          </div>
        </div>

        {phase !== 'idle' && (
          <div className="mt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-line/60">
              <div
                className="h-full rounded-full bg-ok transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted">
              <span>{phase === 'done' ? 'transfer complete' : 'transferring…'}</span>
              <span className="font-num">{Math.round(progress)}%</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={startTransfer}
        disabled={phase === 'transferring'}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent/50 bg-accent/15 px-4 py-2.5 font-display text-[13px] font-semibold text-accent transition-colors hover:bg-accent/25 disabled:opacity-60"
      >
        <Download size={15} />
        {phase === 'done' ? 'Download again' : 'Download résumé'}
      </button>

      <div>
        <SectionTitle hint="object metadata">File</SectionTitle>
        <KeyValue k="key" v="resume.pdf" />
        <KeyValue k="bucket" v="cdn-assets" />
        <KeyValue k="region" v="ap-south-1" />
        <KeyValue k="cache" v="public, max-age=3600" />
        <KeyValue k="etag" v={'"a17f…c92"'} />
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-line/70 bg-bg-2/50 p-3 text-[12px] text-muted">
        <FileText size={14} className="mt-0.5 shrink-0 text-warn" />
        <span>
          The résumé is served from <code className="font-mono text-[11px] text-ink">public/resume.pdf</code>.
          Drop your own PDF in at that path to replace the placeholder.
        </span>
      </div>
    </div>
  )
}
