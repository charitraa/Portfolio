export type ProjectStatus = 'Completed' | 'In Progress' | 'Maintained' | 'Archived'

export interface Project {
  id: string
  name: string
  tagline: string
  status: ProjectStatus
  language: string
  framework: string
  year: string
  repo?: string
  demo?: string
  featured?: boolean
  overview: string
  architecture: string[]
  stack: string[]
  /** Write these yourself — the detail view shows a prompt while they're empty. */
  challenges: { title: string; body: string }[]
  lessons: string[]
  metrics?: { label: string; value: string }[]
  /** Accent used by the detail panel header. Any token color name. */
  accent?: 'blue' | 'orange' | 'green' | 'purple' | 'yellow' | 'red'
}

export interface SkillGroup {
  category: string
  items: { name: string; level: number; note?: string }[]
}

export interface StackCategory {
  id: string
  name: string
  icon: string
  blurb: string
  items: string[]
}

export interface Service {
  id: string
  title: string
  blurb: string
  bullets: string[]
  icon: string
}

export interface ExperienceItem {
  role: string
  org: string
  period: string
  location: string
  current?: boolean
  points: string[]
  tags: string[]
}

export interface Certification {
  name: string
  issuer: string
  date: string
  credential?: string
  status: 'Verified' | 'In Progress'
}

export interface Achievement {
  title: string
  detail: string
  date: string
  kind: 'award' | 'ctf' | 'oss' | 'talk'
}
