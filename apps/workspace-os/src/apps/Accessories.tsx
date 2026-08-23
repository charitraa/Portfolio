import { useEffect, useState } from 'react'
import { HOME, useFs } from '@/store/fs'
import { Btn, Scroll, StatusBar, Toolbar } from '@/os/ui'
import type { AppWindowProps } from '@/os/types'

// ---------------------------------------------------------------------------
// Calculator
// ---------------------------------------------------------------------------

export function Calculator(_: AppWindowProps) {
  const [display, setDisplay] = useState('0')
  const [acc, setAcc] = useState<number | null>(null)
  const [op, setOp] = useState<string | null>(null)
  const [fresh, setFresh] = useState(true)
  const [tape, setTape] = useState<string[]>([])

  function apply(a: number, b: number, o: string): number {
    switch (o) {
      case '+':
        return a + b
      case '−':
        return a - b
      case '×':
        return a * b
      case '÷':
        return b === 0 ? NaN : a / b
      default:
        return b
    }
  }

  function digit(d: string) {
    if (fresh) {
      setDisplay(d === '.' ? '0.' : d)
      setFresh(false)
      return
    }
    if (d === '.' && display.includes('.')) return
    setDisplay(display === '0' && d !== '.' ? d : display + d)
  }

  function operator(next: string) {
    const value = Number(display)
    if (acc !== null && op && !fresh) {
      const result = apply(acc, value, op)
      setTape((t) => [`${acc} ${op} ${value} = ${result}`, ...t].slice(0, 12))
      setAcc(result)
      setDisplay(String(result))
    } else {
      setAcc(value)
    }
    setOp(next)
    setFresh(true)
  }

  function equals() {
    const value = Number(display)
    if (acc === null || !op) return
    const result = apply(acc, value, op)
    setTape((t) => [`${acc} ${op} ${value} = ${result}`, ...t].slice(0, 12))
    setDisplay(String(result))
    setAcc(null)
    setOp(null)
    setFresh(true)
  }

  function clear() {
    setDisplay('0')
    setAcc(null)
    setOp(null)
    setFresh(true)
  }

  // Physical keyboard works too — it is a calculator, after all.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9.]$/.test(e.key)) digit(e.key)
      else if (e.key === '+') operator('+')
      else if (e.key === '-') operator('−')
      else if (e.key === '*') operator('×')
      else if (e.key === '/') {
        e.preventDefault()
        operator('÷')
      } else if (e.key === 'Enter' || e.key === '=') equals()
      else if (e.key === 'Escape') clear()
      else if (e.key === 'Backspace') setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const keys = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-col items-end justify-end px-5 py-5" style={{ minHeight: 96 }}>
          {op && acc !== null && (
            <div className="font-mono text-[12px]" style={{ color: 'var(--text-dim)' }}>
              {acc} {op}
            </div>
          )}
          <div className="selectable truncate font-mono text-[34px] leading-none font-light">{display}</div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 p-3">
          {keys.flat().map((k) => {
            const isOp = ['÷', '×', '−', '+', '='].includes(k)
            const isFn = ['C', '±', '%'].includes(k)
            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === 'C') clear()
                  else if (k === '=') equals()
                  else if (k === '±') setDisplay(String(-Number(display)))
                  else if (k === '%') setDisplay(String(Number(display) / 100))
                  else if (isOp) operator(k)
                  else digit(k)
                }}
                className={`rounded-xl py-3.5 text-[15px] font-medium transition-transform active:scale-95 ${k === '0' ? 'col-span-2' : ''}`}
                style={{
                  background: isOp ? 'var(--accent)' : isFn ? 'color-mix(in oklab, var(--text) 16%, transparent)' : 'color-mix(in oklab, var(--text) 8%, transparent)',
                  color: isOp ? '#fff' : 'var(--text)',
                }}
              >
                {k}
              </button>
            )
          })}
        </div>
      </div>

      {tape.length > 0 && (
        <div className="max-h-24 overflow-y-auto px-4 pb-2 font-mono text-[10.5px]" style={{ color: 'var(--text-dim)' }}>
          {tape.map((t, i) => (
            <div key={i}>{t}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export function Calendar(_: AppWindowProps) {
  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const monthName = cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/10"
        >
          ‹
        </button>
        <span className="text-[13px] font-semibold">{monthName}</span>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="grid h-7 w-7 place-items-center rounded-lg hover:bg-white/10"
        >
          ›
        </button>
        <Btn className="ml-auto" onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}>
          Today
        </Btn>
      </Toolbar>

      <div className="flex-1 p-4">
        <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[10.5px] font-medium" style={{ color: 'var(--text-dim)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const isToday =
              d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            return (
              <div
                key={i}
                className="grid aspect-square place-items-center rounded-lg text-[12.5px]"
                style={{
                  background: isToday ? 'var(--accent)' : d ? 'color-mix(in oklab, var(--text) 5%, transparent)' : 'transparent',
                  color: isToday ? '#fff' : d ? 'var(--text)' : 'transparent',
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {d ?? ''}
              </div>
            )
          })}
        </div>
      </div>

      <StatusBar>
        <span>{today.toDateString()}</span>
        <span className="ml-auto">Week {Math.ceil((today.getDate() + firstDay) / 7)}</span>
      </StatusBar>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Notes — backed by a real file in the virtual filesystem.
// ---------------------------------------------------------------------------

const NOTES_PATH = `${HOME}/Documents/notes.md`

export function Notes(_: AppWindowProps) {
  const fs = useFs()
  const node = fs.read(NOTES_PATH)
  const [text, setText] = useState(node?.content ?? '')
  const dirty = text !== (node?.content ?? '')

  return (
    <div className="flex h-full flex-col">
      <Toolbar>
        <span className="text-[12.5px] font-medium">notes.md</span>
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {dirty ? 'unsaved' : 'saved to ~/Documents'}
        </span>
        <Btn className="ml-auto" primary={dirty} disabled={!dirty} onClick={() => fs.updateFile(NOTES_PATH, text)}>
          Save
        </Btn>
      </Toolbar>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault()
            fs.updateFile(NOTES_PATH, text)
          }
        }}
        spellCheck={false}
        placeholder="Start typing…"
        className="selectable min-h-0 flex-1 resize-none p-4 font-mono text-[12.5px] leading-relaxed outline-none"
        style={{ background: 'transparent', color: 'var(--text)' }}
      />
      <StatusBar>
        <span>{text.split('\n').length} lines</span>
        <span className="ml-auto">Edits here show up in Files and `cat`</span>
      </StatusBar>
    </div>
  )
}

/** Kept so the module has a default export for lazy-loading symmetry. */
export default function Accessories(_: AppWindowProps) {
  return (
    <Scroll className="p-6">
      <p>Pick an accessory from the launcher.</p>
    </Scroll>
  )
}
