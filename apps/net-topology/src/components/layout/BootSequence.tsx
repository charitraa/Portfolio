import { useEffect, useState } from 'react'
import { AnimatePresence, motion as m } from 'framer-motion'
import { profile } from '../../data/profile'

const steps = [
  'Connecting…',
  'Resolving DNS…',
  'Establishing TLS…',
  'Routing through edge…',
  'Loading assets…',
  'Portfolio ready',
]

/** Loading screen: the packet's journey, before you can see the map. */
export function BootSequence({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const reduced =
      document.documentElement.dataset.motion === 'off' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setGone(true)
      onDone()
      return
    }

    const timers = steps.map((_, i) =>
      window.setTimeout(() => setStep(i), i * 420),
    )
    const finish = window.setTimeout(() => {
      setGone(true)
      onDone()
    }, steps.length * 420 + 500)

    return () => {
      timers.forEach(window.clearTimeout)
      window.clearTimeout(finish)
    }
  }, [onDone])

  const progress = ((step + 1) / steps.length) * 100

  return (
    <AnimatePresence>
      {!gone && (
        <m.div
          className="fixed inset-0 z-[60] grid place-items-center bg-bg"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => {
            setGone(true)
            onDone()
          }}
        >
          <div className="w-full max-w-sm px-8">
            <div className="mb-6 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-md border border-accent/40 bg-accent/10">
                <span className="anim-pulse h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-[15px] font-bold text-ink">
                NET<span className="text-accent">://</span>CHARITRA
              </span>
            </div>

            <ul className="space-y-1.5 font-mono text-[11.5px]">
              {steps.map((label, i) => (
                <li
                  key={label}
                  className="flex items-center gap-2 transition-opacity duration-300"
                  style={{ opacity: i <= step ? 1 : 0.25 }}
                >
                  <span className={i < step ? 'text-ok' : i === step ? 'text-accent' : 'text-muted'}>
                    {i < step ? '✓' : i === step ? '›' : '·'}
                  </span>
                  <span className={i === step ? 'text-ink' : 'text-muted'}>{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 h-1 overflow-hidden rounded-full bg-line/60">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-3 flex justify-between font-mono text-[10px] text-muted">
              <span>{profile.domain}</span>
              <span className="tabular-nums">{Math.round(progress)}%</span>
            </div>

            <p className="mt-6 text-center font-mono text-[10px] text-muted/60">click to skip</p>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
