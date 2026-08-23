import { useState } from 'react'
import { accents, useSystem, wallpapers } from '@/store/system'
import { Btn, Field, Scroll, Sidebar, SidebarItem, SidebarLabel, StatusBar, Toggle } from '@/os/ui'
import { owner } from '@/data/portfolio'
import { useFs } from '@/store/fs'
import { useNotifications } from '@/store/notifications'
import { useWindows } from '@/store/windows'
import type { AppWindowProps } from '@/os/types'

type Page = 'appearance' | 'desktop' | 'sound' | 'network' | 'about'

export default function SettingsApp({ props }: AppWindowProps) {
  const [page, setPage] = useState<Page>((props.page as Page) ?? 'appearance')
  const sys = useSystem()
  const { settings, update } = sys

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1">
        <Sidebar width={172}>
          <SidebarLabel>Settings</SidebarLabel>
          <SidebarItem glyph="🎨" active={page === 'appearance'} onClick={() => setPage('appearance')}>
            Appearance
          </SidebarItem>
          <SidebarItem glyph="🖥️" active={page === 'desktop'} onClick={() => setPage('desktop')}>
            Desktop
          </SidebarItem>
          <SidebarItem glyph="🔊" active={page === 'sound'} onClick={() => setPage('sound')}>
            Sound
          </SidebarItem>
          <SidebarItem glyph="📶" active={page === 'network'} onClick={() => setPage('network')}>
            Network
          </SidebarItem>
          <SidebarItem glyph="ⓘ" active={page === 'about'} onClick={() => setPage('about')}>
            About
          </SidebarItem>
        </Sidebar>

        <Scroll className="px-5 py-4">
          {page === 'appearance' && (
            <div className="max-w-lg">
              <H>Wallpaper</H>
              <div className="grid grid-cols-3 gap-2.5">
                {wallpapers.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => update('wallpaper', w.id)}
                    className="overflow-hidden rounded-lg text-left transition-transform hover:-translate-y-0.5"
                    style={{
                      boxShadow:
                        settings.wallpaper === w.id
                          ? '0 0 0 2px var(--accent)'
                          : 'inset 0 0 0 1px var(--chrome-border)',
                    }}
                  >
                    <div className="aspect-[16/10]" style={{ background: w.css }} />
                    <div className="px-2 py-1.5 text-[11px]">{w.name}</div>
                  </button>
                ))}
              </div>

              <H>Accent colour</H>
              <div className="flex flex-wrap gap-2.5">
                {accents.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    title={a.name}
                    aria-label={a.name}
                    onClick={() => update('accent', a.id)}
                    className="h-9 w-9 rounded-full transition-transform hover:scale-110"
                    style={{
                      background: a.value,
                      boxShadow:
                        settings.accent === a.id ? `0 0 0 2.5px var(--chrome), 0 0 0 4.5px ${a.value}` : undefined,
                    }}
                  />
                ))}
              </div>

              <H>Interface</H>
              <Divided>
                <Field label="Light chrome" hint="Panels, windows and menus switch to a light palette.">
                  <Toggle on={!settings.dark} onChange={(v) => update('dark', !v)} />
                </Field>
                <Field label="Transparency" hint="Blur behind the panel, dock and menus.">
                  <Toggle on={settings.transparency} onChange={(v) => update('transparency', v)} />
                </Field>
                <Field label="Animations" hint="Window transitions and dock effects.">
                  <Toggle on={settings.animations} onChange={(v) => update('animations', v)} />
                </Field>
                <Field label="Text size" hint={`${Math.round(settings.fontScale * 100)}% of default`}>
                  <input
                    type="range"
                    min={0.85}
                    max={1.25}
                    step={0.05}
                    value={settings.fontScale}
                    onChange={(e) => update('fontScale', Number(e.target.value))}
                    className="w-36 cursor-pointer accent-[var(--accent)]"
                  />
                </Field>
              </Divided>
            </div>
          )}

          {page === 'desktop' && (
            <div className="max-w-lg">
              <H>Display</H>
              <Divided>
                <Field
                  label="Pop the display out"
                  hint="Fills the browser with the session instead of drawing it on the monitor in the room."
                >
                  <Toggle
                    on={settings.display === 'fullscreen'}
                    onChange={(v) => update('display', v ? 'fullscreen' : 'panel')}
                  />
                </Field>
              </Divided>

              <H>Session</H>
              <Divided>
                <Field label="Lock screen" hint="Keeps the session running behind a lock.">
                  <Btn onClick={() => sys.lock()}>Lock now</Btn>
                </Field>
                <Field label="Restart" hint="Reboots straight into the BIOS.">
                  <Btn onClick={() => sys.reboot()}>Restart</Btn>
                </Field>
                <Field label="Shut down" hint="Powers the machine off and returns you to the room.">
                  <Btn onClick={() => sys.shutdown()}>Shut down</Btn>
                </Field>
              </Divided>

              <H>Reset</H>
              <Divided>
                <Field label="Restore filesystem" hint="Undoes every file you created, renamed or deleted.">
                  <Btn onClick={() => useFs.getState().reset()}>Restore files</Btn>
                </Field>
                <Field label="Close all windows" hint="Ends every running application.">
                  <Btn
                    onClick={() =>
                      useWindows.getState().windows.forEach((w) => useWindows.getState().close(w.id))
                    }
                  >
                    Close all
                  </Btn>
                </Field>
                <Field label="Reset settings" hint="Back to the defaults this machine shipped with.">
                  <Btn onClick={() => sys.resetSettings()}>Reset</Btn>
                </Field>
              </Divided>
            </div>
          )}

          {page === 'sound' && (
            <div className="max-w-lg">
              <H>Output</H>
              <Divided>
                <Field label="Volume" hint={`${sys.muted ? 'Muted' : `${sys.volume}%`}`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sys.muted ? 0 : sys.volume}
                    onChange={(e) => sys.setVolume(Number(e.target.value))}
                    className="w-40 cursor-pointer accent-[var(--accent)]"
                  />
                </Field>
                <Field label="Mute" hint="This desktop starts muted on purpose.">
                  <Toggle on={sys.muted} onChange={() => sys.toggleMute()} />
                </Field>
                <Field label="Interface sounds" hint="Clicks, notifications and the boot chime.">
                  <Toggle on={settings.sounds} onChange={(v) => update('sounds', v)} />
                </Field>
              </Divided>

              <H>Notifications</H>
              <Divided>
                <Field label="Do not disturb" hint="Toasts stay in the notification centre only.">
                  <Toggle
                    on={useNotifications.getState().doNotDisturb}
                    onChange={() => useNotifications.getState().toggleDnd()}
                  />
                </Field>
              </Divided>
            </div>
          )}

          {page === 'network' && (
            <div className="max-w-lg">
              <H>Wi-Fi</H>
              <Divided>
                <Field label="Wireless" hint={sys.wifiConnected ? 'Connected to home-5G' : 'Disconnected'}>
                  <Toggle on={sys.wifiConnected} onChange={() => sys.toggleWifi()} />
                </Field>
              </Divided>
              <div className="mt-3 space-y-1.5">
                {[
                  { ssid: 'home-5G', strength: 4, secured: true, connected: sys.wifiConnected },
                  { ssid: 'CoffeeShop_Guest', strength: 3, secured: false, connected: false },
                  { ssid: 'FBI Surveillance Van', strength: 2, secured: true, connected: false },
                  { ssid: 'Pretty Fly for a WiFi', strength: 1, secured: true, connected: false },
                ].map((n) => (
                  <div
                    key={n.ssid}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-[12.5px]"
                    style={{ background: n.connected ? 'var(--accent-soft)' : 'color-mix(in oklab, var(--text) 5%, transparent)' }}
                  >
                    <span>{'▂▄▆█'.slice(0, n.strength)}</span>
                    <span className="flex-1">{n.ssid}</span>
                    {n.secured && <span style={{ color: 'var(--text-dim)' }}>🔒</span>}
                    {n.connected && <span className="text-[11px] font-medium">connected</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === 'about' && (
            <div className="max-w-lg">
              <div className="mb-5 flex items-center gap-4">
                <div
                  className="grid h-16 w-16 place-items-center rounded-2xl text-2xl font-bold"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  {owner.avatarInitials}
                </div>
                <div>
                  <div className="text-lg font-bold tracking-tight">
                    {owner.osName} {owner.osVersion}
                  </div>
                  <div className="text-[12.5px]" style={{ color: 'var(--text-dim)' }}>
                    {owner.osCodename}
                  </div>
                </div>
              </div>

              <Divided>
                {[
                  ['Device name', owner.hostname],
                  ['User', `${owner.name} (guest session)`],
                  ['Kernel', `${owner.osVersion}.0-web-react`],
                  ['Window manager', 'React Window Manager'],
                  ['Renderer', 'Three.js / WebGL + DOM'],
                  ['Graphics', navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} logical cores` : 'unknown'],
                  ['Memory', '16.0 GiB'],
                  ['Disk', '100 GB /dev/portfolio'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2.5 text-[12.5px]">
                    <span style={{ color: 'var(--text-dim)' }}>{k}</span>
                    <span className="selectable">{v}</span>
                  </div>
                ))}
              </Divided>

              <p className="mt-5 text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                {owner.osName} is a desktop environment written from scratch in React and TypeScript.
                The window manager, filesystem, terminal and every application you see are real
                code — nothing on this screen is an image of a desktop.
              </p>
            </div>
          )}
        </Scroll>
      </div>

      <StatusBar>
        <span>Changes apply immediately and persist in this browser.</span>
      </StatusBar>
    </div>
  )
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-6 mb-2.5 text-[11px] font-semibold tracking-[0.09em] uppercase first:mt-0" style={{ color: 'var(--text-dim)' }}>
      {children}
    </h2>
  )
}

function Divided({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl px-4"
      style={{ background: 'color-mix(in oklab, var(--text) 5.5%, transparent)' }}
    >
      <div className="divide-y" style={{ borderColor: 'var(--chrome-border)' }}>
        {children}
      </div>
    </div>
  )
}
