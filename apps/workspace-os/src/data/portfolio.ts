/**
 * ============================================================================
 *  THE ONLY FILE YOU NEED TO EDIT.
 * ============================================================================
 *  Everything the visitor reads — the boot messages, the About file, projects,
 *  skills, experience, contact details — is defined here. The OS reads from
 *  this; no copy is hard-coded in components.
 *
 *  Placeholder content is marked with  // TODO  — replace it with the real
 *  thing and the whole desktop updates.
 * ============================================================================
 */

export const owner = {
  name: 'Charitra Shrestha', // TODO
  username: 'charitra',
  role: 'Software Engineer & Security Learner', // TODO — adjust the wording, not the honesty
  tagline: 'I build things that boot — and then try to break them.', // TODO
  location: 'Kathmandu, Nepal', // TODO
  email: 'charitra@example.com', // TODO
  avatarInitials: 'CS',
  /**
   * The name of the place, used everywhere outside the machine — the entry
   * loader, the sign over the door, the caption in the room. `osName` is what
   * the machine calls itself, so it stays on the screen and nowhere else.
   */
  workspaceName: 'Charitra Workspace',
  /** Shown by `neofetch` and in Settings → About. */
  osName: 'CharitraOS',
  osVersion: '1.0',
  osCodename: 'Workstation Edition',
  hostname: 'charitra-workstation',
} as const

export const links = {
  /** Verified from this repository's git remote. */
  github: 'https://github.com/charitraa',
  linkedin: 'https://linkedin.com/in/charitra', // TODO — confirm the real handle
  twitter: '', // TODO — leave empty and it is not rendered
  blog: '', // TODO — leave empty and it is not rendered
  website: '', // TODO — leave empty and it is not rendered
  /**
   * Put your real PDF at `public/resume.pdf`. Until you do, the PDF Viewer
   * renders the structured `resume` object below as a paper-styled document,
   * so the app is never empty.
   */
  resumePdf: '/resume.pdf',
} as const

// ---------------------------------------------------------------------------
// About  →  opens in the Text Editor as ~/About.md
// ---------------------------------------------------------------------------

export const aboutMarkdown = `# Hello, I'm ${owner.name}

I'm a software engineer in ${owner.location}, working across the web stack and
spending an increasing amount of my time on the security side of it. I like the
layer where the abstraction leaks — the code that has to be *correct* rather
than merely convincing.

## What I actually do

I build web systems end to end: the API, the data model, the deploy pipeline,
and the interface people touch. My favourite work is the kind that starts as
"this is impossible" and ends as a boring, reliable service nobody thinks about.

## The security half

Building things and breaking them turn out to be the same skill pointed in
opposite directions. I work through practical labs — reconnaissance,
enumeration, web exploitation, Linux privilege escalation — and read the OWASP
material against deliberately vulnerable applications rather than as a list to
memorise. More recently that has extended to how language-model applications
fail, which is its own category of interesting.

To be exact about it: this is lab and self-directed work, not paid security
experience. The Security Lab station labels every tool with how far I have
actually taken it, and nothing in this workspace claims more than that.

## Right now

Looking for work where the problems are hard and the feedback loop is fast.
If that sounds like your team, the Contact app is one click away.

---

*You're reading this inside a desktop environment I wrote from scratch.
The window you're in is real: drag it, resize it, snap it to an edge.
Press Ctrl/⌘ + K to search the whole workspace.*
`

// ---------------------------------------------------------------------------
// Projects  →  Files app + Project Manager app
// ---------------------------------------------------------------------------

export interface Project {
  id: string
  name: string
  tagline: string
  year: string
  status: 'Shipped' | 'In development' | 'Archived' | 'Experiment'
  stack: string[]
  /** Markdown-ish body shown in the project window. */
  description: string
  highlights: string[]
  metrics?: { label: string; value: string }[]
  repo?: string
  demo?: string
  /** Emoji or short glyph used as the "screenshot" placeholder tile. */
  glyph: string
  accent: string
  /** Scaffolded but not yet written up — the UI labels these rather than hiding them. */
  draft?: boolean
}

export const projects: Project[] = [
  {
    id: 'adsmitra',
    name: 'AdsMitra',
    tagline: 'Ad campaign management for small businesses',
    year: '2025',
    status: 'Shipped',
    stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    glyph: '📣',
    accent: '#f59e0b',
    description: `A campaign manager for shopkeepers who have a budget of ten
thousand rupees and no marketing team. It ingests spend data from multiple ad
platforms, normalises it into one schema, and answers the only question the
owner actually has: *is this working?*

The hard part was never the dashboard. It was reconciling three vendor APIs
that each define "impression" differently, then making that reconciliation
explainable to someone who has never heard the word "attribution".`,
    highlights: [
      'Unified ingestion layer normalising three ad-platform APIs into one schema',
      'Incremental sync with Redis-backed job queue; full refresh in under 40s',
      'Attribution explainer that shows *why* a number changed, not just the delta',
      'Rupee-first UI — no currency conversion guesswork for local advertisers',
    ],
    repo: 'https://github.com/charitraa/AdsMitra', // TODO — confirm repo name
  },
  {
    id: 'speech-translator',
    name: 'Speech Translator',
    tagline: 'Real-time speech-to-speech translation in the browser',
    year: '2025',
    status: 'Shipped',
    stack: ['Python', 'FastAPI', 'WebSockets', 'Whisper', 'React'],
    glyph: '🗣️',
    accent: '#38bdf8',
    description: `Speak in one language, hear another, with the delay short
enough that a conversation still feels like a conversation. Audio streams over
a WebSocket, gets chunked with voice-activity detection, transcribed, translated
and re-synthesised — all while the next chunk is already in flight.

Latency is the entire product. Everything in the architecture exists to shave
milliseconds off the gap between someone finishing a sentence and the other
person hearing it.`,
    highlights: [
      'Streaming pipeline with voice-activity chunking instead of fixed windows',
      'Sub-second perceived latency by overlapping transcribe / translate / synthesise',
      'Graceful degradation to text-only when bandwidth collapses',
      'Runs on a single 8GB GPU box — no per-request cloud inference bill',
    ],
    repo: '', // TODO — add the repository URL
  },
  {
    id: 'charitra-os',
    name: 'CharitraOS',
    tagline: 'The desktop environment you are currently using',
    year: '2026',
    status: 'In development',
    stack: ['React', 'TypeScript', 'Zustand', 'Three.js', 'Tailwind'],
    glyph: '🖥️',
    accent: '#a78bfa',
    description: `A portfolio shaped like an operating system. A real window
manager — drag, resize, snap, minimise, focus, z-order — a virtual filesystem
with a working trash, a terminal that parses and executes commands, and a
3D room you power on before any of it exists.

Nothing here is a screenshot. The window you are reading this in was laid out
by the same reducer that lays out the terminal, and the desktop behind it is
rendered onto a plane inside a Three.js scene.`,
    highlights: [
      'Window manager: pointer-driven drag, 8-way resize, edge snapping, focus stack',
      'Virtual filesystem backed by an immutable tree, with trash and restore',
      'Terminal with 20+ commands, history, tab-completion and piping into apps',
      'Boot chain: 3D room → power supply → BIOS POST → kernel → session',
    ],
    repo: 'https://github.com/charitraa/Computer',
  },
  {
    id: 'inventory',
    name: 'Library Inventory System',
    tagline: 'Circulation and cataloguing for a 40,000-title library',
    year: '2024',
    status: 'Shipped',
    stack: ['Java', 'Spring Boot', 'MySQL', 'JavaFX'],
    glyph: '📚',
    accent: '#34d399',
    description: `Built for a college library still running on a paper ledger
and one very tired spreadsheet. Handles cataloguing, circulation, fines and
the single most requested feature: finding out who actually has the book.

Deployed on hardware from 2011, which turned out to be the most useful design
constraint I've ever had. It forced every query to be indexed properly and
every screen to work without a network round-trip.`,
    highlights: [
      'Barcode-driven checkout flow — issue or return in a single scan',
      'Offline-first desktop client that reconciles when the network returns',
      'Fine calculation with a rules engine the librarian can edit',
      'Runs comfortably on 2GB of RAM',
    ],
    repo: '', // TODO — add the repository URL
  },
  // -------------------------------------------------------------------------
  //  Named in the brief but not yet written up. The scaffolding is here so the
  //  Project Lab lists them; the copy is deliberately blank rather than
  //  invented. Fill in `description` and `highlights` and they stop being
  //  marked as drafts.
  // -------------------------------------------------------------------------
  {
    id: 'crochet-inventory',
    name: 'Crochet Inventory System',
    tagline: 'TODO — one line on what it does',
    year: '2025', // TODO
    status: 'Shipped', // TODO
    stack: [], // TODO
    glyph: '🧶',
    accent: '#f472b6',
    draft: true,
    description: 'TODO — the problem, the approach, and the part that was actually hard.',
    highlights: [],
    repo: '', // TODO
  },
  {
    id: 'next-space',
    name: 'Next Space',
    tagline: 'TODO — one line on what it does',
    year: '2025', // TODO
    status: 'Shipped', // TODO
    stack: [], // TODO
    glyph: '🚀',
    accent: '#818cf8',
    draft: true,
    description: 'TODO — the problem, the approach, and the part that was actually hard.',
    highlights: [],
    repo: '', // TODO
  },
  {
    id: 'merokhet',
    name: 'MeroKhet',
    tagline: 'TODO — one line on what it does',
    year: '2025', // TODO
    status: 'Shipped', // TODO
    stack: [], // TODO
    glyph: '🌾',
    accent: '#4ade80',
    draft: true,
    description: 'TODO — the problem, the approach, and the part that was actually hard.',
    highlights: [],
    repo: '', // TODO
  },
]

// ---------------------------------------------------------------------------
// Skills  →  Package Manager app
// ---------------------------------------------------------------------------

export type SkillUse = 'daily' | 'regular' | 'occasional'

/**
 * Ordered so a sort can put the most-used first without reintroducing a score.
 * A percentage would imply a precision nobody actually has about their own
 * ability; how often you reach for something is a fact you can check.
 */
export const USE_RANK: Record<SkillUse, number> = { daily: 3, regular: 2, occasional: 1 }

export const USE_LABEL: Record<SkillUse, string> = {
  daily: 'Daily driver',
  regular: 'Regular use',
  occasional: 'Occasional use',
}

export interface Skill {
  name: string
  version: string
  category: 'Languages' | 'Frontend' | 'Backend' | 'Data' | 'Infrastructure' | 'Tools'
  /** How often this is actually reached for — never a percentage. */
  use: SkillUse
  summary: string
  /** Years of use, shown as "installed <n> ago". */
  since: string
}

export const skills: Skill[] = [
  { name: 'typescript', version: '5.8', category: 'Languages', use: 'daily', since: '4 years', summary: 'Primary language. Strict mode, generics, discriminated unions.' },
  { name: 'python', version: '3.13', category: 'Languages', use: 'daily', since: '5 years', summary: 'APIs, data pipelines, ML glue code.' },
  { name: 'java', version: '21', category: 'Languages', use: 'regular', since: '4 years', summary: 'Spring Boot services and desktop clients.' },
  { name: 'go', version: '1.24', category: 'Languages', use: 'occasional', since: '1 year', summary: 'Small services and CLI tooling.' },
  { name: 'sql', version: '—', category: 'Languages', use: 'regular', since: '4 years', summary: 'Query planning, indexing, window functions.' },

  { name: 'react', version: '19.1', category: 'Frontend', use: 'daily', since: '4 years', summary: 'Hooks, concurrent rendering, suspense boundaries.' },
  { name: 'threejs', version: '0.175', category: 'Frontend', use: 'regular', since: '1 year', summary: 'Scene graphs, materials, render loops. This room, for instance.' },
  { name: 'tailwindcss', version: '4.1', category: 'Frontend', use: 'daily', since: '3 years', summary: 'Design tokens, arbitrary variants, container queries.' },
  { name: 'zustand', version: '5.0', category: 'Frontend', use: 'daily', since: '2 years', summary: 'Store slicing and selector discipline.' },

  { name: 'nodejs', version: '26.4', category: 'Backend', use: 'daily', since: '4 years', summary: 'HTTP services, streams, worker threads.' },
  { name: 'fastapi', version: '0.115', category: 'Backend', use: 'regular', since: '3 years', summary: 'Async endpoints, dependency injection, WebSockets.' },
  { name: 'spring-boot', version: '3.4', category: 'Backend', use: 'regular', since: '3 years', summary: 'REST services, JPA, transactional boundaries.' },

  { name: 'postgresql', version: '17', category: 'Data', use: 'daily', since: '4 years', summary: 'Schema design, EXPLAIN ANALYZE, partial indexes.' },
  { name: 'redis', version: '7.4', category: 'Data', use: 'regular', since: '3 years', summary: 'Caching, queues, rate limiting.' },
  { name: 'mysql', version: '8.4', category: 'Data', use: 'regular', since: '3 years', summary: 'Production schemas on constrained hardware.' },

  { name: 'docker', version: '27', category: 'Infrastructure', use: 'regular', since: '3 years', summary: 'Multi-stage builds, compose, slim images.' },
  { name: 'linux', version: '7.1', category: 'Infrastructure', use: 'daily', since: '6 years', summary: 'Daily driver. systemd, networking, the occasional kernel panic.' },
  { name: 'nginx', version: '1.27', category: 'Infrastructure', use: 'regular', since: '3 years', summary: 'Reverse proxying, TLS termination, caching.' },
  { name: 'github-actions', version: '—', category: 'Infrastructure', use: 'regular', since: '3 years', summary: 'CI matrices, caching, deploy gates.' },

  { name: 'git', version: '2.48', category: 'Tools', use: 'daily', since: '5 years', summary: 'Rebasing, bisecting, and recovering other people’s mistakes.' },
  { name: 'figma', version: '—', category: 'Tools', use: 'occasional', since: '2 years', summary: 'Enough to build what a designer hands over — and to notice when it is wrong.' },
  { name: 'neovim', version: '0.11', category: 'Tools', use: 'regular', since: '3 years', summary: 'Configured once, in Lua, at length.' },
]

// ---------------------------------------------------------------------------
// Tech stack  →  Software Center app
// ---------------------------------------------------------------------------

export interface StackEntry {
  name: string
  blurb: string
  glyph: string
  /** 'core' entries get the featured treatment. */
  tier: 'core' | 'working' | 'exploring'
}

export const techStack: Record<string, StackEntry[]> = {
  Frontend: [
    { name: 'React + TypeScript', blurb: 'The default. Strict types, small components, no cleverness.', glyph: '⚛️', tier: 'core' },
    { name: 'Tailwind CSS', blurb: 'Design tokens in the markup where I can see them.', glyph: '🎨', tier: 'core' },
    { name: 'Three.js / R3F', blurb: 'When the interface needs a third dimension to make sense.', glyph: '🧊', tier: 'working' },
    { name: 'Motion', blurb: 'Spring physics over easing curves, almost always.', glyph: '✨', tier: 'working' },
  ],
  Backend: [
    { name: 'Node.js', blurb: 'Services, streaming, anything that talks to a browser.', glyph: '🟢', tier: 'core' },
    { name: 'FastAPI', blurb: 'When the work is closer to the model than the request.', glyph: '⚡', tier: 'core' },
    { name: 'PostgreSQL', blurb: 'The database I reach for unless there is a reason not to.', glyph: '🐘', tier: 'core' },
    { name: 'Redis', blurb: 'Queues and caches. Not a database, whatever the temptation.', glyph: '🔴', tier: 'working' },
  ],
  Infrastructure: [
    { name: 'Docker', blurb: 'Reproducible builds or it did not happen.', glyph: '🐳', tier: 'core' },
    { name: 'Linux', blurb: 'Daily driver since 2020. This portfolio is a love letter to it.', glyph: '🐧', tier: 'core' },
    { name: 'GitHub Actions', blurb: 'Tests on every push, deploys behind a gate.', glyph: '🔁', tier: 'working' },
    { name: 'Kubernetes', blurb: 'Learning properly, rather than copying manifests.', glyph: '☸️', tier: 'exploring' },
  ],
  'AI & Data': [
    { name: 'Whisper', blurb: 'Streaming transcription in production, not in a notebook.', glyph: '🎙️', tier: 'working' },
    { name: 'PyTorch', blurb: 'Enough to fine-tune and to read a paper’s reference implementation.', glyph: '🔥', tier: 'working' },
    { name: 'Vector search', blurb: 'Embeddings and retrieval for real product features.', glyph: '🧭', tier: 'exploring' },
  ],
}

// ---------------------------------------------------------------------------
// Experience  →  Timeline app
// ---------------------------------------------------------------------------

export interface TimelineEntry {
  id: string
  kind: 'work' | 'education' | 'milestone'
  role: string
  org: string
  start: string
  end: string | 'Present'
  location: string
  summary: string
  bullets: string[]
  tags: string[]
}

export const experience: TimelineEntry[] = [
  {
    id: 'exp-current',
    kind: 'work',
    role: 'Software Engineer & Security Learner', // TODO — adjust the wording, not the honesty — real title
    org: 'Independent / Freelance', // TODO — real organisation, or delete this entry
    start: '2025', // TODO
    end: 'Present',
    location: 'Kathmandu, Nepal', // TODO
    summary:
      'PLACEHOLDER — describe the work in one sentence. Nothing here is filled in, because inventing a role is worse than leaving it blank.',
    bullets: [
      // TODO — real, checkable contributions. Avoid figures you cannot source.
    ],
    tags: ['TypeScript', 'React', 'Python'],
  },
  {
    id: 'edu-bsc',
    kind: 'education',
    role: 'BSc (Hons) Computing', // TODO — real programme name
    org: 'TODO — university / college name',
    start: '2023', // TODO
    end: '2026', // TODO
    location: 'Kathmandu, Nepal', // TODO
    summary: 'PLACEHOLDER — replace with the real programme, dates and focus.',
    bullets: [
      // TODO — modules, final year project, anything checkable.
    ],
    tags: ['Software Engineering', 'Databases', 'Networking'],
  },
  {
    id: 'ms-security',
    kind: 'milestone',
    role: 'Started working through practical security labs',
    org: 'Self-directed',
    start: '2025', // TODO — the year this actually started
    end: '2025',
    location: '—',
    summary:
      'Moved from reading about web and network security to doing it in disposable lab environments — recon, enumeration, web exploitation, Linux privilege escalation.',
    bullets: [],
    tags: ['Security', 'Linux', 'Networking'],
  },
]

/**
 * Empty on purpose. The entries that were here carried invented credential ids
 * (`AWS-CCP-XXXX`), which is a claim rather than a placeholder. Add a real
 * certification and every app that reads this — Timeline, Résumé, the
 * filesystem — picks it up. Until then the sections hide themselves.
 */
export const certifications: { name: string; issuer: string; year: string; id: string }[] = []

// ---------------------------------------------------------------------------
// Résumé  →  PDF Viewer (fallback rendering when no real PDF is present)
// ---------------------------------------------------------------------------

export const resume = {
  // TODO — write this in your own words. The previous text asserted a number
  // of years and a production track record that nothing here can support.
  summary:
    'Software engineer working across the web stack — TypeScript and React on the front, Python and Node on the back — with an active interest in application and network security.',
  focusAreas: ['Full-stack web', 'Streaming & real-time systems', 'Developer tooling', 'Systems programming'],
}

// ---------------------------------------------------------------------------
// Music  →  Music app. Ambient, muted by default, generated on the fly with
// WebAudio so the repo carries no audio files.
// ---------------------------------------------------------------------------

export const playlist = [
  { title: 'Kernel Panic', artist: 'lo-fi tty', duration: 214, seed: 1, mood: 'focus' },
  { title: 'Segfault Sunrise', artist: 'lo-fi tty', duration: 187, seed: 2, mood: 'calm' },
  { title: 'Race Condition', artist: 'nullptr', duration: 243, seed: 3, mood: 'drive' },
  { title: 'Garbage Collected', artist: 'nullptr', duration: 168, seed: 4, mood: 'calm' },
  { title: '3AM Rebase', artist: 'detached HEAD', duration: 231, seed: 5, mood: 'focus' },
  { title: 'It Works On My Machine', artist: 'detached HEAD', duration: 199, seed: 6, mood: 'drive' },
] as const

// ---------------------------------------------------------------------------
// Fun: `fortune` output in the terminal
// ---------------------------------------------------------------------------

export const fortunes = [
  'There are only two hard things in computer science: cache invalidation, naming things, and off-by-one errors.',
  'Weeks of coding can save you hours of planning.',
  'The best code is no code at all. The second best is code you deleted last week.',
  'A distributed system is one where a machine you have never heard of can ruin your afternoon.',
  'Premature optimisation is the root of all evil. Mature optimisation is the root of a promotion.',
  'It compiles. Ship it. (Do not ship it.)',
  'Every program has at least one bug and can be shortened by at least one line. By induction, every program can be reduced to one line that does not work.',
  'Documentation is a love letter you write to your future self.',
]

// ---------------------------------------------------------------------------
// Workstation stations  →  Stations app + dock + launcher
// ---------------------------------------------------------------------------
//
//  A station is a *zone* of the workspace, not an application. Each one groups
//  the apps that belong to one area of the work, so the desktop can be read as
//  "here is the development bench, here is the security bench" rather than as
//  an undifferentiated grid of icons.
//
// ---------------------------------------------------------------------------

export interface Station {
  id: string
  /** Two-digit label printed on the station plate. */
  index: string
  name: string
  /** One line, shown under the name on the station card. */
  blurb: string
  glyph: string
  accent: string
  /** Apps reachable from this station, in the order they should be offered. */
  apps: string[]
  /** Short lines describing what is on this bench. */
  contents: string[]
}

export const stations: Station[] = [
  {
    id: 'development',
    index: '01',
    name: 'Development',
    blurb: 'The software engineering bench — editor, repositories, stack.',
    glyph: '⌨️',
    accent: '#38bdf8',
    apps: ['editor', 'projects', 'techstack', 'terminal'],
    contents: ['Code editor', 'Project repositories', 'Frontend & backend stack', 'APIs and databases'],
  },
  {
    id: 'security',
    index: '02',
    name: 'Security Lab',
    blurb: 'Offensive security practice — recon, enumeration, exploitation.',
    glyph: '🛡️',
    accent: '#f59e0b',
    apps: ['seclab', 'terminal', 'network'],
    contents: ['Reconnaissance', 'Enumeration', 'Exploitation', 'Privilege escalation', 'Reporting'],
  },
  {
    id: 'websec',
    index: '03',
    name: 'Web Security',
    blurb: 'Web application security — OWASP, HTTP, authentication, injection.',
    glyph: '🌐',
    accent: '#a78bfa',
    apps: ['websec', 'browser'],
    contents: ['OWASP Top 10', 'HTTP internals', 'Authentication & session', 'Injection classes', 'API security'],
  },
  {
    id: 'aisec',
    index: '04',
    name: 'AI Security',
    blurb: 'Security of language-model applications, and what breaks them.',
    glyph: '🧠',
    accent: '#34d399',
    apps: ['aisec'],
    contents: ['Prompt injection', 'Model & supply chain', 'Agent and tool risk', 'Output handling'],
  },
  {
    id: 'networking',
    index: '05',
    name: 'Networking',
    blurb: 'Topology, protocols and the path a packet actually takes.',
    glyph: '🕸️',
    accent: '#22d3ee',
    apps: ['network'],
    contents: ['Topology map', 'TCP/IP & DNS', 'Ports and services', 'Capture and analysis'],
  },
  {
    id: 'projectlab',
    index: '06',
    name: 'Project Lab',
    blurb: 'Every project, opened as a folder rather than a card.',
    glyph: '🔬',
    accent: '#fb923c',
    apps: ['projects', 'files'],
    contents: ['Case studies', 'Architecture notes', 'Repositories', 'Live demos'],
  },
  {
    id: 'knowledge',
    index: '07',
    name: 'Knowledge',
    blurb: 'What is being learned right now, and how far along it is.',
    glyph: '📚',
    accent: '#fcd34d',
    apps: ['knowledge', 'skills'],
    contents: ['Learning tracks', 'Methodologies', 'Reading and references', 'Current goals'],
  },
  {
    id: 'about',
    index: '08',
    name: 'About',
    blurb: 'Who is at this desk — background, education, contact.',
    glyph: '🪪',
    accent: '#fb7185',
    apps: ['about', 'experience', 'resume', 'contact'],
    contents: ['Background', 'Education', 'Timeline', 'Contact'],
  },
]

// ---------------------------------------------------------------------------
// Security lab  →  Security Lab app
// ---------------------------------------------------------------------------
//
//  HONESTY RULE FOR THIS SECTION
//  ----------------------------
//  `depth` is the only claim made anywhere about proficiency, and it means
//  exactly this:
//
//    'reading'   — studied it; have not driven the tool myself
//    'lab'       — used it hands-on in a deliberately vulnerable environment
//    'project'   — used it against something I built or was asked to test
//
//  Nothing here claims professional or paid security experience. If that
//  changes, change the labels — do not quietly upgrade them.
//
// ---------------------------------------------------------------------------

export type Depth = 'reading' | 'lab' | 'project'

export const DEPTH_LABEL: Record<Depth, string> = {
  reading: 'Studied',
  lab: 'Hands-on (lab)',
  project: 'Used on a project',
}

export const DEPTH_TONE: Record<Depth, 'neutral' | 'warn' | 'good'> = {
  reading: 'neutral',
  lab: 'warn',
  project: 'good',
}

export interface SecurityPhase {
  id: string
  name: string
  /** Where this sits in an engagement, 1-indexed. */
  order: number
  summary: string
  glyph: string
  /** Tool ids from `securityTools` used at this phase. */
  tools: string[]
  /** Things practised at this phase. */
  activities: string[]
}

export const securityPhases: SecurityPhase[] = [
  {
    id: 'recon',
    name: 'Reconnaissance',
    order: 1,
    glyph: '🔭',
    summary:
      'Establish what exists before touching it. Passive first — the target should not learn anything from being looked at.',
    tools: ['nmap', 'whois', 'dig'],
    activities: ['Passive OSINT collection', 'DNS records and subdomain discovery', 'Host discovery on a known range'],
  },
  {
    id: 'enumeration',
    name: 'Enumeration',
    order: 2,
    glyph: '🗺️',
    summary:
      'Turn "a host is up" into "these services, these versions, this attack surface". Most of an engagement lives here.',
    tools: ['nmap', 'gobuster', 'burp'],
    activities: ['Service and version detection', 'Directory and virtual-host discovery', 'Reading error pages properly'],
  },
  {
    id: 'websec',
    name: 'Web Security',
    order: 3,
    glyph: '🌐',
    summary:
      'The application layer, where most findings actually are. Intercept, modify, replay, and understand why the server believed you.',
    tools: ['burp', 'curl'],
    activities: ['Request interception and replay', 'Injection and access-control testing', 'Session and token handling'],
  },
  {
    id: 'network',
    name: 'Network Security',
    order: 4,
    glyph: '🕸️',
    summary:
      'What is on the wire, and what should not be. Reading a capture is a skill separate from running the capture.',
    tools: ['wireshark', 'tcpdump', 'nmap'],
    activities: ['Packet capture and filtering', 'Protocol analysis', 'Spotting cleartext credentials'],
  },
  {
    id: 'exploitation',
    name: 'Exploitation',
    order: 5,
    glyph: '💥',
    summary:
      'Proving a finding is real. Done in lab environments built to be broken — never against anything without written permission.',
    tools: ['metasploit', 'python'],
    activities: ['Working from a known CVE to a proof of concept', 'Adapting public exploit code', 'Documenting the exact path in'],
  },
  {
    id: 'privesc',
    name: 'Privilege Escalation',
    order: 6,
    glyph: '⬆️',
    summary:
      'A shell is the beginning, not the finding. Misconfiguration is almost always more productive than a kernel exploit.',
    tools: ['linux', 'python'],
    activities: ['SUID, sudo rules and cron inspection', 'Credential reuse across hosts', 'Enumerating from the inside'],
  },
  {
    id: 'reporting',
    name: 'Reporting',
    order: 7,
    glyph: '📝',
    summary:
      'The deliverable is the report, not the shell. A finding nobody can reproduce or prioritise has not been found.',
    tools: [],
    activities: ['Reproduction steps that actually reproduce', 'Impact and severity reasoning', 'Remediation the team can act on'],
  },
]

export interface SecurityTool {
  id: string
  name: string
  /** What it is for, in one line. */
  purpose: string
  depth: Depth
  /** A representative invocation. Illustrative, not copy-paste guidance. */
  example?: string
}

export const securityTools: SecurityTool[] = [
  {
    id: 'nmap',
    name: 'Nmap',
    purpose: 'Host discovery, port scanning and service/version detection.',
    depth: 'lab',
    example: 'nmap -sV -sC -oA scan 10.10.10.0/24',
  },
  {
    id: 'burp',
    name: 'Burp Suite',
    purpose: 'Intercepting proxy for inspecting, modifying and replaying HTTP traffic.',
    depth: 'lab',
    example: 'Proxy → Intercept → send to Repeater',
  },
  {
    id: 'wireshark',
    name: 'Wireshark',
    purpose: 'Packet capture and protocol analysis with a readable dissector tree.',
    depth: 'lab',
    example: 'tcp.port == 80 && http.request',
  },
  {
    id: 'tcpdump',
    name: 'tcpdump',
    purpose: 'Capturing on the command line where no GUI exists.',
    depth: 'lab',
    example: 'tcpdump -i eth0 -nn port 53 -w dns.pcap',
  },
  {
    id: 'metasploit',
    name: 'Metasploit',
    purpose: 'Exploit framework — payloads, handlers and post-exploitation modules.',
    depth: 'reading',
    example: 'use exploit/multi/handler',
  },
  {
    id: 'gobuster',
    name: 'Gobuster',
    purpose: 'Directory, virtual-host and DNS brute forcing against a wordlist.',
    depth: 'lab',
    example: 'gobuster dir -u http://target -w wordlist.txt',
  },
  {
    id: 'curl',
    name: 'curl',
    purpose: 'Hand-crafting HTTP requests when a browser gets in the way.',
    depth: 'project',
    example: "curl -i -X POST -H 'Content-Type: application/json' -d '{}' https://target/api",
  },
  {
    id: 'dig',
    name: 'dig',
    purpose: 'DNS interrogation — records, zone behaviour, resolver disagreement.',
    depth: 'lab',
    example: 'dig +short AXFR target.tld @ns1.target.tld',
  },
  {
    id: 'whois',
    name: 'whois',
    purpose: 'Registration and ownership data during passive reconnaissance.',
    depth: 'lab',
    example: 'whois target.tld',
  },
  {
    id: 'linux',
    name: 'Linux',
    purpose: 'The environment all of the above runs in. Daily driver, not a lab VM.',
    depth: 'project',
    example: 'find / -perm -4000 -type f 2>/dev/null',
  },
  {
    id: 'python',
    name: 'Python',
    purpose: 'Scripting the part of the work no tool does for you.',
    depth: 'project',
    example: 'python3 -c "import socket; ..."',
  },
]

// ---------------------------------------------------------------------------
// Web security  →  Web Security app
// ---------------------------------------------------------------------------

export interface WebVuln {
  id: string
  /** OWASP Top 10 (2021) identifier. */
  code: string
  name: string
  summary: string
  /** What the tester actually does to look for it. */
  test: string
  /** What fixes it, stated as a control rather than a slogan. */
  defence: string
  depth: Depth
}

export const owaspTop10: WebVuln[] = [
  {
    id: 'a01',
    code: 'A01',
    name: 'Broken Access Control',
    summary: 'The server trusts the client to decide what the client is allowed to reach.',
    test: 'Replay a privileged request with a lower-privileged session. Change an id in the path and see who answers.',
    defence: 'Authorise on the server, per object, on every request. Deny by default.',
    depth: 'lab',
  },
  {
    id: 'a02',
    code: 'A02',
    name: 'Cryptographic Failures',
    summary: 'Sensitive data travels or rests without the protection it needs.',
    test: 'Check transport, storage and what ends up in logs. Look for cleartext in a capture.',
    defence: 'TLS everywhere, modern ciphers, hashed credentials with a slow KDF.',
    depth: 'reading',
  },
  {
    id: 'a03',
    code: 'A03',
    name: 'Injection',
    summary: 'Untrusted input reaches an interpreter as code rather than as data — SQL, OS, LDAP, template.',
    test: 'Send input that would change the shape of the query, not just its value, and read the error.',
    defence: 'Parameterised queries and safe APIs. Escaping is the fallback, not the plan.',
    depth: 'lab',
  },
  {
    id: 'a04',
    code: 'A04',
    name: 'Insecure Design',
    summary: 'The flaw is in what the system was asked to do, so no amount of correct code removes it.',
    test: 'Model the abuse case, not the use case. Ask what a motivated user gains by following the rules.',
    defence: 'Threat modelling before implementation; limits and controls as requirements.',
    depth: 'reading',
  },
  {
    id: 'a05',
    code: 'A05',
    name: 'Security Misconfiguration',
    summary: 'Defaults left on, verbose errors, unnecessary features, missing headers.',
    test: 'Look at headers, error pages, exposed admin paths and directory listings.',
    defence: 'Hardened baseline, minimal surface, configuration in review like any code.',
    depth: 'lab',
  },
  {
    id: 'a06',
    code: 'A06',
    name: 'Vulnerable & Outdated Components',
    summary: 'The vulnerability was someone else’s, and you shipped it.',
    test: 'Enumerate versions from responses and manifests; compare against advisories.',
    defence: 'Dependency inventory, automated advisories, an actual patch cadence.',
    depth: 'project',
  },
  {
    id: 'a07',
    code: 'A07',
    name: 'Identification & Authentication Failures',
    summary: 'Sessions, credentials and recovery flows that can be worn by the wrong person.',
    test: 'Attack the session lifecycle — fixation, expiry, reuse, and the reset flow.',
    defence: 'Strong session handling, MFA, rate limiting, no credential in a URL.',
    depth: 'lab',
  },
  {
    id: 'a08',
    code: 'A08',
    name: 'Software & Data Integrity Failures',
    summary: 'Code or data is accepted without verifying where it came from.',
    test: 'Follow the update and deserialisation paths. Ask what is signed and what is merely fetched.',
    defence: 'Signature verification, pinned dependencies, no deserialisation of untrusted input.',
    depth: 'reading',
  },
  {
    id: 'a09',
    code: 'A09',
    name: 'Logging & Monitoring Failures',
    summary: 'The attack succeeded and nothing recorded it, so nobody responded.',
    test: 'Perform a detectable action and check whether anything noticed.',
    defence: 'Log the security-relevant events, centralise them, alert on the ones that matter.',
    depth: 'reading',
  },
  {
    id: 'a10',
    code: 'A10',
    name: 'Server-Side Request Forgery',
    summary: 'The server fetches a URL the attacker chose, from inside the network.',
    test: 'Point any URL parameter at an address only the server can reach and watch for a difference.',
    defence: 'Allow-list destinations, resolve and validate, block link-local metadata ranges.',
    depth: 'lab',
  },
]

// ---------------------------------------------------------------------------
// AI security  →  AI Security app
// ---------------------------------------------------------------------------

export interface AiRisk {
  id: string
  name: string
  category: 'Input' | 'Model' | 'Agent' | 'Output'
  summary: string
  /** A concrete, defensive illustration of the failure. */
  example: string
  mitigation: string
  depth: Depth
}

export const aiRisks: AiRisk[] = [
  {
    id: 'prompt-injection',
    name: 'Prompt Injection',
    category: 'Input',
    summary:
      'Instructions arriving inside data are followed as if they came from the operator. The model has no reliable way to tell the two apart.',
    example:
      'A page the assistant was asked to summarise contains text addressed to the assistant, telling it to ignore its instructions.',
    mitigation:
      'Treat all retrieved content as untrusted data. Keep privilege outside the prompt — the model asks, the system decides.',
    depth: 'lab',
  },
  {
    id: 'indirect-injection',
    name: 'Indirect Injection',
    category: 'Input',
    summary:
      'The payload is planted in a source the model will read later, so the attacker never talks to the system directly.',
    example: 'A document in a shared drive carries instructions that fire whenever an agent indexes it.',
    mitigation: 'Provenance tracking on retrieved content, and no tool call that content alone can authorise.',
    depth: 'reading',
  },
  {
    id: 'data-leak',
    name: 'Sensitive Information Disclosure',
    category: 'Model',
    summary: 'Context assembled for one user ends up in an answer given to another, or in an answer that should not exist.',
    example: 'A retrieval step pulls documents the asking user has no right to read, and the model summarises them faithfully.',
    mitigation: 'Filter at retrieval by the requesting identity. Authorisation belongs before the context window, not after.',
    depth: 'lab',
  },
  {
    id: 'supply-chain',
    name: 'Model & Supply Chain',
    category: 'Model',
    summary: 'Weights, adapters and datasets are dependencies, and are trusted far more casually than packages are.',
    example: 'A fine-tune pulled from a public hub carries behaviour nobody audited.',
    mitigation: 'Pin and verify artefacts, prefer known provenance, evaluate before promotion.',
    depth: 'reading',
  },
  {
    id: 'excessive-agency',
    name: 'Excessive Agency',
    category: 'Agent',
    summary: 'The model is given tools whose blast radius exceeds the confidence anyone has in its judgement.',
    example: 'An agent that can both read arbitrary web pages and send email needs only one hostile page.',
    mitigation: 'Least privilege per tool, human confirmation on irreversible actions, and a hard separation of read and write scopes.',
    depth: 'lab',
  },
  {
    id: 'insecure-output',
    name: 'Insecure Output Handling',
    category: 'Output',
    summary: 'Model output is passed to something that executes it — a shell, a template, a browser, a query.',
    example: 'Generated markdown is rendered as raw HTML and carries a script tag.',
    mitigation: 'Treat output as untrusted input to the next system. Encode, sandbox, and never eval.',
    depth: 'project',
  },
]

// ---------------------------------------------------------------------------
// Networking  →  Network app
// ---------------------------------------------------------------------------
//
//  A deliberately generic lab topology. It describes how the segments of a
//  practice network relate — no real address, hostname or identifier from any
//  actual network appears here.
//
// ---------------------------------------------------------------------------

export interface NetNode {
  id: string
  label: string
  kind: 'internet' | 'router' | 'firewall' | 'switch' | 'server' | 'workstation' | 'target'
  /** Percentage coordinates within the topology viewport. */
  x: number
  y: number
  glyph: string
  detail: string
  /** Illustrative open ports for a lab host of this kind. */
  ports?: { port: number; service: string }[]
}

export interface NetLink {
  from: string
  to: string
  label?: string
}

export const netNodes: NetNode[] = [
  {
    id: 'internet',
    label: 'Internet',
    kind: 'internet',
    x: 50,
    y: 8,
    glyph: '🌍',
    detail: 'Everything outside the perimeter. Assumed hostile by default.',
  },
  {
    id: 'edge',
    label: 'Edge Router',
    kind: 'router',
    x: 50,
    y: 26,
    glyph: '📡',
    detail: 'First hop in. Where NAT happens and where the first ACL should already have applied.',
    ports: [{ port: 22, service: 'ssh (management, restricted)' }],
  },
  {
    id: 'fw',
    label: 'Firewall',
    kind: 'firewall',
    x: 50,
    y: 44,
    glyph: '🧱',
    detail: 'Segmentation boundary. The DMZ can be reached from outside; the LAN must not be.',
  },
  {
    id: 'dmz',
    label: 'DMZ Switch',
    kind: 'switch',
    x: 22,
    y: 62,
    glyph: '🔀',
    detail: 'Public-facing segment. Anything here is treated as already compromised.',
  },
  {
    id: 'lan',
    label: 'LAN Switch',
    kind: 'switch',
    x: 78,
    y: 62,
    glyph: '🔀',
    detail: 'Internal segment. Reachable from the DMZ only through explicitly allowed flows.',
  },
  {
    id: 'web',
    label: 'Web Server',
    kind: 'server',
    x: 10,
    y: 84,
    glyph: '🖧',
    detail: 'The application under test. Usually the way in, and rarely the goal.',
    ports: [
      { port: 80, service: 'http' },
      { port: 443, service: 'https' },
    ],
  },
  {
    id: 'dns',
    label: 'DNS / Mail',
    kind: 'server',
    x: 34,
    y: 84,
    glyph: '🗂️',
    detail: 'Name resolution and mail. Rich in reconnaissance value long before exploitation.',
    ports: [
      { port: 53, service: 'dns' },
      { port: 25, service: 'smtp' },
    ],
  },
  {
    id: 'db',
    label: 'Database',
    kind: 'target',
    x: 66,
    y: 84,
    glyph: '🗄️',
    detail: 'What the engagement is usually actually about. Should never be reachable from the DMZ directly.',
    ports: [{ port: 5432, service: 'postgresql' }],
  },
  {
    id: 'ws',
    label: 'Workstation',
    kind: 'workstation',
    x: 90,
    y: 84,
    glyph: '💻',
    detail: 'The analyst bench. Where the capture is read and the notes are written.',
  },
]

export const netLinks: NetLink[] = [
  { from: 'internet', to: 'edge', label: 'WAN' },
  { from: 'edge', to: 'fw' },
  { from: 'fw', to: 'dmz', label: 'DMZ' },
  { from: 'fw', to: 'lan', label: 'LAN' },
  { from: 'dmz', to: 'web' },
  { from: 'dmz', to: 'dns' },
  { from: 'lan', to: 'db' },
  { from: 'lan', to: 'ws' },
]

export interface Protocol {
  name: string
  layer: string
  port: string
  note: string
}

export const protocols: Protocol[] = [
  { name: 'HTTP / HTTPS', layer: 'Application', port: '80 / 443', note: 'Where most findings live. Everything about the request is attacker-controlled.' },
  { name: 'DNS', layer: 'Application', port: '53', note: 'Reconnaissance goldmine, and a exfiltration channel when nothing else is open.' },
  { name: 'SSH', layer: 'Application', port: '22', note: 'Key-based only. A password prompt on a public host is a finding by itself.' },
  { name: 'TCP', layer: 'Transport', port: '—', note: 'The handshake is what a SYN scan is actually manipulating.' },
  { name: 'UDP', layer: 'Transport', port: '—', note: 'No handshake, so scanning is slow and ambiguous. Frequently under-tested.' },
  { name: 'IP / ICMP', layer: 'Network', port: '—', note: 'Reachability and routing. A blocked ping is not an absent host.' },
  { name: 'ARP', layer: 'Link', port: '—', note: 'Trust-free by design, which is precisely the problem on a shared segment.' },
]

// ---------------------------------------------------------------------------
// Learning  →  Knowledge app
// ---------------------------------------------------------------------------
//
//  `progress` is a self-assessment of how far through a body of material this
//  is — not a score, not a certification, and not a claim of competence.
//
// ---------------------------------------------------------------------------

export interface LearningTrack {
  id: string
  name: string
  provider: string
  /** 0–100, self-assessed completion of the material. */
  progress: number
  status: 'In progress' | 'Ongoing' | 'Planned'
  summary: string
  topics: string[]
  url?: string
}

export const learningTracks: LearningTrack[] = [
  {
    id: 'thm',
    name: 'TryHackMe — practical security paths',
    provider: 'TryHackMe',
    progress: 0, // TODO — set this from your actual profile before publishing
    status: 'In progress',
    summary:
      'Guided rooms covering reconnaissance, web exploitation and Linux privilege escalation in disposable lab environments.',
    topics: ['Recon', 'Web exploitation', 'Linux privesc', 'Networking'],
    url: 'https://tryhackme.com/',
  },
  {
    id: 'owasp',
    name: 'OWASP Top 10 — working through each class',
    provider: 'OWASP',
    progress: 0, // TODO
    status: 'Ongoing',
    summary: 'Reading each category alongside a deliberately vulnerable application, rather than as a list to memorise.',
    topics: ['Access control', 'Injection', 'SSRF', 'Misconfiguration'],
    url: 'https://owasp.org/Top10/',
  },
  {
    id: 'netfund',
    name: 'Networking fundamentals',
    provider: 'Self-directed',
    progress: 0, // TODO
    status: 'Ongoing',
    summary: 'TCP/IP, DNS and routing from the packet up — the layer most web work skips and then needs.',
    topics: ['TCP/IP', 'DNS', 'Routing', 'Packet analysis'],
  },
  {
    id: 'aisec',
    name: 'LLM application security',
    provider: 'Self-directed',
    progress: 0, // TODO
    status: 'In progress',
    summary:
      'How model-backed applications fail: injection through retrieved content, tool privilege, and output that reaches an interpreter.',
    topics: ['Prompt injection', 'Agent privilege', 'Output handling'],
  },
]

/**
 * Methodologies referenced rather than claimed. These are the frameworks the
 * lab work is organised around — reading them is not the same as certifying
 * against them, and nothing here says otherwise.
 */
export const methodologies = [
  { name: 'OWASP Testing Guide', note: 'Structure for working through a web application methodically.' },
  { name: 'OWASP Top 10', note: 'The vocabulary most findings are reported in.' },
  { name: 'Cyber Kill Chain', note: 'A way to describe where in an intrusion a control actually applies.' },
  { name: 'MITRE ATT&CK', note: 'Shared naming for techniques, used when writing anything up.' },
]

// ---------------------------------------------------------------------------
// Services  →  Services app
// ---------------------------------------------------------------------------
//
//  What you are available to be hired for. These describe capability, not
//  completed engagements — nothing here claims a client, a rate or a delivery
//  record, because none of that is known to this file.
//
// ---------------------------------------------------------------------------

export interface Service {
  id: string
  name: string
  summary: string
  /** What the work actually involves, concretely. */
  includes: string[]
  glyph: string
  accent: string
  /** Stack this draws on — cross-checked against `skills` by the app. */
  stack: string[]
}

export const services: Service[] = [
  {
    id: 'web-app',
    name: 'Web application development',
    summary: 'A working product end to end — data model, API, interface, deploy.',
    includes: [
      'Schema and API design',
      'React + TypeScript front end',
      'Authentication and access control',
      'Deployment and CI',
    ],
    glyph: '🧱',
    accent: '#39ace1',
    stack: ['react', 'typescript', 'nodejs', 'postgresql'],
  },
  {
    id: 'frontend',
    name: 'Front-end engineering',
    summary: 'Interfaces that hold up — accessible, responsive, and fast on real devices.',
    includes: [
      'Component architecture and design systems',
      'Responsive layout down to 375px',
      'Accessibility: keyboard, focus, reduced motion',
      'Performance budgets and bundle work',
    ],
    glyph: '🎨',
    accent: '#a78bfa',
    stack: ['react', 'typescript', 'tailwindcss'],
  },
  {
    id: 'api',
    name: 'APIs and backend services',
    summary: 'The part behind the interface: endpoints, jobs, storage, and the schema under them.',
    includes: ['REST API design', 'Database schema and query work', 'Background jobs and queues', 'Docker packaging'],
    glyph: '⚙️',
    accent: '#34d399',
    stack: ['nodejs', 'fastapi', 'postgresql', 'docker'],
  },
  {
    id: 'security-review',
    name: 'Security review of web applications',
    summary:
      'A structured read of an application against the OWASP categories, written up so the findings can be acted on.',
    includes: [
      'Authentication and access-control review',
      'Injection and input-handling review',
      'Dependency and configuration review',
      'Written findings with reproduction steps',
    ],
    glyph: '🛡️',
    accent: '#f59e0b',
    stack: ['linux', 'python'],
  },
]

/**
 * Shown at the foot of the Services app. Says plainly what the security offer
 * is and is not, so nobody reads "security review" as a credentialed
 * penetration test — see [[the depth labels]] on the Security Lab.
 */
export const servicesNote =
  'Availability and terms are not listed here — get in touch and we can work out whether it is a fit. ' +
  'The security review is an application review against published categories, carried out with permission; ' +
  'it is not an accredited penetration test.'

// ---------------------------------------------------------------------------
// Testimonials  →  Testimonials app
// ---------------------------------------------------------------------------
//
//  EMPTY, AND THAT IS THE CORRECT STATE.
//
//  A fabricated testimonial is the single most damaging thing that could go on
//  a portfolio: it is a quote attributed to a named human being who never said
//  it. There is no placeholder version of that which is safe to ship, so this
//  array stays empty and the app renders an honest empty state instead of
//  filler.
//
//  To add a real one you need, at minimum: the person's name, their role and
//  organisation, the exact words they agreed to, and their permission to
//  publish it. Anything less is not a testimonial.
//
// ---------------------------------------------------------------------------

export interface Testimonial {
  id: string
  /** The words, exactly as given and approved. */
  quote: string
  name: string
  role: string
  org: string
  /** How you worked together — helps a reader weight the quote. */
  context: string
  /** Where it can be checked, if it is public (LinkedIn recommendation, etc.). */
  source?: string
}

export const testimonials: Testimonial[] = []
