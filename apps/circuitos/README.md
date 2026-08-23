# CircuitOS — Motherboard Portfolio

An interactive PCB that boots *you* instead of an OS. The CPU is the engineer; every other
component on the board is a section of the portfolio, wired to the CPU with animated copper traces.

```
Power On → POST → CPU detected → Devices connected → Portfolio ready
```

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
```

Stack: Vite + React 18 + TypeScript, Tailwind v4, Framer Motion, lucide-react. No canvas, no WebGL —
the board is plain DOM nodes over an SVG trace layer, so it stays crisp and cheap at any zoom.

## Making it yours

**All copy lives in `src/data/content.ts`.** Name, bio, skills, projects, timeline, services,
certifications, testimonials, stats, contact links — edit that one file and the whole board updates.
Nothing in `src/board/` or `src/panels/` needs to change.

Two assets sit in `public/`:

| File | What it is |
| --- | --- |
| `public/resume.pdf` | Replace the placeholder — this is what the BIOS "flash" downloads. |
| `public/avatar.jpg` | Optional headshot for the About panel. Missing → a CPU icon renders instead. |

To move a component or change the board layout, edit `NODES` in `src/board/layout.ts` (fixed
1400×900 logical coordinate space). Traces are generated from those coordinates by `route()`, which
does real PCB-style routing — one axis, a 45° mitre, the other axis — so parts and copper can never
drift apart.

## Component map

| Component | Section | Interaction |
| --- | --- | --- |
| CPU (U1) | About | Pulses at the centre; every trace originates here |
| RAM (DIMM ×4) | Skills | One stick per discipline, with level meters |
| GPU (GPU1) | Projects | Fans spin faster on hover, RGB strip lights |
| NVMe SSD (M.2_1) | Experience | Read/write timeline, 2023 → 2026 |
| BIOS (U9) | Résumé | "Flash BIOS" progress bar, then downloads the PDF |
| NIC (J1) | Contact | Link LEDs, social links, contact form |
| USB hub (J2) | Services | One port per service offered |
| PCIe slots | Certifications | Cards seated in lanes |
| PSU (ATX1) | Statistics | Counters and rail readings |
| VRM (Q1–Q8) | Core strengths | Five power phases |
| Cooling fan (FAN1) | Soft skills | Fan RPM rises on hover |
| CMOS battery (BT1) | Personal details | Settings that survive a power cut |
| Audio codec (U7) | Testimonials | |
| Capacitors (C1–C12) | Toolbelt | Small, unglamorous, required |
| Expansion card | Achievements | |
| Rear I/O (J3) | Quick links | DisplayPort/HDMI/USB-C/LAN → GitHub, LinkedIn, résumé, email |

## Hidden features

- **Konami code** (↑↑↓↓←→←→BA) — RGB lighting mode; the whole board cycles hue.
- **Click the CPU five times** — developer mode, exposes hidden slots.
- **Hover every component** — full board power-up, which reveals the unpopulated M.2 slot.
- **The secret M.2 slot** — side projects and experiments.
- **Double-click the BIOS chip** — retro blue setup utility (also reachable from the Résumé panel).

## Notes on behaviour

- **Telemetry is simulated.** CPU/RAM/temp/voltage in the bottom monitor random-walk around a target
  that reacts to what you're doing — it is decoration, not measurement.
- **Sound is off by default** and synthesised with WebAudio (no audio files). Toggle it in the top bar.
- **Mobile** starts zoomed into the CPU; pinch to zoom, drag to pan, or use the INDEX button for a
  plain list of sections.
- **Reduced motion** is respected — every looping animation stops under
  `prefers-reduced-motion: reduce`.
- The board is keyboard reachable (every component is a real `<button>`), with a screen-reader-only
  section list and `Esc` to close panels.
