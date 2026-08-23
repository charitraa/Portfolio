import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { apps } from '@/apps/registry'
import { owner, stations } from '@/data/portfolio'
import { useSystem } from '@/store/system'
import { isScreenActive } from '@/os/screen'

/** Plays a scripted list of lines with per-line delays. */
function useScript(lines: { text: string; delay: number }[], onDone: () => void) {
  const [shown, setShown] = useState<string[]>([])
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    let cancelled = false
    let i = 0
    const timers: number[] = []

    const step = () => {
      if (cancelled || i >= lines.length) {
        if (!cancelled) timers.push(window.setTimeout(() => doneRef.current(), 500))
        return
      }
      const line = lines[i++]
      setShown((s) => [...s, line.text])
      timers.push(window.setTimeout(step, line.delay))
    }
    timers.push(window.setTimeout(step, 220))

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return shown
}

function CrtSurface({ children, onSkip }: { children: React.ReactNode; onSkip?: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  })

  return (
    <div className="scanlines crt absolute inset-0 overflow-hidden" style={{ background: '#05070a' }}>
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto p-6 font-mono text-[12.5px] leading-[1.5] sm:p-10 sm:text-[13px]"
        style={{ color: '#c9d6c9', textShadow: '0 0 6px rgba(120,255,160,.28)' }}
      >
        {children}
      </div>
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="absolute right-4 bottom-4 rounded-lg px-3 py-1.5 font-mono text-[11px] transition-colors hover:bg-white/10"
          style={{ color: '#6f8a76', boxShadow: 'inset 0 0 0 1px rgba(140,200,160,.28)' }}
        >
          Skip intro →
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// BIOS / POST
// ---------------------------------------------------------------------------

export function PostScreen() {
  const setPhase = useSystem((s) => s.setPhase)
  const skipIntro = useSystem((s) => s.skipIntro)

  const lines = [
    { text: `${owner.osName} BIOS v${owner.osVersion} — Developer Edition`, delay: 260 },
    { text: 'Copyright (C) 2026. All wrongs reversed.', delay: 380 },
    { text: '', delay: 120 },
    { text: 'Performing Power-On Self Test…', delay: 420 },
    { text: '', delay: 100 },
    { text: '  CPU        Human Brain (1 core, 3.2 GHz) ........ OK', delay: 300 },
    { text: '  Memory     16384 MB DDR5 ....................... OK', delay: 280 },
    { text: '  Storage    /dev/portfolio 100 GB ............... OK', delay: 280 },
    { text: '  Display    1 monitor detected ................. OK', delay: 260 },
    { text: '  Keyboard   detected, RGB present .............. OK', delay: 240 },
    { text: '  Mouse      detected ........................... OK', delay: 240 },
    { text: '  Network    wlan0 up ........................... OK', delay: 300 },
    { text: '', delay: 200 },
    { text: 'Boot order: 1. /dev/portfolio  2. Network  3. Give up', delay: 420 },
    { text: `Loading ${owner.osName} kernel…`, delay: 700 },
  ]

  const shown = useScript(lines, () => setPhase('boot'))

  return (
    <CrtSurface onSkip={skipIntro}>
      {shown.map((l, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {l || ' '}
        </div>
      ))}
      <span className="caret">█</span>
    </CrtSurface>
  )
}

// ---------------------------------------------------------------------------
// Kernel + init
// ---------------------------------------------------------------------------

export function BootScreen() {
  const setPhase = useSystem((s) => s.setPhase)
  const skipIntro = useSystem((s) => s.skipIntro)

  const ok = (s: string) => `[  OK  ] ${s}`
  const lines = [
    { text: `Booting ${owner.osName} ${owner.osVersion} (${owner.osCodename}) — kernel ${owner.osVersion}.0-web-react`, delay: 320 },
    { text: '', delay: 90 },
    { text: ok('Mounted /dev/portfolio on /'), delay: 160 },
    { text: ok('Started Virtual Filesystem Service'), delay: 150 },
    { text: ok('Reached target Local File Systems'), delay: 140 },
    { text: ok('Started Window Manager (react-wm)'), delay: 190 },
    { text: ok('Started Notification Daemon'), delay: 140 },
    { text: ok('Started Audio Synthesiser (webaudio)'), delay: 150 },
    { text: ok('Started Network Manager — wlan0 connected to home-5G'), delay: 210 },
    { text: ok(`Loaded application registry (${apps.length} applications)`), delay: 180 },
    { text: ok(`Mounted workspace stations (${stations.length} benches)`), delay: 170 },
    { text: ok('Started Security Lab — isolated, no external targets'), delay: 200 },
    { text: ok('Indexed portfolio data — projects, skills, security, learning'), delay: 200 },
    { text: ok('Started Display Manager'), delay: 320 },
    { text: '', delay: 120 },
    { text: `Welcome to ${owner.osName}.`, delay: 520 },
  ]

  const shown = useScript(lines, () => setPhase('login'))

  return (
    <CrtSurface onSkip={skipIntro}>
      {shown.map((l, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {l.includes('OK') ? (
            <>
              <span style={{ color: '#9aa5a0' }}>[  </span>
              <span style={{ color: '#4ade80', fontWeight: 700 }}>OK</span>
              <span style={{ color: '#9aa5a0' }}>  ] </span>
              {l.split('] ')[1]}
            </>
          ) : (
            l || ' '
          )}
        </div>
      ))}
      <span className="caret">█</span>
    </CrtSurface>
  )
}

// ---------------------------------------------------------------------------
// Greeter
// ---------------------------------------------------------------------------

export function LoginScreen() {
  const login = useSystem((s) => s.login)
  const [pressed, setPressed] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isScreenActive()) return
      if (e.key === 'Enter' || e.key === ' ') enter()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function enter() {
    if (pressed) return
    setPressed(true)
    setTimeout(login, 460)
  }

  return (
    <div
      className="absolute inset-0 grid place-items-center transition-opacity duration-500"
      style={{
        background: 'radial-gradient(110% 90% at 50% 20%, #26304a 0%, #161c28 45%, #0b0e14 100%)',
        opacity: pressed ? 0 : 1,
      }}
    >
      <div className="absolute top-8 w-full text-center">
        <div className="text-5xl font-extralight tracking-tight tabular-nums">
          {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="mt-1 text-[13px]" style={{ color: 'var(--text-dim)' }}>
          {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      <button type="button" onClick={enter} className="flex flex-col items-center gap-4">
        <div
          className="grid h-24 w-24 place-items-center rounded-full text-2xl font-bold transition-transform hover:scale-105"
          style={{
            background: 'linear-gradient(140deg, var(--accent), color-mix(in oklab, var(--accent) 40%, #000))',
            color: '#fff',
            boxShadow: '0 0 0 2px rgba(255,255,255,.12), 0 20px 50px -18px rgba(0,0,0,.9)',
          }}
        >
          {owner.avatarInitials}
        </div>
        <div className="text-center">
          <div className="text-[17px] font-semibold">Guest</div>
          <div className="mt-0.5 text-[12.5px]" style={{ color: 'var(--text-dim)' }}>
            No password required — {owner.name} left it unlocked for you
          </div>
        </div>
        <div
          className="mt-2 rounded-lg px-5 py-2 text-[13px] font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Sign in
        </div>
      </button>

      <div className="absolute bottom-6 text-center text-[11.5px]" style={{ color: 'var(--text-dim)' }}>
        {owner.osName} {owner.osVersion} · {owner.osCodename} · press Enter to continue
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Lock screen
// ---------------------------------------------------------------------------

export function LockScreen() {
  const unlock = useSystem((s) => s.unlock)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isScreenActive()) return
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') unlock()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [unlock])

  return (
    <button
      type="button"
      onClick={unlock}
      className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3"
      style={{ background: 'rgba(6,9,14,.94)', backdropFilter: 'blur(16px)' }}
    >
      <div className="text-7xl font-extralight tracking-tighter tabular-nums">
        {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-[14px]" style={{ color: 'var(--text-dim)' }}>
        {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
      <div className="mt-8 flex items-center gap-2.5 text-[12.5px]" style={{ color: 'var(--text-dim)' }}>
        <span>🔒</span> Session locked — click anywhere or press Enter
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Shutdown
// ---------------------------------------------------------------------------

export function ShutdownScreen() {
  return (
    <div className="absolute inset-0 grid place-items-center" style={{ background: '#05070a' }}>
      <div className="text-center">
        <div
          className="mx-auto mb-5 h-8 w-8 rounded-full border-2 border-transparent"
          style={{ borderTopColor: 'var(--accent)', animation: 'spin-slow 0.9s linear infinite' }}
        />
        <div className="font-mono text-[13px]" style={{ color: '#8fa39a' }}>
          {owner.osName} is shutting down…
        </div>
      </div>
    </div>
  )
}
