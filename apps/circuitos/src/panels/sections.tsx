import { useEffect, useState } from 'react'
import { withBase } from '../lib/base'
import {
  Award,
  BadgeCheck,
  Battery,
  Cpu,
  Download,
  Fan,
  Github,
  Globe,
  HardDrive,
  Layers,
  Linkedin,
  Mail,
  MapPin,
  Quote,
  Send,
  Usb,
  Zap,
} from 'lucide-react'
import type { ComponentId } from '../board/layout'
import { ACCENT_HEX, NODE_MAP } from '../board/layout'
import {
  achievements,
  certifications,
  contact,
  experience,
  identity,
  personal,
  projects,
  resume,
  secretLab,
  services,
  skillBanks,
  smallSkills,
  softSkills,
  stats,
  strengths,
  testimonials,
} from '../data/content'

/* ── shared bits ──────────────────────────────────────────────────────── */

function Meter({ value, color }: { value: number; color: string }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = window.setTimeout(() => setW(value), 60)
    return () => window.clearTimeout(t)
  }, [value])
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${w}%`, background: color, boxShadow: `0 0 10px ${color}80` }}
      />
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-slate-700 bg-slate-800/60 px-2 py-0.5 font-mono text-[10px] text-slate-300">
      {children}
    </span>
  )
}

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div
      className="rounded-lg border border-slate-700/70 bg-slate-900/60 p-4"
      style={accent ? { borderLeft: `2px solid ${accent}` } : undefined}
    >
      {children}
    </div>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">{children}</h3>
  )
}

/* ── sections ─────────────────────────────────────────────────────────── */

function About() {
  const [imgOk, setImgOk] = useState(true)
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
          {imgOk ? (
            <img
              src={withBase(identity.photo)}
              alt={identity.name}
              className="h-full w-full object-cover"
              onError={() => setImgOk(false)}
            />
          ) : (
            <Cpu className="h-8 w-8 text-blue-400" />
          )}
        </div>
        <div>
          <div className="font-display text-2xl font-bold tracking-wide">{identity.name}</div>
          <div className="text-sm text-slate-300">{identity.role}</div>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-green-400">
            <span className="breathe h-1.5 w-1.5 rounded-full bg-green-400" /> {identity.status} ·{' '}
            {identity.clock}
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-200">{identity.tagline}</p>
      {identity.bio.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed text-slate-400">
          {p}
        </p>
      ))}

      <div>
        <Heading>Goals</Heading>
        <ul className="space-y-1.5">
          {identity.goals.map((g) => (
            <li key={g} className="flex gap-2 text-sm text-slate-300">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
              {g}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <Heading>Education</Heading>
          <div className="text-sm text-slate-200">{identity.university}</div>
        </Card>
        <Card>
          <Heading>Location</Heading>
          <div className="flex items-center gap-1.5 text-sm text-slate-200">
            <MapPin className="h-3.5 w-3.5 text-green-400" /> {identity.location}
          </div>
        </Card>
      </div>

      <a
        href={withBase(resume.file)}
        download
        className="inline-flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20"
      >
        <Download className="h-4 w-4" /> Download résumé
      </a>
    </div>
  )
}

function Skills() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Four memory banks, populated. Each stick is a discipline; the bars are honest self-assessment,
        not marketing.
      </p>
      {skillBanks.map((bank) => {
        const hex = ACCENT_HEX[bank.color]
        return (
          <Card key={bank.slot} accent={hex}>
            <div className="mb-3 flex items-baseline justify-between">
              <div className="font-display text-sm font-semibold" style={{ color: hex }}>
                {bank.label}
              </div>
              <div className="font-mono text-[10px] text-slate-500">
                {bank.slot} · {bank.capacity}
              </div>
            </div>
            <div className="space-y-2.5">
              {bank.skills.map((s) => (
                <div key={s.name}>
                  <div className="mb-1 flex justify-between font-mono text-[11px]">
                    <span className="text-slate-300">{s.name}</span>
                    <span className="text-slate-500">{s.level}%</span>
                  </div>
                  <Meter value={s.level} color={hex} />
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function Projects() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Render pipeline output — things I built end to end.</p>
      {projects.map((p) => (
        <Card key={p.name} accent={ACCENT_HEX.memory}>
          <div className="mb-1 flex items-start justify-between gap-3">
            <div className="font-display text-base font-semibold text-slate-100">{p.name}</div>
            <Chip>{p.kind}</Chip>
          </div>
          <p className="mb-3 text-sm leading-relaxed text-slate-400">{p.blurb}</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
          <div className="flex items-center justify-between">
            {p.metric && (
              <span className="font-mono text-[10px] text-violet-400">▲ {p.metric}</span>
            )}
            <div className="flex gap-3 font-mono text-[11px]">
              {p.href && (
                <a href={p.href} className="text-blue-400 hover:underline">
                  live ↗
                </a>
              )}
              {p.repo && (
                <a href={p.repo} className="text-slate-400 hover:underline">
                  source ↗
                </a>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function Experience() {
  return (
    <div className="space-y-1">
      <p className="mb-4 text-sm text-slate-400">Sequential read from the experience volume.</p>
      {experience.map((e, i) => (
        <div key={e.year} className="relative pl-8">
          <span className="absolute left-[7px] top-1 h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
          {i < experience.length - 1 && (
            <span className="absolute bottom-0 left-[11px] top-4 w-px bg-gradient-to-b from-green-500/60 to-slate-700" />
          )}
          <div className="pb-6">
            <div className="flex items-center gap-2">
              <span className="font-numeric text-sm font-bold text-green-400">{e.year}</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
                {e.io}
              </span>
            </div>
            <div className="mt-0.5 font-display text-base font-semibold text-slate-100">{e.title}</div>
            <div className="font-mono text-[11px] text-slate-500">{e.org}</div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{e.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function Resume() {
  const [flashing, setFlashing] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!flashing) return
    const t = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          window.clearInterval(t)
          return 100
        }
        return p + 4
      })
    }, 28)
    return () => window.clearInterval(t)
  }, [flashing])

  useEffect(() => {
    if (progress < 100) return
    const a = document.createElement('a')
    a.href = withBase(resume.file)
    a.download = 'resume.pdf'
    a.click()
  }, [progress])

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        The résumé lives in firmware. Flashing it writes a PDF to your downloads folder.
      </p>
      <Card accent={ACCENT_HEX.copper}>
        <div className="grid grid-cols-3 gap-3 font-mono text-[11px]">
          <div>
            <div className="text-slate-500">VERSION</div>
            <div className="text-amber-300">{resume.version}</div>
          </div>
          <div>
            <div className="text-slate-500">SIZE</div>
            <div className="text-amber-300">{resume.size}</div>
          </div>
          <div>
            <div className="text-slate-500">UPDATED</div>
            <div className="text-amber-300">{resume.updated}</div>
          </div>
        </div>
      </Card>

      {flashing ? (
        <div className="space-y-2">
          <div className="flex justify-between font-mono text-[11px] text-amber-300">
            <span>{progress < 100 ? 'FLASHING BIOS — DO NOT POWER OFF' : 'FLASH COMPLETE'}</span>
            <span>{progress}%</span>
          </div>
          <Meter value={progress} color={ACCENT_HEX.copper} />
        </div>
      ) : (
        <button
          onClick={() => setFlashing(true)}
          className="inline-flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20"
        >
          <Download className="h-4 w-4" /> Flash & download résumé
        </button>
      )}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('circuitos:bios'))}
        className="block font-mono text-[10px] text-slate-500 underline decoration-dotted underline-offset-4 transition hover:text-slate-300"
      >
        Enter setup utility (or double-click the BIOS chip on the board)
      </button>
    </div>
  )
}

function Contact() {
  const [sent, setSent] = useState(false)
  const links = [
    { icon: Github, label: 'GitHub', href: contact.github },
    { icon: Linkedin, label: 'LinkedIn', href: contact.linkedin },
    { icon: Mail, label: 'Email', href: `mailto:${contact.email}` },
  ]
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Link is up. 1000BASE-T, full duplex.</p>
      <div className="grid grid-cols-3 gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 py-3 text-slate-300 transition hover:border-green-500/50 hover:text-green-300"
          >
            <l.icon className="h-4 w-4" />
            <span className="font-mono text-[10px]">{l.label}</span>
          </a>
        ))}
      </div>
      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
        <MapPin className="h-3.5 w-3.5 text-green-400" /> {contact.location}
      </div>

      <form
        className="space-y-2.5"
        onSubmit={(e) => {
          e.preventDefault()
          setSent(true)
          window.location.href = `mailto:${contact.email}`
        }}
      >
        <input
          required
          placeholder="Your name"
          className="w-full rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-green-500/60"
        />
        <input
          required
          type="email"
          placeholder="Your email"
          className="w-full rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-green-500/60"
        />
        <textarea
          required
          rows={4}
          placeholder="Packet payload…"
          className="w-full resize-none rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-green-500/60"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-300 transition hover:bg-green-500/20"
        >
          <Send className="h-4 w-4" /> {sent ? 'Packet sent' : 'Transmit'}
        </button>
        <p className="font-mono text-[10px] text-slate-600">
          Opens your mail client — no server, no tracking.
        </p>
      </form>
    </div>
  )
}

function Services() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">Six ports, hot-swappable. Plug in whatever you need.</p>
      {services.map((s) => (
        <Card key={s.title} accent={ACCENT_HEX.electric}>
          <div className="flex items-start gap-3">
            <Usb className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-semibold text-slate-100">{s.title}</span>
                <Chip>{s.port}</Chip>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{s.detail}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function Certifications() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">Expansion cards seated in the PCIe lanes.</p>
      {certifications.map((c) => (
        <Card key={c.name} accent={ACCENT_HEX.copper}>
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-4 w-4 shrink-0 text-amber-400" />
            <div className="flex-1">
              <div className="font-display text-sm font-semibold text-slate-100">{c.name}</div>
              <div className="font-mono text-[11px] text-slate-500">
                {c.issuer} · {c.year}
              </div>
            </div>
            <Chip>{c.slot}</Chip>
          </div>
        </Card>
      ))}
    </div>
  )
}

function Achievements() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">Add-in card: milestones worth soldering down.</p>
      {achievements.map((a) => (
        <Card key={a.title} accent={ACCENT_HEX.power}>
          <div className="flex items-start gap-3">
            <Award className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <div>
              <div className="font-display text-sm font-semibold text-slate-100">{a.title}</div>
              <p className="mt-0.5 text-sm text-slate-400">{a.detail}</p>
              <div className="mt-1 font-mono text-[10px] text-slate-500">{a.year}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function Stats() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Rail readings from the 24-pin connector.</p>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="font-numeric text-3xl font-bold text-amber-400 text-glow-copper">
              {Number.isFinite(s.value) ? s.value : '∞'}
              <span className="text-base">{s.suffix}</span>
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              {s.label}
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <Heading>Rail health</Heading>
        <div className="space-y-2 font-mono text-[11px]">
          {[
            ['+12V rail', 12.02, '#f59e0b'],
            ['+5V rail', 5.01, '#3b82f6'],
            ['+3.3V rail', 3.31, '#22c55e'],
          ].map(([label, v, c]) => (
            <div key={label as string} className="flex justify-between">
              <span className="text-slate-400">{label as string}</span>
              <span style={{ color: c as string }}>{(v as number).toFixed(2)}V · STABLE</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Strengths() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        Five power phases. These are what keep the core stable when the load spikes.
      </p>
      {strengths.map((s) => (
        <Card key={s.title} accent={ACCENT_HEX.power}>
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-semibold text-slate-100">{s.title}</span>
                <Chip>{s.phase}</Chip>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{s.detail}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function SoftSkills() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">Thermal management — the fans that stop the core throttling.</p>
      {softSkills.map((s) => (
        <Card key={s.name} accent={ACCENT_HEX.electric}>
          <div className="flex items-center gap-3">
            <Fan className="fan-spin h-4 w-4 shrink-0 text-blue-400" />
            <span className="flex-1 font-display text-sm font-semibold text-slate-100">{s.name}</span>
            <span className="font-numeric text-sm text-blue-400">{s.rpm} RPM</span>
          </div>
        </Card>
      ))}
    </div>
  )
}

function Personal() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        CMOS holds the settings that survive a power cut. Here are mine.
      </p>
      <Card accent={ACCENT_HEX.signal}>
        <div className="space-y-2.5 font-mono text-[12px]">
          <div className="flex justify-between">
            <span className="text-slate-500">NAME</span>
            <span className="text-slate-200">{identity.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">COUNTRY</span>
            <span className="text-slate-200">{personal.country}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">TIMEZONE</span>
            <span className="text-slate-200">{personal.timezone}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">LANGUAGES</span>
            <span className="text-right text-slate-200">{personal.languages.join(', ')}</span>
          </div>
        </div>
      </Card>
      <div>
        <Heading>Hobbies</Heading>
        <div className="flex flex-wrap gap-1.5">
          {personal.hobbies.map((h) => (
            <Chip key={h}>{h}</Chip>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 font-mono text-[11px] text-green-400">
        <Battery className="h-4 w-4" /> CMOS battery: 3.0V — settings retained
      </div>
    </div>
  )
}

function Testimonials() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">Audio out — what other people say.</p>
      {testimonials.map((t) => (
        <Card key={t.name} accent={ACCENT_HEX.memory}>
          <Quote className="mb-2 h-4 w-4 text-violet-400" />
          <p className="text-sm italic leading-relaxed text-slate-300">{t.quote}</p>
          <div className="mt-3 font-mono text-[11px]">
            <span className="text-slate-200">{t.name}</span>
            <span className="text-slate-500"> · {t.role}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}

function Toolbelt() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        Decoupling caps: small, unglamorous, and the board does not boot without them.
      </p>
      <div className="flex flex-wrap gap-2">
        {smallSkills.map((s) => (
          <span
            key={s}
            className="rounded-full border border-amber-600/40 bg-amber-500/10 px-3 py-1 font-mono text-[11px] text-amber-300"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

function Ports() {
  const links = [
    { label: 'DisplayPort', target: 'GitHub', href: contact.github, icon: Github },
    { label: 'HDMI', target: 'LinkedIn', href: contact.linkedin, icon: Linkedin },
    { label: 'USB-C', target: 'Résumé', href: withBase(resume.file), icon: Download },
    { label: 'LAN', target: 'Email', href: `mailto:${contact.email}`, icon: Mail },
  ]
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">Rear I/O — direct connections out of the board.</p>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target={l.href.startsWith('mailto') ? undefined : '_blank'}
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/60 p-3 transition hover:border-amber-500/50"
        >
          <l.icon className="h-4 w-4 text-amber-400" />
          <span className="flex-1 font-display text-sm text-slate-100">{l.target}</span>
          <Chip>{l.label}</Chip>
        </a>
      ))}
    </div>
  )
}

function Lab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-mono text-[11px] text-red-400">
        <Layers className="h-4 w-4" /> SECRET SLOT — UNDOCUMENTED
      </div>
      <p className="text-sm text-slate-400">
        You found the unpopulated M.2. Half-finished experiments live here.
      </p>
      {secretLab.map((s) => (
        <Card key={s.name} accent={ACCENT_HEX.power}>
          <div className="font-display text-sm font-semibold text-slate-100">{s.name}</div>
          <p className="mt-1 text-sm text-slate-400">{s.detail}</p>
        </Card>
      ))}
    </div>
  )
}

function Storage() {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] text-green-400">
      <HardDrive className="h-4 w-4" /> Volume mounted, 0 bad sectors
    </div>
  )
}

/* ── registry ─────────────────────────────────────────────────────────── */

export const SECTION_BODY: Record<ComponentId, () => React.ReactNode> = {
  cpu: About,
  ram: Skills,
  gpu: Projects,
  ssd: () => (
    <div className="space-y-4">
      <Experience />
      <Storage />
    </div>
  ),
  bios: Resume,
  nic: Contact,
  usb: Services,
  pcie: Certifications,
  psu: Stats,
  vrm: Strengths,
  fan: SoftSkills,
  cmos: Personal,
  audio: Testimonials,
  caps: Toolbelt,
  expansion: Achievements,
  ports: Ports,
  m2: Lab,
}

export const SECTION_ICON: Partial<Record<ComponentId, typeof Cpu>> = {
  cpu: Cpu,
  ssd: HardDrive,
  nic: Globe,
  usb: Usb,
  psu: Zap,
}

export function sectionTitle(id: ComponentId) {
  return NODE_MAP[id].section
}
