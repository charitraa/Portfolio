# Portfolio Machines

Six developer-portfolio templates, each one built as a **machine** instead of a landing page —
a firmware setup screen, a motherboard, a network topology, a security console, a desktop OS,
and a printed manga volume.

They're meant to be taken. Every one keeps all of its content in one or two data files, so
turning a template into *your* portfolio is an edit, not a rewrite. MIT licensed, no attribution
required.

**▶ [Live demos — all six in one place](https://charitraa.github.io/portfolio-templates/)**

---

## The six

| | Template | What it is | Stack |
| --- | --- | --- | --- |
| 01 | **[Developer BIOS Utility](apps/bios)** · [demo](https://charitraa.github.io/portfolio-templates/bios/) | Visitors boot the machine, watch it detect a developer, then browse the résumé as if editing BIOS settings. Keyboard-driven. | Vanilla JS — **no build step** |
| 02 | **[CircuitOS](apps/circuitos)** · [demo](https://charitraa.github.io/portfolio-templates/circuitos/) | An interactive PCB that boots *you* instead of an OS. The CPU is the engineer; every other component is a section, wired with animated copper traces. | React 18, Tailwind v4, Framer Motion |
| 03 | **[NET://](apps/net-topology)** · [demo](https://charitraa.github.io/portfolio-templates/net-topology/) | The visitor is a packet — ISP edge, DNS, firewall, load balancer, database. Every device on the map is a section. | React 19, xyflow, Tailwind v4 |
| 04 | **[ReconOS](apps/reconos)** · [demo](https://charitraa.github.io/portfolio-templates/reconos/) | A security operations console: persistent tabs, a working command bar, a resizable log panel, views that present as HTTP responses. | React 19, Router, Recharts, Vitest |
| 05 | **[Workspace OS](apps/workspace-os)** · [demo](https://charitraa.github.io/portfolio-templates/workspace-os/) | A room with a computer in it. Pull the bulb's cord, press power, watch it POST, land in a desktop where every section is an app — running on the monitor in CSS 3D. | React 19, three.js, R3F |
| 06 | **[My Story, Vol. 01](apps/manga-book)** · [demo](https://charitraa.github.io/portfolio-templates/manga-book/) | A career told as a manga volume you page through. Every spread is inked at runtime onto a canvas — panels, screentones, speech bubbles and all. | React 19, Canvas 2D, three.js |

Not sure which one? **[docs/comparison.md](docs/comparison.md)** puts them side by side — payload
size, dependency count, accessibility, and what each one is actually good for.

---

## What they look like

| | |
| --- | --- |
| **01 · Developer BIOS Utility** — the MAIN page of the setup utility<br><img src="screenshots/bios.png" alt="Developer BIOS Utility — a blue firmware setup screen listing system information for Charitra Shrestha"> | **02 · CircuitOS** — the board, powered up<br><img src="screenshots/circuitos.png" alt="CircuitOS — a motherboard layout with a labelled CPU at the centre wired to RAM, GPU, PSU and other components by copper traces"> |
| **03 · NET://** — the topology, inspecting the ISP edge<br><img src="screenshots/net-topology.png" alt="NET:// — a network topology map from client through ISP, DNS, firewall and load balancer, with a detail panel open on the right"> | **04 · ReconOS** — the dashboard view<br><img src="screenshots/reconos.png" alt="ReconOS — a dark security operations console showing stat tiles, an about payload rendered as JSON, resource gauges and a log panel"> |
| **05 · Workspace OS** — the room, with the session live on the monitor<br><img src="screenshots/workspace-os.png" alt="Workspace OS — a 3D room containing a desk, chair, server rack and three monitors, the centre one showing a running desktop"> | **06 · My Story, Vol. 01** — the contents spread<br><img src="screenshots/manga-book.png" alt="My Story Vol. 01 — an open manga volume on a wooden desk, showing an inside-cover blurb and a contents page listing twelve chapters"> |

---

## Making it yours

Pick one, run it, edit its data file. That's the whole workflow.

```bash
git clone https://github.com/charitraa/portfolio-templates.git
cd portfolio-templates/apps/reconos      # or bios · circuitos · net-topology · workspace-os · manga-book

npm install
npm run dev                    # http://localhost:5173
```

`apps/bios` is the exception — it has no dependencies and no build:

```bash
cd portfolio-templates/apps/bios
python3 -m http.server 8000    # http://localhost:8000
```

### Where the content lives

Each template deliberately funnels every piece of personal content into a small number of files.
Nothing outside these needs to be touched to ship your own version.

| Template | Edit these |
| --- | --- |
| `bios` | `assets/js/data.js` |
| `circuitos` | `src/data/content.ts` |
| `net-topology` | `src/data/profile.ts` |
| `reconos` | `src/data/profile.ts`, `src/data/projects.ts`, `src/data/skills.ts` |
| `workspace-os` | `src/data/portfolio.ts` |
| `manga-book` | `src/content/story.ts` |

Drop your own `resume.pdf` (and, where the template uses one, `avatar.jpg` / `wallpaper.jpg`)
into that app's `public/` folder — `bios` reads its résumé from its own folder instead.
Each app's README covers the details.

### Shipping it

Every template builds to a plain static bundle, so any static host works — GitHub Pages,
Netlify, Vercel, Cloudflare Pages, an S3 bucket.

```bash
npm run build      # → dist/
npm run preview    # serve the built output locally
```

If you deploy to a **subpath** (e.g. `example.com/portfolio/`), set `BASE_PATH` at build time:

```bash
BASE_PATH=/portfolio/ npm run build
```

At the domain root you don't need it — `/` is the default.

> **Single-page routers:** `reconos` uses client-side routing, so its host needs a rewrite of
> unknown paths to `index.html`. Its `vercel.json` and `public/_redirects` already do this for
> Vercel and Netlify; the Pages workflow here writes a per-directory `404.html`.

---

## Repository layout

```
apps/
  bios/           firmware setup screen   (static, no build)
  circuitos/      motherboard             (Vite + React 18)
  manga-book/     manga volume            (Vite + React 19)
  net-topology/   network map             (Vite + React 19)
  reconos/        SOC console             (Vite + React 19)
  workspace-os/   3D room + desktop OS    (Vite + React 19)
site/
  index.html      the gallery landing page
screenshots/      one capture per template, used by this README
docs/
  comparison.md   size, features and trade-offs, side by side
.github/workflows/
  deploy.yml      builds all six + the gallery, publishes to GitHub Pages
```

Each app is fully self-contained — its own `package.json`, its own lockfile, its own README.
There is no root-level workspace, nothing shared between them, and no build order. You can
delete the five you don't want and the sixth still works.

## Publishing the demos yourself

If you fork this, the demo site builds itself:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push to `main`.

The workflow resolves the correct base path from your repo name, so it works whether you keep
the name `portfolio-templates` or rename it — and whether it's a project site or a `<user>.github.io` one.

## Author

**Charitra Shrestha** — Full-Stack Software Developer, Kathmandu, Nepal
BSc (Hons) Computer Science & Software Engineering, University of Bedfordshire

[Website](https://www.charitrashrestha.com.np/) ·
[GitHub](https://github.com/charitraa) ·
[LinkedIn](https://www.linkedin.com/in/charitra-shrestha-78245b270/) ·
[dev.to](https://dev.to/charitraa) ·
[LeetCode](https://leetcode.com/charitraa/) ·
[Email](mailto:code@charitrashrestha.com.np)

The templates ship filled with my details so you can see what a finished one looks like. Swapping in
your own is the one edit each README opens with.

## License

[MIT](LICENSE). Use them, change them, ship them commercially. No attribution required.
