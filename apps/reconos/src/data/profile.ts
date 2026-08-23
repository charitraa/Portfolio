/**
 * ─────────────────────────────────────────────────────────────────────────
 *  Sourced from github.com/charitraa (profile + README) and
 *  charitrashrestha.com.np, August 2026.
 *
 *  Anything marked TODO could not be verified from a public source — fill it
 *  in yourself rather than leaving a guess on your portfolio.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const profile = {
  handle: 'ReconOS',
  name: 'Charitra Shrestha',
  role: 'Full-Stack Software Developer',
  university: 'BSc (Hons) Computer Science & Software Engineering — University of Bedfordshire',
  location: 'Kathmandu, Nepal',
  email: 'code@charitrashrestha.com.np',
  availability: 'Open to opportunities',
  languages: ['English', 'Nepali'],
  interests: ['Full-Stack Development', 'Web Security', 'Mobile Apps', 'Football', 'Music'],
  careerGoal:
    'Build web and mobile products end to end — and understand their security well enough to break them first.',
  bio: 'Computer Science graduate and Junior Software Developer at YakshaSoft, building web and mobile applications. Currently focused on full-stack development and web security. 75 public repositories and counting.',
  socials: {
    github: 'https://github.com/charitraa',
    linkedin: 'https://www.linkedin.com/in/charitra-shrestha-78245b270/',
    x: 'https://x.com/ROYALXGAMER9',
    website: 'https://www.charitrashrestha.com.np/',
    devto: 'https://dev.to/charitraa',
    leetcode: 'https://leetcode.com/charitraa/',
  },
  resume: {
    file: 'resume.pdf',
    // TODO: drop your real CV at public/resume.pdf and correct these two fields.
    size: '— KB',
    updated: 'Aug 2026',
    url: '/resume.pdf',
  },
} as const

/** Counts verified against the GitHub API on 2026-08-03. */
export const dashboardStats = [
  { label: 'Repositories', value: 75, accent: 'blue' },
  { label: 'Featured Projects', value: 11, accent: 'orange' },
  { label: 'Years Coding', value: 4, accent: 'purple' },
  { label: 'Technologies', value: 40, accent: 'green' },
  { label: 'Coffee', value: '∞', accent: 'yellow' },
] as const

/**
 * The "system resources" gauges. These are self-assessments, not measurements —
 * adjust them to whatever you'd actually claim in an interview.
 */
export const systemVitals = [
  { label: 'Full-Stack', sub: 'CPU', value: 90, color: 'blue' },
  { label: 'Backend / Django', sub: 'MEM', value: 92, color: 'purple' },
  { label: 'Mobile / Flutter', sub: 'NET', value: 80, color: 'orange' },
  { label: 'Web Security', sub: 'SEC', value: 72, color: 'green' },
] as const

/** Seeds the activity feed; the store appends live events on top of these. */
export const seedActivity = [
  { time: '-4m', text: 'Session established from 192.168.1.24', kind: 'info' },
  { time: '-3m', text: 'Loaded project index (11 records)', kind: 'ok' },
  { time: '-2m', text: 'Integrity check passed — 0 findings', kind: 'ok' },
  { time: '-1m', text: 'Resume artifact cached', kind: 'info' },
] as const

export const contributionWeeks = 26
