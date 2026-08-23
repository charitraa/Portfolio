# Developer BIOS Utility v2.1

A portfolio that presents itself as firmware setup. Visitors don't land on a
homepage — they boot the machine, watch it detect a developer, and then browse
the résumé as if editing BIOS settings.

Original design inspired by firmware setup screens. It is not a reproduction of
any vendor's BIOS (AMI, Phoenix, Award, ASUS, MSI, Dell).

## Running it

No build step, no dependencies. Any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from the filesystem also works, though the
résumé-file check is skipped under `file://`.

## Deploying

Push the folder anywhere that serves static files — GitHub Pages, Netlify,
Vercel, Cloudflare Pages. There is nothing to configure.

## Editing content

**Everything you need to change lives in `assets/js/data.js`.** Nothing else has
to be touched. Each section maps to one tab; search the file for `TODO` to find
the placeholders that need your real values:

| What | Where in `data.js` |
| --- | --- |
| Name, role, email, links, résumé path | `owner` |
| Main screen rows | `main.rows` |
| About + interests + bio | `about` |
| Projects and their detail pages | `projects.items` |
| Skill bars | `skills.groups` |
| Services | `services.items` |
| Tech inventory | `stack.groups` |
| Timeline | `experience.items` |
| Education, certificates | `education`, `certificates` |
| Contact rows | `contact.rows` |
| Printable résumé | `RESUME_PRINT` |

Value colours are set per row with `flag`: `ok` (green), `err` (red),
`dim` (gray), `plain` (white), omitted (yellow).

### Still to personalize

- [ ] Replace the `TODO` values in `owner` — email, GitHub, LinkedIn
- [ ] Drop your résumé at `assets/resume.pdf` (the Resume tab reports an error until you do)
- [ ] Fill in each project's real `github` / `demo` URLs
- [ ] Add screenshots: put files in `assets/img/` and list them in a project's `shots` array
- [ ] Confirm the skill percentages actually reflect you

## Adding a bitmap font

The stack falls back to the best monospace font available. For a true DOS look,
drop a VGA face into `assets/fonts/` and uncomment the `@font-face` block at the
top of `assets/css/bios.css`. Good choices: Px437 IBM VGA 8x16, Perfect DOS VGA
437, Web437.

## Keyboard

The whole site works without a mouse.

| Key | Action |
| --- | --- |
| `↑` `↓` | Move between items |
| `←` `→` | Change menu (or change value on a setting) |
| `Enter` | Execute / open |
| `Esc` | Back |
| `Home` / `End` | First / last item |
| `+` `-` | Change a setting's value |
| `F1` or `?` | Help |
| `F2` | Download résumé |
| `F3` or `/` | Jump to setting (search) |
| `F5` | Refresh screen |
| `F10` | Save and exit |
| `Tab` | Next menu |

On touch devices, swipe left/right to change menu and tap to select.

During POST: any key enters setup, `Esc` fast-forwards the self test.

## URLs

Every screen is linkable:

- `#skills` — open a section directly
- `#projects/adsmitra` — open one project's detail page
- `?nopost=1` — skip the boot sequence entirely
- `#boot` — force the boot sequence to replay

The POST runs once per browser session; returning to the tab goes straight to
setup.

## Settings

Under the Settings tab, stored in `localStorage`:

- **Theme** — Classic (BIOS blue), Modern (dark), High Contrast
- **CRT Effect** — scanlines and vignette
- **Flicker** — occasional brightness flicker
- **Animation** — transitions and typing (forced off when the OS requests reduced motion)
- **Sound** — PC-speaker beeps, synthesised in the browser. Off by default.

## Easter egg

The Konami code (`↑ ↑ ↓ ↓ ← → ← → B A`) unlocks a Developer Mode menu.

## Files

```
index.html              markup shell
assets/css/bios.css     theme, 8px grid, CRT layers, print styles
assets/js/data.js       ALL content — edit this
assets/js/boot.js       power-on self test
assets/js/render.js     builds each screen from data
assets/js/nav.js        tabs, selection, keyboard, touch
assets/js/audio.js      synthesised beeps
assets/js/app.js        settings, clock, search, modals, easter eggs
```

## Notes

- The contact form has no backend; it composes a `mailto:` link. Swap the `Send`
  action in `render.js` for a Formspree/Netlify endpoint if you want real submissions.
- "Memory Usage" fills as you visit sections. It is decorative.
- The Exit tab is non-destructive — everything it does is reversible.
