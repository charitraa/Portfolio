import { motion } from 'framer-motion'
import type { ComponentProps, ReactNode } from 'react'
import { ACCENT, cx } from '@/lib/style'

/* ── Panel ─────────────────────────────────────────────────────────────── */

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClass,
  icon,
}: {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClass?: string
  icon?: ReactNode
}) {
  return (
    <section
      className={cx(
        'flex min-w-0 flex-col rounded-[10px] border border-line bg-panel',
        'shadow-[0_1px_2px_var(--rc-shadow)]',
        className,
      )}
    >
      {title && (
        <header className="flex shrink-0 items-center gap-2 border-b border-line-soft px-3 py-2">
          {icon && <span className="text-muted">{icon}</span>}
          <h2 className="text-[12px] font-semibold tracking-wide text-fg2 uppercase">
            {title}
          </h2>
          {subtitle && (
            <span className="truncate font-mono text-[11px] text-muted">{subtitle}</span>
          )}
          {actions && <div className="ml-auto flex items-center gap-1">{actions}</div>}
        </header>
      )}
      {/* bodyClass replaces the default padding rather than fighting it. */}
      <div className={cx('min-w-0 flex-1', bodyClass ?? 'p-3')}>{children}</div>
    </section>
  )
}

/* ── Button ────────────────────────────────────────────────────────────── */

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md'
}

const VARIANTS: Record<string, string> = {
  primary: 'bg-blue text-white hover:brightness-110 border-transparent',
  secondary: 'bg-bg2 text-fg2 hover:bg-hover hover:text-fg border-line',
  ghost: 'bg-transparent text-muted hover:bg-hover hover:text-fg border-transparent',
  danger: 'bg-red text-white hover:brightness-110 border-transparent',
  success: 'bg-green text-[#0d1b0e] hover:brightness-110 border-transparent',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-md border font-medium',
        'transition-[background-color,color,filter,transform] duration-150 ease-[var(--ease-ui)]',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' ? 'h-6 px-2 text-[11px]' : 'h-8 px-3 text-[12px]',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </button>
  )
}

/* ── Badge ─────────────────────────────────────────────────────────────── */

export function Badge({
  children,
  color = 'muted',
  dot,
  className,
}: {
  children: ReactNode
  color?: keyof typeof ACCENT | string
  dot?: boolean
  className?: string
}) {
  const c = ACCENT[color] ?? ACCENT.muted
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5',
        'font-mono text-[10px] leading-none whitespace-nowrap',
        className,
      )}
      style={{
        color: c,
        borderColor: `color-mix(in srgb, ${c} 35%, transparent)`,
        background: `color-mix(in srgb, ${c} 12%, transparent)`,
      }}
    >
      {dot && (
        <span className="size-1.5 rounded-full" style={{ background: c }} aria-hidden />
      )}
      {children}
    </span>
  )
}

/* ── Progress bar (block-segment style) ────────────────────────────────── */

export function Meter({
  value,
  color = 'blue',
  showValue = true,
  label,
  sub,
}: {
  value: number
  color?: string
  showValue?: boolean
  label?: ReactNode
  sub?: ReactNode
}) {
  const c = ACCENT[color] ?? color
  return (
    <div className="min-w-0">
      {(label || showValue) && (
        <div className="mb-1 flex items-baseline gap-2">
          <span className="truncate text-[12px] text-fg2">{label}</span>
          {sub && <span className="truncate font-mono text-[10px] text-muted">{sub}</span>}
          {showValue && (
            <span className="num ml-auto text-[11px] text-muted">{value}%</span>
          )}
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: c }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

/* ── Keyboard hint ─────────────────────────────────────────────────────── */

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-bg2 px-1.5 py-0.5 font-mono text-[10px] text-muted">
      {children}
    </kbd>
  )
}

/* ── View scaffolding ──────────────────────────────────────────────────── */

export function ViewHeader({
  title,
  route,
  desc,
  actions,
}: {
  title: string
  route: string
  desc?: string
  actions?: ReactNode
}) {
  return (
    <header className="mb-4 flex flex-wrap items-end gap-x-4 gap-y-2">
      <div className="min-w-0">
        <div className="mb-1 font-mono text-[11px] text-blue">{route}</div>
        <h1 className="text-[20px] leading-tight font-semibold text-fg">{title}</h1>
        {desc && <p className="mt-1 max-w-2xl text-[13px] text-muted">{desc}</p>}
      </div>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  )
}

/** Wraps a view body with the shared fade/slide entrance. */
export function View({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cx('mx-auto w-full max-w-[1400px] p-4 md:p-5', className)}
    >
      {children}
    </motion.div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="font-mono text-[11px] text-muted">{children}</div>
    </div>
  )
}
