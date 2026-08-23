/* ============================================================
   data.js — ALL PORTFOLIO CONTENT LIVES HERE.
   Edit this file to update the site. Nothing else needs to change.

   Value flags:  ok   -> green      err  -> red
                 dim  -> gray       plain-> white
                 (default)          -> yellow
   ============================================================ */

const BIOS = {

  /* ---------- identity ---------------------------------- */
  owner: {
    name:      "Charitra Shrestha",
    role:      "Software Engineer",
    location:  "Nepal",
    status:    "Available for work",
    version:   "2.1",
    bootYear:  "2026",
    email:     "charitra@example.com",          // TODO: real address
    github:    "https://github.com/charitra",    // TODO: real handle
    linkedin:  "https://linkedin.com/in/charitra", // TODO: real handle
    resume:    "assets/resume.pdf",              // TODO: drop your PDF here
    tagline:   "Building useful software."
  },

  /* ---------- MAIN -------------------------------------- */
  main: {
    help: "Overview of the detected developer system. Values on this page are read-only.",
    rows: [
      { label: "System Name",        value: "Charitra Shrestha" },
      { label: "Role",               value: "Software Engineer" },
      { label: "Location",           value: "Nepal" },
      { label: "Status",             value: "Available",           flag: "ok" },
      { label: "Portfolio Version",  value: "2.1" },
      { label: "System Time",        value: "",  live: "clock" },
      { label: "System Uptime",      value: "",  live: "uptime" },
      { label: "Boot Year",          value: "2026" },
      { label: "University",         value: "Bedfordshire" },
      { label: "Installed Modules",  value: "4 detected",          flag: "plain" },
      { label: "Skills Database",    value: "Ready",               flag: "ok" },
      { label: "Portfolio Interface",value: "Online",              flag: "ok" }
    ]
  },

  /* ---------- ABOUT ------------------------------------- */
  about: {
    help: "Developer information block. Read-only firmware description of the operator.",
    rows: [
      { label: "Name",           value: "Charitra" },
      { label: "Current Status", value: "Learning" },
      { label: "Focus",          value: "Full Stack Development" },
      { label: "Primary Stack",  value: "Python / React / Flutter" },
      { label: "Mission",        value: "Building useful software.", flag: "plain" }
    ],
    interests: ["Cyber Security", "AI", "Mobile Apps", "Backend", "Linux", "Systems"],
    bio: [
      "Computer science undergraduate at the University of Bedfordshire, building "
      + "full stack products end to end — backend services, web frontends and mobile apps.",
      "Most of what I know came from shipping things: an ad marketplace, a library "
      + "management system, a speech translator. I care about software that people "
      + "actually run, not demos."
    ]
  },

  /* ---------- PROJECTS ---------------------------------- */
  projects: {
    help: "Installed modules. Press ENTER on a module to view its device details.",
    items: [
      {
        id: "adsmitra",
        name: "AdsMitra",
        status: "Enabled",
        summary: "Advertising marketplace connecting local businesses with ad space owners.",
        stack: ["React", "Django REST", "PostgreSQL", "Docker", "AWS"],
        github: "https://github.com/charitra/adsmitra",   // TODO
        demo:   "",                                        // TODO or leave blank
        features: [
          "Listing and booking flow for physical and digital ad slots",
          "Role-based dashboards for advertisers and space owners",
          "Availability calendar with conflict detection",
          "Payment record keeping and invoice export"
        ],
        architecture:
          "React SPA talks to a Django REST API over JWT. PostgreSQL holds listings, "
          + "bookings and users. Media goes to object storage; the whole stack runs in "
          + "Docker Compose locally and on a single AWS EC2 host in production.",
        lessons:
          "Modelling availability was the hard part — overlapping bookings need database "
          + "level constraints, not application checks. Moving that rule into Postgres "
          + "removed an entire class of bug.",
        shots: []   // e.g. ["assets/img/adsmitra-1.png"]
      },
      {
        id: "library",
        name: "Library System",
        status: "Enabled",
        summary: "Library management system for issuing, returning and tracking books.",
        stack: ["Python", "Django", "MySQL", "Bootstrap"],
        github: "https://github.com/charitra/library-system",  // TODO
        demo:   "",
        features: [
          "Catalogue search with ISBN lookup",
          "Issue / return workflow with due dates and fines",
          "Member management and borrowing history",
          "Librarian reporting dashboard"
        ],
        architecture:
          "Server-rendered Django app. Domain split into catalogue, members and "
          + "circulation apps so lending rules stay isolated from the catalogue.",
        lessons:
          "Server-rendered pages were the right call — the whole thing shipped faster "
          + "than an SPA would have, and librarians never noticed the difference.",
        shots: []
      },
      {
        id: "speech",
        name: "Speech Translator",
        status: "Enabled",
        summary: "Real-time speech-to-speech translation on mobile.",
        stack: ["Flutter", "Dart", "Firebase", "Speech API"],
        github: "https://github.com/charitra/speech-translator",  // TODO
        demo:   "",
        features: [
          "Live speech recognition with language auto-detect",
          "Translation plus text-to-speech playback",
          "Offline phrasebook for saved translations",
          "Conversation mode with two-way turn taking"
        ],
        architecture:
          "Flutter client streams audio to the recognition service, pipes the transcript "
          + "through translation, then synthesises speech locally. Firebase stores saved "
          + "phrases and syncs them across devices.",
        lessons:
          "Streaming audio makes latency visible. Chunking the stream and showing partial "
          + "transcripts made a 2s round trip feel instant.",
        shots: []
      },
      {
        id: "nextspace",
        name: "NextSpace",
        status: "Enabled",
        summary: "Workspace and room booking platform with live availability.",
        stack: ["Next.js", "Node", "PostgreSQL", "Firebase Auth"],
        github: "https://github.com/charitra/nextspace",  // TODO
        demo:   "",
        features: [
          "Live availability grid across rooms and time slots",
          "Instant booking with confirmation email",
          "Admin panel for spaces, pricing and blackout dates",
          "Usage analytics per space"
        ],
        architecture:
          "Next.js with server components for the availability grid, a Node API for "
          + "mutations, Postgres for state and Firebase for authentication.",
        lessons:
          "Server components removed most of my client-side data fetching. Less state "
          + "in the browser meant far fewer edge cases.",
        shots: []
      }
    ]
  },

  /* ---------- SKILLS ------------------------------------ */
  skills: {
    help: "System resource allocation. Percentages reflect self-assessed proficiency.",
    groups: [
      {
        title: "Languages",
        items: [
          { label: "Python",     level: 95 },
          { label: "JavaScript", level: 88 },
          { label: "Dart",       level: 85 },
          { label: "SQL",        level: 82 }
        ]
      },
      {
        title: "Frameworks",
        items: [
          { label: "React",   level: 90 },
          { label: "Flutter", level: 88 },
          { label: "Django",  level: 90 },
          { label: "Next.js", level: 80 }
        ]
      },
      {
        title: "Platform",
        items: [
          { label: "Linux",    level: 92 },
          { label: "Docker",   level: 84 },
          { label: "Firebase", level: 86 },
          { label: "Git",      level: 90 }
        ]
      }
    ]
  },

  /* ---------- SERVICES ---------------------------------- */
  services: {
    help: "Optional subsystems available for hire. All listed services are Enabled.",
    items: [
      { label: "Web Development",  value: "Enabled", flag: "ok", note: "Responsive marketing sites and full web applications." },
      { label: "Backend APIs",     value: "Enabled", flag: "ok", note: "REST APIs in Django or Node, with auth, tests and docs." },
      { label: "Mobile Apps",      value: "Enabled", flag: "ok", note: "Cross-platform apps in Flutter for Android and iOS." },
      { label: "UI Design",        value: "Enabled", flag: "ok", note: "Interface design and prototyping before implementation." },
      { label: "Cloud Deployment", value: "Enabled", flag: "ok", note: "Dockerised deploys to AWS or a VPS, with CI." },
      { label: "AI Integration",   value: "Enabled", flag: "ok", note: "LLM and speech features wired into existing products." }
    ]
  },

  /* ---------- TECH STACK -------------------------------- */
  stack: {
    help: "Detected devices grouped by bus. Read-only inventory of tools in active use.",
    groups: [
      { title: "CPU / Core",   items: ["Python", "JavaScript", "Dart"] },
      { title: "Frontend",     items: ["React", "Next.js", "Tailwind", "HTML/CSS"] },
      { title: "Backend",      items: ["Django", "Django REST", "Node", "Express"] },
      { title: "Database",     items: ["PostgreSQL", "MySQL", "SQLite"] },
      { title: "Cloud",        items: ["Firebase", "AWS EC2", "AWS S3", "Vercel"] },
      { title: "Tools",        items: ["Git", "Linux", "Docker", "Postman", "Figma"] }
    ]
  },

  /* ---------- EXPERIENCE -------------------------------- */
  experience: {
    help: "Boot history. Chronological log of the developer's runtime.",
    items: [
      { year: "2023", title: "Started Programming",
        body: "First lines of Python. Automation scripts, then small CLI tools. Learned Git and Linux the hard way." },
      { year: "2024", title: "Flutter / Mobile",
        body: "Moved into mobile with Flutter. Shipped the Speech Translator and started publishing work on GitHub." },
      { year: "2025", title: "Django / Backend",
        body: "Backend focus — Django, REST APIs, PostgreSQL, Docker. Built the Library System end to end." },
      { year: "2026", title: "Professional Projects",
        body: "Full stack production work: AdsMitra and NextSpace. Deployment, CI and code review as routine." }
    ]
  },

  /* ---------- EDUCATION --------------------------------- */
  education: {
    help: "Firmware training records.",
    rows: [
      { label: "University", value: "University of Bedfordshire" },
      { label: "Degree",     value: "BSc (Hons) Computer Science" },
      { label: "Status",     value: "In Progress", flag: "ok" },
      { label: "Expected",   value: "2027" },
      { label: "Location",   value: "United Kingdom" }
    ],
    coursework: ["Data Structures", "Algorithms", "Databases", "Networks", "Software Engineering", "Operating Systems"]
  },

  /* ---------- CERTIFICATIONS ---------------------------- */
  certificates: {
    help: "Installed credentials. Completed entries are verified; others are still running.",
    items: [
      { label: "Python",     value: "Completed",   flag: "ok",  note: "Core language, standard library and testing." },
      { label: "Flutter",    value: "Completed",   flag: "ok",  note: "Cross-platform mobile development." },
      { label: "Linux",      value: "Completed",   flag: "ok",  note: "Administration, shell and system fundamentals." },
      { label: "Networking", value: "In Progress", flag: "dim", note: "TCP/IP, routing and network security." }
    ]
  },

  /* ---------- RESUME ------------------------------------ */
  resume: {
    help: "Boot device configuration. Press ENTER on Download to fetch the résumé.",
    rows: [
      { label: "Boot Option",  value: "Resume.pdf" },
      { label: "Priority",     value: "1" },
      { label: "Format",       value: "PDF / A4" },
      { label: "Last Updated", value: "August 2026" },
      { label: "Status",       value: "Ready", flag: "ok" }
    ]
  },

  /* ---------- CONTACT ----------------------------------- */
  contact: {
    help: "Communication ports. Press ENTER on a port to open it.",
    rows: [
      { label: "Email",    value: "charitra@example.com",  action: "mailto" },
      { label: "GitHub",   value: "github.com/charitra",   action: "github" },
      { label: "LinkedIn", value: "in/charitra",           action: "linkedin" },
      { label: "Location", value: "Nepal (UTC+05:45)",     flag: "plain" }
    ]
  },

  /* ---------- HELP TEXT PER TAB ------------------------- */
  helpDefault: "Use ↑↓ to select an item and ←→ to change menu. ENTER executes, ESC goes back."
};

/* Résumé content used by the printable screen (F2 -> Print). */
const RESUME_PRINT = {
  summary:
    "Full stack developer building web and mobile products with Python, React and Flutter. "
    + "Comfortable across the stack from Postgres schema to deployed container.",
  sections: [
    {
      title: "Education",
      rows: [
        ["University of Bedfordshire", "BSc (Hons) Computer Science, expected 2027"]
      ]
    },
    {
      title: "Selected Projects",
      bullets: [
        "AdsMitra — advertising marketplace. React, Django REST, PostgreSQL, Docker, AWS.",
        "NextSpace — workspace booking platform with live availability. Next.js, Node, PostgreSQL.",
        "Library System — circulation and catalogue management. Django, MySQL.",
        "Speech Translator — real-time speech-to-speech translation. Flutter, Firebase."
      ]
    },
    {
      title: "Technical Skills",
      rows: [
        ["Languages", "Python, JavaScript, Dart, SQL"],
        ["Frameworks", "Django, React, Next.js, Flutter, Node"],
        ["Data", "PostgreSQL, MySQL, SQLite, Firebase"],
        ["Platform", "Linux, Docker, Git, AWS"]
      ]
    },
    {
      title: "Certifications",
      bullets: [
        "Python — Completed",
        "Flutter — Completed",
        "Linux — Completed",
        "Networking — In Progress"
      ]
    }
  ]
};
