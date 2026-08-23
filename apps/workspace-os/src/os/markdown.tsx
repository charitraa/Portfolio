import type { ReactNode } from 'react'

/**
 * A deliberately small Markdown subset — headings, lists, rules, blockquotes,
 * code fences, and inline bold/italic/code/links. Enough for the documents this
 * OS actually contains, without pulling in a parser.
 */

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  // Order matters: code first so its contents aren't re-processed.
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0

  while ((m = pattern.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const token = m[0]
    const key = `${keyBase}-${i++}`

    if (token.startsWith('`')) {
      out.push(
        <code
          key={key}
          className="rounded px-1.5 py-0.5 font-mono text-[0.88em]"
          style={{ background: 'color-mix(in oklab, var(--text) 12%, transparent)' }}
        >
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith('**')) {
      out.push(
        <strong key={key} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('*')) {
      out.push(
        <em key={key} style={{ color: 'var(--text-dim)' }}>
          {token.slice(1, -1)}
        </em>,
      )
    } else {
      const label = token.slice(1, token.indexOf(']'))
      const href = token.slice(token.indexOf('(') + 1, -1)
      out.push(
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
          style={{ color: 'var(--accent)' }}
        >
          {label}
        </a>,
      )
    }
    last = m.index + token.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = []
  const lines = source.split('\n')
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i++
      continue
    }

    // Fenced code
    if (line.startsWith('```')) {
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++])
      i++
      blocks.push(
        <pre
          key={key++}
          className="my-3 overflow-x-auto rounded-lg p-3 font-mono text-[12px] leading-relaxed"
          style={{ background: 'color-mix(in oklab, #000 40%, transparent)' }}
        >
          {body.join('\n')}
        </pre>,
      )
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={key++} className="my-5" style={{ borderColor: 'var(--chrome-border)' }} />)
      i++
      continue
    }

    // Headings
    const h = /^(#{1,4})\s+(.*)$/.exec(line)
    if (h) {
      const level = h[1].length
      const sizes = ['text-[22px]', 'text-[17px]', 'text-[14.5px]', 'text-[13px]']
      blocks.push(
        <div
          key={key++}
          className={`${sizes[level - 1]} font-semibold tracking-tight ${level === 1 ? 'mt-1 mb-2' : 'mt-5 mb-1.5'}`}
        >
          {inline(h[2], `h${key}`)}
        </div>,
      )
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const body: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) body.push(lines[i++].slice(2))
      blocks.push(
        <blockquote
          key={key++}
          className="my-3 py-1 pl-4 text-[12.5px] italic"
          style={{ borderLeft: '3px solid var(--accent)', color: 'var(--text-dim)' }}
        >
          {inline(body.join(' '), `q${key}`)}
        </blockquote>,
      )
      continue
    }

    // Lists
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ''))
      blocks.push(
        <ul key={key++} className="my-2 space-y-1 pl-1">
          {items.map((it, n) => (
            <li key={n} className="flex gap-2.5">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
              <span className="flex-1">{inline(it, `li${key}-${n}`)}</span>
            </li>
          ))}
        </ul>,
      )
      continue
    }

    // Paragraph — consume until a blank line or a new block marker.
    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|>\s|```|---+$|\s*[-*]\s)/.test(lines[i])
    ) {
      para.push(lines[i++])
    }
    blocks.push(
      <p key={key++} className="my-2.5">
        {inline(para.join(' '), `p${key}`)}
      </p>,
    )
  }

  return <div className="selectable text-[13.5px] leading-[1.72]">{blocks}</div>
}
