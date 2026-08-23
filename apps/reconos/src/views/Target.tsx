import { motion } from 'framer-motion'
import { Check, Crosshair, Play, RotateCcw, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Badge, Button, Panel, View, ViewHeader } from '@/components/ui'
import { cx } from '@/lib/style'
import { profile } from '@/data/profile'
import { projects } from '@/data/projects'
import { skillGroups, stackCategories } from '@/data/skills'
import { useApp } from '@/store/app'

/**
 * A deliberately theatrical "scan" of this portfolio. It inspects the local
 * data files and reports them as findings — no network requests, no real
 * scanning, and nothing here touches a host you do not own.
 */
const STEPS = [
  { label: 'Resolving target', detail: 'reconos.portfolio.local → 127.0.0.1' },
  { label: 'Port sweep', detail: '443/tcp open · 80/tcp redirect' },
  { label: 'TLS inspection', detail: 'TLS 1.3 · TLS_AES_256_GCM_SHA384 · valid 89d' },
  { label: 'Enumerating projects', detail: `${projects.length} records indexed` },
  { label: 'Fingerprinting stack', detail: `${stackCategories.length} categories detected` },
  { label: 'Auth surface review', detail: 'no exposed credentials found' },
  { label: 'Dependency audit', detail: '0 critical · 0 high · 0 moderate' },
  { label: 'Generating report', detail: 'signed with sha256' },
]

export function Target() {
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)
  const log = useApp((s) => s.log)
  const notify = useApp((s) => s.notify)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const complete = step >= STEPS.length - 1 && !running

  const start = () => {
    timers.current.forEach(clearTimeout)
    setStep(-1)
    setRunning(true)
    log(`Initiating surface scan against ${profile.handle.toLowerCase()}.local`, 'cmd')

    timers.current = STEPS.map((s, i) =>
      setTimeout(() => {
        setStep(i)
        log(`${s.label} — ${s.detail}`, i === STEPS.length - 1 ? 'ok' : 'info')
        if (i === STEPS.length - 1) {
          setRunning(false)
          notify('Scan complete', 'No vulnerabilities found.', 'ok')
        }
      }, 500 + i * 620),
    )
  }

  // Kick off automatically the first time the view is opened.
  useEffect(() => {
    start()
    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const progress = Math.round(((step + 1) / STEPS.length) * 100)
  const totalSkills = skillGroups.reduce((n, g) => n + g.items.length, 0)

  return (
    <View>
      <ViewHeader
        title="Target"
        route="POST /api/v1/scan"
        desc="A scripted assessment of this portfolio itself — everything below is computed from local data, not from probing anything on the network."
        actions={
          <Button variant={running ? 'secondary' : 'primary'} onClick={start} disabled={running}>
            {running ? <RotateCcw size={13} className="animate-spin" /> : <Play size={13} />}
            {running ? 'Scanning…' : 'Re-run scan'}
          </Button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel
          title="Scan progress"
          subtitle={running ? 'running' : complete ? 'finished' : 'idle'}
          className="lg:col-span-2"
          icon={<Crosshair size={13} />}
          actions={<span className="num text-[11px] text-muted">{progress}%</span>}
        >
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-bg2">
            <motion.div
              className="h-full rounded-full bg-blue"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <ol className="space-y-1 font-mono text-[11.5px]">
            {STEPS.map((s, i) => {
              const state = i < step ? 'done' : i === step ? (running ? 'active' : 'done') : 'pending'
              return (
                <li
                  key={s.label}
                  className={cx(
                    'flex items-baseline gap-2 rounded px-2 py-1 transition-colors duration-200',
                    state === 'active' && 'bg-blue/10',
                    state === 'pending' && 'opacity-35',
                  )}
                >
                  <span
                    className={cx(
                      'w-4 shrink-0',
                      state === 'done' ? 'text-green' : state === 'active' ? 'text-blue' : 'text-muted',
                    )}
                  >
                    {state === 'done' ? '✓' : state === 'active' ? '›' : '·'}
                  </span>
                  <span className="shrink-0 text-fg2">{s.label}</span>
                  <span className="truncate text-muted">{s.detail}</span>
                </li>
              )
            })}
          </ol>
        </Panel>

        <div className="flex flex-col gap-3">
          <Panel title="Verdict" icon={<ShieldCheck size={13} />}>
            <div
              className={cx(
                'flex flex-col items-center rounded-md border py-5 transition-colors duration-300',
                complete ? 'border-green/40 bg-green/8' : 'border-line bg-bg2',
              )}
            >
              <span
                className={cx(
                  'grid size-11 place-items-center rounded-full',
                  complete ? 'bg-green/15 text-green' : 'bg-active text-muted',
                )}
                style={complete ? { animation: 'rc-pulse-ring 2.4s ease-out infinite' } : undefined}
              >
                {complete ? <Check size={22} /> : <Crosshair size={20} />}
              </span>
              <div className="mt-2.5 text-[14px] font-semibold text-fg">
                {complete ? 'No vulnerabilities found' : 'Assessment in progress'}
              </div>
              <div className="num mt-0.5 text-[11px] text-muted">
                {complete ? 'Status: Secure' : `${progress}% complete`}
              </div>
            </div>

            <ul className="mt-3 space-y-1.5 font-mono text-[11.5px]">
              {[
                ['SSL', 'Valid', 'green'],
                ['Firewall', 'Active', 'green'],
                ['Authentication', 'Passed', 'green'],
                ['Rate limiting', 'Enabled', 'green'],
                ['Exposed secrets', 'None', 'green'],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center gap-2">
                  <span className="text-muted">{k}</span>
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-green">{v}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Surface inventory">
            <ul className="space-y-1.5 font-mono text-[11.5px]">
              {[
                ['Projects', projects.length],
                ['Technologies', stackCategories.reduce((n, c) => n + c.items.length, 0)],
                ['Skills tracked', totalSkills],
                ['Open findings', 0],
              ].map(([k, v]) => (
                <li key={String(k)} className="flex items-center gap-2">
                  <span className="text-muted">{k}</span>
                  <span className="h-px flex-1 bg-line" />
                  <span className="num text-fg2">{v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <Badge color="blue">report signed · sha256:4c1f…9de2</Badge>
            </div>
          </Panel>
        </div>
      </div>
    </View>
  )
}
