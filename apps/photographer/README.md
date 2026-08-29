# Dharshan Studio — portfolio

A single-page portfolio for a working photographer: cinematic hero, filterable
contact-sheet gallery with a lightbox, services, packages, an enquiry form that
carries the chosen package, testimonials, process, FAQ and contact.

Built as plain HTML, CSS and ES modules. **No dependencies, no build step.**

---

## Running it

The site uses ES modules, so it needs to be served over `http://` rather than
opened as a file:

```bash
node serve.mjs          # → http://localhost:5173
node serve.mjs 8080     # or pick a port
```

Any static server works (`python3 -m http.server`, nginx, Netlify, GitHub Pages).
Deploying means copying the folder — there is nothing to compile.

---

## Where the content lives

Everything a photographer needs to change is in `assets/js/data/`. No component
markup has to be touched to update the site.

| File | What it holds |
|---|---|
| `photographer.js` | Name, location, email, phone, social links, nav, hero, intro, about, stats, social strip, footer |
| `portfolio.js` | Categories and every frame in the gallery |
| `services.js` | The kinds of work offered |
| `packages.js` | Package names, prices, features, which one is featured |
| `testimonials.js` | Client quotes |
| `process.js` | The four stages of working together |
| `faq.js` | Questions and answers |

### What is real, what needs checking

Contact details are real: **Dharshan Studio · Dharshan Shrestha · Itahari, Nepal ·
darshanshrestha@gmail.com · +977 9800118899**.

**Written for you — read it before publishing.** The About and intro copy, the FAQ
answers, the package rates and the process timings were drafted to fit a studio of
this kind. They are not brackets any more, which means a client will treat them as
commitments. Check each one against how you actually want to work:

| Where | What was assumed |
|---|---|
| `packages.js` | NPR 15,000 / 35,000 / 85,000 starting rates; 30 / 80 / 200+ photographs; 2 / 3 / 4 week delivery |
| `faq.js` | Weddings booked 6–12 months ahead; travel free within an hour of Itahari; 25% deposit holds a date; balance due on the day; 30-image preview within 5 days |
| `process.js` | Final gallery in 2 to 4 weeks |
| `photographer.js` | The About and intro paragraphs, written in first person; "Replies within 2 business days" |

**Deliberately left empty.** These four are the things that cannot be written for
you, only supplied:

- **`social: []`** in `photographer.js` — a guessed handle would send visitors to
  somebody else's account. Paste a real one in (the template is in the file) and
  both the footer and the photo strip switch back to Instagram automatically.
  Until then the strip runs as "From the archive" and the footer offers email and
  phone instead.
- **`testimonials: []`** — inventing a quote and signing a real client's name to it
  is the one thing that would make everything else on the page untrustworthy. The
  section stays off the page until you add one; two or three are plenty.
- **The About statistics** are facts (Based in / Coverage / Delivery), not
  achievement counts. Swap in years working or sessions delivered whenever you
  want to — but only real ones.
- **`https://[your-domain.com]/`** in `index.html` — the canonical URL, `og:url`
  and the JSON-LD `url`. A wrong canonical points search engines at a domain you
  do not own, so it stays bracketed until you have the real one. Add a `sameAs`
  array to the JSON-LD at the same time as the social links.

### Replacing the photography

The placeholder photographs are stock images served from Unsplash so the layout
can be judged with real pictures in it. **They are not the photographer's work
and must be replaced.**

Each image entry looks like this:

```js
{ id: "1520854221256-17451cc331bf", tone: "#5A5F4A", category: "weddings",
  title: "Held",
  alt: "Two hands joined, casting a heart-shaped shadow on sunlit grass.",
  meta: "50mm · ƒ/1.8 · 1/800 · ISO 100" }
```

- `id` — an Unsplash photo id, **or** a path to your own file
  (`images/held.jpg`, `/uploads/held.avif`, or an absolute URL). Anything
  containing a `/` or ending in an image extension is used as-is, so hosting
  your own files needs no code changes.
- `tone` — the average colour of the photograph. It is painted behind the frame
  while the image loads, so nothing flashes white and nothing shifts. Get it with
  `magick your-photo.jpg -resize 1x1\! -format '#%[hex:p{0,0}]' info:`.
- `alt` — describe what is actually in the frame, for screen readers and search.
- `meta` — the exposure data printed along the caption. Use the real EXIF from
  your files, or set it to `""` to hide it.

When you host your own files, export at ~2000px on the long edge in AVIF or WebP
and let `assets/js/lib/image.js` handle the rest.

### Making the enquiry form send

With no backend configured the form composes a prefilled email and hands it to
the visitor — nothing is silently dropped. To post it somewhere instead, set an
endpoint in `photographer.js`:

```js
formEndpoint: "https://your-form-service.example/f/abc123",
```

The form POSTs JSON with the keys `name, email, phone, service, package, date,
location, budget, message`.

---

## How it is put together

```
index.html                    section shells + all SEO metadata
serve.mjs                     dependency-free static server for development
assets/
  css/
    tokens.css                palette, type scale, spacing — the dark and paper themes
    base.css                  reset, type primitives, film grain, reduced-motion rules
    layout.css                shell, section headers, nav, hero, gallery grid
    components.css            everything else
  js/
    main.js                   mounts each component into its <section>
    data/                     all editable content (see above)
    lib/
      dom.js                  small helpers
      image.js                responsive sources, aspect-ratio frames, tone placeholders
      reveal.js               one shared IntersectionObserver for scroll reveals
      scroll.js               header state, section highlighting, smooth scroll
    components/
      navbar · hero · sectionHeading · intro · portfolioGallery · portfolioFilter
      lightbox · about · services · packages · packageCard · process
      testimonials · socialGallery · faq · bookingForm · contact · footer
```

Each component exports `mount(element)` and is wired up in `main.js` by the
`data-component` attribute on its `<section>`. Adding a section means adding a
`<section data-component="…">` to `index.html` and one line to the registry.

### Design notes

- **Palette** — photographic near-black (`#0B0C0D`) as the default surface, warm
  gallery paper (`#EDEBE6`) for the intro, packages and process, and a single
  cyanotype accent (`#2E6076`) used only for active states, focus rings and frame
  numbers. Semantic tokens flip on `.panel--paper`, so components need no variants.
- **Type** — Bodoni Moda for display, Archivo for body and UI, DM Mono for the
  technical captions.
- **The film rebate** — every frame carries its number, title and exposure data in
  mono type along a hairline, the way a contact sheet does. It is the one
  decorative idea on the page and it carries real information.
- **Sequence numbering** appears only where the content is genuinely a sequence
  (the four process stages, the frame numbers on the roll).

### Performance and accessibility

- Every photograph is lazy-loaded (except the hero, which is preloaded and
  `fetchpriority="high"`), served through a `srcset` at six widths, and requested
  as AVIF/WebP where the browser supports it.
- Frames declare their aspect ratio and a background tone, so there is no layout
  shift while images arrive.
- One shared `IntersectionObserver` drives every scroll reveal; elements are
  unobserved once shown.
- The lightbox is a native `<dialog>`, so Escape and the focus trap come from the
  platform. Arrow keys, swipe, a live-region counter and focus return are added.
- All body text meets WCAG AA contrast on both surfaces; focus is always visible;
  the mobile menu is removed from the tab order while closed.
- `prefers-reduced-motion: reduce` disables the reveals, the hero's slow zoom and
  the gallery's filter transition.

### Note on rendering

Sections are rendered by JavaScript from the data files, so the page needs JS to
display. All SEO metadata (title, description, Open Graph, canonical, JSON-LD)
is static in `index.html`, and there is a `<noscript>` fallback with the
photographer's name and email. If you need the content itself in the HTML for a
crawler that does not run JavaScript, prerender the page at deploy time.
