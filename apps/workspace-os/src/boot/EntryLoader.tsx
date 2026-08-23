import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { owner } from '@/data/portfolio'
import { useSystem } from '@/store/system'

/**
 * Scene one: the splash that plays before the visitor is standing in the
 * corridor outside the lab.
 *
 * It is a DOM screen rather than anything in the 3D scene, which is what lets
 * it cover the frames where the room's chunk is still being fetched and its
 * first shaders compiled. Everything on it is drawn with CSS and one inline
 * SVG — no images, no fonts to wait on, nothing that could itself need loading.
 */

/** The three states the headline moves through, keyed to progress. */
const HEADLINES: { at: number; text: string; sub: string }[] = [
  { at: 0, text: 'INITIALIZING SECURE WORKSPACE', sub: 'mounting encrypted volumes' },
  { at: 56, text: 'ACCESSING SYSTEM', sub: 'verifying operator credentials' },
  { at: 92, text: 'WELCOME, OPERATOR', sub: 'clearance confirmed' },
]

/** Status lines, each appearing as the bar passes it. */
const STEPS: { at: number; text: string; tag: string }[] = [
  { at: 4, text: 'cold boot · secure enclave', tag: 'OK' },
  { at: 14, text: 'establishing encrypted channel', tag: 'TLS 1.3' },
  { at: 24, text: 'loading intrusion signatures', tag: '48219' },
  { at: 36, text: 'mounting /dev/lab · read-write', tag: 'OK' },
  { at: 48, text: 'starting packet capture daemon', tag: 'eth0' },
  { at: 58, text: 'syncing threat intelligence feed', tag: 'OK' },
  { at: 68, text: 'auditing workstation integrity', tag: 'CLEAN' },
  { at: 78, text: 'negotiating door controller link', tag: 'RS-485' },
  { at: 88, text: 'operator profile · charitra', tag: 'FOUND' },
  { at: 96, text: 'access control armed', tag: 'READY' },
]

/**
 * Where the bar is at a given moment. A real loader does not move at a constant
 * rate — it lurches and then waits on something — so this is a hand-drawn curve
 * with two stalls in it rather than a linear ramp.
 */
const CURVE: [number, number][] = [
  [0, 0],
  [420, 17],
  [900, 24],
  [1350, 26],
  [2000, 55],
  [2500, 61],
  [2760, 62],
  [3450, 89],
  [3950, 97],
  [4300, 100],
]

function progressAt(ms: number) {
  if (ms >= CURVE[CURVE.length - 1][0]) return 100
  for (let i = 1; i < CURVE.length; i++) {
    const [t1, p1] = CURVE[i]
    if (ms <= t1) {
      const [t0, p0] = CURVE[i - 1]
      return p0 + ((p1 - p0) * (ms - t0)) / (t1 - t0)
    }
  }
  return 100
}

export default function EntryLoader() {
  const finishLoading = useSystem((s) => s.finishLoading)
  const [pct, setPct] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const done = useRef(false)

  const reduced = useMemo(
    () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    // Someone who has asked for less motion is not asking to watch a loading
    // bar crawl either: the same screen, over in a beat.
    const scale = reduced ? 0.28 : 1
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const p = progressAt((now - start) / scale)
      setPct(p)
      if (p >= 100) {
        if (!done.current) {
          done.current = true
          // Hold on "WELCOME, OPERATOR" long enough to be read, then dissolve
          // into the corridor.
          window.setTimeout(() => setLeaving(true), reduced ? 200 : 620)
        }
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  useEffect(() => {
    if (!leaving) return
    const t = window.setTimeout(finishLoading, 720)
    return () => clearTimeout(t)
  }, [leaving, finishLoading])

  const headline = [...HEADLINES].reverse().find((h) => pct >= h.at) ?? HEADLINES[0]
  const log = STEPS.filter((s) => pct >= s.at).slice(-6)
  const cleared = pct >= HEADLINES[2].at

  return (
    <div
      className="absolute inset-0 z-[200] overflow-hidden"
      style={{
        background: '#04060a',
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.035)' : 'scale(1)',
        transition: 'opacity .7s ease, transform 1.1s cubic-bezier(.4,0,.2,1)',
        pointerEvents: leaving ? 'none' : 'auto',
      }}
    >
      <Backdrop />

      {/* The console itself */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-full" style={{ maxWidth: 620 }}>
          <div className="flex items-start gap-5">
            <Sigil cleared={cleared} />
            <div className="min-w-0 flex-1 pt-1">
              <div
                className="text-[10px] font-semibold"
                style={{ color: 'rgba(120,150,180,.62)', letterSpacing: '.34em' }}
              >
                {owner.workspaceName.toUpperCase()} · SECURE FACILITY
              </div>
              <h1
                key={headline.text}
                className="mt-2 text-[17px] font-semibold sm:text-[21px]"
                style={{
                  color: cleared ? '#a9f0d6' : '#dbe9fb',
                  letterSpacing: '.15em',
                  textShadow: cleared ? '0 0 24px rgba(87,217,138,.35)' : '0 0 24px rgba(91,156,248,.28)',
                  animation: 'entry-in .5s ease both',
                }}
              >
                {headline.text}
                <span className="caret ml-1" style={{ color: '#4fd6e8' }}>
                  ▌
                </span>
              </h1>
              <div className="mt-1.5 font-mono text-[11.5px]" style={{ color: 'rgba(140,168,196,.55)' }}>
                {headline.sub}
              </div>
            </div>
          </div>

          {/* Bar */}
          <div className="mt-7 flex items-center gap-3">
            <div
              className="relative h-[3px] flex-1 overflow-hidden rounded-full"
              style={{ background: 'rgba(140,180,220,.09)' }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #2f6f9e, #4fd6e8)',
                  boxShadow: '0 0 12px rgba(79,214,232,.55)',
                }}
              />
            </div>
            <div
              className="w-[46px] text-right font-mono text-[11px] tabular-nums"
              style={{ color: 'rgba(160,196,224,.75)' }}
            >
              {Math.floor(pct).toString().padStart(3, '0')}%
            </div>
          </div>

          {/* Log */}
          <div className="mt-4 font-mono text-[11px] leading-[1.75]" style={{ minHeight: 126 }}>
            {log.map((s) => (
              <div key={s.text} className="flex gap-2" style={{ animation: 'entry-in .35s ease both' }}>
                <span style={{ color: 'rgba(90,120,150,.6)' }}>›</span>
                <span className="flex-1 truncate" style={{ color: 'rgba(168,192,214,.72)' }}>
                  {s.text}
                </span>
                <span style={{ color: s.tag === 'OK' ? 'rgba(87,217,138,.8)' : 'rgba(79,214,232,.7)' }}>
                  [{s.tag}]
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Facility metadata, the small print of a place like this */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-5 font-mono text-[10px]"
        style={{ color: 'rgba(110,140,170,.4)' }}
      >
        <div className="leading-relaxed">
          node {owner.hostname}
          <br />
          10.13.37.4 · vlan 1337 · isolated
        </div>
        <div className="text-right leading-relaxed">
          {owner.workspaceName} · {owner.osCodename}
          <br />
          biometric access control online
        </div>
      </div>

      <div className="scanlines pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(120% 90% at 50% 45%, transparent 30%, rgba(0,0,0,.82) 100%)' }}
      />
    </div>
  )
}

/**
 * The workstation environment behind the console: monitor glow in the dark,
 * a network diagram on the wall, code running down the far screens, cable
 * shadow. All of it stays well under the text — it is a room seen out of focus,
 * not a second thing to read.
 */
const Backdrop = memo(function Backdrop() {
  const columns = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        left: `${4 + i * 14.4}%`,
        dur: `${26 + ((i * 7) % 13)}s`,
        delay: `-${i * 3.4}s`,
        size: i % 3 === 0 ? 11 : 10,
        // Written out twice, so scrolling exactly half the block loops with no
        // seam and no second animation to keep in step.
        lines: Array.from({ length: 60 }, (_, j) => codeLine(i * 60 + j)),
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Room light: two monitors and a rack, all of it a long way off */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(48% 42% at 22% 34%, rgba(52,104,168,.30), transparent 70%),' +
            'radial-gradient(38% 40% at 78% 26%, rgba(30,120,140,.24), transparent 70%),' +
            'radial-gradient(60% 50% at 50% 108%, rgba(24,58,92,.35), transparent 70%)',
        }}
      />

      {/* Blueprint grid, as faint as the light in the room allows */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(120,180,230,.045) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(120,180,230,.045) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
          maskImage: 'radial-gradient(90% 80% at 50% 40%, #000 20%, transparent 85%)',
        }}
      />

      {/* Terminals running down the far wall. Kept well under the console —
          this is a room out of focus behind the text, not a second thing to
          read. */}
      <div className="absolute inset-0" style={{ opacity: 0.26 }}>
        {columns.map((c, i) => (
          <div
            key={i}
            className="absolute font-mono whitespace-pre"
            style={{
              left: c.left,
              top: 0,
              fontSize: c.size,
              lineHeight: 1.6,
              color: i % 4 === 0 ? 'rgba(87,217,138,.16)' : 'rgba(120,175,225,.14)',
              animation: `entry-rain ${c.dur} linear ${c.delay} infinite`,
            }}
          >
            {[...c.lines, ...c.lines].join('\n')}
          </div>
        ))}
      </div>

      <Topology />

      {/* A slow sweep of light across the room, as if something moved past a lamp */}
      <div
        className="absolute inset-y-0 w-1/3"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(120,190,240,.055), transparent)',
          animation: 'entry-sweep 9s ease-in-out infinite',
        }}
      />

      {/* The pool of dark the console sits in. Without it the room behind
          fights the text for the middle of the screen. */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(46% 40% at 50% 47%, rgba(2,5,8,.94) 0%, rgba(2,5,8,.72) 45%, transparent 78%)' }}
      />
    </div>
  )
})

/** Deterministic pseudo-code, so the columns read as work rather than as noise. */
function codeLine(i: number) {
  const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1
  const hex = (n: number) => Math.floor(Math.abs(Math.sin(n * 78.233) * 65536) % 65536).toString(16).padStart(4, '0')
  const forms = [
    `0x${hex(i)}  ${hex(i + 1)} ${hex(i + 2)}  mov  r${i % 8}, [sp+${i % 32}]`,
    `tcp 10.13.37.${i % 254} → 443  len=${40 + (i % 900)} SYN`,
    `sha256 ${hex(i)}${hex(i + 3)}${hex(i + 5)}`,
    `[+] probe ${i % 65535} ok`,
    `nmap -sS -T4 10.13.37.0/24`,
    `handshake ok · cipher=aes_256_gcm`,
    `0x${hex(i + 7)}  ${hex(i + 8)} ${hex(i + 9)}  xor  r${i % 4}, r${(i + 3) % 4}`,
  ]
  return forms[Math.floor(r * forms.length)]
}

/** The network diagram on the wall behind everything. */
function Topology() {
  const { nodes, links } = useMemo(() => {
    const nodes = [
      [12, 26], [26, 16], [26, 40], [40, 28], [54, 14], [54, 42],
      [68, 26], [82, 18], [82, 40], [94, 30], [40, 60], [58, 68],
      [74, 58], [22, 62], [90, 66],
    ] as [number, number][]
    const links: [number, number][] = [
      [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6],
      [6, 7], [6, 8], [7, 9], [8, 9], [2, 10], [10, 11], [11, 12], [12, 8],
      [13, 10], [0, 13], [12, 14], [9, 14],
    ]
    return { nodes, links }
  }, [])

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 80"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: 0.5, maskImage: 'radial-gradient(80% 70% at 50% 45%, transparent 25%, #000 90%)' }}
    >
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="rgba(120,190,240,.24)"
          strokeWidth={0.16}
          strokeDasharray={i % 3 === 0 ? '1.2 1.6' : undefined}
          style={i % 3 === 0 ? { animation: `entry-dash ${6 + (i % 5)}s linear infinite` } : undefined}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={1.6} fill="rgba(79,214,232,.05)" />
          <circle
            cx={x}
            cy={y}
            r={0.5}
            fill={i % 5 === 0 ? 'rgba(87,217,138,.55)' : 'rgba(140,200,245,.4)'}
            style={{ animation: `entry-pulse ${3 + (i % 4)}s ease-in-out ${i * 0.3}s infinite` }}
          />
        </g>
      ))}
    </svg>
  )
}

/** The facility mark: a hexagon with a lock in it, and a ring that reads. */
function Sigil({ cleared }: { cleared: boolean }) {
  const stroke = cleared ? '#57d98a' : '#4fd6e8'
  return (
    <svg width="66" height="66" viewBox="0 0 100 100" style={{ flex: '0 0 auto' }}>
      <g style={{ transformOrigin: '50px 50px', animation: 'spin-slow 7s linear infinite' }}>
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={stroke}
          strokeOpacity={0.5}
          strokeWidth="1.4"
          strokeDasharray="14 8 3 8"
        />
      </g>
      <polygon
        points="50,10 84,30 84,70 50,90 16,70 16,30"
        fill="rgba(79,214,232,.05)"
        stroke={stroke}
        strokeOpacity={0.55}
        strokeWidth="1.6"
        style={{ filter: `drop-shadow(0 0 6px ${stroke}66)` }}
      />
      {/* Padlock: shackle up once clearance lands */}
      <path
        d={cleared ? 'M40 46 v-8 a10 10 0 0 1 20 0 v2' : 'M40 46 v-8 a10 10 0 0 1 20 0 v8'}
        fill="none"
        stroke={stroke}
        strokeWidth="3.4"
        strokeLinecap="round"
        style={{ transition: 'd .4s ease' }}
      />
      <rect x="36" y="46" width="28" height="22" rx="3" fill="rgba(4,8,12,.9)" stroke={stroke} strokeWidth="2.6" />
      <circle cx="50" cy="57" r="2.6" fill={stroke} />
    </svg>
  )
}
