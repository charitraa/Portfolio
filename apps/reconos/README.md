# ReconOS

A developer portfolio that behaves like a security operations console: persistent tabs, a
working command bar, a resizable log panel, and views that present themselves as HTTP
responses. Inspired by the *workflow* of tools like Burp Suite, Wireshark and VS Code —
its own branding, its own layout.

```bash
npm install
npm run dev      # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typecheck, then production build to `dist/` |
| `npm run preview` | Serve the built output locally |
| `npm test` | Smoke tests — every view must mount with no console errors |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` | oxlint |

## Content

All personal content lives in three files. Nothing else needs editing to ship this.

| File | Holds |
| --- | --- |
| `src/data/profile.ts` | Name, role, bio, socials, dashboard counters, system gauges |
| `src/data/projects.ts` | Project case studies — overview, architecture, challenges, lessons |
| `src/data/skills.ts` | Skills, tech stack, services, experience, certifications, achievements |

The data currently in those files was pulled from public sources on **2026-08-03**: the
GitHub REST API (`/users/charitraa` and its repositories) and the profile README. LinkedIn
returns HTTP 999 to non-browser clients and could not be read; `charitrashrestha.com.np`
is a client-rendered SPA whose backend (`charitraa.pythonanywhere.com`) is returning 404,
so nothing was recoverable from either.

### Still to do

Search the data files for `TODO` — every one marks something no public source could
confirm. Nothing there is a guess dressed up as fact:

1. **Project challenges and lessons** are empty for all 11 projects. These are the sections
   interviewers actually read, and they only work in your own voice. The detail view shows
   a prompt until you write them.
2. **Certifications and achievements** are empty arrays; both views render a "204 No
   Content" placeholder until you add rows.
3. **Experience dates** are `—`. The YakshaSoft role and the Bedfordshire degree are real
   (both from your GitHub profile) but no start/end dates were published anywhere.
4. **Skill percentages** are self-assessments seeded from your repo language mix. Adjust
   every one to what you'd defend in an interview.
5. **Resume**: drop your real CV at `public/resume.pdf` (a placeholder is committed so the
   download button works) and correct `profile.resume.size`.
6. **Contact form** posts nowhere — see the marked `setTimeout` in `src/views/Contact.tsx`.
   Your site already uses Web3Forms (`api.web3forms.com/submit`), which drops straight in.

Verified as accurate: name, role, employer, degree, location, email, all social URLs, the
75-repo count, the language distribution donut, every repository link, and the two demo
links that returned HTTP 200 (VideoMaster and the Construction Management System). The
`constructions.pythonanywhere.com` API demo returned 400 and was left out.

## Layout

```
Toolbar          brand · status · command search · clock · theme · notifications · socials
─────────────────────────────────────────────────────────────────────────────────────────
Sidebar   │  Tab bar
          │  Workspace  (the active view)
          │
          │  Console     resizable, accepts commands — type `help`
─────────────────────────────────────────────────────────────────────────────────────────
Status bar       branch · findings · TLS · last log line · view · latency · clock
```

Tabs open as you navigate and can be closed individually (or with middle-click). Filter and
sort state on the Projects table lives in the store, so switching tabs never loses it.

## Keyboard

| Keys | Action |
| --- | --- |
| `Ctrl` `K` | Command palette — views, projects and actions |
| `Ctrl` `D` / `P` / `T` / `R` | Dashboard · Projects · Tech Stack · Resume |
| `Ctrl` `M` | Toggle the console |
| `↑` `↓` | Console command history |
| `Esc` | Close the palette |

Console commands: `help`, `ls`, `open <view>`, `whoami`, `projects`, `scan`, `contact`,
`theme`, `clear`.

## Architecture notes

- **State** — one Zustand store (`src/store/app.ts`). Settings and open tabs persist to
  `localStorage`; logs, toasts and transient UI flags deliberately do not.
- **Theming** — raw colours are `--rc-*` custom properties swapped by a `data-theme`
  attribute on `<html>`; Tailwind tokens in `@theme` point at them, so one attribute flip
  recolours every utility class. Dark and light are both fully supported, plus four accent
  choices and a compact density mode.
- **Code splitting** — every view is lazy-loaded behind a skeleton, and the Recharts charts
  are split out again inside the dashboard so the shell paints before the chart bundle
  lands. Icons resolve through an explicit map (`src/icons.ts`) rather than a namespace
  import, which keeps the whole Lucide library out of the bundle.
- **Motion** — Framer Motion throughout, with a global `prefers-reduced-motion` override in
  CSS and an animations toggle in Settings.
- **The `/target` view** computes its "scan" entirely from the local data files. It makes no
  network requests and probes nothing.

## Deploying

Any static host works — the output is `dist/`. Because this is a client-routed SPA, the host
must rewrite unknown paths to `index.html`; `vercel.json` and `public/_redirects` are
included for Vercel and Netlify respectively.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · Zustand · Framer Motion ·
Recharts · Lucide · Vitest
