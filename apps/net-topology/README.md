# NET://CHARITRA — Internet Infrastructure Portfolio

An interactive portfolio built as a network topology. The visitor is a packet:
they arrive at the ISP edge, get resolved by DNS, pass the firewall, hit the
load balancer and end up at the database — and each device on the map is a
section of the portfolio.

| Device | Section |
| --- | --- |
| ISP / edge | Home |
| DNS resolver | Identity |
| Core router | About |
| Firewall | Skills (allow rules + bandwidth bars) |
| Load balancer | Projects (each project is a backend server) |
| API gateway | Services (as routes) |
| Application server | Experience (timeline) |
| Database | Education, certificates, awards |
| Object storage | Résumé download |
| SMTP relay | Contact |

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production bundle into dist/
npm run preview    # serve the built bundle
npm run typecheck  # tsc only
```

## Make it yours

All content lives in `src/data/` — no component edits needed:

- `profile.ts` — name, title, location, socials, dashboard counters, résumé metadata
- `projects.ts` — the backend pool: stack, architecture, challenges, lessons, repo links
- `skills.ts` — firewall allow/deny rules, proficiency levels, language mix for the donut
- `experience.ts` — timeline entries, education, certificates, awards, per-year bar chart
- `services.ts` — API gateway routes
- `topology.ts` — the map itself: which devices exist, where they sit, how they are wired

Then replace `public/resume.pdf` with your real résumé (the shipped file is a
placeholder) and `public/favicon.svg` if you want a different mark.

## Behaviour worth knowing

- **Deep links.** Every panel has a URL: `#projects`, `#skills`, `#experience`,
  `#services`, `#education`, `#resume`, `#contact`, `#about`, `#identity`,
  `#dashboard`, `#settings`. The address bar tracks whatever is open.
- **Command palette.** `Ctrl`/`⌘` + `K` searches nodes, projects and services.
  `Esc` closes the palette, then the panel.
- **Themes.** Dark NOC (default), Cloud (light) and Blueprint, in the navbar or
  in Settings. The choice is stored in `localStorage`.
- **Motion.** Defaults to your system `prefers-reduced-motion` setting and can be
  overridden in Settings. With motion off there are no packets, no boot sequence,
  no live telemetry and no counters.
- **Mobile.** Below 768px the map becomes a vertical stack and panels open as a
  draggable bottom sheet.
- **The contact form has no server.** It simulates the request, then hands the
  message to the visitor's mail client via `mailto:`. Point it at a real endpoint
  in `src/components/panels/ContactPanel.tsx` if you want submissions.
- Telemetry (ping, CPU, bandwidth, visitor count, contribution heatmap) is
  simulated for atmosphere. Swap in the GitHub API or real analytics if you want
  the numbers to mean something.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · `@xyflow/react` (React Flow) ·
Framer Motion · lucide-react. Charts are hand-rolled SVG — no charting
dependency.
