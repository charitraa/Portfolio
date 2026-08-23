import type { Credential, TimelineEntry } from './types'

export const timeline: TimelineEntry[] = [
  {
    year: '2023',
    title: 'Started building in public',
    org: 'Self-directed',
    detail:
      'First real projects: Python automation scripts and a Django CRUD app deployed to a VPS I broke and rebuilt more than once. Learned Linux the way everyone does — by fixing it.',
    tags: ['Python', 'Django', 'Linux'],
  },
  {
    year: '2024',
    title: 'Mobile development with Flutter',
    org: 'Freelance',
    detail:
      'Shipped cross-platform apps for local clients. Built the Library System and Inventory System end to end, including deployment, backups and handover documentation.',
    tags: ['Flutter', 'Dart', 'MongoDB'],
  },
  {
    year: '2025',
    title: 'Backend and API work',
    org: 'Contract',
    detail:
      'Focused on Django REST and FastAPI services: authentication, background jobs, caching and the observability needed to run them. AdsMitra and Speech Translator both landed this year.',
    tags: ['Django REST', 'FastAPI', 'PostgreSQL', 'Redis'],
  },
  {
    year: '2026',
    title: 'Professional engineering work',
    org: 'Current',
    detail:
      'Working across the stack on production systems — containerised deployments, CI pipelines, performance work and code review. Increasingly the person who gets called when something is slow.',
    tags: ['Docker', 'CI/CD', 'React', 'Performance'],
  },
]

export const credentials: Credential[] = [
  {
    kind: 'education',
    title: 'BSc (Hons) Computer Science',
    issuer: 'Tribhuvan University, Nepal',
    year: '2021 — 2025',
    detail: 'Networks, operating systems, databases and distributed systems.',
  },
  {
    kind: 'education',
    title: 'Higher Secondary, Science',
    issuer: 'Kathmandu',
    year: '2019 — 2021',
    detail: 'Physics, mathematics and computer science.',
  },
  {
    kind: 'certificate',
    title: 'Docker and Containerisation',
    issuer: 'Online certification',
    year: '2025',
    detail: 'Image layering, multi-stage builds, compose orchestration.',
  },
  {
    kind: 'certificate',
    title: 'Backend Development with Django',
    issuer: 'Online certification',
    year: '2024',
    detail: 'REST design, ORM internals, authentication flows.',
  },
  {
    kind: 'award',
    title: 'Hackathon finalist',
    issuer: 'Regional developer event',
    year: '2025',
    detail: 'Built and demoed a working prototype in 36 hours.',
  },
  {
    kind: 'award',
    title: 'Open source contributions',
    issuer: 'Community',
    year: '2024 — present',
    detail: 'Bug fixes and documentation across Python and Flutter packages.',
  },
]

/** Bars for the "projects shipped per year" chart. */
export const projectsPerYear = [
  { label: '2022', value: 1 },
  { label: '2023', value: 3 },
  { label: '2024', value: 4 },
  { label: '2025', value: 5 },
  { label: '2026', value: 2 },
]
