import { useEffect, useRef, useState } from 'react'
import Panel from './Panel'
import DesktopIcons from './DesktopIcons'
import WindowLayer from './WindowLayer'
import Launcher from './Launcher'
import NotificationLayer from './NotificationLayer'
import { useShortcuts } from './shortcuts'
import { menu } from './ContextMenu'
import { launchApp } from './launch'
import { DESKTOP, useFs } from '@/store/fs'
import { useSystem, useWallpaper, wallpapers } from '@/store/system'
import { useNotifications } from '@/store/notifications'
import { toScreen } from '@/os/screen'
import { owner } from '@/data/portfolio'

export default function Desktop() {
  const wallpaper = useWallpaper()
  const update = useSystem((s) => s.update)
  const fs = useFs()
  const [launcherOpen, setLauncherOpen] = useState(false)
  const surfaceRef = useRef<HTMLDivElement>(null)

  useShortcuts({ launcherOpen, setLauncherOpen })

  // Marquee (rubber-band) selection over the desktop surface.
  const [marquee, setMarquee] = useState<DOMRect | null>(null)
  const marqueeStart = useRef<{ x: number; y: number } | null>(null)

  // The welcome notification — the moment the visitor learns where they are.
  const greeted = useRef(false)
  useEffect(() => {
    if (greeted.current) return
    greeted.current = true
    const t1 = setTimeout(() => {
      useNotifications.getState().notify({
        title: `Welcome to ${owner.osName}`,
        body: 'A guest session on a real desktop. Open Workspace to see every bench at once — development, security lab, network, projects.',
        glyph: '👋',
        timeout: 11000,
      })
    }, 900)
    const t2 = setTimeout(() => {
      useNotifications.getState().notify({
        title: 'Tip: press Ctrl/⌘ + K',
        body: 'Searches everything — stations, projects, security topics, files. F1 lists every shortcut.',
        glyph: '⌨️',
        timeout: 8000,
      })
    }, 7000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const desktopMenu = menu([
    {
      label: 'New Folder',
      glyph: '📁',
      onClick: () => fs.mkdir(DESKTOP),
    },
    { label: 'Open Terminal', glyph: '❯', hint: 'Ctrl+Alt+T', onClick: () => launchApp('terminal') },
    { label: 'Open Files', glyph: '🗂️', onClick: () => launchApp('files') },
    { label: 'Open Workspace Map', glyph: '🧭', hint: 'Ctrl+Alt+W', onClick: () => launchApp('stations') },
    { separator: true },
    {
      label: 'Change Wallpaper',
      glyph: '🖼️',
      children: wallpapers.map((w) => ({
        label: w.name,
        glyph: wallpaper.id === w.id ? '•' : '',
        onClick: () => update('wallpaper', w.id),
      })),
    },
    { label: 'Display Settings', glyph: '⚙️', onClick: () => launchApp('settings', { page: 'appearance' }) },
    { separator: true },
    { label: 'About This Machine', glyph: 'ⓘ', onClick: () => launchApp('settings', { page: 'about' }) },
  ])

  return (
    <div
      ref={surfaceRef}
      className="absolute inset-0 overflow-hidden"
      style={{ background: wallpaper.css }}
      onContextMenu={desktopMenu}
      onPointerDown={(e) => {
        // Only start a marquee on the bare desktop, with the left button.
        if (e.button !== 0) return
        if (e.target !== e.currentTarget) return
        marqueeStart.current = toScreen(e.clientX, e.clientY)
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        const s = marqueeStart.current
        if (!s) return
        const p = toScreen(e.clientX, e.clientY)
        setMarquee(
          new DOMRect(Math.min(s.x, p.x), Math.min(s.y, p.y), Math.abs(p.x - s.x), Math.abs(p.y - s.y)),
        )
      }}
      onPointerUp={(e) => {
        if (marqueeStart.current) e.currentTarget.releasePointerCapture(e.pointerId)
        marqueeStart.current = null
        setMarquee(null)
      }}
    >
      {/* A faint vignette so window chrome always has something to sit against. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(120% 100% at 50% 0%, transparent 40%, rgba(0,0,0,.35) 100%)' }}
      />

      <DesktopIcons marquee={marquee} />

      {marquee && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: marquee.left,
            top: marquee.top,
            width: marquee.width,
            height: marquee.height,
            background: 'color-mix(in oklab, var(--accent) 18%, transparent)',
            boxShadow: 'inset 0 0 0 1px var(--accent)',
            borderRadius: 3,
          }}
        />
      )}

      <WindowLayer />

      {/* One bar. Launcher, tasks and tray all live in it — see Panel.tsx. */}
      <Panel onToggleLauncher={() => setLauncherOpen((v) => !v)} />
      <NotificationLayer />

      {launcherOpen && <Launcher onClose={() => setLauncherOpen(false)} />}
    </div>
  )
}
