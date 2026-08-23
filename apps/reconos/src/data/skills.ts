import type { Achievement, Certification, ExperienceItem, Service, SkillGroup, StackCategory } from './types'

/**
 * Technologies come from the "Languages and Tools" section of the
 * github.com/charitraa profile README plus the stacks actually used across the
 * public repositories.
 *
 * The percentage levels are SELF-ASSESSMENTS — no public source can measure
 * them. They're seeded from how much each technology shows up in your repos;
 * adjust every one of them to what you'd defend in an interview.
 */
export const skillGroups: SkillGroup[] = [
  {
    category: 'Languages',
    items: [
      { name: 'Python', level: 90, note: 'Most-used language across repos' },
      { name: 'TypeScript', level: 85, note: 'Primary frontend language' },
      { name: 'JavaScript', level: 85 },
      { name: 'Dart', level: 78, note: 'Flutter apps' },
      { name: 'Java', level: 60 },
      { name: 'Kotlin', level: 55, note: 'Android + KMP' },
      { name: 'PHP', level: 50 },
      { name: 'C / C#', level: 50, note: 'Coursework' },
    ],
  },
  {
    category: 'Frontend',
    items: [
      { name: 'React', level: 88 },
      { name: 'HTML5 / CSS3', level: 92 },
      { name: 'TypeScript', level: 85 },
      { name: 'Bootstrap', level: 78 },
      { name: 'Vite', level: 72 },
    ],
  },
  {
    category: 'Backend',
    items: [
      { name: 'Django', level: 92, note: 'Backend of choice' },
      { name: 'Django REST Framework', level: 90 },
      { name: 'Node.js / Express', level: 70 },
      { name: 'JWT / Auth', level: 80 },
      { name: 'REST API design', level: 85 },
    ],
  },
  {
    category: 'Mobile',
    items: [
      { name: 'Flutter', level: 82 },
      { name: 'Dart', level: 78 },
      { name: 'Android SDK', level: 65 },
      { name: 'Kotlin Multiplatform', level: 50 },
    ],
  },
  {
    category: 'Security & Tools',
    items: [
      { name: 'Web security', level: 70, note: 'Current focus area' },
      { name: 'Kali Linux', level: 65 },
      { name: 'Git / GitHub', level: 88 },
      { name: 'Linux', level: 75 },
    ],
  },
  {
    category: 'Data & AI',
    items: [
      { name: 'MySQL', level: 78 },
      { name: 'SQLite', level: 80 },
      { name: 'MongoDB', level: 68 },
      { name: 'Deep Learning', level: 65, note: 'Vision models in Django services' },
      { name: 'LLM integration', level: 72, note: 'Gemini in suggit & DjangoProbe' },
    ],
  },
]

/** Feeds the radar chart on the Skills view. Self-assessed — adjust freely. */
export const competencyRadar = [
  { axis: 'Frontend', value: 86 },
  { axis: 'Backend', value: 92 },
  { axis: 'Mobile', value: 80 },
  { axis: 'Security', value: 70 },
  { axis: 'AI / ML', value: 68 },
  { axis: 'DevOps', value: 62 },
]

/**
 * Real distribution: primary language of the 73 non-forked public repos with a
 * detected language, GitHub API, 2026-08-03.
 */
export const languageUsage = [
  { name: 'Python', value: 33, color: '#4caf50' },
  { name: 'HTML', value: 22, color: '#f57c00' },
  { name: 'JavaScript', value: 16, color: '#ffca28' },
  { name: 'TypeScript', value: 11, color: '#007acc' },
  { name: 'Dart', value: 4, color: '#7e57c2' },
  { name: 'Other', value: 14, color: '#8b8b8b' },
]

export const stackCategories: StackCategory[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    icon: 'Layout',
    blurb: 'Interfaces built with React and plain web fundamentals.',
    items: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Bootstrap', 'Vite'],
  },
  {
    id: 'backend',
    name: 'Backend',
    icon: 'Server',
    blurb: 'Django is home; Node when the project calls for it.',
    items: ['Django', 'Django REST Framework', 'Node.js', 'Express.js', 'PHP', 'REST APIs', 'JWT'],
  },
  {
    id: 'mobile',
    name: 'Mobile',
    icon: 'Smartphone',
    blurb: 'Cross-platform apps, plus native Android where needed.',
    items: ['Flutter', 'Dart', 'Kotlin', 'Kotlin Multiplatform', 'Android SDK'],
  },
  {
    id: 'database',
    name: 'Database',
    icon: 'Database',
    blurb: 'Relational by default, document stores when they fit.',
    items: ['MySQL', 'SQLite', 'MongoDB'],
  },
  {
    id: 'cloud',
    name: 'Deployment',
    icon: 'Cloud',
    blurb: 'Where the projects actually run.',
    items: ['Netlify', 'PythonAnywhere', 'GitHub Pages', 'WordPress'],
  },
  {
    id: 'devops',
    name: 'Tools',
    icon: 'GitBranch',
    blurb: 'The daily driver set.',
    items: ['Git', 'GitHub', 'VS Code', 'Linux', 'Postman'],
  },
  {
    id: 'security',
    name: 'Cybersecurity',
    icon: 'ShieldCheck',
    blurb: 'Current focus: understanding web apps well enough to break them.',
    items: ['Kali Linux', 'Web application security', 'Authentication & sessions', 'OWASP Top 10'],
  },
  {
    id: 'ai',
    name: 'AI',
    icon: 'BrainCircuit',
    blurb: 'Models wired into real products, not demos.',
    items: ['Google Gemini API', 'Deep Learning', 'Computer Vision', 'Speech Recognition', 'NLP'],
  },
]

/**
 * TODO: these describe what you *could* offer based on what your repositories
 * demonstrate — they are not sourced from anything you've published. Edit the
 * wording, or delete the Services view from src/nav.ts if you'd rather not
 * advertise freelance work.
 */
export const services: Service[] = [
  {
    id: 'web',
    title: 'Web Development',
    icon: 'Globe',
    blurb: 'Full-stack web applications from empty repo to live URL.',
    bullets: ['React + TypeScript frontends', 'Django REST backends', 'Responsive layouts', 'Deployed and handed over'],
  },
  {
    id: 'mobile',
    title: 'Mobile Apps',
    icon: 'Smartphone',
    blurb: 'Cross-platform Flutter apps for Android and iOS.',
    bullets: ['Single Flutter codebase', 'Native Android integrations', 'Offline-capable storage', 'Play Store ready'],
  },
  {
    id: 'api',
    title: 'Backend & APIs',
    icon: 'Server',
    blurb: 'Django REST services designed to be maintained, not just shipped.',
    bullets: ['Django / DRF', 'JWT authentication', 'Documented endpoints', 'Admin tooling included'],
  },
  {
    id: 'ai',
    title: 'AI Integration',
    icon: 'Sparkles',
    blurb: 'LLM and vision models wired into working products.',
    bullets: ['Google Gemini integration', 'Image classification services', 'Graceful offline fallbacks', 'Cost-aware design'],
  },
  {
    id: 'cloud',
    title: 'Deployment',
    icon: 'CloudUpload',
    blurb: 'Getting it online and keeping it there.',
    bullets: ['Netlify and PythonAnywhere', 'Environment configuration', 'Custom domains and HTTPS', 'Post-launch fixes'],
  },
  {
    id: 'audit',
    title: 'Security Review',
    icon: 'ShieldCheck',
    blurb: 'Authorised review of your web application.',
    bullets: ['OWASP Top 10 sweep', 'Auth and session review', 'Dependency audit', 'Written remediation notes'],
  },
]

/**
 * TODO: dates and bullet points could not be verified from any public source.
 * Replace every "—" and every TODO line with the real detail.
 */
export const experience: ExperienceItem[] = [
  {
    role: 'Junior Software Developer',
    org: 'YakshaSoft',
    period: '— present',
    location: 'Kathmandu, Nepal',
    current: true,
    points: [
      'Building web and mobile applications.',
      'TODO: add two or three concrete outcomes — what you shipped, and what changed because of it.',
    ],
    tags: ['Django', 'React', 'Flutter', 'TypeScript'],
  },
  {
    role: 'BSc (Hons) Computer Science & Software Engineering',
    org: 'University of Bedfordshire',
    period: '— graduated',
    location: 'Study programme',
    points: [
      'Graduated with a BSc (Hons) in Computer Science and Software Engineering.',
      'Final-year research on real-time English ↔ Nepali bidirectional speech translation.',
      'TODO: add your classification and any modules worth highlighting.',
    ],
    tags: ['Computer Science', 'Software Engineering', 'Research'],
  },
  {
    role: 'Open Source & Personal Projects',
    org: 'github.com/charitraa',
    period: '2022 — present',
    location: 'Remote',
    points: [
      '75 public repositories spanning web, mobile, backend and machine learning.',
      'Developer tooling published for others to use, including suggit and DjangoProbe.',
      'Active since December 2022.',
    ],
    tags: ['Python', 'TypeScript', 'Dart', 'Open Source'],
  },
]

/**
 * TODO: empty because no certifications could be verified from a public source.
 * Add your own — the table renders as soon as there's a row, and the
 * Certifications view shows a placeholder while this list is empty.
 */
export const certifications: Certification[] = []

/** TODO: same as above — add awards, competitions, talks or disclosures. */
export const achievements: Achievement[] = []
