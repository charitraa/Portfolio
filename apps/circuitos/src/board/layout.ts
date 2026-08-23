/**
 * Board geometry. Everything is expressed in a fixed 1400x900 logical space and
 * scaled to fit the viewport, so nodes and copper traces can never drift apart.
 */

export const BOARD_W = 1400
export const BOARD_H = 900

export type ComponentId =
  | 'cpu'
  | 'ram'
  | 'gpu'
  | 'ssd'
  | 'bios'
  | 'nic'
  | 'usb'
  | 'pcie'
  | 'psu'
  | 'vrm'
  | 'fan'
  | 'cmos'
  | 'audio'
  | 'caps'
  | 'expansion'
  | 'ports'
  | 'm2'

export type Accent = 'copper' | 'electric' | 'signal' | 'power' | 'memory'

export type BoardNode = {
  id: ComponentId
  /** Silkscreen designator, printed on the board next to the part. */
  ref: string
  label: string
  section: string
  accent: Accent
  x: number
  y: number
  w: number
  h: number
  /** Hidden until discovered (easter egg). */
  secret?: boolean
}

export const NODES: BoardNode[] = [
  { id: 'nic', ref: 'J1', label: 'NIC', section: 'Contact', accent: 'signal', x: 60, y: 60, w: 160, h: 130 },
  { id: 'usb', ref: 'J2', label: 'USB HUB', section: 'Services', accent: 'electric', x: 240, y: 60, w: 200, h: 130 },
  { id: 'ports', ref: 'J3', label: 'I/O PORTS', section: 'Links', accent: 'copper', x: 460, y: 60, w: 180, h: 130 },
  { id: 'vrm', ref: 'Q1-Q8', label: 'VRM', section: 'Core Strengths', accent: 'power', x: 680, y: 60, w: 320, h: 80 },
  { id: 'fan', ref: 'FAN1', label: 'COOLING', section: 'Soft Skills', accent: 'electric', x: 1030, y: 50, w: 120, h: 120 },
  { id: 'psu', ref: 'ATX1', label: 'PSU', section: 'Statistics', accent: 'copper', x: 1190, y: 50, w: 150, h: 130 },

  { id: 'ram', ref: 'DIMM', label: 'MEMORY', section: 'Skills', accent: 'memory', x: 100, y: 240, w: 200, h: 320 },
  { id: 'caps', ref: 'C1-C12', label: 'CAPS', section: 'Toolbelt', accent: 'copper', x: 340, y: 300, w: 120, h: 200 },
  { id: 'cpu', ref: 'U1', label: 'CPU', section: 'About', accent: 'electric', x: 540, y: 280, w: 300, h: 260 },
  { id: 'audio', ref: 'U7', label: 'AUDIO', section: 'Testimonials', accent: 'memory', x: 880, y: 240, w: 170, h: 110 },
  { id: 'cmos', ref: 'BT1', label: 'CMOS', section: 'Personal', accent: 'signal', x: 890, y: 400, w: 120, h: 120 },
  { id: 'expansion', ref: 'CARD1', label: 'EXPANSION', section: 'Achievements', accent: 'power', x: 1060, y: 240, w: 280, h: 110 },
  { id: 'ssd', ref: 'M.2_1', label: 'NVMe SSD', section: 'Experience', accent: 'signal', x: 1060, y: 400, w: 280, h: 100 },

  { id: 'pcie', ref: 'PCIE', label: 'PCIe SLOTS', section: 'Certifications', accent: 'copper', x: 100, y: 620, w: 340, h: 180 },
  { id: 'gpu', ref: 'GPU1', label: 'GPU', section: 'Projects', accent: 'memory', x: 500, y: 600, w: 480, h: 200 },
  { id: 'bios', ref: 'U9', label: 'BIOS', section: 'Résumé', accent: 'copper', x: 1040, y: 600, w: 140, h: 130 },
  { id: 'm2', ref: 'M.2_2', label: 'M.2 · ???', section: 'Lab', accent: 'power', x: 1230, y: 620, w: 110, h: 56, secret: true },
]

export const NODE_MAP = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<ComponentId, BoardNode>

/** Sections that appear in the boot log and the mobile index, in boot order. */
export const BOOT_ORDER: ComponentId[] = [
  'psu',
  'vrm',
  'cpu',
  'ram',
  'ssd',
  'gpu',
  'nic',
  'bios',
  'usb',
  'pcie',
  'audio',
  'cmos',
  'fan',
  'caps',
  'expansion',
  'ports',
]

type Side = 'l' | 'r' | 't' | 'b'

function anchor(id: ComponentId, side: Side, offset = 0.5) {
  const n = NODE_MAP[id]
  switch (side) {
    case 'l':
      return { x: n.x, y: n.y + n.h * offset }
    case 'r':
      return { x: n.x + n.w, y: n.y + n.h * offset }
    case 't':
      return { x: n.x + n.w * offset, y: n.y }
    case 'b':
      return { x: n.x + n.w * offset, y: n.y + n.h }
  }
}

/**
 * PCB-style route: one axis, a 45° mitre, then the other axis. Real boards keep
 * traces off 90° corners, so we chamfer every turn.
 */
function route(
  a: { x: number; y: number },
  b: { x: number; y: number },
  mode: 'hv' | 'vh',
  bend?: number,
): string {
  /** Chamfer, shrunk so a short segment can never fold back on itself. */
  const chamfer = (...runs: number[]) => Math.max(0, Math.min(16, ...runs.map((r) => Math.abs(r) / 2)))

  if (mode === 'hv') {
    const mx = bend ?? b.x
    const s1 = Math.sign(mx - a.x) || 1
    const s2 = Math.sign(b.y - a.y) || 1
    const s3 = Math.sign(b.x - mx) || 1
    if (bend === undefined) {
      const c = chamfer(mx - a.x, b.y - a.y)
      return `M ${a.x} ${a.y} L ${mx - s1 * c} ${a.y} L ${mx} ${a.y + s2 * c} L ${mx} ${b.y}`
    }
    const c = chamfer(mx - a.x, b.y - a.y, b.x - mx)
    return [
      `M ${a.x} ${a.y}`,
      `L ${mx - s1 * c} ${a.y}`,
      `L ${mx} ${a.y + s2 * c}`,
      `L ${mx} ${b.y - s2 * c}`,
      `L ${mx + s3 * c} ${b.y}`,
      `L ${b.x} ${b.y}`,
    ].join(' ')
  }
  const my = bend ?? b.y
  const s1 = Math.sign(my - a.y) || 1
  const s2 = Math.sign(b.x - a.x) || 1
  const s3 = Math.sign(b.y - my) || 1
  if (bend === undefined) {
    const c = chamfer(my - a.y, b.x - a.x)
    return `M ${a.x} ${a.y} L ${a.x} ${my - s1 * c} L ${a.x + s2 * c} ${my} L ${b.x} ${my}`
  }
  const c = chamfer(my - a.y, b.x - a.x, b.y - my)
  return [
    `M ${a.x} ${a.y}`,
    `L ${a.x} ${my - s1 * c}`,
    `L ${a.x + s2 * c} ${my}`,
    `L ${b.x - s2 * c} ${my}`,
    `L ${b.x} ${my + s3 * c}`,
    `L ${b.x} ${b.y}`,
  ].join(' ')
}

export type Trace = {
  id: string
  to: ComponentId
  d: string
  accent: Accent
  /** Bus width — wider traces read as power rails. */
  weight: number
}

/** Every trace originates at the CPU: the board is a star topology around you. */
export const TRACES: Trace[] = [
  {
    id: 't-ram',
    to: 'ram',
    accent: 'memory',
    weight: 3,
    d: route(anchor('cpu', 'l', 0.35), anchor('ram', 'r', 0.4), 'hv', 470),
  },
  {
    id: 't-caps',
    to: 'caps',
    accent: 'copper',
    weight: 1.6,
    d: route(anchor('cpu', 'l', 0.75), anchor('caps', 'r', 0.7), 'hv'),
  },
  {
    id: 't-gpu',
    to: 'gpu',
    accent: 'memory',
    weight: 3.4,
    d: route(anchor('cpu', 'b', 0.5), anchor('gpu', 't', 0.42), 'vh'),
  },
  {
    id: 't-pcie',
    to: 'pcie',
    accent: 'copper',
    weight: 2.4,
    d: route(anchor('cpu', 'b', 0.2), anchor('pcie', 't', 0.5), 'vh', 570),
  },
  {
    id: 't-ssd',
    to: 'ssd',
    accent: 'signal',
    weight: 2.6,
    d: route(anchor('cpu', 'r', 0.7), anchor('ssd', 'l', 0.5), 'hv', 1020),
  },
  {
    id: 't-cmos',
    to: 'cmos',
    accent: 'signal',
    weight: 1.4,
    d: route(anchor('cpu', 'r', 0.45), anchor('cmos', 'l', 0.5), 'hv'),
  },
  {
    id: 't-audio',
    to: 'audio',
    accent: 'memory',
    weight: 1.6,
    d: route(anchor('cpu', 'r', 0.16), anchor('audio', 'l', 0.6), 'hv'),
  },
  {
    id: 't-expansion',
    to: 'expansion',
    accent: 'power',
    weight: 2,
    d: route(anchor('cpu', 't', 0.85), anchor('expansion', 'l', 0.35), 'vh', 200),
  },
  {
    id: 't-vrm',
    to: 'vrm',
    accent: 'power',
    weight: 3.2,
    d: route(anchor('cpu', 't', 0.62), anchor('vrm', 'b', 0.35), 'vh'),
  },
  {
    id: 't-psu',
    to: 'psu',
    accent: 'copper',
    weight: 3.6,
    d: route(anchor('vrm', 'r', 0.5), anchor('psu', 'l', 0.5), 'hv'),
  },
  {
    id: 't-fan',
    to: 'fan',
    accent: 'electric',
    weight: 1.4,
    d: route(anchor('vrm', 't', 0.8), anchor('fan', 'l', 0.25), 'vh', 30),
  },
  {
    id: 't-nic',
    to: 'nic',
    accent: 'signal',
    weight: 2.2,
    d: route(anchor('cpu', 't', 0.2), anchor('nic', 'b', 0.4), 'vh', 220),
  },
  {
    id: 't-usb',
    to: 'usb',
    accent: 'electric',
    weight: 2,
    d: route(anchor('cpu', 't', 0.34), anchor('usb', 'b', 0.5), 'vh', 240),
  },
  {
    id: 't-ports',
    to: 'ports',
    accent: 'copper',
    weight: 1.6,
    d: route(anchor('cpu', 't', 0.46), anchor('ports', 'b', 0.5), 'vh', 260),
  },
  {
    id: 't-bios',
    to: 'bios',
    accent: 'copper',
    weight: 2,
    d: route(anchor('cpu', 'r', 0.9), anchor('bios', 't', 0.5), 'hv', 1110),
  },
  {
    id: 't-m2',
    to: 'm2',
    accent: 'power',
    weight: 1.2,
    d: route(anchor('bios', 'r', 0.3), anchor('m2', 'l', 0.5), 'hv'),
  },
]

/** Decorative copper that goes nowhere — real boards are mostly filler. */
export const FILLER_TRACES: string[] = [
  route({ x: 40, y: 210 }, { x: 470, y: 226 }, 'hv', 300),
  route({ x: 40, y: 580 }, { x: 470, y: 600 }, 'hv', 320),
  route({ x: 1360, y: 210 }, { x: 1070, y: 224 }, 'hv', 1240),
  route({ x: 1360, y: 546 }, { x: 1040, y: 560 }, 'hv', 1200),
  route({ x: 660, y: 20 }, { x: 660, y: 240 }, 'vh', 180),
  route({ x: 1010, y: 860 }, { x: 500, y: 840 }, 'hv', 760),
  route({ x: 60, y: 830 }, { x: 440, y: 850 }, 'hv', 240),
  route({ x: 1180, y: 760 }, { x: 1360, y: 800 }, 'hv', 1300),
]

/** Via pads scattered across the substrate. */
export const VIAS: { x: number; y: number }[] = (() => {
  const pts: { x: number; y: number }[] = []
  let seed = 7
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  for (let i = 0; i < 90; i++) {
    pts.push({ x: 30 + rand() * (BOARD_W - 60), y: 30 + rand() * (BOARD_H - 60) })
  }
  return pts
})()

export const ACCENT_HEX: Record<Accent, string> = {
  copper: '#F59E0B',
  electric: '#3B82F6',
  signal: '#22C55E',
  power: '#EF4444',
  memory: '#8B5CF6',
}
