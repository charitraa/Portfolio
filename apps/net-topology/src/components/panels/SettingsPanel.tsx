import { Check, Keyboard, Palette, Zap } from 'lucide-react'
import { useApp, type ThemeName } from '../../store/AppState'
import { SectionTitle } from '../ui/primitives'
import { cn } from '../../utils/cn'

const themes: Array<{ id: ThemeName; label: string; note: string; swatch: string[] }> = [
  { id: 'noc', label: 'Dark NOC', note: 'Default — night operations centre', swatch: ['#0b1020', '#3b82f6', '#22c55e'] },
  { id: 'cloud', label: 'Cloud', note: 'Light console, daylight readable', swatch: ['#f1f5f9', '#2563eb', '#15803d'] },
  { id: 'blueprint', label: 'Blueprint', note: 'Drafting paper, cyan ink', swatch: ['#071a2e', '#38bdf8', '#22d3ee'] },
]

const shortcuts = [
  { keys: 'Ctrl / ⌘ + K', action: 'Open command palette' },
  { keys: 'Esc', action: 'Close panel or palette' },
  { keys: 'Tab', action: 'Move focus between devices' },
  { keys: 'Enter', action: 'Open the focused device' },
  { keys: 'Double click', action: 'Reset the map view' },
]

export function SettingsPanel() {
  const { theme, setTheme, motion, setMotion, packets, setPackets } = useApp()

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle hint="appearance">
          <span className="inline-flex items-center gap-1.5">
            <Palette size={12} /> Theme
          </span>
        </SectionTitle>
        <div className="space-y-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                theme === t.id ? 'border-accent/60 bg-accent/10' : 'bg-bg-2/60 hover:border-accent/40',
              )}
            >
              <span className="flex gap-1">
                {t.swatch.map((c) => (
                  <span
                    key={c}
                    className="h-4 w-4 rounded border border-line/70"
                    style={{ background: c }}
                  />
                ))}
              </span>
              <span className="flex-1">
                <span className="block font-display text-[13px] font-semibold text-ink">
                  {t.label}
                </span>
                <span className="font-mono text-[10px] text-muted">{t.note}</span>
              </span>
              {theme === t.id && <Check size={15} className="text-accent" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle hint="accessibility">
          <span className="inline-flex items-center gap-1.5">
            <Zap size={12} /> Motion
          </span>
        </SectionTitle>
        <div className="space-y-2">
          <Toggle
            label="Animations"
            note="Pulses, sweeps, counters and live telemetry"
            checked={motion}
            onChange={setMotion}
          />
          <Toggle
            label="Packet flow"
            note="Dots travelling along the links"
            checked={packets && motion}
            disabled={!motion}
            onChange={setPackets}
          />
        </div>
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted/70">
          Defaults follow your system's reduce-motion setting.
        </p>
      </div>

      <div>
        <SectionTitle hint="keyboard">
          <span className="inline-flex items-center gap-1.5">
            <Keyboard size={12} /> Shortcuts
          </span>
        </SectionTitle>
        <div className="space-y-1">
          {shortcuts.map((s) => (
            <div key={s.keys} className="flex items-center justify-between gap-3 py-1">
              <span className="text-[12.5px] text-muted">{s.action}</span>
              <kbd className="rounded border bg-bg-2/70 px-1.5 py-0.5 font-mono text-[10px] text-ink">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Toggle({
  label,
  note,
  checked,
  onChange,
  disabled,
}: {
  label: string
  note: string
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border bg-bg-2/60 px-3 py-2.5 text-left transition-colors',
        !disabled && 'hover:border-accent/40',
        disabled && 'opacity-50',
      )}
    >
      <span className="flex-1">
        <span className="block font-display text-[13px] font-semibold text-ink">{label}</span>
        <span className="font-mono text-[10px] text-muted">{note}</span>
      </span>
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
          checked ? 'bg-accent' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}
