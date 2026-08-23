import { useState } from 'react'
import { links, owner } from '@/data/portfolio'
import { Btn, Scroll, Sidebar, SidebarItem, SidebarLabel, StatusBar, Toolbar } from '@/os/ui'
import { launchApp } from '@/os/launch'
import { notify } from '@/store/notifications'
import type { AppWindowProps } from '@/os/types'

/** Contact, presented as a mail client. Sending opens the visitor's own client. */
export default function Contact({ props }: AppWindowProps) {
  const [from, setFrom] = useState('')
  const [name, setName] = useState('')
  const [subject, setSubject] = useState((props.subject as string) ?? '')
  const [body, setBody] = useState('')
  const [sent, setSent] = useState(false)

  const valid = from.includes('@') && subject.trim() && body.trim()

  function send() {
    if (!valid) return
    const signature = name ? `\n\n— ${name}${from ? `\n${from}` : ''}` : from ? `\n\n${from}` : ''
    const url = `mailto:${owner.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + signature)}`
    window.location.href = url
    setSent(true)
    notify({
      title: 'Message handed to your mail client',
      body: `To: ${owner.email}`,
      glyph: '✉️',
    })
  }

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[13px] font-semibold">Compose</span>
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          to {owner.email}
        </span>
        <div className="ml-auto flex gap-2">
          <Btn
            onClick={() => {
              setSubject('')
              setBody('')
              setSent(false)
            }}
          >
            Discard
          </Btn>
          <Btn primary disabled={!valid} onClick={send}>
            Send ▸
          </Btn>
        </div>
      </Toolbar>

      <div className="flex min-h-0 flex-1">
        <Sidebar width={196}>
          <SidebarLabel>Reach me at</SidebarLabel>
          <SidebarItem glyph="✉️" onClick={() => (window.location.href = `mailto:${owner.email}`)}>
            {owner.email}
          </SidebarItem>
          <SidebarItem glyph="🐙" onClick={() => launchApp('browser', { url: links.github })}>
            GitHub
          </SidebarItem>
          <SidebarItem glyph="💼" onClick={() => launchApp('browser', { url: links.linkedin })}>
            LinkedIn
          </SidebarItem>
          <SidebarItem glyph="🌐" onClick={() => launchApp('browser', { url: links.website })}>
            Website
          </SidebarItem>

          <SidebarLabel>Status</SidebarLabel>
          <div className="mx-3 rounded-lg p-3" style={{ background: 'color-mix(in oklab, #34d399 14%, transparent)' }}>
            <div className="flex items-center gap-2 text-[12px] font-medium">
              <span className="h-2 w-2 rounded-full" style={{ background: '#34d399' }} />
              Open to opportunities
            </div>
            <p className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--text-dim)' }}>
              {owner.location} · remote-friendly · replies within a day or two.
            </p>
          </div>
        </Sidebar>

        <Scroll className="p-5">
          <div className="mx-auto max-w-xl space-y-3">
            {sent && (
              <div
                className="rounded-xl p-3 text-[12.5px]"
                style={{ background: 'color-mix(in oklab, #34d399 16%, transparent)' }}
              >
                <strong>Handed off.</strong> Your mail client should have opened with this message
                ready to send. If nothing happened, copy the address:{' '}
                <span className="selectable font-mono" style={{ color: 'var(--accent)' }}>
                  {owner.email}
                </span>
              </div>
            )}

            <Row label="From">
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                type="email"
                placeholder="you@company.com"
                className="w-full bg-transparent text-[13px] outline-none"
                style={{ color: 'var(--text)' }}
              />
            </Row>
            <Row label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                className="w-full bg-transparent text-[13px] outline-none"
                style={{ color: 'var(--text)' }}
              />
            </Row>
            <Row label="Subject">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What is this about?"
                className="w-full bg-transparent text-[13px] outline-none"
                style={{ color: 'var(--text)' }}
              />
            </Row>

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder={`Hi ${owner.name.split(' ')[0]},\n\nI came across your workstation…`}
              className="selectable w-full resize-none rounded-xl p-3.5 text-[13px] leading-relaxed outline-none"
              style={{
                background: 'color-mix(in oklab, var(--text) 6%, transparent)',
                color: 'var(--text)',
                boxShadow: 'inset 0 0 0 1px var(--chrome-border)',
              }}
            />

            <div className="flex flex-wrap gap-2">
              {['Job opportunity', 'Freelance project', 'Just saying hi'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className="rounded-full px-3 py-1 text-[11.5px]"
                  style={{ background: 'color-mix(in oklab, var(--text) 9%, transparent)', color: 'var(--text-dim)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Scroll>
      </div>

      <StatusBar>
        <span>{body.length} characters</span>
        <span className="ml-auto">{valid ? 'Ready to send' : 'Fill in email, subject and message'}</span>
      </StatusBar>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
      style={{ background: 'color-mix(in oklab, var(--text) 6%, transparent)' }}
    >
      <span className="w-16 shrink-0 text-[11.5px]" style={{ color: 'var(--text-dim)' }}>
        {label}
      </span>
      {children}
    </div>
  )
}
