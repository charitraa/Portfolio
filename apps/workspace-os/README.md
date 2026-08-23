# Charitra Workspace

A portfolio shaped like a room with a computer in it. You walk in, pull the
bulb's cord, press the power button on the tower, watch it POST, and land in a desktop
environment where every part of the portfolio is an application.

You never leave the room. The session runs **on the monitor standing on the
desk** — the camera pushes in until the panel fills the view, and what you are
clicking is the live DOM, CSS-3D-transformed onto the glass. Step back and the
desktop keeps running behind you, small and lit, while you open the blinds or
put a record on.

Nothing here is a screenshot of Linux. The window manager, filesystem, terminal
and applications are real code.

**Two names, on purpose.** *Charitra Workspace* is the place — the sign over the
door, the entry loader, the caption in the room, the eight workstations you walk
between. *CharitraOS* is what the machine on the desk calls itself, so it appears
on the panel and nowhere else: the BIOS line, the greeter, Settings → About,
`neofetch`. Both come from `owner` in `src/data/portfolio.ts`
(`workspaceName` and `osName`), so renaming either is one edit.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve that bundle, exactly as it will be deployed
npm run typecheck
```

---

## Deploy it

It is a static site — a build directory and nothing else. No server, no
database, no environment variables. Anything that serves files will host it;
`vercel.json` configures Vercel specifically.

```bash
npx vercel        # preview deployment
npx vercel --prod # production
```

Or import the repository at vercel.com and press deploy: the settings in
`vercel.json` are picked up automatically and every push to `main` ships.

| Setting | Value | Why |
| --- | --- | --- |
| Framework | `vite` | Vercel's own preset, pinned rather than guessed. |
| Install | `npm ci` | Builds from `package-lock.json`, so a deploy installs what you tested. |
| Build | `npm run build` | `tsc -b && vite build` — a type error fails the deploy instead of shipping. |
| Output | `dist` | |
| Node | `>=20.19` (`engines`) | Vite 6 needs it; Vercel picks a matching runtime. |

Two rules beyond that. Everything under `/assets` is content-hashed by Vite, so
it is served `immutable` for a year. Anything that isn't a real file falls
through to `index.html`, which keeps deep links working — including `?inside`
and the other query flags below.

**Before the first deploy** — the content in `src/data/portfolio.ts` is yours,
not placeholder, and `public/` has your `poster.jpg` and (optionally)
`resume.pdf` in it. Both are described in the sections that follow.

**Custom domain.** Add it in Vercel → Settings → Domains. Nothing in the code
knows the hostname, so there is nothing to change afterwards — except
`index.html`, which leaves `og:url` and `og:image` out on purpose: fill them in
once you know the domain and have a card image to point at.

---

## Edit your content — one file

**`src/data/portfolio.ts` is the only file you need to touch.**

Everything a visitor reads comes from it: your name, the boot messages, the
About document, projects, skills, experience, the résumé, contact details.
Placeholder content is marked with `// TODO`.

Change `owner.name` and the workspace renames itself, the terminal prompt
updates, the greeter greets you, and `neofetch` reports the new hostname.
`owner.workspaceName` is the name of the place; `owner.osName` is what the
machine on the desk reports. Nothing hardcodes either.

To use a real résumé, drop a PDF at `public/resume.pdf`. Until you do, the
viewer typesets the structured `resume` data as a paper document, so the app is
never empty.

---

## Getting in

You do not start in the room. You start in the corridor outside it.

| Entry | What happens |
| --- | --- |
| `loading` | A splash over a dark workstation: encrypted volumes mounting, threat feeds syncing, a bar that reaches **WELCOME, OPERATOR**. It is plain DOM, so it covers the frames the 3D room spends being fetched and compiled. |
| `door` | A service corridor, and the lab door at the end of it. The camera walks the hallway on a slow dolly. Heavy steel leaf, wired vision panel, LED channel in the reveal, lit sign overhead, and a card-and-fingerprint reader on the jamb. |
| `unlocking` | The reader goes amber, the bolts withdraw, the maglock drops, and the leaf swings inwards while the camera walks through it — arriving exactly at the room's own `room` shot, so the handover is invisible. |
| `inside` | The corridor is behind you and the room behaves as it always has. |

**Straight in →** skips the corridor. `?inside` skips the whole entrance, which
is also what a popped-out display does — there is no hallway to stand in when
the session fills the browser.

The door has sound: pips from the reader, the bolts, the motor, and the room
tone that fades up behind it, all synthesised (no audio files). It follows
**Settings → Interface sounds**, which is off by default and offered as a button
in the corner while you are outside.

---

## The boot chain

Every phase after `room` is drawn on the monitor's panel, not over the page.

| Phase | What happens |
| --- | --- |
| `room` | Mains off, PC off, panel dark. Pull the cord hanging off the ceiling bulb, then press the tower's power button. |
| `post` | BIOS power-on self test. The camera has pushed in on the monitor. |
| `boot` | Kernel and init log. |
| `login` | Greeter. One guest account, no password. |
| `desktop` | The session. |
| `locked` | Session alive behind a lock screen (`Super+L`). |
| `shutdown` | Powers off; you're left sitting in front of a dark monitor. |

A **Skip intro** button sits in the corner of every pre-desktop screen —
recruiters coming back a second time shouldn't have to sit through the
cinematics.

### Where the camera stands

| View | |
| --- | --- |
| `room` | Just inside the door. The whole workspace in frame. |
| `desk` | Up at the desk, everything on it in reach. |
| `screen` | Square-on to the panel, which fills the viewport. **Only here is the session usable** — pointer events and keyboard shortcuts are gated on the camera having arrived and stopped, because you cannot type at a machine you are stood across the room from. |

Click the monitor (or the chair) to sit down; **Step back** walks you out again.
**Pop out display** takes the session out of the room and fills the browser with
it — the honest default on a phone, where a 3D room costs a lot and reading a
screen inside one costs more.

---

## Theme

The shell is themed to match the workstation it is modelled on, read from that
machine's own config rather than guessed at:

| | |
| --- | --- |
| Desktop | KDE Plasma 6 (Wayland) on CachyOS |
| Look-and-feel | `Apple-Darknes-AccentDinamic` |
| Colour scheme | `MkosBigSurDark` |
| Accent | `#39ace1` — the scheme's `Colors:Selection` |
| Window buttons | Left, `close · minimise · maximise` (`ButtonsOnLeft=XIA`) |
| Font | SF Pro Display, falling back to Inter |
| Shell | One panel along the bottom — kickoff, task icons, tray, clock |

The layout follows the real panel (`location=4`, holding kickoff, a pager,
icontasks and the system tray), so there is **no top panel and no separate
dock**: pinned launchers and running windows share one strip, and a running app
draws a dash under its icon that widens when it has focus. Right-clicking a task
icon offers a new window or closes the app.

Two caveats:

- **SF Pro Display is Apple-licensed** and cannot be served. It is first in the
  stack, so anyone who has it installed sees it; everyone else gets Inter.
- **The wallpaper is the desk's own**, resized and cropped into
  `public/wallpaper.jpg`. It is a film still, so it is third-party artwork —
  fine locally, but replace it before publishing anywhere you would rather not
  host someone else's image. Swap that one file and the desktop follows.

---

## Applications

**Portfolio, dressed as system software**

| App | Is really |
| --- | --- |
| Project Manager | Case studies, metrics, stack, screens |
| About Me | `~/About.md` open in the text editor |
| Resume | A document viewer with zoom and download |
| Skills | `skillpkg`, a package manager — listed by how often you reach for it |
| Experience | A timeline application, with certifications |
| Tech Stack | A software centre, tiered by how often you reach for it |
| Contact | A mail client that composes to your real address |
| Workspace | The map: all eight workstations, and the way into each |
| GitHub | Public repositories, fetched live from the GitHub API |
| Services | What you can be hired to build |
| Testimonials | Empty until real ones exist — see below |

**Security**

| App | Is really |
| --- | --- |
| Security Lab | The seven engagement phases, and the tooling used at each |
| Web Security | OWASP Top 10 — how each class is tested for, and what removes it |
| AI Security | Where model-backed applications fail, by pipeline stage |
| Network | An interactive lab topology, plus protocols and ports |
| Knowledge | Current learning tracks and the methodologies behind them |

**System**

Files · Terminal · Browser · Music · System Monitor · Settings · Trash ·
Calculator · Calendar · Notes

---

## Walking around

The room is explorable. From the desk, **Walk around ⤳** (or `Ctrl+Alt+E`, or
`explore` in the terminal) hands the camera to a first-person controller.

| Key | Action |
| --- | --- |
| `W A S D` / arrows | Walk |
| `Shift` | Sprint |
| Mouse | Look — click to capture the pointer |
| `E` / `Enter` | Use the workstation in front of you |
| `M` | Workspace map and fast travel |
| `?` | Controls |
| `Esc` | Release the pointer |

Workstations are anchored to furniture that was already modelled — the rack,
the bookshelf, the topology drawn on the back wall — so walking to a thing and
opening the application about that thing are the same gesture. Using a
workstation launches its app *and then* sits you down at the monitor, so you
arrive at a screen already showing what you walked over to look at.

The terminal reaches into the room too:

```bash
charitra@charitra-workstation:~$ goto security
🛡️ Walking to Security Lab. The rack. Recon through reporting…
```

Workstations you have stood in are remembered (`charitraos.discovery.v1`), and
the map offers fast travel to those — walking is the default, not the only
option.

### Movement notes

- Collision is four axis-aligned boxes and a per-axis slide, not a physics
  engine. The room is static and everything solid is box-shaped, so a solver
  would cost a dependency and buy nothing.
- Movement integrates in fixed 1/60s substeps rather than one variable step.
  Clamping a long frame instead is simpler but makes the player crawl whenever
  the frame rate drops — the distance covered has to stay right at any fps.
- Head bob respects `prefers-reduced-motion`.

### If the room will not run

WebGL is probed before the room's chunk is even requested, and the scene is
wrapped in an error boundary. Either failure lands on
**Enter Charitra Workspace →**, which opens the same desktop with none of the
3D. Nothing in the workspace is reachable only through the room.

---

## Workstations

Charitra Workspace is organised into eight workstations. `Workspace` (or
`Ctrl+Alt+W`) shows all of them at once; each groups the applications belonging
to one area.

| # | Workstation | Bench |
| --- | --- | --- |
| 01 | Development | Editor, projects, stack, terminal |
| 02 | Security Lab | Recon → enumeration → exploitation → reporting |
| 03 | Web Security | OWASP, HTTP, authentication, injection |
| 04 | AI Security | Prompt injection, agent privilege, output handling |
| 05 | Networking | Topology, TCP/IP, DNS, capture |
| 06 | Project Lab | Case studies and repositories |
| 07 | Knowledge | Learning tracks and methodologies |
| 08 | About | Background, education, timeline, contact |

### The honesty rule

The security workstations describe lab and self-directed work. Every tool and
vulnerability class carries a depth label, and the labels mean exactly this:

| Label | Means |
| --- | --- |
| Studied | Read about it; have not driven the tool |
| Hands-on (lab) | Used it in a deliberately vulnerable environment |
| Used on a project | Used it against something I built or was asked to test |

Nothing in the workspace claims paid or professional security experience, and
`~/Cybersecurity/scope.txt` says so in the filesystem too. If that changes,
change the labels — do not quietly upgrade them.

**Testimonials are empty on purpose.** A fabricated quote attributed to a named
person is the worst thing that can go on a portfolio, and there is no safe
placeholder version of one. The app renders an honest empty state and lists what
a real entry needs. Add entries to `testimonials` and the list replaces it.

**The GitHub app shows no contribution heatmap.** Daily contribution counts are
not in the public REST API, and drawing a plausible grid from repository
timestamps would be inventing data. It charts pushes per month instead, which is
derived from real `pushed_at` values, and says so on the chart.

Two related rules the content model enforces:

- **No self-scored percentages.** "Python 95%" implies a precision nobody has
  about their own ability. Skills carry frequency of use instead.
- **No unsourced figures.** Project metrics, credential ids and employers are
  either real or absent. Scaffolded projects are flagged `Draft` in the UI
  rather than filled with invented copy.

---

## What "real" means here

- **Window manager** — pointer-driven drag, 8-way resize, edge and corner
  snapping, maximise, minimise, a focus stack and monotonic z-order. Windows
  cannot be dragged off-screen or lose their titlebar under the panel.
- **Filesystem** — an immutable tree in `src/store/fs.ts` with `mkdir`,
  `writeFile`, `rename`, `move` and a working trash you can restore from. Files,
  the desktop icons, the terminal and the Trash app all read the same tree, so a
  file deleted in one appears in the trash of another.
- **Terminal** — a real command interpreter, not a canned script. 30+ commands
  with argument parsing, a working directory, history, tab-completion and
  quoting. `ls`, `cd`, `cat`, `tree`, `mkdir`, `rm`, `mv` operate on the actual
  filesystem. Try `neofetch`, `fortune`, and `sudo hire me`.
- **Browser** — tabs, history, bookmarks and an omnibox. Real sites can't be
  framed and a fake screenshot would be dishonest, so it renders first-party
  pages built from the same portfolio data, with a one-click escape to the live
  URL.
- **Music** — tracks are synthesised in the browser with WebAudio (a seeded
  pentatonic arpeggio over a pad), so the repo ships no audio files. Muted by
  default, and driven from a store rather than the window: the record player in
  the room and the Music app are two views of one transport, and starting a
  record in the room unmutes, because that's plainly what you asked for.
- **Settings** — genuinely changes the OS: wallpaper, accent colour, light/dark
  chrome, transparency, animations, text size. Persists to `localStorage`.

## Keyboard

| Key | Action |
| --- | --- |
| `Ctrl/⌘+K` | Search everything — workstations, projects, security topics, files |
| `Super` | Application launcher / search |
| `Ctrl+Alt+W` | Workspace map |
| `Ctrl+Alt+T` | Terminal |
| `Alt+Tab` / `Alt+Shift+Tab` | Cycle windows |
| `Alt+F4` | Close focused window |
| `Super+←/→` | Tile left / right |
| `Super+↑/↓` | Maximise / minimise |
| `Super+D` | Show desktop |
| `Super+L` | Lock |
| `F1` | Show this list in a notification |
| `F2`, `Delete` | Rename / trash the selected icon |

Keys only reach the session while you're sat in front of the monitor.

---

## Architecture

```
src/
  data/portfolio.ts     ← all content lives here
  store/
    system.ts           boot phase, camera view, power, room state, settings
    windows.ts          the window manager reducer
    fs.ts               virtual filesystem + trash
    music.ts            one synthesiser, shared by the app and the hi-fi
    notifications.ts
  os/
    screen.ts           the virtual display: size, and client → screen coords
    ScreenSurface.tsx   everything the machine displays, and nothing else
    Desktop.tsx         composes the shell; marquee selection
    Window.tsx          drag, 8-way resize, snap
    Panel.tsx           top bar, taskbar, tray, power menu
    Dock.tsx            pinned + running apps
    Launcher.tsx        search across apps, files, projects, skills
    ContextMenu.tsx     right-click menus with submenus
    launch.ts           which app opens which kind of file
  apps/
    registry.ts         every application, in one list
    …
  boot/
    Room3D.tsx          the room, the camera, and the monitor the shell runs on
    BootScreens.tsx     BIOS, kernel log, greeter, lock, shutdown
```

`App.tsx` mounts either the room (with `ScreenSurface` on the monitor) or the
popped-out display. Nothing else in the shell knows which it is.

**Adding an application** means writing a component that takes
`{ winId, props }` and adding one entry to `src/apps/registry.ts`. Set
`onDesktop` to give it a desktop icon, `inDock` to pin it.

---

## The room

Built entirely from primitive geometry — no GLTF models, no HDRI, no texture
files. That keeps the bundle small and means it renders identically offline; the
trade-off is a stylised look rather than photoreal, which suits a machine you are
about to switch on.

| Object | Does |
| --- | --- |
| Wall switch | Mains. Nothing boots without it, and the room is dark until it's on. |
| Tower | Power button, spinning fans, RGB behind the tempered glass. |
| Monitor | Runs the session. Click to sit down, click the bezel to get up. |
| Chair | Rolls in and out. Rolling in *is* sitting down at the machine. |
| Books | Three of them, on the desk. Each falls open and launches the application holding the same material — About, Projects, Résumé. |
| Record player | Plays the same synthesised playlist as the Music app, through the same transport. Its level meter reads the synthesiser's own note counter. |
| Blinds | Raise and lower over the window; the moonlight goes with them. |
| Desk lamp | Warm point light, real shadows. |
| Keyboard | Toggles the RGB underglow. |
| Mouse | Follows your real cursor. |

Three.js is lazy-loaded, and isn't fetched at all if the display is popped out.

### How the session gets onto the panel

`<Html transform>` from drei renders the shell into a CSS-3D-transformed layer
sitting exactly where the glass is, at exactly the panel's size. That means the
DOM is *in* the scene rather than pasted over it — but it also means every
pointer event arrives in browser coordinates while the window manager thinks in
display coordinates, and the two differ by whatever scale and offset the monitor
happens to have on screen.

`src/os/screen.ts` is the one place that knows the difference. It measures the
surface, converts client coordinates to screen coordinates, and reports the
display's logical size; `getWorkarea`, window drags, icon drags, marquee
selection and context menus all go through it. With the display popped out the
mapping is the identity, so both modes run the same code.

Two things fall out of that design:

- **The camera locks while you're using the machine.** No parallax square-on to
  the panel — a drifting camera would drag every window with it.
- **The chair has a low back.** The panel is a DOM layer with no depth, so
  nothing may stand in front of it; tucked in, the chair has to sit below the
  bottom bezel.

---

## Stack

React 19 · TypeScript · Zustand · Tailwind CSS v4 · Three.js / React Three Fiber
· Vite
# Computer
