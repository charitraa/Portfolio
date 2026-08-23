# My Story, Vol. 01 — Manga Portfolio

A career told as a manga volume you page through. There is no HTML résumé underneath — every
spread is **inked at runtime onto a canvas** (panels, screentones, speech bubbles, sound effects,
the QR code on the contact page) and mapped onto a real 3D book sitting on a desk.

```
Cover → Inside → Contents → 12 chapters → Back cover
```

Reading position, bookmark and which sheets you've read persist in `localStorage`, so closing the
tab and coming back reopens the volume where you left it.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve the built output
```

Stack: Vite + React 19 + TypeScript, three.js + @react-three/fiber + drei, Zustand, Tailwind v4,
`qrcode`. Needs WebGL.

**No image assets ship with this template.** The desk oak, every page, and the contact QR are
generated procedurally at load — that's why the folder has no `public/`. The only network request
is the Google Fonts stylesheet in `index.html` (Bangers, Caveat, Noto Sans JP, Zen Maru Gothic).

## Making it yours

**All copy lives in `src/content/story.ts`.** Nothing in `src/pages/`, `src/components/` or the
three.js layer needs to change to publish your own volume.

Start with `AUTHOR` at the top — name, role, volume title and subtitle, year, publisher, ISBN, and
the contact links (`github`, `site`, `linkedin`, `email`). The `site` value is what the contact
page encodes into its QR code.

Then edit `PAGES`, the array that *is* the book. Each entry is one page, discriminated by `kind`:

| `kind` | What it renders |
| --- | --- |
| `cover` / `backcover` | Front and back covers |
| `inside` | Inside-cover blurb, with an optional handwritten `sticky` note |
| `toc` | Table of contents, generated from the chapter pages |
| `chapter` | A chapter title page (`n`, `title`) |
| `panels` | A comic page — a `head` plus laid-out `panels` |
| `project` | A full project spread: arc, stack, results, link |
| `skills` | Skill groups with levels |
| `timeline` | Dated experience entries |
| `equipment` | Tools, as an RPG inventory |
| `awards` | Achievements and certifications |
| `contact` | Contact page with the QR code |
| `end` | The "to be continued" page |

> **Page-count rule (enforced by the layout, easy to trip over):** a sheet is two pages, so `PAGES`
> must stay **even**. A chapter title page must sit on an **odd** index, which means every chapter
> needs an **odd** number of content pages after it. `SHEET_COUNT` is `PAGES.length / 2`; the file's
> header comment restates this next to the code.

Panels use fractional coordinates (`x`, `y`, `w`, `h` in 0–1 of the page), so a layout you write
holds at any texture resolution. Bubbles take the same fractional coordinates plus a `tail`
direction and a `kind` (`speech`, `thought`, `shout`). Drop-in art is chosen with `ArtKind`:
`hero`, `laptop`, `desk`, `speedlines`, `sunburst`, `city`, `sparkle`, `door`, or `none`.

## Reading controls

| Key | Action |
| --- | --- |
| `→` / `Space` | Next page |
| `←` | Previous page |
| `Home` / `End` | Jump to the cover / the last sheet |
| `T` | Table of contents |
| `B` | Drop the bookmark ribbon on this sheet |
| `Z` | Zoom (or double-click the page) |
| `M` | Mute the paper sounds |
| `Esc` | Close the contents overlay, then the zoom |

The bottom bar mirrors all of it. The row of ticks above the buttons is the book's **thickness** —
each tick is a sheet, gold once read, red where the bookmark sits; click any tick to jump straight
there. Holding `◀` / `▶` flips continuously instead of one page at a time.

## Where the drawing happens

| File | Responsibility |
| --- | --- |
| `src/content/story.ts` | The script — all content, all page definitions |
| `src/pages/render.ts` | Renders one `Page` to a canvas; owns the QR code |
| `src/pages/draw.ts` | Primitives — bubbles, tails, screentone, ink lines, seeded `rng` |
| `src/pages/art.ts` | The `ArtKind` illustrations |
| `src/textures.ts` | Builds every page into a three.js texture (B6 tankoubon, 1 : 1.41) |
| `src/turn.ts` | Page-turn curve |
| `src/components/Book.tsx` | The 3D book — bent sheets, spine, covers |
| `src/components/Desk.tsx` | Procedural oak desk |
| `src/state.ts` | Zustand store + `localStorage` persistence |

## Notes on behaviour

- **Textures are built once, up front.** The loader counts pages as they're inked; on a small
  viewport (min dimension under 760px) pages render at 640px wide instead of 896px to keep memory
  down.
- **Fonts are awaited before inking** — if Google Fonts is blocked or slow, the pages fall back to
  system fonts rather than blocking the read.
- **Sound is synthesised** with WebAudio (no audio files) and starts on.
- **Private-mode safe** — if `localStorage` throws, reading still works, it just won't remember.
- **The art is seeded**, so a given page inks identically on every load and across reloads.

## Deploying

Builds to a static bundle in `dist/`. For a subpath deploy set `BASE_PATH` at build time:

```bash
BASE_PATH=/portfolio/ npm run build
```

There is no client-side router here, so no host rewrite rules are needed.
