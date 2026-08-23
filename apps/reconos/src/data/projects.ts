import type { Project } from './types'

/**
 * Every field below comes from the public GitHub repositories at
 * github.com/charitraa — descriptions, languages and links were read from the
 * API on 2026-08-03. Only demo URLs that returned HTTP 200 are included.
 *
 * `challenges` and `lessons` are intentionally empty: those are your words, and
 * inventing them would put claims on your portfolio that you never made. The
 * detail view shows a short prompt wherever they're missing, so fill in the
 * ones that matter and delete the rest.
 *
 * `status` is inferred from recent push activity — correct anything that's wrong.
 */
export const projects: Project[] = [
  {
    id: 'hisab',
    name: 'Hisab',
    tagline: 'Expense tracker that reads your bank and wallet SMS automatically',
    status: 'In Progress',
    language: 'Dart',
    framework: 'Flutter + Django REST',
    year: '2026',
    repo: 'https://github.com/charitraa/Hisab',
    featured: true,
    accent: 'green',
    overview:
      'Hisab combines manual transaction entry with automatic SMS-based capture from eSewa, Khalti and major Nepali bank alerts (NIC Asia, NMB, Global IME, Nabil and others), so every Rupee gets tracked without typing it in. The Flutter client is paired with a Django REST Framework backend in a separate repository.',
    architecture: [
      'Flutter mobile client for Android',
      'Django REST Framework backend (charitraa/Hisab_Server)',
      'JWT authentication keyed on phone numbers',
      'SMS-driven transaction parsing and categorisation',
      'Budgets with threshold alerts',
    ],
    stack: ['Flutter', 'Dart', 'Django', 'DRF', 'JWT', 'SQLite'],
    challenges: [],
    lessons: [],
    metrics: [
      { label: 'Wallets parsed', value: 'eSewa · Khalti' },
      { label: 'Banks covered', value: '4+' },
    ],
  },
  {
    id: 'construction-management',
    name: 'Construction Management System',
    tagline: 'Full-stack platform for projects, employees, attendance and payroll',
    status: 'Completed',
    language: 'TypeScript',
    framework: 'React 18 + Django REST',
    year: '2026',
    repo: 'https://github.com/charitraa/construction_management_system',
    demo: 'https://constructionmanagementsystem.netlify.app/login',
    featured: true,
    accent: 'orange',
    overview:
      'A modern, full-stack construction management system built with React 18, TypeScript and Express.js, featuring comprehensive project management, employee tracking, payroll processing and real-time analytics. The REST API server is a separate Django + DRF application covering employees, projects and attendance.',
    architecture: [
      'React 18 + TypeScript frontend deployed on Netlify',
      'Express.js layer alongside the client',
      'Django + Django REST Framework API server (charitraa/construction_management_server)',
      'Modules for employees, projects, attendance and payroll',
      'Real-time analytics views',
    ],
    stack: ['React 18', 'TypeScript', 'Express.js', 'Django', 'DRF', 'Netlify'],
    challenges: [],
    lessons: [],
  },
  {
    id: 'video-master',
    name: 'VideoMaster',
    tagline: 'One downloader for six social platforms',
    status: 'Maintained',
    language: 'TypeScript',
    framework: 'Web app',
    year: '2026',
    repo: 'https://github.com/charitraa/All-in-One-Video-Downloader',
    demo: 'https://video-master.netlify.app',
    featured: true,
    accent: 'red',
    overview:
      'A user-friendly web application that downloads videos from multiple social media platforms — YouTube, TikTok, Instagram, Twitter (X), Facebook and Reddit — behind a single interface.',
    architecture: [
      'TypeScript web client deployed on Netlify',
      'Per-platform extraction handlers behind one shared interface',
    ],
    stack: ['TypeScript', 'React', 'Netlify'],
    challenges: [],
    lessons: [],
    metrics: [
      { label: 'Platforms', value: '6' },
      { label: 'Status', value: 'Live' },
    ],
  },
  {
    id: 'speech-translation',
    name: 'English ↔ Nepali Speech Translation',
    tagline: 'Real-time, end-to-end bidirectional speech-to-speech translation',
    status: 'Completed',
    language: 'Python',
    framework: 'Deep Learning',
    year: '2026',
    repo: 'https://github.com/charitraa/Real-Time-English-Nepali-Bidirection-Speech-Translation',
    accent: 'purple',
    overview:
      'A real-time, end-to-end speech-to-speech translation system designed for English ↔ Nepali communication, combining state-of-the-art speech and translation models. The accompanying research write-up lives in a separate repository.',
    architecture: [
      'Speech recognition → machine translation → speech synthesis pipeline',
      'Bidirectional: English → Nepali and Nepali → English',
      'Research documentation in charitraa/Research-on-Real-time-english-nepali-bidirectional-speech-translation',
    ],
    stack: ['Python', 'Deep Learning', 'Speech Recognition', 'NLP'],
    challenges: [],
    lessons: [],
  },
  {
    id: 'djangoprobe',
    name: 'DjangoProbe',
    tagline: 'AI-powered test runner that discovers your Django endpoints for you',
    status: 'Maintained',
    language: 'Python',
    framework: 'Django',
    year: '2026',
    repo: 'https://github.com/charitraa/DjangoProbe',
    accent: 'blue',
    overview:
      'An AI-powered Django API test runner that automatically discovers endpoints, generates intelligent test cases and executes them with detailed reporting — aimed at the gap between "the API exists" and "the API is tested".',
    architecture: [
      'Endpoint discovery by introspecting Django URL configuration',
      'AI-generated test cases per discovered route',
      'Execution layer with detailed pass/fail reporting',
    ],
    stack: ['Python', 'Django', 'DRF', 'AI / LLM'],
    challenges: [],
    lessons: [],
  },
  {
    id: 'suggit',
    name: 'suggit',
    tagline: 'Git commit messages suggested before you start typing',
    status: 'Maintained',
    language: 'Python',
    framework: 'CLI',
    year: '2026',
    repo: 'https://github.com/charitraa/suggit',
    accent: 'yellow',
    overview:
      'A smart git commit message suggester with pre-filled autocomplete. It tries Google Gemini first — free, no credit card — and falls back to a local engine when the AI is unavailable, so it works completely offline too.',
    architecture: [
      'CLI wrapping the git staging area',
      'Google Gemini as the primary suggestion source',
      'Local heuristic engine as an offline fallback',
      'Pre-filled autocomplete rather than a blank prompt',
    ],
    stack: ['Python', 'Google Gemini API', 'Git'],
    challenges: [],
    lessons: [],
  },
  {
    id: 'mindful-blog',
    name: 'Mindful Blog',
    tagline: 'Full-stack blogging platform with rich text and comments',
    status: 'Completed',
    language: 'TypeScript',
    framework: 'React + Django',
    year: '2026',
    repo: 'https://github.com/charitraa/Mindful_Blog',
    accent: 'green',
    overview:
      'A modern web application for creating, managing and reading blogs, with a robust Django backend and a React + TypeScript frontend. Users can create, edit and share articles with rich text support, comments and session handling.',
    architecture: [
      'React + TypeScript frontend',
      'Django backend API (charitraa/Blog_Server)',
      'Rich text authoring with comment threads',
      'Session-based user management',
    ],
    stack: ['React', 'TypeScript', 'Django', 'DRF'],
    challenges: [],
    lessons: [],
  },
  {
    id: 'heart-game',
    name: 'Heart Game',
    tagline: 'Real-time multiplayer card game with an authenticated API',
    status: 'Completed',
    language: 'TypeScript',
    framework: 'React + Vite / DRF',
    year: '2025',
    repo: 'https://github.com/charitraa/HeartGame',
    accent: 'red',
    overview:
      'A real-time multiplayer card game built with React, TypeScript and Vite, connected to the HeartServer Django REST API for secure authentication, game session management and live gameplay.',
    architecture: [
      'React + TypeScript + Vite client',
      'Django REST Framework backend (charitraa/HeartServer)',
      'Secure user authentication and session management',
      'Server-side gameplay logic and scoring',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Django', 'DRF'],
    challenges: [],
    lessons: [],
  },
  {
    id: 'library-management',
    name: 'Library Management System',
    tagline: 'Catalogue and circulation management',
    status: 'In Progress',
    language: 'TypeScript',
    framework: 'Web app',
    year: '2026',
    repo: 'https://github.com/charitraa/Library_Management_System',
    accent: 'blue',
    overview:
      'A library management system covering catalogue and circulation workflows. TODO: expand this from the repository README — the GitHub description is currently just the project name.',
    architecture: ['TypeScript web application'],
    stack: ['TypeScript'],
    challenges: [],
    lessons: [],
  },
  {
    id: 'nextspace',
    name: 'NextSpace',
    tagline: 'Discover, book and manage coworking spaces',
    status: 'Completed',
    language: 'Dart',
    framework: 'Flutter',
    year: '2025',
    repo: 'https://github.com/charitraa/NextSpace',
    accent: 'purple',
    overview:
      'A mobile application for discovering, booking and managing coworking spaces, giving users a seamless way to find spaces, book them and communicate with space owners.',
    architecture: [
      'Flutter mobile client',
      'Space discovery and booking flows',
      'Messaging between users and space owners',
    ],
    stack: ['Flutter', 'Dart'],
    challenges: [],
    lessons: [],
  },
  {
    id: 'plant-care',
    name: 'PlantCare',
    tagline: 'Identify a houseplant from a photo, then get a watering schedule',
    status: 'Completed',
    language: 'Python',
    framework: 'Django + Deep Learning',
    year: '2025',
    repo: 'https://github.com/charitraa/Plant_Care_Server',
    accent: 'green',
    overview:
      'An intelligent mobile application combining deep learning with Django: upload a photo, get the plant identified, and have a personalised watering schedule managed for you. Part of a set of vision-model backends alongside skin cancer and hairfall detection servers.',
    architecture: [
      'Django backend serving an image classification model',
      'Photo upload → species identification → schedule generation',
      'Personalised watering reminders per identified plant',
    ],
    stack: ['Python', 'Django', 'Deep Learning', 'Computer Vision'],
    challenges: [],
    lessons: [],
  },
]

export const projectById = (id: string) => projects.find((p) => p.id === id)
