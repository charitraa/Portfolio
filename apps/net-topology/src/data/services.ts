import type { Service } from './types'

/** Services are presented as API gateway routes. */
export const services: Service[] = [
  {
    method: 'GET',
    path: '/services/web',
    name: 'Web Development',
    description:
      'Production React and TypeScript front ends: routing, state, forms, accessibility and a build you can actually ship on a Friday.',
    deliverables: ['Component library', 'Responsive layouts', 'Lighthouse budget', 'Handover docs'],
    latency: '18 ms',
  },
  {
    method: 'POST',
    path: '/services/api',
    name: 'Backend APIs',
    description:
      'Django REST, FastAPI and Express services — schema design, authentication, background jobs, pagination and versioning that will not paint you into a corner.',
    deliverables: ['OpenAPI spec', 'Auth flows', 'Migrations', 'Load test report'],
    latency: '24 ms',
  },
  {
    method: 'GET',
    path: '/services/mobile',
    name: 'Mobile Apps',
    description:
      'Flutter applications for Android and iOS from one codebase, including offline behaviour, platform channels and store submission.',
    deliverables: ['iOS + Android builds', 'Offline strategy', 'Crash reporting', 'Store assets'],
    latency: '31 ms',
  },
  {
    method: 'PUT',
    path: '/services/cloud',
    name: 'Cloud & DevOps',
    description:
      'Containerised deployments, CI pipelines, reverse proxies, TLS, backups and the monitoring that tells you before your users do.',
    deliverables: ['Dockerised stack', 'CI pipeline', 'Monitoring + alerts', 'Runbook'],
    latency: '12 ms',
  },
  {
    method: 'POST',
    path: '/services/ai',
    name: 'AI Integration',
    description:
      'Speech, translation and LLM features wired into real products — streaming responses, sane fallbacks and cost control.',
    deliverables: ['Inference pipeline', 'Streaming UX', 'Fallback path', 'Cost model'],
    latency: '46 ms',
  },
  {
    method: 'GET',
    path: '/services/ui',
    name: 'UI & Design Systems',
    description:
      'Design tokens, component specs and dark-mode-first interfaces that stay consistent as the product grows.',
    deliverables: ['Token set', 'Component specs', 'Dark/light themes', 'A11y audit'],
    latency: '15 ms',
  },
]
