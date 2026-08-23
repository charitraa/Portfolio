/**
 * Everything personal lives in src/data. Edit these files and the whole
 * topology, panels and charts update — no component changes needed.
 */
export const profile = {
  name: 'Charitra Shrestha',
  title: 'Software Engineer',
  location: 'Kathmandu, Nepal',
  timezone: 'Asia/Kathmandu',
  domain: 'charitra.dev',
  email: 'hello@charitra.dev',
  handle: 'NET://CHARITRA',
  asn: 'AS64512',
  ipv4: '103.94.128.42',
  ipv6: '2400:1a00:b1d0::42',
  summary:
    'I build things that have to stay up: React and Flutter front ends, Django and Node APIs behind them, and the Linux and Docker plumbing that keeps the whole route healthy. I care about the parts of a system nobody sees until they break.',
  goal:
    'Working on backend and infrastructure teams where reliability, clean interfaces and good instrumentation are the point — not an afterthought.',
  languages: [
    { name: 'Nepali', level: 'Native' },
    { name: 'English', level: 'Professional' },
    { name: 'Hindi', level: 'Conversational' },
  ],
  socials: {
    github: 'https://github.com/charitra',
    linkedin: 'https://linkedin.com/in/charitra',
  },
  resume: {
    file: '/resume.pdf',
    updated: '2026-07-18',
    size: '284 KB',
  },
  stats: {
    visitors: 1432,
    projects: 15,
    years: 5,
    technologies: 30,
    repos: 52,
  },
} as const
