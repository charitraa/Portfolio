import { AnimatePresence, motion } from 'framer-motion'
import { List } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Board } from './board/Board'
import { NODES, NODE_MAP, ACCENT_HEX } from './board/layout'
import type { ComponentId } from './board/layout'
import { Viewport } from './board/Viewport'
import type { ViewportHandle } from './board/Viewport'
import { BootSequence } from './components/BootSequence'
import type { BootPhase } from './components/BootSequence'
import { PowerBar } from './components/PowerBar'
import { SystemMonitor, useTelemetry } from './components/Telemetry'
import { BiosSetup } from './components/BiosSetup'
import { useSound } from './components/useSound'
import { Panel } from './panels/Panel'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

type Toast = { id: number; text: string; tone: string }

export default function App() {
  const [phase, setPhase] = useState<BootPhase>('off')
  const [energised, setEnergised] = useState<Set<ComponentId>>(new Set())
  const [active, setActive] = useState<ComponentId | null>(null)
  const [hovered, setHovered] = useState<ComponentId | null>(null)
  const [visited, setVisited] = useState<Set<ComponentId>>(new Set())
  const [m2Revealed, setM2Revealed] = useState(false)
  const [rgb, setRgb] = useState(false)
  const [sound, setSound] = useState(false)
  const [biosOpen, setBiosOpen] = useState(false)
  const [mobileIndex, setMobileIndex] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const viewport = useRef<ViewportHandle>(null)
  const cpuClicks = useRef({ count: 0, at: 0 })
  const biosPending = useRef<number | null>(null)
  const beep = useSound(sound)

  const publicNodes = useMemo(() => NODES.filter((n) => !n.secret), [])

  const toast = useCallback((text: string, tone = ACCENT_HEX.electric) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, text, tone }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])

  const energise = useCallback((id: ComponentId) => {
    setEnergised((s) => (s.has(id) ? s : new Set(s).add(id)))
  }, [])

  const finishBoot = useCallback(() => setPhase('ready'), [])

  /* ── Easter egg: Konami code ────────────────────────────────────────── */
  useEffect(() => {
    let idx = 0
    const onKey = (e: KeyboardEvent) => {
      const want = KONAMI[idx]
      if (e.key.toLowerCase() === want.toLowerCase()) {
        idx++
        if (idx === KONAMI.length) {
          idx = 0
          setRgb((r) => {
            toast(r ? 'RGB lighting disabled' : 'RGB lighting enabled — because it makes it faster', ACCENT_HEX.memory)
            return !r
          })
          beep('ready')
        }
      } else {
        idx = e.key === KONAMI[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toast, beep])

  /* ── Easter egg: hover every component ──────────────────────────────── */
  const onHover = useCallback(
    (id: ComponentId | null) => {
      setHovered(id)
      if (!id) return
      beep('hover')
      setVisited((v) => (v.has(id) ? v : new Set(v).add(id)))
    },
    [beep],
  )

  // Kept out of the setVisited updater so the reveal fires exactly once.
  useEffect(() => {
    if (m2Revealed) return
    if (!publicNodes.every((n) => visited.has(n.id))) return
    setM2Revealed(true)
    toast('Full board power-up — an unpopulated M.2 slot just lit up', ACCENT_HEX.power)
    beep('ready')
  }, [visited, m2Revealed, publicNodes, toast, beep])

  useEffect(() => {
    if (m2Revealed) energise('m2')
  }, [m2Revealed, energise])

  const powerUp = useMemo(
    () => publicNodes.every((n) => visited.has(n.id)),
    [publicNodes, visited],
  )

  /* ── Selection ──────────────────────────────────────────────────────── */
  const openPanel = useCallback(
    (id: ComponentId) => {
      setActive(id)
      setMobileIndex(false)
      beep('open')
    },
    [beep],
  )

  const onSelect = useCallback(
    (id: ComponentId) => {
      // The BIOS chip answers to two gestures, so its panel waits a beat to see
      // whether a second click is coming.
      if (id === 'bios') {
        if (biosPending.current !== null) {
          window.clearTimeout(biosPending.current)
          biosPending.current = null
          setActive(null)
          setBiosOpen(true)
          beep('click')
          return
        }
        biosPending.current = window.setTimeout(() => {
          biosPending.current = null
          openPanel('bios')
        }, 240)
        return
      }

      if (id === 'cpu') {
        const now = Date.now()
        const c = cpuClicks.current
        c.count = now - c.at < 2200 ? c.count + 1 : 1
        c.at = now
        if (c.count >= 5) {
          c.count = 0
          setM2Revealed(true)
          toast('Developer mode enabled — hidden slots exposed', ACCENT_HEX.signal)
          beep('ready')
        }
      }
      openPanel(id)
    },
    [beep, openPanel, toast],
  )

  // The résumé panel offers the same trip into setup for anyone who never
  // thinks to double-click a chip.
  useEffect(() => {
    const open = () => {
      setActive(null)
      setBiosOpen(true)
    }
    window.addEventListener('circuitos:bios', open)
    return () => window.removeEventListener('circuitos:bios', open)
  }, [])

  const reboot = useCallback(() => {
    setActive(null)
    setBiosOpen(false)
    setEnergised(new Set())
    setVisited(new Set())
    setM2Revealed(false)
    setPhase('off')
    viewport.current?.reset()
  }, [])

  /* ── Telemetry load reacts to what you are doing ────────────────────── */
  const load = phase !== 'ready' ? 8 : active ? 78 : hovered ? 42 : 16
  const telemetry = useTelemetry(load)

  useEffect(() => {
    if (phase !== 'ready') return
    const touch = window.matchMedia('(pointer: coarse)').matches
    const t = window.setTimeout(
      () =>
        toast(
          touch ? 'Pinch to zoom · drag to pan · tap a component' : 'Hover the copper. Click any component.',
          ACCENT_HEX.copper,
        ),
      600,
    )
    return () => window.clearTimeout(t)
  }, [phase, toast])

  return (
    <div className={`flex h-full flex-col ${rgb ? 'rgb-mode' : ''}`}>
      <PowerBar
        ready={phase === 'ready'}
        active={active}
        sound={sound}
        rgb={rgb}
        onSelect={onSelect}
        onToggleSound={() => {
          setSound((s) => !s)
          toast(sound ? 'Audio muted' : 'Audio enabled — POST beeps on', ACCENT_HEX.signal)
        }}
        onReboot={reboot}
        onZoom={(d) => viewport.current?.zoomBy(d)}
        onResetView={() => viewport.current?.reset()}
      />

      <Viewport ref={viewport} interactive={phase === 'ready'}>
        <Board
          energised={energised}
          active={active}
          hovered={hovered}
          powerUp={powerUp}
          m2Revealed={m2Revealed}
          onHover={onHover}
          onSelect={onSelect}
        />
      </Viewport>

      <SystemMonitor t={telemetry} ready={phase === 'ready'} />

      {/* Mobile section index */}
      {phase === 'ready' && (
        <button
          onClick={() => setMobileIndex((v) => !v)}
          className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full border border-slate-700 bg-[#111827]/95 px-4 py-2.5 font-mono text-[11px] tracking-[0.16em] text-slate-300 shadow-lg backdrop-blur lg:hidden"
        >
          <List className="h-4 w-4" /> INDEX
        </button>
      )}

      <AnimatePresence>
        {mobileIndex && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 z-30 max-h-[50vh] overflow-y-auto rounded-xl border border-slate-700 bg-[#0d1424]/97 p-2 shadow-2xl backdrop-blur lg:hidden"
          >
            <div className="grid grid-cols-2 gap-1.5">
              {NODES.filter((n) => !n.secret || m2Revealed).map((n) => (
                <button
                  key={n.id}
                  onClick={() => onSelect(n.id)}
                  className="rounded-lg border border-slate-800 px-3 py-2 text-left transition hover:border-slate-600"
                >
                  <div className="font-mono text-[9px] tracking-[0.18em]" style={{ color: ACCENT_HEX[n.accent] }}>
                    {n.label}
                  </div>
                  <div className="font-display text-[13px] text-slate-200">{n.section}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-40 left-4 right-4 z-[60] flex flex-col gap-2 lg:bottom-24 lg:right-auto lg:w-[340px]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="rounded-lg border bg-[#0d1424]/97 px-3.5 py-2.5 font-mono text-[11px] leading-relaxed shadow-xl backdrop-blur"
              style={{ borderColor: `${t.tone}66`, color: t.tone }}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Panel id={active} onClose={() => setActive(null)} />
      <BiosSetup open={biosOpen} onClose={() => setBiosOpen(false)} />

      <BootSequence
        phase={phase}
        onPowerOn={() => setPhase('post')}
        onEnergise={energise}
        onDone={finishBoot}
        beep={beep}
      />

      {/* Screen-reader / no-JS-friendly outline of the board */}
      <nav className="sr-only" aria-label="Portfolio sections">
        <ul>
          {publicNodes.map((n) => (
            <li key={n.id}>
              <button onClick={() => onSelect(n.id)}>{NODE_MAP[n.id].section}</button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
