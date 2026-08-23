import { RotateCcw } from 'lucide-react'
import { Button, Kbd, Panel, View, ViewHeader } from '@/components/ui'
import { cx } from '@/lib/style'
import { useSound } from '@/hooks'
import { useApp, type Settings as SettingsShape } from '@/store/app'

const SHORTCUTS: [string, string][] = [
  ['Ctrl + K', 'Command palette'],
  ['Ctrl + D', 'Dashboard'],
  ['Ctrl + P', 'Projects'],
  ['Ctrl + T', 'Tech Stack'],
  ['Ctrl + R', 'Resume'],
  ['Ctrl + M', 'Toggle console'],
  ['↑ / ↓', 'Console history'],
  ['Esc', 'Close overlay'],
]

function Row({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line-soft py-2.5 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] text-fg">{label}</div>
        {hint && <div className="mt-0.5 text-[11px] text-muted">{hint}</div>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cx(
        'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200',
        on ? 'bg-blue' : 'bg-line',
      )}
    >
      <span
        className={cx(
          'absolute top-0.5 size-4 rounded-full bg-white transition-[left] duration-200 ease-[var(--ease-ui)]',
          on ? 'left-[18px]' : 'left-0.5',
        )}
      />
    </button>
  )
}

function Choice<T extends string>({
  value,
  options,
  onChange,
  swatch,
}: {
  value: T
  options: readonly T[]
  onChange: (v: T) => void
  swatch?: boolean
}) {
  return (
    <div className="flex shrink-0 gap-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          title={o}
          className={cx(
            'rounded border px-2 py-1 font-mono text-[10.5px] capitalize transition-colors duration-150',
            value === o
              ? 'border-blue/60 bg-blue/15 text-blue'
              : 'border-line text-muted hover:bg-hover hover:text-fg2',
          )}
        >
          {swatch && (
            <span
              className="mr-1.5 inline-block size-2 rounded-full align-middle"
              style={{ background: `var(--color-${o})` }}
            />
          )}
          {o}
        </button>
      ))}
    </div>
  )
}

export function Settings() {
  const settings = useApp((s) => s.settings)
  const set = useApp((s) => s.set)
  const reset = useApp((s) => s.resetSettings)
  const notify = useApp((s) => s.notify)
  const beep = useSound()

  const change = <K extends keyof SettingsShape>(k: K) => (v: SettingsShape[K]) => {
    set(k, v)
    beep('key')
  }

  return (
    <View>
      <ViewHeader
        title="Settings"
        route="GET /api/v1/settings"
        desc="Preferences persist in local storage — they survive a reload but never leave your browser."
        actions={
          <Button
            onClick={() => {
              reset()
              notify('Settings reset', 'Back to defaults.', 'info')
            }}
          >
            <RotateCcw size={13} /> Reset
          </Button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="Appearance">
          <Row label="Theme" hint="Dark is the intended look; light is fully supported.">
            <Choice
              value={settings.theme}
              options={['dark', 'light'] as const}
              onChange={change('theme')}
            />
          </Row>
          <Row label="Accent colour" hint="Recolours highlights, charts and the status bar.">
            <Choice
              value={settings.accent}
              options={['blue', 'orange', 'green', 'purple'] as const}
              onChange={change('accent')}
              swatch
            />
          </Row>
          <Row label="Density" hint="Compact tightens spacing across tables and panels.">
            <Choice
              value={settings.density}
              options={['comfortable', 'compact'] as const}
              onChange={change('density')}
            />
          </Row>
        </Panel>

        <Panel title="Behaviour">
          <Row label="Animations" hint="Turn off for instant transitions and no typing effects.">
            <Toggle on={settings.animations} onChange={change('animations')} />
          </Row>
          <Row label="Interface sound" hint="Short synthesised blips on key interactions.">
            <Toggle
              on={settings.sound}
              onChange={(v) => {
                set('sound', v)
                if (v) notify('Sound enabled', 'Keyboard and notification blips are on.', 'info')
              }}
            />
          </Row>
          <Row label="Console" hint="The command bar at the bottom of the workspace.">
            <Toggle on={settings.consoleOpen} onChange={change('consoleOpen')} />
          </Row>
          <Row label="Collapse sidebar" hint="Icon-only navigation rail.">
            <Toggle on={settings.sidebarCollapsed} onChange={change('sidebarCollapsed')} />
          </Row>
        </Panel>

        <Panel title="Keyboard shortcuts" className="lg:col-span-2">
          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
            {SHORTCUTS.map(([keys, label]) => (
              <div key={keys} className="flex items-center gap-2 py-1">
                <span className="flex shrink-0 gap-1">
                  {keys.split(' + ').map((k) => (
                    <Kbd key={k}>{k}</Kbd>
                  ))}
                </span>
                <span className="truncate text-[11.5px] text-muted">{label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </View>
  )
}
