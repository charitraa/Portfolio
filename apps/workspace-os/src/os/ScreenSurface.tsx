import { useEffect, useRef } from 'react'
import Desktop from '@/os/Desktop'
import { ContextMenuLayer } from '@/os/ContextMenu'
import { BootScreen, LockScreen, LoginScreen, PostScreen, ShutdownScreen } from '@/boot/BootScreens'
import { useSystem } from '@/store/system'
import { measureScreen, registerScreen, SCREEN_H, SCREEN_W, setScreenActive, useScreen } from '@/os/screen'
import { useWindows } from '@/store/windows'

/**
 * Everything the machine displays, and nothing else. The same tree is either
 * pasted onto the monitor in the 3D room (`panel`) or fills the browser window
 * (`fullscreen`) — the shell can't tell the difference, because it measures
 * this element rather than the viewport.
 */
export default function ScreenSurface({ mode }: { mode: 'panel' | 'fullscreen' }) {
  const phase = useSystem((s) => s.phase)
  const ref = useRef<HTMLDivElement>(null)
  const panel = mode === 'panel'

  useEffect(() => {
    registerScreen(ref.current)
    const onResize = () => measureScreen()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      registerScreen(null)
    }
  }, [])

  // A popped-out display is always usable; a panel waits for the camera.
  useEffect(() => {
    if (!panel) setScreenActive(true)
    return () => setScreenActive(false)
  }, [panel])

  // Resolution changes (popping out, rotating a phone) must not leave windows
  // stranded off the edge of the display.
  useEffect(() => useScreen.subscribe(() => useWindows.getState().fitToScreen()), [])

  const desktopMounted = phase === 'desktop' || phase === 'locked'

  return (
    <div
      ref={ref}
      data-screen
      className={panel ? 'relative overflow-hidden' : 'absolute inset-0 overflow-hidden'}
      style={{
        width: panel ? SCREEN_W : undefined,
        height: panel ? SCREEN_H : undefined,
        background: '#04060a',
        // The shell is a pointer surface; a stray text selection mid-drag
        // reads as a bug, and inside a 3D transform it looks worse.
        userSelect: 'none',
      }}
      onPointerDownCapture={measureScreen}
    >
      {/* Nothing is running. On the desk that just means a dark panel — the
          switches are in the room. Popped out, there is no room to walk back
          into, so the display has to offer the power button itself. */}
      {phase === 'room' && !panel && <NoSignal />}

      {phase === 'post' && <PostScreen />}
      {phase === 'boot' && <BootScreen />}
      {phase === 'login' && <LoginScreen />}
      {phase === 'shutdown' && <ShutdownScreen />}

      {desktopMounted && <Desktop />}
      {phase === 'locked' && <LockScreen />}

      <ContextMenuLayer />

      {panel && <Glass />}
    </div>
  )
}

function NoSignal() {
  const powerOn = useSystem((s) => s.powerOn)
  const skipIntro = useSystem((s) => s.skipIntro)

  return (
    <div
      className="absolute inset-0 grid place-items-center px-6 text-center"
      style={{ background: 'radial-gradient(120% 90% at 50% 30%, #10141c 0%, #06080c 70%)' }}
    >
      <div>
        <div className="text-[11px] font-semibold tracking-[0.3em] uppercase" style={{ color: '#4c5a6e' }}>
          No signal
        </div>
        <p className="mx-auto mt-3 max-w-[26rem] text-[13px] leading-relaxed" style={{ color: '#7d8ca1' }}>
          The machine is off. Press the power button, or put the display back in the room and pull the
          light cord yourself.
        </p>

        <button
          type="button"
          onClick={powerOn}
          aria-label="Power on"
          className="mx-auto mt-7 grid h-16 w-16 place-items-center rounded-full transition-transform hover:scale-105"
          style={{ background: '#151a23', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.14), 0 0 40px -8px var(--accent)' }}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M12 3v9" strokeLinecap="round" />
            <path d="M6.4 6.9a8 8 0 1 0 11.2 0" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={skipIntro}
          className="mt-6 rounded-lg px-3 py-1.5 text-[11.5px] transition-colors hover:bg-white/10"
          style={{ color: '#6f8090', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.12)' }}
        >
          Skip the boot →
        </button>
      </div>
    </div>
  )
}

/**
 * The physical panel: a diagonal sheen and a slight darkening towards the
 * edges. Without it the shell reads as a texture pasted onto a box rather than
 * light coming out of a display.
 */
function Glass() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[10000]">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(114deg, rgba(255,255,255,.075) 0%, rgba(255,255,255,.02) 26%, transparent 46%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(130% 110% at 50% 45%, transparent 55%, rgba(0,0,0,.42) 100%)' }}
      />
    </div>
  )
}
