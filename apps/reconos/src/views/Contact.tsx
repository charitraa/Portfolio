import { motion } from 'framer-motion'
import { Copy, Globe, Loader2, Mail, MapPin, PenLine, Send } from 'lucide-react'
import { Github, Linkedin } from '@/components/BrandIcons'
import { useState } from 'react'
import { Badge, Button, Panel, View, ViewHeader } from '@/components/ui'
import { cx } from '@/lib/style'
import { profile } from '@/data/profile'
import { useApp } from '@/store/app'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const FIELDS = [
  { name: 'name', label: 'name', type: 'text', placeholder: 'Ada Lovelace' },
  { name: 'email', label: 'email', type: 'email', placeholder: 'ada@example.com' },
  { name: 'subject', label: 'subject', type: 'text', placeholder: 'Project enquiry' },
] as const

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const log = useApp((s) => s.log)
  const notify = useApp((s) => s.notify)

  const update = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: '' }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return

    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'must be a valid address'
    if (form.message.trim().length < 12) next.message = 'at least 12 characters'
    setErrors(next)

    if (Object.keys(next).length) {
      log(`POST /api/v1/contact — 422 Unprocessable Entity (${Object.keys(next).join(', ')})`, 'error')
      setStatus('error')
      return
    }

    setStatus('sending')
    log('POST /api/v1/contact — sending…', 'cmd')

    // No backend wired up yet — swap this block for your real endpoint.
    setTimeout(() => {
      setStatus('sent')
      log('POST /api/v1/contact — 200 OK', 'ok')
      notify('Message sent', 'I usually reply within a day.', 'ok')
    }, 1200)
  }

  const copyEmail = () => {
    void navigator.clipboard?.writeText(profile.email)
    notify('Copied', profile.email, 'ok')
  }

  const inputCls = (field: string) =>
    cx(
      'w-full rounded-md border bg-bg px-2.5 py-2 font-mono text-[12px] text-fg outline-none',
      'transition-colors duration-150 placeholder:text-muted/60 focus:border-blue',
      errors[field] ? 'border-red' : 'border-line',
    )

  return (
    <View>
      <ViewHeader
        title="Contact"
        route="POST /api/v1/contact"
        desc="Open to internships, freelance work and interesting problems. Fill the form or use any channel on the right."
        actions={<Badge color="green" dot>{profile.availability}</Badge>}
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel
          title="Request"
          subtitle="application/json"
          className="lg:col-span-2"
          actions={
            status === 'sent' ? (
              <Badge color="green">200 OK</Badge>
            ) : status === 'error' ? (
              <Badge color="red">422</Badge>
            ) : (
              <Badge>pending</Badge>
            )
          }
        >
          <form onSubmit={submit} noValidate className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {FIELDS.map((f) => (
                <label key={f.name} className="flex flex-col gap-1">
                  <span className="font-mono text-[11px] text-blue">
                    "{f.label}"
                    {errors[f.name] && (
                      <span className="ml-1.5 text-red">— {errors[f.name]}</span>
                    )}
                  </span>
                  <input
                    type={f.type}
                    value={form[f.name]}
                    onChange={(e) => update(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    spellCheck={false}
                    className={inputCls(f.name)}
                  />
                </label>
              ))}
            </div>

            <label className="flex flex-col gap-1">
              <span className="font-mono text-[11px] text-blue">
                "message"
                {errors.message && <span className="ml-1.5 text-red">— {errors.message}</span>}
              </span>
              <textarea
                rows={7}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                placeholder="What are you building, and where do you need help?"
                className={cx(inputCls('message'), 'resize-y leading-relaxed')}
              />
            </label>

            <div className="flex items-center gap-3">
              <Button type="submit" variant="primary" disabled={status === 'sending'}>
                {status === 'sending' ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
                {status === 'sending' ? 'Sending…' : 'Send request'}
              </Button>
              <span className="font-mono text-[11px] text-muted">
                Content-Length: {JSON.stringify(form).length}
              </span>
            </div>
          </form>

          {status === 'sent' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-md border border-green/40 bg-green/8 p-3 font-mono text-[11.5px]"
            >
              <div className="text-green">HTTP/1.1 200 OK</div>
              <div className="mt-1 text-muted">content-type: application/json</div>
              <pre className="mt-2 text-fg2">{`{
  "status": "delivered",
  "message": "Thanks ${form.name.split(' ')[0] || 'there'} — I'll reply within 24 hours.",
  "ticket": "RC-${Math.floor(Math.random() * 90000 + 10000)}"
}`}</pre>
            </motion.div>
          )}
        </Panel>

        <div className="flex flex-col gap-3">
          <Panel title="Channels">
            <ul className="space-y-1">
              {[
                { icon: Mail, label: profile.email, href: `mailto:${profile.email}`, color: 'blue' },
                { icon: Github, label: 'GitHub', href: profile.socials.github, color: 'purple' },
                { icon: Linkedin, label: 'LinkedIn', href: profile.socials.linkedin, color: 'blue' },
                { icon: Globe, label: 'charitrashrestha.com.np', href: profile.socials.website, color: 'green' },
                { icon: PenLine, label: 'dev.to', href: profile.socials.devto, color: 'orange' },
              ].map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.href.startsWith('mailto') ? undefined : '_blank'}
                    rel="noreferrer noopener"
                    className="flex items-center gap-2.5 rounded-md px-2 py-2 text-[12.5px] text-fg2 transition-colors duration-150 hover:bg-hover hover:text-fg"
                  >
                    <c.icon size={15} className="shrink-0 text-muted" />
                    <span className="truncate">{c.label}</span>
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-[12.5px] text-fg2 transition-colors duration-150 hover:bg-hover hover:text-fg"
                >
                  <Copy size={15} className="shrink-0 text-muted" />
                  Copy email address
                </button>
              </li>
              <li className="flex items-center gap-2.5 px-2 py-2 text-[12.5px] text-muted">
                <MapPin size={15} className="shrink-0" />
                {profile.location}
              </li>
            </ul>
          </Panel>

          <Panel title="Response time">
            <ul className="space-y-1.5 font-mono text-[11.5px]">
              {[
                ['Typical reply', '< 24h'],
                ['Timezone', 'NPT (UTC+5:45)'],
                ['Best hours', '10:00 — 22:00'],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center gap-2">
                  <span className="text-muted">{k}</span>
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-fg2">{v}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </View>
  )
}
