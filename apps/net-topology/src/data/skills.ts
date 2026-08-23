import type { Skill } from './types'

/** Skills are rendered as firewall ALLOW rules and as bandwidth bars. */
export const skills: Skill[] = [
  { name: 'React', level: 92, group: 'frontend', port: '443/tcp', note: 'Hooks, suspense, state colocation' },
  { name: 'TypeScript', level: 88, group: 'frontend', port: '443/tcp', note: 'Strict mode, generics, narrowing' },
  { name: 'Tailwind CSS', level: 85, group: 'frontend', port: '443/tcp', note: 'Design tokens, dark mode' },
  { name: 'Django', level: 90, group: 'backend', port: '8000/tcp', note: 'DRF, ORM, migrations, Celery' },
  { name: 'Python', level: 91, group: 'backend', port: '8000/tcp', note: 'Async, typing, tooling scripts' },
  { name: 'Node.js', level: 78, group: 'backend', port: '3000/tcp', note: 'Express, streams, workers' },
  { name: 'PostgreSQL', level: 82, group: 'backend', port: '5432/tcp', note: 'Indexing, locks, query plans' },
  { name: 'Flutter', level: 84, group: 'mobile', port: '8080/tcp', note: 'Custom widgets, platform channels' },
  { name: 'Linux', level: 86, group: 'infra', port: '22/tcp', note: 'systemd, networking, debugging' },
  { name: 'Docker', level: 80, group: 'infra', port: '2375/tcp', note: 'Multi-stage builds, compose' },
  { name: 'Nginx', level: 74, group: 'infra', port: '80/tcp', note: 'Reverse proxy, TLS, caching' },
  { name: 'CI/CD', level: 72, group: 'infra', port: '9000/tcp', note: 'GitHub Actions, build pipelines' },
  { name: 'Git', level: 89, group: 'tooling', port: '9418/tcp', note: 'Rebase, bisect, clean history' },
  { name: 'Figma', level: 68, group: 'tooling', port: '443/tcp', note: 'Handoff, component specs' },
]

/** Denied "ports" — a bit of honesty, in firewall costume. */
export const deniedRules = [
  { name: 'Untested deploys', reason: 'no rollback path' },
  { name: 'Silent failures', reason: 'unlogged exceptions' },
  { name: 'Hardcoded secrets', reason: 'policy violation' },
]

/** Language mix for the pie chart, in percent. */
export const languageMix = [
  { name: 'TypeScript', value: 32, color: 'var(--accent)' },
  { name: 'Python', value: 28, color: 'var(--cyan)' },
  { name: 'Dart', value: 18, color: 'var(--purple)' },
  { name: 'JavaScript', value: 12, color: 'var(--success)' },
  { name: 'Shell', value: 6, color: 'var(--warning)' },
  { name: 'Other', value: 4, color: 'var(--border)' },
]
