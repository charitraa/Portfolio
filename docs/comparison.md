# Choosing a template

Seven templates. Six are ways to build the same thing — a developer portfolio — and the seventh,
`photographer`, is a client-facing studio site for a photographer. They share no code, no components
and no build order; the only thing they have in common is that all the personal content sits in one
or two data files.

Everything below was measured from the code in this repository, not estimated.

## At a glance

| | Template | Framework | Styling | Design | Complexity | Best for |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | [bios](../apps/bios) | Vanilla JS (ES modules), **no build** | Hand-written CSS | Firmware setup screen | Low | Anyone who wants zero toolchain, or a résumé that loads instantly on anything |
| 02 | [circuitos](../apps/circuitos) | React 18 + Vite 6 | Tailwind v4, Framer Motion | Motherboard / PCB | Medium | Hardware and embedded people; a strong visual hook that stays cheap |
| 03 | [net-topology](../apps/net-topology) | React 19 + Vite 7 | Tailwind v4, Framer Motion, xyflow | Network topology map | Medium | Network, infra, DevOps and SRE roles |
| 04 | [reconos](../apps/reconos) | React 19 + Vite 8 + React Router 7 | Tailwind v4, Recharts | Security operations console | Medium-High | Security and backend roles; the most conventional "app" of the set |
| 05 | [workspace-os](../apps/workspace-os) | React 19 + Vite 6 + three.js / R3F | Tailwind v4, `motion` | 3D room + desktop OS | High | Showing range; the most content-hungry and the biggest download |
| 06 | [manga-book](../apps/manga-book) | React 19 + Vite 6 + three.js / R3F | Tailwind v4, Canvas 2D | Printed manga volume | High | Telling a career as a story rather than listing it |
| 07 | [photographer](../apps/photographer) | Vanilla JS (ES modules), **no build** | Hand-written CSS | Photographic contact sheet | Low | Photographers and other visual freelancers — the only one here that sells a service rather than a CV |

## What each one costs

Payload is the gzipped JS + CSS in `dist/` after `npm run build` — for the two templates with no
build step it is the gzipped HTML, CSS and JS as they ship. Source is hand-written lines only —
`.ts`, `.tsx`, `.js`, `.css`, `.html`, excluding `node_modules` and `dist`.

| Template | Payload (gzip) | `dist/` | Source | Direct deps | Installed packages |
| --- | --- | --- | --- | --- | --- |
| bios | **24 KB** | 124 KB | 2,510 | 0 | 0 |
| photographer | 30 KB | — ‡ | 2,729 | 0 | 0 |
| circuitos | 113 KB | 400 KB | 3,323 | 4 + 7 dev | 57 |
| net-topology | 194 KB | 660 KB | 4,380 | 5 + 7 dev | 69 |
| reconos | 274 KB † | 1.0 MB | 5,283 | 7 + 13 dev | 127 |
| manga-book | 349 KB | 1.3 MB | 5,296 | 8 + 9 dev | 130 |
| workspace-os | 414 KB | 3.1 MB | 19,322 | 7 + 9 dev | 106 |

† `reconos` is the only one that code-splits its routes, so this is the total across all chunks, not
the first load. The initial bundle is ~131 KB gzipped; the rest arrives per view. The heaviest single
chunk is the polar chart (~99 KB gzipped) and it only loads on the Skills view.

‡ `photographer` has no build, so there is no `dist/` — the folder you deploy is 109 KB, and every
photograph on the page is loaded from Unsplash rather than shipped. Hosting your own images is what
will set its real weight.

`workspace-os` carries a 3.1 MB `dist/` largely because of `wallpaper.jpg` and `poster.jpg` — replace
those with your own and the number moves a lot.

## What each one can do

| | bios | circuitos | net-topology | reconos | workspace-os | manga-book | photographer |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Build step required | — | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| TypeScript | — | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Client-side router | — | — | — | ✓ | — | — | — |
| Test suite | — | — | — | ✓ (15) | — | — | — |
| Lint script | — | — | — | ✓ | — | — | — |
| WebGL required | — | — | — | — | ✓ | ✓ | — |
| Canvas 2D drawing | — | — | — | — | ✓ | ✓ | — |
| Command palette | — | — | ✓ | ✓ | — | — | — |
| Boot / intro sequence | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Keyboard-driven | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Synthesised audio | ✓ | ✓ | — | ✓ | ✓ | ✓ | — |
| Persists state locally | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| Respects reduced motion | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| Deep-linkable sections | ✓ | — | ✓ | ✓ | — | — | ✓ |
| Works without JS toolchain | ✓ | — | — | — | — | — | ✓ |
| Needs host rewrite rules | — | — | — | ✓ | — | — | — |
| Enquiry / contact form | — | — | — | — | — | — | ✓ |

## Where your content goes

| Template | Edit | Assets it expects |
| --- | --- | --- |
| bios | `assets/js/data.js` | `assets/resume.pdf` |
| circuitos | `src/data/content.ts` | `public/resume.pdf`, optional `public/avatar.jpg` |
| net-topology | `src/data/profile.ts` (+ `experience`, `projects`, `services`, `skills`, `topology`) | `public/resume.pdf`, `public/favicon.svg` |
| reconos | `src/data/profile.ts`, `src/data/projects.ts`, `src/data/skills.ts` | `public/resume.pdf`, `public/favicon.svg` |
| workspace-os | `src/data/portfolio.ts` | `public/wallpaper.jpg`, `public/poster.jpg`, `public/favicon.svg` |
| manga-book | `src/content/story.ts` | none — every page and texture is drawn at runtime |
| photographer | `assets/js/data/*.js` (seven files: photographer, portfolio, services, packages, testimonials, process, faq) | your photographs — the gallery takes an Unsplash id or a path to your own file, so nothing has to be added to run it |

## Picking one

**Start with `bios`** if you want something you can host anywhere in five minutes, or if you don't
want a `node_modules` folder in your life. With `photographer`, it is one of the two that are just
files — and the only developer portfolio among them.

**Start with `reconos`** if this is a job-hunting portfolio and you want the most conventional,
most readable, most complete one. It is the only template with tests, a linter, real routing and
verified content, and it degrades to a normal web app on any device.

**Start with `circuitos` or `net-topology`** if you want one strong metaphor that a recruiter takes
in at a glance. Both are plain DOM and SVG — no WebGL, no canvas — so they stay fast and work
everywhere. Pick by field: silicon or packets.

**Start with `workspace-os` or `manga-book`** if the portfolio *is* the demonstration. Both need
WebGL, both take real effort to fill with content, and both will be remembered. `workspace-os`
wants the most writing of any template here; `manga-book` wants you to think in panels and page
counts, and enforces an even page count with chapters on odd indices.

**Take `photographer`** if the site is not for a developer at all. It is the only template here
written for a client-facing business — enquiries, packages and prices rather than projects and a
résumé — and like `bios` it is just files. Its README lists the rates, timings and copy that were
drafted for it, all of which need checking before the page goes live, and the placeholder
photographs are stock images that must be replaced with the photographer's own work.

## Accessibility and fallbacks

Read this before picking one for a job application.

- `bios`, `circuitos`, `net-topology`, `reconos` and `photographer` are keyboard reachable and render
  as normal DOM, so screen readers and text scaling behave.
- `photographer` renders its sections from the data files at runtime, so the page needs JavaScript to
  show anything; the SEO metadata is static in `index.html` and there is a `<noscript>` fallback with
  the name and email. Its lightbox is a native `<dialog>`, so Escape and the focus trap come from the
  platform.
- Every template except `manga-book` honours `prefers-reduced-motion`.
- `net-topology` ships a separate simplified topology for narrow viewports.
- `workspace-os` probes for WebGL and shows `WorkspaceUnavailable` when it is missing; it also
  auto-pops the display out of the 3D room below 860px wide.
- `manga-book` needs WebGL with no fallback path, and its pages are canvas bitmaps — the text in them
  is not selectable and not readable by a screen reader. It is a showcase, not an accessible résumé.
