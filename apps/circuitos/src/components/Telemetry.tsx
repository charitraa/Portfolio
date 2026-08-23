import { useEffect, useRef, useState } from 'react'

export type Telemetry = {
  cpu: number
  ram: number
  storage: number
  temp: number
  voltage: number
  clock: number
  history: number[]
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Simulated sensor bus. Values drift like real ones; none of it is real. */
export function useTelemetry(load: number) {
  const [t, setT] = useState<Telemetry>({
    cpu: 12,
    ram: 46,
    storage: 45,
    temp: 38,
    voltage: 12.01,
    clock: 4.2,
    history: Array(40).fill(12),
  })
  const target = useRef(load)
  target.current = load

  useEffect(() => {
    const id = window.setInterval(() => {
      setT((p) => {
        const pull = (target.current - p.cpu) * 0.18
        const cpu = clamp(p.cpu + pull + (Math.random() - 0.5) * 7, 3, 99)
        return {
          cpu,
          ram: clamp(p.ram + (Math.random() - 0.5) * 3, 34, 82),
          storage: clamp(p.storage + (Math.random() - 0.5) * 0.6, 42, 49),
          temp: clamp(36 + cpu * 0.22 + (Math.random() - 0.5) * 1.5, 34, 78),
          voltage: clamp(12 + (Math.random() - 0.5) * 0.06, 11.9, 12.1),
          clock: clamp(4.0 + cpu * 0.012 + (Math.random() - 0.5) * 0.08, 3.6, 5.4),
          history: [...p.history.slice(1), cpu],
        }
      })
    }, 700)
    return () => window.clearInterval(id)
  }, [])

  return t
}

function Spark({ data, color }: { data: number[]; color: string }) {
  const w = 64
  const h = 18
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / 100) * h}`)
    .join(' ')
  return (
    <svg width={w} height={h} className="opacity-80" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" />
    </svg>
  )
}

function Gauge({ label, value, unit, color }: { label: string; value: string; unit?: string; color: string }) {
  return (
    <div className="flex min-w-[86px] flex-col">
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <span className="font-numeric text-[13px] font-bold" style={{ color }}>
        {value}
        {unit && <span className="ml-0.5 text-[10px] opacity-70">{unit}</span>}
      </span>
    </div>
  )
}

export function SystemMonitor({ t, ready }: { t: Telemetry; ready: boolean }) {
  const diagnostics = [
    ['VOLTAGE', 'STABLE', '#f59e0b'],
    ['CPU', 'ONLINE', '#3b82f6'],
    ['MEMORY', 'HEALTHY', '#8b5cf6'],
    ['STORAGE', 'HEALTHY', '#22c55e'],
    ['NETWORK', 'CONNECTED', '#22c55e'],
  ] as const

  return (
    <footer
      className="z-30 shrink-0 border-t border-slate-800 bg-[#0b1120]/95 backdrop-blur"
      style={{ opacity: ready ? 1 : 0.25, transition: 'opacity 700ms' }}
    >
      <div className="scrollbar-thin flex items-center gap-5 overflow-x-auto px-4 py-2">
        <div className="flex items-center gap-2">
          <Spark data={t.history} color="#3b82f6" />
          <Gauge label="CPU" value={t.cpu.toFixed(0)} unit="%" color="#3b82f6" />
        </div>
        <Gauge label="RAM" value={t.ram.toFixed(0)} unit="%" color="#8b5cf6" />
        <Gauge label="Storage" value={t.storage.toFixed(0)} unit="%" color="#22c55e" />
        <Gauge label="Temp" value={t.temp.toFixed(0)} unit="°C" color={t.temp > 65 ? '#ef4444' : '#f59e0b'} />
        <Gauge label="Voltage" value={t.voltage.toFixed(2)} unit="V" color="#f59e0b" />
        <Gauge label="Clock" value={t.clock.toFixed(2)} unit="GHz" color="#3b82f6" />
        <Gauge label="Network" value="UP" color="#22c55e" />
      </div>
      <div className="scrollbar-thin flex items-center gap-4 overflow-x-auto border-t border-slate-800/70 px-4 py-1.5">
        {diagnostics.map(([k, v, c]) => (
          <div key={k} className="flex shrink-0 items-center gap-1.5">
            <span className="led h-1.5 w-1.5 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
            <span className="font-mono text-[9px] tracking-[0.16em] text-slate-500">{k}</span>
            <span className="font-mono text-[9px] tracking-[0.16em]" style={{ color: c }}>
              {v}
            </span>
          </div>
        ))}
        <span className="ml-auto shrink-0 font-mono text-[9px] tracking-[0.16em] text-slate-600">
          ALL SUBSYSTEMS NOMINAL
        </span>
      </div>
    </footer>
  )
}
