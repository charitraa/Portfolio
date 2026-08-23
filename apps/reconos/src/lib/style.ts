/** Joins class names, dropping falsy entries. */
export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(' ')

/** Accent name → CSS color, so data files can carry a token name as a string. */
export const ACCENT: Record<string, string> = {
  blue: 'var(--color-blue)',
  orange: 'var(--color-orange)',
  green: 'var(--color-green)',
  red: 'var(--color-red)',
  yellow: 'var(--color-yellow)',
  purple: 'var(--color-purple)',
  muted: 'var(--color-muted)',
}
