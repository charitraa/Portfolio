import type { LucideIcon } from 'lucide-react'

/** The device kinds drawn on the topology. Each one owns a panel. */
export type NodeId =
  | 'client'
  | 'isp'
  | 'dns'
  | 'router'
  | 'firewall'
  | 'balancer'
  | 'gateway'
  | 'app'
  | 'database'
  | 'storage'
  | 'contact'

export type Health = 'healthy' | 'degraded' | 'offline'

export interface DeviceNodeData extends Record<string, unknown> {
  id: NodeId
  /** Device name printed on the node, e.g. "lb-01.charitra.dev". */
  hostname: string
  /** What this device means in portfolio terms, e.g. "Projects". */
  section: string
  /** Device class label shown above the hostname. */
  kind: string
  icon: LucideIcon
  accent: 'accent' | 'purple' | 'cyan' | 'ok' | 'warn'
  health: Health
  /** Fake-but-plausible metric shown on the node face. */
  metric: string
}

export interface Project {
  id: string
  name: string
  host: string
  tagline: string
  summary: string
  role: string
  year: string
  stack: string[]
  health: Health
  /** Percentage of simulated traffic this "server" receives. */
  load: number
  requests: string
  architecture: string[]
  challenges: string[]
  lessons: string[]
  repo?: string
  demo?: string
}

export interface Skill {
  name: string
  /** 0–100, drives the bandwidth bars. */
  level: number
  group: 'frontend' | 'backend' | 'mobile' | 'infra' | 'tooling'
  /** Firewall rule flavour text. */
  port: string
  note: string
}

export interface TimelineEntry {
  year: string
  title: string
  org: string
  detail: string
  tags: string[]
}

export interface Service {
  method: 'GET' | 'POST' | 'PUT'
  path: string
  name: string
  description: string
  deliverables: string[]
  latency: string
}

export interface Credential {
  kind: 'education' | 'certificate' | 'award'
  title: string
  issuer: string
  year: string
  detail: string
}
