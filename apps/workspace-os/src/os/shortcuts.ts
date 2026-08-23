import { useEffect } from 'react'
import { useWindows } from '@/store/windows'
import { useSystem } from '@/store/system'
import { launchApp } from '@/os/launch'
import { notify } from '@/store/notifications'
import { isScreenActive } from '@/os/screen'

/** True when the event came from somewhere the user is typing. */
function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
}

/**
 * Global keyboard shortcuts. Deliberately close to a GNOME/KDE keymap so
 * anyone who uses Linux can drive this without being told how.
 */
export function useShortcuts({
  launcherOpen,
  setLauncherOpen,
}: {
  launcherOpen: boolean
  setLauncherOpen: (v: boolean) => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // You can't type at a machine you're stood across the room from.
      if (!isScreenActive()) return
      const wm = useWindows.getState()
      const sys = useSystem.getState()
      const typing = isTyping(e.target)

      // Super / Meta — the app launcher, like every desktop of the last decade.
      if ((e.key === 'Meta' || e.key === 'OS') && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setLauncherOpen(!launcherOpen)
        return
      }

      // Ctrl/Cmd+K — the command palette. Same surface as the launcher, but
      // reachable with the chord every other tool has trained people to press.
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setLauncherOpen(true)
        return
      }

      // Ctrl+Alt+T — terminal.
      if (e.ctrlKey && e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault()
        launchApp('terminal')
        return
      }

      // Alt+Tab — cycle windows.
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault()
        wm.cycleFocus(e.shiftKey)
        return
      }

      // Alt+F4 — close the focused window.
      if (e.altKey && e.key === 'F4') {
        e.preventDefault()
        wm.closeFocused()
        return
      }

      // Super+D — show desktop.
      if (e.metaKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        wm.toggleShowDesktop()
        return
      }

      // Super+L — lock.
      if (e.metaKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault()
        sys.lock()
        return
      }

      // Super + arrows — tile the focused window.
      if (e.metaKey && wm.focusedId && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        if (e.key === 'ArrowLeft') wm.snap(wm.focusedId, 'left')
        else if (e.key === 'ArrowRight') wm.snap(wm.focusedId, 'right')
        else if (e.key === 'ArrowUp') wm.toggleMaximize(wm.focusedId)
        else wm.minimize(wm.focusedId)
        return
      }

      // Ctrl+Alt+E — get up from the desk and walk around the room. Only
      // meaningful when the display is actually on the desk.
      if (e.ctrlKey && e.altKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault()
        if (sys.settings.display === 'panel') sys.setView('explore')
        else
          notify({
            title: 'The display is popped out',
            body: 'Put it back on the desk (Settings → Interface) to walk around the room.',
            glyph: '⤳',
          })
        return
      }

      // Ctrl+Alt+W — the workspace map, for anyone who lands without a route in.
      if (e.ctrlKey && e.altKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault()
        launchApp('stations')
        return
      }

      if (typing) return

      // Escape closes the launcher.
      if (e.key === 'Escape' && launcherOpen) {
        e.preventDefault()
        setLauncherOpen(false)
        return
      }

      // F1 — the "what can I do here" hint.
      if (e.key === 'F1') {
        e.preventDefault()
        notify({
          title: 'Keyboard shortcuts',
          body: 'Ctrl/⌘+K: search everything · Ctrl+Alt+E: walk around the room · Super: launcher · Ctrl+Alt+W: workspace map · Ctrl+Alt+T: terminal · Alt+Tab: switch · Alt+F4: close · Super+←/→: tile · Super+D: show desktop · Super+L: lock',
          glyph: '⌨️',
          timeout: 12000,
        })
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [launcherOpen, setLauncherOpen])
}
