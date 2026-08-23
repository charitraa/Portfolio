import { useState, type FormEvent } from 'react'
import { Github, Linkedin, Mail, Send } from 'lucide-react'
import { profile } from '../../data/profile'
import { KeyValue, SectionTitle, StatusPill } from '../ui/primitives'
import { useApp } from '../../store/AppState'

type Phase = 'idle' | 'sending' | 'sent'

const fields = [
  { name: 'name', label: 'name', type: 'text', placeholder: 'Your name' },
  { name: 'email', label: 'email', type: 'email', placeholder: 'you@example.com' },
  { name: 'subject', label: 'subject', type: 'text', placeholder: 'What is this about?' },
] as const

/**
 * SMTP relay — the contact form. There is no backend in this project, so the
 * request is simulated and then handed to the visitor's mail client.
 */
export function ContactPanel() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' })
  const { pushLog } = useApp()

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(
    values.subject || 'Hello',
  )}&body=${encodeURIComponent(`${values.message}\n\n— ${values.name} (${values.email})`)}`

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPhase('sending')
    pushLog('POST /contact — queued for delivery', 'info')
    window.setTimeout(() => {
      setPhase('sent')
      pushLog('POST /contact — 201 Created', 'ok')
      window.location.href = mailto
    }, 900)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill label="accepting mail" tone="ok" pulse />
        <StatusPill label="tls required" tone="purple" dot={false} />
      </div>

      <div className="rounded-lg border bg-bg-2/70 p-2.5 font-mono text-[11px]">
        <span className="rounded bg-accent/15 px-1.5 py-0.5 font-bold text-accent">POST</span>{' '}
        <span className="text-ink">/contact</span>{' '}
        <span className="text-muted">HTTP/1.1</span>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-1 block font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
              {field.label}
            </span>
            <input
              type={field.type}
              required
              placeholder={field.placeholder}
              value={values[field.name]}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, [field.name]: event.target.value }))
              }
              className="w-full rounded-lg border bg-bg-2/70 px-3 py-2 font-mono text-[12px] text-ink transition-colors outline-none placeholder:text-muted/50 focus:border-accent"
            />
          </label>
        ))}

        <label className="block">
          <span className="mb-1 block font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
            message
          </span>
          <textarea
            required
            rows={4}
            placeholder="Tell me what you are building."
            value={values.message}
            onChange={(event) => setValues((prev) => ({ ...prev, message: event.target.value }))}
            className="w-full resize-y rounded-lg border bg-bg-2/70 px-3 py-2 font-mono text-[12px] text-ink transition-colors outline-none placeholder:text-muted/50 focus:border-accent"
          />
        </label>

        <button
          type="submit"
          disabled={phase === 'sending'}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-ok/50 bg-ok/15 px-4 py-2.5 font-display text-[13px] font-semibold text-ok transition-colors hover:bg-ok/25 disabled:opacity-60"
        >
          <Send size={14} />
          {phase === 'sending' ? 'Sending…' : phase === 'sent' ? 'Send another' : 'Send message'}
        </button>
      </form>

      {phase === 'sent' && (
        <div className="anim-rise rounded-lg border border-ok/40 bg-ok/10 p-3 font-mono text-[11px]">
          <div className="font-bold text-ok">201 Created</div>
          <p className="mt-1 text-muted">
            Your mail client should have opened with the message prefilled. If it did not, write to{' '}
            <a href={`mailto:${profile.email}`} className="text-accent underline">
              {profile.email}
            </a>
            .
          </p>
        </div>
      )}

      <div>
        <SectionTitle hint="relay">Endpoints</SectionTitle>
        <KeyValue k="email" v={profile.email} />
        <KeyValue k="location" v={profile.location} />
        <KeyValue k="response time" v="< 24 h" tone="ok" />
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={profile.socials.github}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-accent/60 hover:text-accent"
        >
          <Github size={13} /> github
        </a>
        <a
          href={profile.socials.linkedin}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-accent/60 hover:text-accent"
        >
          <Linkedin size={13} /> linkedin
        </a>
        <a
          href={`mailto:${profile.email}`}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-accent/60 hover:text-accent"
        >
          <Mail size={13} /> email
        </a>
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-muted/70">
        Note: this front end has no server. Submitting composes the message in your own mail client
        rather than posting it anywhere.
      </p>
    </div>
  )
}
