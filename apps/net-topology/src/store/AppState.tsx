import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { NodeId } from '../data/types'
import { drift } from '../utils/cn'

export type ThemeName = 'noc' | 'cloud' | 'blueprint'
/** Panels that are not devices on the map. */
export type PanelId = NodeId | 'dashboard' | 'settings'

export interface LogEntry {
  id: number
  time: string
  message: string
  level: 'info' | 'ok' | 'warn' | 'err'
}

export interface Telemetry {
  ping: number
  bandwidth: number
  cpu: number
  memory: number
  load: number
  connections: number
}

interface AppStateValue {
  selected: PanelId | null
  select: (id: PanelId | null) => void
  /** Node the map should fly to; cleared once the view has moved. */
  focusRequest: NodeId | null
  focusNode: (id: NodeId) => void
  clearFocus: () => void
  hovered: NodeId | null
  setHovered: (id: NodeId | null) => void
  theme: ThemeName
  setTheme: (t: ThemeName) => void
  motion: boolean
  setMotion: (on: boolean) => void
  packets: boolean
  setPackets: (on: boolean) => void
  log: LogEntry[]
  pushLog: (message: string, level?: LogEntry['level']) => void
  telemetry: Telemetry
  paletteOpen: boolean
  setPaletteOpen: (open: boolean) => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

/** Deep-link slugs: /#projects is friendlier than /#balancer. */
const slugToPanel: Record<string, PanelId> = {
  dashboard: 'dashboard',
  settings: 'settings',
  home: 'isp',
  about: 'router',
  identity: 'dns',
  skills: 'firewall',
  projects: 'balancer',
  services: 'gateway',
  experience: 'app',
  education: 'database',
  resume: 'storage',
  contact: 'contact',
}

const panelToSlug: Record<string, string> = Object.fromEntries(
  Object.entries(slugToPanel).map(([slug, panel]) => [panel, slug]),
)

function panelFromHash(): PanelId | null {
  if (typeof location === 'undefined') return null
  return slugToPanel[location.hash.replace(/^#/, '').toLowerCase()] ?? null
}

const THEME_KEY = 'net-charitra:theme'
const MOTION_KEY = 'net-charitra:motion'

function readStoredTheme(): ThemeName {
  if (typeof localStorage === 'undefined') return 'noc'
  const stored = localStorage.getItem(THEME_KEY)
  return stored === 'cloud' || stored === 'blueprint' || stored === 'noc' ? stored : 'noc'
}

function prefersReducedMotion(): boolean {
  if (typeof matchMedia === 'undefined') return false
  return matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<PanelId | null>(panelFromHash)
  const [focusRequest, setFocusRequest] = useState<NodeId | null>(null)
  const [hovered, setHovered] = useState<NodeId | null>(null)
  const [theme, setThemeState] = useState<ThemeName>(readStoredTheme)
  const [motion, setMotionState] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(MOTION_KEY)
      if (stored === 'on') return true
      if (stored === 'off') return false
    }
    return !prefersReducedMotion()
  })
  const [packets, setPackets] = useState(true)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])
  const [telemetry, setTelemetry] = useState<Telemetry>({
    ping: 12,
    bandwidth: 1.2,
    cpu: 18,
    memory: 64,
    load: 23,
    connections: 42,
  })

  const logId = useRef(0)

  const pushLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    setLog((prev) => {
      const entry: LogEntry = {
        id: logId.current++,
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        message,
        level,
      }
      // Keep the tail short; this is a ticker, not an audit trail.
      return [...prev.slice(-40), entry]
    })
  }, [])

  const select = useCallback((id: PanelId | null) => setSelected(id), [])

  const focusNode = useCallback((id: NodeId) => {
    setSelected(id)
    setFocusRequest(id)
  }, [])

  const clearFocus = useCallback(() => setFocusRequest(null), [])

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next)
    localStorage.setItem(THEME_KEY, next)
  }, [])

  const setMotion = useCallback((on: boolean) => {
    setMotionState(on)
    localStorage.setItem(MOTION_KEY, on ? 'on' : 'off')
  }, [])

  // Keep the address bar in step with the open panel, both ways.
  useEffect(() => {
    const slug = selected ? panelToSlug[selected] : null
    const next = slug ? `#${slug}` : ''
    if (next !== location.hash && !(next === '' && location.hash === '')) {
      history.replaceState(null, '', `${location.pathname}${location.search}${next}`)
    }
  }, [selected])

  useEffect(() => {
    const onHashChange = () => setSelected(panelFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Reflect theme + motion preference on <html> so plain CSS can react.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? 'on' : 'off'
  }, [motion])

  // Simulated NOC telemetry. Stops entirely when motion is off.
  useEffect(() => {
    if (!motion) return
    const id = window.setInterval(() => {
      setTelemetry((prev) => ({
        ping: Math.round(drift(prev.ping, 3, 8, 42)),
        bandwidth: Number(drift(prev.bandwidth, 0.25, 0.4, 2.4).toFixed(2)),
        cpu: Math.round(drift(prev.cpu, 6, 6, 68)),
        memory: Math.round(drift(prev.memory, 4, 38, 84)),
        load: Math.round(drift(prev.load, 7, 8, 72)),
        connections: Math.round(drift(prev.connections, 6, 12, 96)),
      }))
    }, 2200)
    return () => window.clearInterval(id)
  }, [motion])

  // Ctrl/Cmd+K opens the palette; Escape closes whatever is open.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
        return
      }
      if (event.key === 'Escape') {
        setPaletteOpen((open) => {
          if (open) return false
          setSelected(null)
          return false
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const value = useMemo<AppStateValue>(
    () => ({
      selected,
      select,
      focusRequest,
      focusNode,
      clearFocus,
      hovered,
      setHovered,
      theme,
      setTheme,
      motion,
      setMotion,
      packets,
      setPackets,
      log,
      pushLog,
      telemetry,
      paletteOpen,
      setPaletteOpen,
    }),
    [
      selected,
      select,
      focusRequest,
      focusNode,
      clearFocus,
      hovered,
      theme,
      setTheme,
      motion,
      setMotion,
      packets,
      log,
      pushLog,
      telemetry,
      paletteOpen,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useApp(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useApp must be used inside <AppStateProvider>')
  return ctx
}
