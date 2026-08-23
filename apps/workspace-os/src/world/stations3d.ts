import type { AppId } from '@/os/types'

/**
 * The stations, as places in the room.
 *
 * Every one of these is anchored to furniture that already exists in the
 * scene — the rack at [2.86, -2.16], the bookshelf at [-3.62, -2.44], the
 * topology diagram on the back wall. Nothing here adds geometry; it gives the
 * geometry that is already modelled a meaning and a way in.
 *
 * `at` is where the visitor stands to use the thing, not where the thing is:
 * you read a wall diagram from in front of it, not from inside it.
 */
export interface Station3D {
  id: string
  /** Matches `Station.id` in the portfolio data where one exists. */
  name: string
  /** Shown in the interaction prompt: "[E] {verb} {name}". */
  verb: string
  /** Where the visitor stands. */
  at: [number, number]
  /** How close they must be for the prompt to appear, in metres. */
  radius: number
  /** Where to look when fast-travelling here. */
  face: [number, number]
  /** The application this opens. `null` means it opens the full desktop. */
  app: AppId | null
  /** Launch arguments, e.g. which page of Settings. */
  props?: Record<string, unknown>
  /** One line, shown on the map and in the discovery toast. */
  blurb: string
  glyph: string
}

export const stations3d: Station3D[] = [
  {
    id: 'main',
    name: 'Main Workstation',
    verb: 'Use',
    at: [0, 0.2],
    radius: 1.1,
    face: [0, -1.25],
    app: null,
    blurb: 'The centre monitor. Sitting down here starts the session.',
    glyph: '🖥️',
  },
  {
    id: 'development',
    name: 'Development Bench',
    verb: 'Open',
    at: [-1.35, 0.12],
    radius: 0.85,
    face: [-1.3, -0.68],
    app: 'techstack',
    blurb: 'The laptop on the stand — stack, frameworks, tooling.',
    glyph: '⌨️',
  },
  {
    id: 'security',
    name: 'Security Lab',
    verb: 'Inspect',
    at: [2.3, -1.25],
    radius: 1.15,
    face: [2.86, -2.16],
    app: 'seclab',
    blurb: 'The rack. Recon through reporting, and the tooling at each phase.',
    glyph: '🛡️',
  },
  {
    id: 'network',
    name: 'Network Lab',
    verb: 'Inspect',
    at: [3.8, -2.15],
    radius: 1.0,
    face: [3.6, -2.96],
    app: 'network',
    blurb: 'The topology drawn on the back wall. Click a node to inspect it.',
    glyph: '🕸️',
  },
  {
    id: 'websec',
    name: 'Web Security',
    verb: 'Inspect',
    at: [1.55, -2.1],
    radius: 0.95,
    face: [1.55, -2.96],
    app: 'websec',
    blurb: 'The task board. OWASP classes, how each is tested for.',
    glyph: '🌐',
  },
  {
    id: 'aisec',
    name: 'AI Security',
    verb: 'Open',
    at: [1.3, 0.12],
    radius: 0.8,
    face: [1.28, -0.98],
    app: 'aisec',
    blurb: 'The breadboard end of the desk. Where model-backed systems fail.',
    glyph: '🧠',
  },
  {
    id: 'knowledge',
    name: 'Knowledge Wall',
    verb: 'Read',
    at: [-3.55, -1.72],
    radius: 1.05,
    face: [-3.62, -2.44],
    app: 'knowledge',
    blurb: 'The bookshelf. Current learning tracks and methodologies.',
    glyph: '📚',
  },
  {
    id: 'projects',
    name: 'Project Lab',
    verb: 'Open',
    at: [-2.5, -1.75],
    radius: 0.9,
    face: [-2.5, -2.4],
    app: 'projects',
    blurb: 'The cabinet and the stack on top of it. Every project, as a folder.',
    glyph: '📁',
  },
  {
    id: 'about',
    name: 'Whiteboard',
    verb: 'Read',
    at: [-0.35, -2.2],
    radius: 0.95,
    face: [-0.35, -2.96],
    app: 'about',
    blurb: 'What is being worked out, and who is working it out.',
    glyph: '🪪',
  },
]

export const stationById = new Map(stations3d.map((s) => [s.id, s]))

/** Closest station whose radius the point is inside, or null. */
export function stationAt(x: number, z: number): Station3D | null {
  let best: Station3D | null = null
  let bestD = Infinity
  for (const s of stations3d) {
    const d = Math.hypot(x - s.at[0], z - s.at[1])
    if (d <= s.radius && d < bestD) {
      best = s
      bestD = d
    }
  }
  return best
}
