import type { Project } from './types'

/** Each project is presented as a backend server sitting behind the LB. */
export const projects: Project[] = [
  {
    id: 'adsmitra',
    name: 'AdsMitra',
    host: 'srv-ads-01',
    tagline: 'Ad campaign marketplace',
    summary:
      'A marketplace that connects local advertisers with billboard and digital screen owners. Handles listings, availability windows, bookings and payment reconciliation.',
    role: 'Full stack — architecture, API, dashboard',
    year: '2025',
    stack: ['React', 'TypeScript', 'Django REST', 'PostgreSQL', 'Redis', 'Docker'],
    health: 'healthy',
    load: 42,
    requests: '18.4k req/day',
    architecture: [
      'React + TypeScript SPA served from a CDN edge',
      'Django REST Framework API behind Nginx, gunicorn workers',
      'PostgreSQL for bookings, Redis for availability caching and rate limits',
      'Celery workers for invoice generation and campaign reminders',
      'Everything containerised, one compose file per environment',
    ],
    challenges: [
      'Double-booking under concurrent requests — solved with row-level locks plus an exclusion constraint on overlapping time ranges.',
      'Availability lookups were scanning the whole bookings table; a composite index and a Redis layer took p95 from 900ms to 70ms.',
    ],
    lessons: [
      'Put the correctness guarantee in the database, not only in application code.',
      'A boring cache invalidation strategy you can explain beats a clever one you cannot.',
    ],
    repo: 'https://github.com/charitra/adsmitra',
  },
  {
    id: 'speech-translator',
    name: 'Speech Translator',
    host: 'srv-speech-02',
    tagline: 'Real-time speech translation',
    summary:
      'A mobile app that captures speech, transcribes it and returns translated audio in near real time — built for travellers and field workers with unreliable connectivity.',
    role: 'Mobile + inference pipeline',
    year: '2025',
    stack: ['Flutter', 'Dart', 'Python', 'FastAPI', 'WebSockets', 'Whisper'],
    health: 'healthy',
    load: 27,
    requests: '6.1k sessions/mo',
    architecture: [
      'Flutter client with a streaming audio recorder and local VAD',
      'WebSocket channel to a FastAPI service for chunked transcription',
      'Translation queued per utterance so playback never blocks capture',
      'Offline fallback: cached phrasebook when the socket drops',
    ],
    challenges: [
      'Latency budget: each 300ms audio chunk had to round-trip before the next was ready. Overlapping windows and back-pressure kept it under a second.',
      'Android and iOS disagree about audio session interruptions — one abstraction layer, two very different code paths.',
    ],
    lessons: [
      'Streaming UX forgives latency if you show partial results immediately.',
      'Design the degraded path first; the happy path takes care of itself.',
    ],
    repo: 'https://github.com/charitra/speech-translator',
  },
  {
    id: 'library-system',
    name: 'Library System',
    host: 'srv-lib-03',
    tagline: 'Campus circulation platform',
    summary:
      'Catalogue, circulation and fine management for a college library. Replaced a spreadsheet workflow used by four staff and about 2,000 students.',
    role: 'Solo build — backend, UI, deployment',
    year: '2024',
    stack: ['Django', 'Python', 'PostgreSQL', 'Bootstrap', 'Linux'],
    health: 'healthy',
    load: 15,
    requests: '2.3k req/day',
    architecture: [
      'Django monolith with server-rendered templates — the right size for the team',
      'Role-based access for staff, students and administrators',
      'Nightly job for overdue notices and fine accrual',
      'Deployed on a single Linux VPS with systemd and automated backups',
    ],
    challenges: [
      'Migrating a decade of inconsistent spreadsheet records: a staged import with a dry-run report let staff fix data before it went live.',
      'ISBN lookups had to work offline during network outages, so metadata is cached locally on first fetch.',
    ],
    lessons: [
      'The migration is the project. Budget for it accordingly.',
      'A monolith you can deploy in one command beats microservices you cannot.',
    ],
    repo: 'https://github.com/charitra/library-system',
  },
  {
    id: 'inventory-system',
    name: 'Inventory System',
    host: 'srv-inv-04',
    tagline: 'Multi-warehouse stock control',
    summary:
      'Stock tracking across multiple warehouses with transfer orders, low-stock alerts and an auditable movement ledger.',
    role: 'Backend lead',
    year: '2024',
    stack: ['Node.js', 'Express', 'MongoDB', 'React', 'Docker', 'Git'],
    health: 'healthy',
    load: 9,
    requests: '4.8k req/day',
    architecture: [
      'Append-only movement ledger; stock levels are a projection, never edited directly',
      'Express API with request-scoped transactions for transfers',
      'React dashboard with optimistic updates and conflict reconciliation',
      'Alerting worker that watches reorder thresholds per warehouse',
    ],
    challenges: [
      'Reconciling physical counts against the ledger without losing history — adjustments became first-class ledger entries with a reason code.',
      'Transfers between warehouses had to be atomic across two documents; a two-phase state machine made partial failures recoverable.',
    ],
    lessons: [
      'Event-sourced stock is more code up front and far less debugging later.',
      'Every destructive action should leave a row behind explaining itself.',
    ],
    repo: 'https://github.com/charitra/inventory-system',
  },
]
