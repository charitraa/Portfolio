import { ArrowRight, Globe, MapPin, Route } from 'lucide-react'
import { profile } from '../../data/profile'
import { languageMix } from '../../data/skills'
import { DonutChart } from '../charts/charts'
import { KeyValue, SectionTitle, StatusPill, Tag } from '../ui/primitives'
import { useApp } from '../../store/AppState'

/** ISP / edge — the landing page. */
export function IspPanel() {
  const { focusNode } = useApp()
  return (
    <div className="space-y-6">
      <div>
        <StatusPill label="link established" tone="ok" pulse />
        <h2 className="mt-3 font-display text-2xl leading-tight font-bold text-ink">
          You reached {profile.name}
        </h2>
        <p className="mt-1 font-mono text-[12px] text-accent">
          {profile.title} · {profile.location}
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">{profile.summary}</p>
      </div>

      <div>
        <SectionTitle hint="handshake">Connection</SectionTitle>
        <KeyValue k="remote host" v={profile.domain} />
        <KeyValue k="protocol" v="HTTPS / TLS 1.3" tone="ok" />
        <KeyValue k="asn" v={profile.asn} />
        <KeyValue k="round trip" v="12 ms" tone="ok" />
        <KeyValue k="status" v="200 OK" tone="ok" />
      </div>

      <div>
        <SectionTitle hint="next hop">Where to go</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'balancer' as const, label: 'Projects', note: '4 backends' },
            { id: 'firewall' as const, label: 'Skills', note: '14 rules' },
            { id: 'app' as const, label: 'Experience', note: 'timeline' },
            { id: 'contact' as const, label: 'Contact', note: 'POST' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => focusNode(item.id)}
              className="group flex items-center justify-between rounded-lg border bg-bg-2/70 px-3 py-2.5 text-left transition-colors hover:border-accent/60 hover:bg-panel"
            >
              <span>
                <span className="block font-display text-[13px] font-semibold text-ink">
                  {item.label}
                </span>
                <span className="font-mono text-[10px] text-muted">{item.note}</span>
              </span>
              <ArrowRight
                size={14}
                className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Core router — about me. */
export function RouterPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
        <Route size={13} className="text-accent" />
        <span>routing packets…</span>
        <span className="text-accent">destination resolved</span>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold text-ink">{profile.name}</h2>
        <p className="font-mono text-[12px] text-accent">{profile.title}</p>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">{profile.summary}</p>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">{profile.goal}</p>
      </div>

      <div>
        <SectionTitle hint="routing table">Interfaces</SectionTitle>
        <KeyValue k="location" v={profile.location} />
        <KeyValue k="timezone" v={profile.timezone} />
        <KeyValue k="ipv4" v={profile.ipv4} />
        <KeyValue k="ipv6" v={profile.ipv6} />
        <KeyValue k="uptime" v="5 years" tone="ok" />
      </div>

      <div>
        <SectionTitle>Working style</SectionTitle>
        <ul className="space-y-2 text-[13px] text-muted">
          {[
            'Read the logs before guessing.',
            'Make the failure mode obvious, then make it rare.',
            'Small diffs, clear commit messages, reversible deploys.',
            'Documentation counts as shipping.',
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** DNS — identity record. */
export function DnsPanel() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-bg-2/70 p-3 font-mono text-[11px]">
        <div className="text-muted">
          <span className="text-accent">$</span> dig {profile.domain} +short
        </div>
        <div className="mt-2 grid gap-1">
          <div className="flex justify-between">
            <span className="text-muted">;; status</span>
            <span className="text-ok">NOERROR</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">;; query time</span>
            <span className="text-ink">8 msec</span>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle hint="answer section">Records</SectionTitle>
        <KeyValue k="A" v={profile.name} />
        <KeyValue k="CNAME" v={profile.title} />
        <KeyValue k="LOC" v={profile.location} />
        <KeyValue k="TXT" v={profile.email} />
        <KeyValue k="TTL" v="3600" />
      </div>

      <div>
        <SectionTitle hint="spoken">Languages</SectionTitle>
        <div className="space-y-1">
          {profile.languages.map((lang) => (
            <KeyValue key={lang.name} k={lang.name} v={lang.level} />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle hint="by volume">Code languages</SectionTitle>
        <DonutChart data={languageMix} />
      </div>

      <div>
        <SectionTitle>Career goal</SectionTitle>
        <p className="text-[13px] leading-relaxed text-muted">{profile.goal}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Tag>backend</Tag>
          <Tag>infrastructure</Tag>
          <Tag>reliability</Tag>
          <Tag>developer tooling</Tag>
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted">
        <Globe size={13} />
        <span className="font-mono text-[11px]">{profile.domain}</span>
        <MapPin size={13} className="ml-2" />
        <span className="font-mono text-[11px]">{profile.location}</span>
      </div>
    </div>
  )
}
