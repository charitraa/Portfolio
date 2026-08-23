import { AnimatePresence, motion } from 'framer-motion'
import { Power } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ComponentId } from '../board/layout'
import { identity } from '../data/content'

export type BootPhase = 'off' | 'post' | 'ready'

type Step = { text: string; id?: ComponentId; ms?: number }

const STEPS: Step[] = [
  { text: 'Power connected — ATX 24-pin OK', id: 'psu', ms: 420 },
  { text: 'Checking voltage rails ......... +12.0V +5.0V +3.3V', id: 'vrm', ms: 380 },
  { text: `Initializing CPU ............... ${identity.name} @ ${identity.clock}`, id: 'cpu', ms: 480 },
  { text: 'Detecting memory ............... 4 banks / 48GB', id: 'ram', ms: 340 },
  { text: 'Loading storage ................ NVMe volume mounted', id: 'ssd', ms: 320 },
  { text: 'Connecting GPU ................. render pipeline ready', id: 'gpu', ms: 340 },
  { text: 'Initializing network ........... link up, 1000BASE-T', id: 'nic', ms: 300 },
  { text: 'Reading firmware ............... UEFI v2026.08', id: 'bios', ms: 260 },
  { text: 'Enumerating USB devices ........ 6 ports', id: 'usb', ms: 220 },
  { text: 'Scanning PCIe lanes ............ 4 cards seated', id: 'pcie', ms: 220 },
  { text: 'Audio codec .................... online', id: 'audio', ms: 180 },
  { text: 'CMOS ........................... settings retained', id: 'cmos', ms: 180 },
  { text: 'Fan curve applied .............. thermals nominal', id: 'fan', ms: 180 },
  { text: 'Decoupling caps ................ stable', id: 'caps', ms: 160 },
  { text: 'Expansion card ................. detected', id: 'expansion', ms: 160 },
  { text: 'Rear I/O ....................... ready', id: 'ports', ms: 200 },
  { text: 'SYSTEM READY', ms: 500 },
]

type Props = {
  phase: BootPhase
  onPowerOn: () => void
  onEnergise: (id: ComponentId) => void
  onDone: () => void
  beep: (kind: 'click' | 'tick' | 'ready') => void
}

export function BootSequence({ phase, onPowerOn, onEnergise, onDone, beep }: Props) {
  const [lines, setLines] = useState<string[]>([])
  const timers = useRef<number[]>([])

  useEffect(() => {
    if (phase !== 'post') return
    let t = 0
    STEPS.forEach((step, i) => {
      t += step.ms ?? 260
      const handle = window.setTimeout(() => {
        setLines((prev) => [...prev, step.text])
        if (step.id) onEnergise(step.id)
        beep(i === STEPS.length - 1 ? 'ready' : 'tick')
        if (i === STEPS.length - 1) window.setTimeout(onDone, 650)
      }, t)
      timers.current.push(handle)
    })
    const snapshot = timers.current
    return () => snapshot.forEach(window.clearTimeout)
  }, [phase, onEnergise, onDone, beep])

  const skip = () => {
    timers.current.forEach(window.clearTimeout)
    setLines(STEPS.map((s) => s.text))
    STEPS.forEach((s) => s.id && onEnergise(s.id))
    onDone()
  }

  return (
    <AnimatePresence>
      {phase === 'off' && (
        <motion.div
          key="off"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[70] grid place-items-center bg-[#050810]"
        >
          <div className="flex flex-col items-center gap-7 px-6 text-center">
            <div>
              <div className="font-mono text-[11px] tracking-[0.4em] text-slate-500">CIRCUIT OS</div>
              <h1 className="mt-2 font-display text-4xl font-bold tracking-[0.06em] text-slate-100 sm:text-5xl">
                {identity.name}
              </h1>
              <p className="mt-2 font-mono text-[12px] tracking-[0.2em] text-slate-400">
                {identity.role.toUpperCase()}
              </p>
            </div>

            <button
              onClick={() => {
                beep('click')
                onPowerOn()
              }}
              className="group relative grid h-24 w-24 place-items-center rounded-full border border-slate-700 bg-slate-900 transition hover:border-blue-500"
              aria-label="Power on"
            >
              <span className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl transition group-hover:bg-blue-500/25" />
              <span className="breathe absolute inset-2 rounded-full border border-blue-500/40" />
              <Power className="relative h-9 w-9 text-blue-400 transition group-hover:text-blue-300" />
            </button>

            <p className="font-mono text-[11px] tracking-[0.25em] text-slate-600">PRESS POWER TO BOOT</p>
          </div>
        </motion.div>
      )}

      {phase === 'post' && (
        <motion.div
          key="post"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[70] flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ backgroundColor: 'rgba(5,8,16,1)' }}
            animate={{ backgroundColor: 'rgba(5,8,16,0.55)' }}
            transition={{ duration: 2.6, delay: 1.2 }}
            className="absolute inset-0"
          />
          <div className="relative w-full max-w-2xl rounded-lg border border-slate-800 bg-[#070c16]/90 p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono text-[10px] tracking-[0.24em] text-amber-400">
                POWER-ON SELF TEST
              </span>
              <button
                onClick={skip}
                className="font-mono text-[10px] tracking-[0.18em] text-slate-500 transition hover:text-slate-300"
              >
                SKIP →
              </button>
            </div>
            <div className="scrollbar-thin max-h-[46vh] space-y-1 overflow-y-auto font-mono text-[12px] leading-relaxed">
              {lines.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={
                    l === 'SYSTEM READY'
                      ? 'pt-1 font-bold tracking-[0.3em] text-green-400'
                      : 'text-slate-400'
                  }
                >
                  {l !== 'SYSTEM READY' && <span className="text-green-500">[ OK ] </span>}
                  {l}
                </motion.div>
              ))}
              <span className="inline-block h-3 w-2 animate-pulse bg-green-400 align-middle" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
