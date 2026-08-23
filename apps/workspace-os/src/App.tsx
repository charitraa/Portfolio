import { Suspense, lazy, useEffect } from 'react'
import { useSystem, accents, useWallpaper } from '@/store/system'
import { initMusic } from '@/store/music'
import ScreenSurface from '@/os/ScreenSurface'
// Deliberately not lazy: this is the screen that covers the frames the room
// spends being fetched and compiled, so it cannot be waiting on a chunk itself.
import EntryLoader from '@/boot/EntryLoader'
import { WebglGuard, WorkspaceUnavailable, hasWebgl } from '@/world/WebglGuard'

// Three.js only ships to visitors who actually look at the room.
const Room3D = lazy(() => import('@/boot/Room3D'))

/** Pushes the settings store into CSS custom properties on :root. */
function useThemeVars() {
  const settings = useSystem((s) => s.settings)
  const wallpaper = useWallpaper()

  useEffect(() => {
    const root = document.documentElement
    const accent = accents.find((a) => a.id === settings.accent)?.value ?? accents[0].value
    root.style.setProperty('--accent', accent)
    root.style.setProperty('--accent-soft', `color-mix(in oklab, ${accent} 24%, transparent)`)
    root.style.fontSize = `${16 * settings.fontScale}px`
    root.dataset.light = String(!settings.dark)
    // Keep the browser UI in step with the wallpaper.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', wallpaper.mood === 'light' ? '#e2e8f0' : '#0b0d12')
  }, [settings, wallpaper])
}

/** Probed once per session, before anything asks for the room. */
const webgl = hasWebgl()

export default function App() {
  const display = useSystem((s) => s.settings.display)
  const entry = useSystem((s) => s.entry)
  useThemeVars()

  // One synthesiser for the session, shared by the Music app and the hi-fi.
  useEffect(initMusic, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      {display === 'panel' ? (
        // The session renders inside the room, on the monitor — and the way in
        // is a corridor, a locked door and the splash that plays over both.
        // A device without WebGL never downloads the room's chunk at all.
        webgl ? (
          <WebglGuard>
            <Suspense fallback={<RoomFallback />}>
              <Room3D />
            </Suspense>
            {entry === 'loading' && <EntryLoader />}
          </WebglGuard>
        ) : (
          <WorkspaceUnavailable />
        )
      ) : (
        <>
          <ScreenSurface mode="fullscreen" />
          <PopIn />
        </>
      )}
    </div>
  )
}

/** Puts the display back on the desk. */
function PopIn() {
  const update = useSystem((s) => s.update)
  return (
    <button
      type="button"
      onClick={() => update('display', 'panel')}
      title="Put the display back on the desk"
      className="absolute right-3 bottom-3 z-[10001] rounded-lg px-3 py-1.5 text-[11.5px] font-medium opacity-45 transition-opacity hover:opacity-100"
      style={{ background: 'rgba(8,11,16,.75)', color: '#dbe6f7', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.16)' }}
    >
      ⤡ Back to the room
    </button>
  )
}

function RoomFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center" style={{ background: '#05070a' }}>
      <div className="text-center">
        <div
          className="mx-auto mb-4 h-7 w-7 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#3b82f6', animation: 'spin-slow .9s linear infinite' }}
        />
        <p className="font-mono text-[12px]" style={{ color: '#6f8090' }}>
          Loading the room…
        </p>
      </div>
    </div>
  )
}
