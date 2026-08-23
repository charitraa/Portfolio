/**
 * Every word of portfolio copy lives here. Edit this file to make the board
 * yours — nothing in `components/` needs to change.
 */

export const identity = {
  name: 'CHARITRA',
  role: 'Software Engineer',
  status: 'Online',
  socket: 'LGA-2026',
  cores: '8C / 16T',
  clock: '5.1 GHz',
  tagline: 'Full-stack engineer wired for backend systems, mobile, and applied AI.',
  bio: [
    'I build software the way a board is laid out: every subsystem has a job, and the interesting work is in how they connect.',
    'Currently studying computer science while shipping freelance and university projects across Django, React, and Flutter. I like problems where the constraint is real — latency, cost, or a deadline.',
  ],
  goals: [
    'Ship a product used by more than ten thousand people',
    'Go deep on distributed systems and inference infrastructure',
    'Contribute meaningfully to an open-source project I depend on',
  ],
  university: 'B.Sc. Computer Science — Year 3',
  location: 'Kathmandu, Nepal',
  // Drop a headshot at /public/avatar.jpg and it renders automatically.
  photo: '/avatar.jpg',
}

export type SkillBank = {
  slot: string
  label: string
  color: 'copper' | 'electric' | 'signal' | 'memory'
  capacity: string
  skills: { name: string; level: number }[]
}

export const skillBanks: SkillBank[] = [
  {
    slot: 'DIMM_A1',
    label: 'Frontend',
    color: 'electric',
    capacity: '16GB',
    skills: [
      { name: 'React', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'Tailwind CSS', level: 88 },
      { name: 'Next.js', level: 72 },
    ],
  },
  {
    slot: 'DIMM_A2',
    label: 'Backend',
    color: 'signal',
    capacity: '16GB',
    skills: [
      { name: 'Python', level: 92 },
      { name: 'Django', level: 88 },
      { name: 'PostgreSQL', level: 78 },
      { name: 'REST / GraphQL', level: 80 },
    ],
  },
  {
    slot: 'DIMM_B1',
    label: 'Mobile',
    color: 'memory',
    capacity: '8GB',
    skills: [
      { name: 'Flutter', level: 85 },
      { name: 'Dart', level: 82 },
      { name: 'Firebase', level: 76 },
    ],
  },
  {
    slot: 'DIMM_B2',
    label: 'Cloud & Infra',
    color: 'copper',
    capacity: '8GB',
    skills: [
      { name: 'Linux', level: 84 },
      { name: 'Docker', level: 79 },
      { name: 'CI/CD', level: 72 },
      { name: 'Nginx', level: 68 },
    ],
  },
]

export type Project = {
  name: string
  kind: string
  blurb: string
  stack: string[]
  metric?: string
  href?: string
  repo?: string
}

export const projects: Project[] = [
  {
    name: 'AdsMitra',
    kind: 'Product',
    blurb:
      'Ad-campaign management platform that pairs local businesses with vetted creators, handling briefs, approvals, and payouts end to end.',
    stack: ['Django', 'React', 'PostgreSQL', 'Celery'],
    metric: '120+ campaigns processed',
    href: '#',
    repo: '#',
  },
  {
    name: 'Speech Translator',
    kind: 'AI',
    blurb:
      'Real-time speech-to-speech translation pipeline: streaming ASR, translation, and neural TTS stitched together under a two-second budget.',
    stack: ['Python', 'Whisper', 'FastAPI', 'WebSockets'],
    metric: '~1.8s end-to-end latency',
    repo: '#',
  },
  {
    name: 'Inventory System',
    kind: 'Systems',
    blurb:
      'Multi-warehouse stock and invoicing system with barcode intake, audit trails, and offline-tolerant sync for shops with poor connectivity.',
    stack: ['Django', 'HTMX', 'PostgreSQL'],
    metric: '4 shops running it daily',
    repo: '#',
  },
  {
    name: 'Library App',
    kind: 'Mobile',
    blurb:
      'Cross-platform campus library client — catalogue search, holds, due-date reminders, and an offline reading queue.',
    stack: ['Flutter', 'Firebase', 'Riverpod'],
    metric: '900+ installs',
    repo: '#',
  },
]

export const experience = [
  {
    year: '2023',
    title: 'Learning the Stack',
    org: 'Self-directed',
    detail:
      'Went from scripting to shipping: Python fundamentals, first Django app, and enough Linux to stop fearing the terminal.',
    io: 'READ',
  },
  {
    year: '2024',
    title: 'Freelance Developer',
    org: 'Independent',
    detail:
      'Delivered client web apps and Flutter builds on fixed timelines. Learned scoping, invoicing, and how to say no to feature creep.',
    io: 'WRITE',
  },
  {
    year: '2025',
    title: 'University Projects',
    org: 'B.Sc. Computer Science',
    detail:
      'Led a four-person team on the inventory system, built the speech-translation pipeline, and started reading papers seriously.',
    io: 'WRITE',
  },
  {
    year: '2026',
    title: 'Professional Development',
    org: 'AdsMitra & open source',
    detail:
      'Running AdsMitra in production, contributing upstream fixes, and moving toward backend and infrastructure work full time.',
    io: 'SYNC',
  },
]

export const services = [
  { port: 'USB 3.2', title: 'Web Development', detail: 'React + TypeScript frontends that stay maintainable past launch week.' },
  { port: 'USB 3.2', title: 'Backend Engineering', detail: 'Django and FastAPI services, schema design, background jobs, deploys.' },
  { port: 'USB-C', title: 'Flutter Apps', detail: 'One codebase, both stores, native-feeling motion and offline handling.' },
  { port: 'USB 2.0', title: 'REST APIs', detail: 'Versioned, documented, and tested APIs other teams can build against.' },
  { port: 'USB-C', title: 'Applied AI', detail: 'Speech, translation, and LLM features wired into products that already exist.' },
  { port: 'USB 2.0', title: 'Consulting', detail: 'Architecture reviews, stack decisions, and unblocking a stalled build.' },
]

export const certifications = [
  { slot: 'PCIe x16', name: 'Cloud Practitioner', issuer: 'AWS', year: '2025' },
  { slot: 'PCIe x8', name: 'Python for Everybody', issuer: 'University of Michigan', year: '2024' },
  { slot: 'PCIe x4', name: 'Linux Administration', issuer: 'Linux Foundation', year: '2025' },
  { slot: 'PCIe x1', name: 'Networking Fundamentals', issuer: 'Cisco', year: '2024' },
]

export const achievements = [
  { title: 'National Hackathon — Finalist', detail: 'Top 8 of 140 teams with a 36-hour logistics-routing build.', year: '2025' },
  { title: 'University Innovation Award', detail: 'Awarded for the campus library application.', year: '2025' },
  { title: 'Open Source Contributor', detail: 'Merged fixes into Django-adjacent packages and Flutter plugins.', year: '2024–' },
]

export const stats = [
  { label: 'Projects', value: 18, suffix: '' },
  { label: 'GitHub Repos', value: 42, suffix: '' },
  { label: 'Experience', value: 5, suffix: ' yrs' },
  { label: 'Coffee', value: Infinity, suffix: '' },
]

export const strengths = [
  { phase: 'PHASE 1', title: 'Problem Solving', detail: 'Reduce the problem until the hard part is obvious, then attack that.' },
  { phase: 'PHASE 2', title: 'Work Ethic', detail: 'Consistent output over heroic sprints. The build ships because it never stalled.' },
  { phase: 'PHASE 3', title: 'Teamwork', detail: 'Clear handoffs, small PRs, and no surprises in review.' },
  { phase: 'PHASE 4', title: 'Communication', detail: 'Explain the tradeoff before the decision, not after the incident.' },
  { phase: 'PHASE 5', title: 'Leadership', detail: 'Set the direction, remove the blocker, take the blame, share the credit.' },
]

export const softSkills = [
  { name: 'Communication', rpm: 1400 },
  { name: 'Creativity', rpm: 1650 },
  { name: 'Critical Thinking', rpm: 1800 },
  { name: 'Leadership', rpm: 1250 },
  { name: 'Adaptability', rpm: 1520 },
]

export const smallSkills = ['Git', 'CI/CD', 'Linux', 'Networking', 'VS Code', 'Figma', 'Postman', 'Nginx', 'Bash', 'Regex']

export const testimonials = [
  {
    quote:
      'Charitra scoped the project honestly, flagged risk early, and delivered ahead of the deadline. The handover documentation alone was worth the fee.',
    name: 'Project Client',
    role: 'Retail Operations Lead',
  },
  {
    quote:
      'Reliable under pressure and unusually good at explaining technical tradeoffs to non-technical stakeholders. Would work with again.',
    name: 'Team Lead',
    role: 'University Capstone',
  },
]

export const personal = {
  country: 'Nepal',
  languages: ['English', 'Nepali', 'Hindi'],
  hobbies: ['Mechanical keyboards', 'PC building', 'Cycling', 'Sci-fi'],
  timezone: 'UTC+05:45',
}

export const contact = {
  email: 'hello@example.com',
  github: 'https://github.com/',
  linkedin: 'https://linkedin.com/in/',
  location: 'Kathmandu, Nepal',
}

export const resume = {
  file: '/resume.pdf',
  version: 'v2026.08',
  size: '182 KB',
  updated: 'August 2026',
}

export const secretLab = [
  { name: 'Trace Router', detail: 'A tiny orthogonal auto-router — it draws the copper on this very board.' },
  { name: 'ASCII Renderer', detail: 'Terminal renderer that turns webcam frames into ANSI art at 30fps.' },
  { name: 'Kernel Notes', detail: 'Working through Linux device drivers, one chapter and one panic at a time.' },
]
