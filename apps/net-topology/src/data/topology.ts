import {
  Cloud,
  Database,
  HardDrive,
  Laptop,
  Mail,
  Network,
  Radio,
  Route,
  Server,
  Shield,
  Split,
} from 'lucide-react'
import type { DeviceNodeData, NodeId } from './types'

export interface DeviceSpec {
  data: DeviceNodeData
  position: { x: number; y: number }
  /** Which side of the node the wires attach to. */
  ports: { in?: 'top' | 'left' | 'right'; out?: Array<'bottom' | 'left' | 'right'> }
}

/**
 * The spine runs top to bottom at x = 0; DNS, object storage and the mail
 * relay hang off it as side branches, the way they would on a real diagram.
 */
export const devices: DeviceSpec[] = [
  {
    data: {
      id: 'client',
      hostname: 'you@browser',
      section: 'Entry point',
      kind: 'CLIENT',
      icon: Laptop,
      accent: 'cyan',
      health: 'healthy',
      metric: 'session open',
    },
    position: { x: 0, y: 0 },
    ports: { out: ['bottom'] },
  },
  {
    data: {
      id: 'isp',
      hostname: 'isp-edge-01',
      section: 'Home',
      kind: 'ISP / EDGE',
      icon: Cloud,
      accent: 'accent',
      health: 'healthy',
      metric: '1.2 Gbps',
    },
    position: { x: 0, y: 150 },
    ports: { in: 'top', out: ['bottom', 'right'] },
  },
  {
    data: {
      id: 'dns',
      hostname: 'ns1.charitra.dev',
      section: 'Identity',
      kind: 'DNS RESOLVER',
      icon: Radio,
      accent: 'purple',
      health: 'healthy',
      metric: 'NOERROR',
    },
    position: { x: 360, y: 150 },
    ports: { in: 'left' },
  },
  {
    data: {
      id: 'router',
      hostname: 'core-rtr-01',
      section: 'About Me',
      kind: 'CORE ROUTER',
      icon: Route,
      accent: 'accent',
      health: 'healthy',
      metric: '12 ms',
    },
    position: { x: 0, y: 300 },
    ports: { in: 'top', out: ['bottom'] },
  },
  {
    data: {
      id: 'firewall',
      hostname: 'fw-edge-01',
      section: 'Skills',
      kind: 'FIREWALL',
      icon: Shield,
      accent: 'ok',
      health: 'healthy',
      metric: '14 rules',
    },
    position: { x: 0, y: 450 },
    ports: { in: 'top', out: ['bottom'] },
  },
  {
    data: {
      id: 'balancer',
      hostname: 'lb-01',
      section: 'Projects',
      kind: 'LOAD BALANCER',
      icon: Split,
      accent: 'cyan',
      health: 'healthy',
      metric: '4 backends',
    },
    position: { x: 0, y: 600 },
    ports: { in: 'top', out: ['bottom'] },
  },
  {
    data: {
      id: 'gateway',
      hostname: 'api-gw-01',
      section: 'Services',
      kind: 'API GATEWAY',
      icon: Network,
      accent: 'purple',
      health: 'healthy',
      metric: '6 routes',
    },
    position: { x: 0, y: 750 },
    ports: { in: 'top', out: ['bottom', 'left'] },
  },
  {
    data: {
      id: 'storage',
      hostname: 'cdn-assets',
      section: 'Résumé',
      kind: 'OBJECT STORAGE',
      icon: HardDrive,
      accent: 'warn',
      health: 'healthy',
      metric: '200 OK',
    },
    position: { x: -360, y: 750 },
    ports: { in: 'right' },
  },
  {
    data: {
      id: 'app',
      hostname: 'app-01',
      section: 'Experience',
      kind: 'APPLICATION',
      icon: Server,
      accent: 'accent',
      health: 'healthy',
      metric: '18% cpu',
    },
    position: { x: 0, y: 900 },
    ports: { in: 'top', out: ['bottom', 'right'] },
  },
  {
    data: {
      id: 'contact',
      hostname: 'mail-relay',
      section: 'Contact',
      kind: 'SMTP RELAY',
      icon: Mail,
      accent: 'ok',
      health: 'healthy',
      metric: 'accepting',
    },
    position: { x: 360, y: 900 },
    ports: { in: 'left' },
  },
  {
    data: {
      id: 'database',
      hostname: 'db-primary',
      section: 'Education',
      kind: 'DATABASE',
      icon: Database,
      accent: 'cyan',
      health: 'healthy',
      metric: '4 tables',
    },
    position: { x: 0, y: 1050 },
    ports: { in: 'top' },
  },
]

export interface LinkSpec {
  from: NodeId
  to: NodeId
  fromPort: 'bottom' | 'left' | 'right'
  toPort: 'top' | 'left' | 'right'
  label: string
  /** Lookups and side-channels render dashed, without a travelling packet. */
  dashed?: boolean
}

export const links: LinkSpec[] = [
  { from: 'client', to: 'isp', fromPort: 'bottom', toPort: 'top', label: 'TCP/443' },
  { from: 'isp', to: 'dns', fromPort: 'right', toPort: 'left', label: 'UDP/53', dashed: true },
  { from: 'isp', to: 'router', fromPort: 'bottom', toPort: 'top', label: 'BGP' },
  { from: 'router', to: 'firewall', fromPort: 'bottom', toPort: 'top', label: 'forward' },
  { from: 'firewall', to: 'balancer', fromPort: 'bottom', toPort: 'top', label: 'ACCEPT' },
  { from: 'balancer', to: 'gateway', fromPort: 'bottom', toPort: 'top', label: 'round-robin' },
  { from: 'gateway', to: 'storage', fromPort: 'left', toPort: 'right', label: 'GET /static', dashed: true },
  { from: 'gateway', to: 'app', fromPort: 'bottom', toPort: 'top', label: 'proxy_pass' },
  { from: 'app', to: 'contact', fromPort: 'right', toPort: 'left', label: 'SMTP/587', dashed: true },
  { from: 'app', to: 'database', fromPort: 'bottom', toPort: 'top', label: 'SQL/5432' },
]

/** Sidebar order — also the order the command palette lists nodes in. */
export const navOrder: NodeId[] = [
  'isp',
  'router',
  'dns',
  'firewall',
  'balancer',
  'gateway',
  'app',
  'database',
  'storage',
  'contact',
]
