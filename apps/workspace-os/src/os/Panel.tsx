import { useEffect, useRef, useState } from 'react'
import { useSystem } from '@/store/system'
import { useWindows, DOCK_H } from '@/store/windows'
import { useNotifications } from '@/store/notifications'
import { appById, dockApps } from '@/apps/registry'
import { launchApp } from '@/os/launch'
import { menu } from '@/os/ContextMenu'
import { owner } from '@/data/portfolio'
import type { AppId } from '@/os/types'

export default function Panel({ onToggleLauncher }: { onToggleLauncher: () => void }) {
  const sys = useSystem()
  const windows = useWindows((s) => s.windows)
  const focusedId = useWindows((s) => s.focusedId)
  const toggleMinimize = useWindows((s) => s.toggleMinimize)
  const focusWindow = useWindows((s) => s.focus)
  const { history, clearHistory, doNotDisturb, toggleDnd } = useNotifications()

  const [now, setNow] = useState(new Date())
  const [tray, setTray] = useState<null | 'notifications' | 'system'>(null)

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Battery drains gently so the indicator isn't static furniture.
  useEffect(() => {
    const t = window.setInterval(() => {
      useSystem.setState((s) => ({ battery: s.charging ? Math.min(100, s.battery + 1) : Math.max(4, s.battery - 1) }))
    }, 45000)
    return () => clearInterval(t)
  }, [])


  // Pinned launchers first, then anything running that is not pinned — the
  // behaviour of the icontasks widget this is modelled on.
  const runningIds = [...new Set(windows.map((w) => w.appId))]
  const taskIds = [...dockApps.map((a) => a.id), ...runningIds.filter((id) => !dockApps.some((a) => a.id === id))]

  /** Click cycles focus → minimise → next window of the same app. */
  function activate(appId: AppId) {
    const forApp = windows.filter((w) => w.appId === appId).sort((a, b) => b.z - a.z)
    if (forApp.length === 0) return void launchApp(appId)
    const top = forApp[0]
    if (top.id === focusedId && !top.minimized) {
      if (forApp.length > 1) focusWindow(forApp[1].id)
      else toggleMinimize(top.id)
    } else {
      focusWindow(top.id)
    }
  }

  return (
    <>
      {/*
        One bar, along the bottom.

        The workstation this is modelled on runs a single KDE panel at
        `location=4` holding kickoff, a pager, icontasks and the system tray —
        not the two-bar GNOME arrangement this shell shipped with. So the
        launcher, the task list and the tray live here together, and there is
        no top panel at all.
      */}
      <header
        className={`absolute inset-x-0 bottom-0 z-[1000] flex items-center gap-1 px-1.5 text-[12px] ${sys.settings.transparency ? 'glass' : 'glass-solid'}`}
        style={{ height: DOCK_H, borderTop: '1px solid var(--chrome-border)' }}
        onContextMenu={menu([
          { label: 'Settings', glyph: '⚙️', onClick: () => launchApp('settings') },
          { label: 'System Monitor', glyph: '📊', onClick: () => launchApp('monitor') },
          { separator: true },
          { label: 'Show Desktop', glyph: '🖥️', hint: 'Super+D', onClick: () => useWindows.getState().toggleShowDesktop() },
        ])}
      >
        {/* Kickoff. A launcher button, not a word — same as the real panel. */}
        <button
          type="button"
          onClick={onToggleLauncher}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors hover:bg-white/10"
          title="Applications (Super)"
          aria-label="Applications"
        >
          <span className="grid h-4 w-4 grid-cols-2 gap-[2.5px]">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="rounded-[1.5px]"
                style={{ background: 'var(--accent)', opacity: i === 0 ? 1 : 0.55 + i * 0.1 }}
              />
            ))}
          </span>
        </button>

        <span className="mx-0.5 h-6 w-px shrink-0" style={{ background: 'var(--chrome-border)' }} />

        {/* Task icons: pinned launchers and running windows in one strip. */}
        <div className="task-strip flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {taskIds.map((id) => {
            const meta = appById(id)
            if (!meta) return null
            const open = windows.filter((w) => w.appId === id)
            const isFocused = open.some((w) => w.id === focusedId && !w.minimized)
            return (
              <button
                key={id}
                type="button"
                onClick={() => activate(id)}
                title={open.length ? open[0].title : meta.name}
                aria-label={meta.name}
                className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[17px] transition-colors hover:bg-white/10"
                style={{ background: isFocused ? 'color-mix(in oklab, var(--text) 12%, transparent)' : undefined }}
                onContextMenu={menu(
                  open.length
                    ? [
                        { label: 'New Window', glyph: meta.glyph, onClick: () => launchApp(id) },
                        { separator: true },
                        { label: 'Close', glyph: '✕', onClick: () => useWindows.getState().closeApp(id) },
                      ]
                    : [{ label: `Open ${meta.name}`, glyph: meta.glyph, onClick: () => launchApp(id) }],
                )}
              >
                <span style={{ opacity: open.some((w) => !w.minimized) || !open.length ? 1 : 0.55 }}>{meta.glyph}</span>
                {/* Running indicator: a dash under the icon, as icontasks draws it. */}
                {open.length > 0 && (
                  <span
                    className="absolute bottom-[3px] h-[2.5px] rounded-full transition-all"
                    style={{
                      width: isFocused ? 14 : 6,
                      background: isFocused ? 'var(--accent)' : 'var(--text-dim)',
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Tray */}
        <div className="ml-auto flex items-center gap-0.5">
          <TrayButton
            title="Notifications"
            onClick={() => setTray(tray === 'notifications' ? null : 'notifications')}
            active={tray === 'notifications'}
          >
            <span className="relative">
              {doNotDisturb ? '🔕' : '🔔'}
              {history.length > 0 && !doNotDisturb && (
                <span
                  className="absolute -top-0.5 -right-1 h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </span>
          </TrayButton>

          <TrayButton title="System" onClick={() => setTray(tray === 'system' ? null : 'system')} active={tray === 'system'}>
            <span className="flex items-center gap-1.5">
              <span>{sys.wifiConnected ? '📶' : '📵'}</span>
              <span>{sys.muted || sys.volume === 0 ? '🔇' : sys.volume > 50 ? '🔊' : '🔉'}</span>
              <span className="flex items-center gap-1">
                <BatteryIcon level={sys.battery} charging={sys.charging} />
                <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-dim)' }}>
                  {sys.battery}%
                </span>
              </span>
            </span>
          </TrayButton>

          {/* Two lines, time over date — the digital clock widget's default. */}
          <button
            type="button"
            className="rounded-md px-2.5 py-1 text-center leading-[1.12] tabular-nums transition-colors hover:bg-white/10"
            title={now.toDateString()}
            onClick={() => launchApp('calendar')}
          >
            <span className="block text-[12px] font-medium">
              {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="block text-[10px]" style={{ color: 'var(--text-dim)' }}>
              {now.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </span>
          </button>
        </div>
      </header>

      {tray && <TrayPanel kind={tray} onClose={() => setTray(null)} history={history} clearHistory={clearHistory} doNotDisturb={doNotDisturb} toggleDnd={toggleDnd} />}
    </>
  )
}

function TrayButton({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-md px-2 py-1 transition-colors hover:bg-white/10"
      style={{ background: active ? 'var(--accent-soft)' : undefined }}
    >
      {children}
    </button>
  )
}

function BatteryIcon({ level, charging }: { level: number; charging: boolean }) {
  return (
    <span className="relative inline-flex h-[11px] w-[21px] items-center rounded-[3px] px-[2px]" style={{ boxShadow: 'inset 0 0 0 1.2px var(--text-dim)' }}>
      <span
        className="h-[5px] rounded-[1px] transition-[width]"
        style={{
          width: `${Math.max(6, (level / 100) * 15)}px`,
          background: level < 15 ? '#f87171' : charging ? '#4ade80' : 'var(--text)',
        }}
      />
      <span className="absolute -right-[3px] h-[5px] w-[2px] rounded-r-[1px]" style={{ background: 'var(--text-dim)' }} />
    </span>
  )
}

function TrayPanel({
  kind,
  onClose,
  history,
  clearHistory,
  doNotDisturb,
  toggleDnd,
}: {
  kind: 'notifications' | 'system'
  onClose: () => void
  history: ReturnType<typeof useNotifications.getState>['history']
  clearHistory: () => void
  doNotDisturb: boolean
  toggleDnd: () => void
}) {
  const sys = useSystem()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    // Defer so the click that opened the panel doesn't immediately close it.
    const t = setTimeout(() => window.addEventListener('pointerdown', onDown), 0)
    return () => {
      clearTimeout(t)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className="glass absolute right-2 z-[1001] w-[320px] rounded-xl p-3"
      style={{ bottom: DOCK_H + 6, boxShadow: '0 20px 60px -14px rgba(0,0,0,.7), inset 0 0 0 1px var(--chrome-border)' }}
    >
      {kind === 'notifications' ? (
        <>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-semibold">Notifications</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={toggleDnd}
                className="rounded-md px-2 py-1 text-[11px] hover:bg-white/10"
                style={{ color: doNotDisturb ? 'var(--accent)' : 'var(--text-dim)' }}
              >
                {doNotDisturb ? 'DND on' : 'DND off'}
              </button>
              <button type="button" onClick={clearHistory} className="rounded-md px-2 py-1 text-[11px] hover:bg-white/10" style={{ color: 'var(--text-dim)' }}>
                Clear
              </button>
            </div>
          </div>
          {history.length === 0 ? (
            <p className="py-6 text-center text-[12px]" style={{ color: 'var(--text-dim)' }}>
              No notifications
            </p>
          ) : (
            <div className="max-h-72 space-y-1.5 overflow-y-auto">
              {history.map((n) => (
                <div key={n.id} className="rounded-lg p-2.5" style={{ background: 'color-mix(in oklab, var(--text) 7%, transparent)' }}>
                  <div className="flex items-baseline gap-2">
                    <span>{n.glyph}</span>
                    <span className="flex-1 text-[12px] font-medium">{n.title}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                      {new Date(n.at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {n.body && (
                    <p className="mt-0.5 pl-6 text-[11.5px]" style={{ color: 'var(--text-dim)' }}>
                      {n.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full text-[13px] font-bold" style={{ background: 'var(--accent)', color: '#fff' }}>
              {owner.avatarInitials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-semibold">{owner.name}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                Guest session
              </div>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-1.5">
            <QuickToggle label={sys.wifiConnected ? 'Wi-Fi on' : 'Wi-Fi off'} glyph={sys.wifiConnected ? '📶' : '📵'} on={sys.wifiConnected} onClick={sys.toggleWifi} />
            <QuickToggle label={sys.muted ? 'Muted' : 'Sound on'} glyph={sys.muted ? '🔇' : '🔊'} on={!sys.muted} onClick={sys.toggleMute} />
            <QuickToggle label={sys.settings.dark ? 'Dark' : 'Light'} glyph={sys.settings.dark ? '🌙' : '☀️'} on={sys.settings.dark} onClick={() => sys.update('dark', !sys.settings.dark)} />
            <QuickToggle label="Settings" glyph="⚙️" onClick={() => { launchApp('settings'); onClose() }} />
          </div>

          <div className="mb-3">
            <div className="mb-1 flex justify-between text-[11px]" style={{ color: 'var(--text-dim)' }}>
              <span>Volume</span>
              <span>{sys.muted ? 'muted' : `${sys.volume}%`}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={sys.muted ? 0 : sys.volume}
              onChange={(e) => sys.setVolume(Number(e.target.value))}
              className="w-full cursor-pointer accent-[var(--accent)]"
              aria-label="Volume"
            />
          </div>

          <div className="flex gap-1.5 border-t pt-2.5" style={{ borderColor: 'var(--chrome-border)' }}>
            <PowerButton glyph="🔒" label="Lock" onClick={() => { onClose(); sys.lock() }} />
            <PowerButton glyph="🔄" label="Restart" onClick={() => { onClose(); sys.reboot() }} />
            <PowerButton glyph="⏻" label="Shut down" onClick={() => { onClose(); sys.shutdown() }} />
          </div>
        </>
      )}
    </div>
  )
}

function QuickToggle({ label, glyph, on, onClick }: { label: string; glyph: string; on?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11.5px] transition-colors"
      style={{
        background: on ? 'var(--accent-soft)' : 'color-mix(in oklab, var(--text) 7%, transparent)',
        color: 'var(--text)',
      }}
    >
      <span>{glyph}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

function PowerButton({ glyph, label, onClick }: { glyph: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-[10.5px] transition-colors hover:bg-white/10"
      style={{ color: 'var(--text-dim)' }}
    >
      <span className="text-[14px]">{glyph}</span>
      {label}
    </button>
  )
}
