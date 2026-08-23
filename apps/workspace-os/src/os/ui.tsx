import type { ReactNode } from 'react'
import { useIsNarrow } from '@/os/screen'

/** Horizontal strip at the top of an app window. */
export function Toolbar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex h-11 shrink-0 items-center gap-2 px-3 ${className}`}
      style={{ borderBottom: '1px solid var(--chrome-border)' }}
    >
      {children}
    </div>
  )
}

export function StatusBar({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-7 shrink-0 items-center gap-3 px-3 text-[11px]"
      style={{ borderTop: '1px solid var(--chrome-border)', color: 'var(--text-dim)' }}
    >
      {children}
    </div>
  )
}

export function Sidebar({ children, width = 190 }: { children: ReactNode; width?: number }) {
  const narrow = useIsNarrow()

  // On a phone a 190px rail would leave the content pane unusable, so the same
  // items lay out as a scrolling strip across the top instead.
  if (narrow) {
    return (
      <nav
        className="flex shrink-0 gap-1 overflow-x-auto px-1 py-1.5"
        style={{
          borderBottom: '1px solid var(--chrome-border)',
          background: 'color-mix(in oklab, #000 10%, transparent)',
          scrollbarWidth: 'none',
        }}
        data-sidebar-strip
      >
        {children}
      </nav>
    )
  }

  return (
    <aside
      className="shrink-0 overflow-y-auto py-2"
      style={{
        width,
        borderRight: '1px solid var(--chrome-border)',
        background: 'color-mix(in oklab, #000 10%, transparent)',
      }}
    >
      {children}
    </aside>
  )
}

export function SidebarItem({
  children,
  active,
  onClick,
  glyph,
  trailing,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  glyph?: ReactNode
  trailing?: ReactNode
}) {
  const narrow = useIsNarrow()
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={
        narrow
          ? 'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] whitespace-nowrap transition-colors'
          : 'mx-2 flex w-[calc(100%-16px)] items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] transition-colors'
      }
      style={{
        background: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--text)' : 'var(--text-dim)',
        fontWeight: active ? 600 : 450,
      }}
      onPointerEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'color-mix(in oklab, var(--text) 8%, transparent)'
      }}
      onPointerLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent'
      }}
    >
      {glyph !== undefined && <span className="w-4 shrink-0 text-center text-[13px]">{glyph}</span>}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
    </button>
  )
}

export function SidebarLabel({ children }: { children: ReactNode }) {
  const narrow = useIsNarrow()
  if (narrow) return null
  return (
    <div
      className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-[0.09em] uppercase"
      style={{ color: 'color-mix(in oklab, var(--text-dim) 75%, transparent)' }}
    >
      {children}
    </div>
  )
}

export function Chip({
  children,
  tone = 'neutral',
  title,
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'good' | 'warn'
  title?: string
}) {
  const bg =
    tone === 'accent'
      ? 'var(--accent-soft)'
      : tone === 'good'
        ? 'color-mix(in oklab, #34d399 20%, transparent)'
        : tone === 'warn'
          ? 'color-mix(in oklab, #f59e0b 22%, transparent)'
          : 'color-mix(in oklab, var(--text) 10%, transparent)'
  return (
    <span
      title={title}
      className="inline-flex items-center rounded-md px-2 py-[3px] text-[10.5px] font-medium whitespace-nowrap"
      style={{ background: bg, color: 'var(--text)' }}
    >
      {children}
    </span>
  )
}

export function Btn({
  children,
  onClick,
  primary,
  disabled,
  title,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  primary?: boolean
  disabled?: boolean
  title?: string
  className?: string
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={{
        background: primary ? 'var(--accent)' : 'color-mix(in oklab, var(--text) 10%, transparent)',
        color: primary ? '#fff' : 'var(--text)',
      }}
    >
      {children}
    </button>
  )
}

export function IconBtn({
  children,
  onClick,
  title,
  active,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  title: string
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
      style={{
        background: active ? 'var(--accent-soft)' : undefined,
        color: active ? 'var(--text)' : 'var(--text-dim)',
      }}
    >
      {children}
    </button>
  )
}

export function EmptyState({ glyph, title, body }: { glyph: string; title: string; body?: string }) {
  return (
    <div className="grid h-full place-items-center p-8 text-center">
      <div>
        <div className="mb-3 text-4xl opacity-40">{glyph}</div>
        <div className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
          {title}
        </div>
        {body && (
          <div className="mx-auto mt-1 max-w-xs text-[12px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            {body}
          </div>
        )}
      </div>
    </div>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="flex items-center justify-between gap-6 py-2.5">
      <span className="min-w-0">
        <span className="block text-[12.5px] font-medium" style={{ color: 'var(--text)' }}>
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-[11px] leading-snug" style={{ color: 'var(--text-dim)' }}>
            {hint}
          </span>
        )}
      </span>
      <span className="shrink-0">{children}</span>
    </label>
  )
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative h-6 w-11 rounded-full transition-colors"
      style={{ background: on ? 'var(--accent)' : 'color-mix(in oklab, var(--text) 22%, transparent)' }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-150"
        style={{ left: on ? 22 : 2 }}
      />
    </button>
  )
}

/** A labelled progress/meter bar used by Skills, Monitor and the boot screen. */
export function Meter({ value, color, height = 6 }: { value: number; color?: string; height?: number }) {
  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{ height, background: 'color-mix(in oklab, var(--text) 12%, transparent)' }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color ?? 'var(--accent)' }}
      />
    </div>
  )
}

export function Scroll({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`selectable min-h-0 flex-1 overflow-y-auto ${className}`}>{children}</div>
}
