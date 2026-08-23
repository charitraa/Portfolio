import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LogKind = 'info' | 'ok' | 'warn' | 'error' | 'cmd'

export interface LogLine {
  id: number
  at: number
  kind: LogKind
  text: string
}

export interface Toast {
  id: number
  title: string
  body?: string
  kind: LogKind
}

export interface Tab {
  path: string
  title: string
}

export interface Settings {
  theme: 'dark' | 'light'
  accent: 'blue' | 'orange' | 'green' | 'purple'
  animations: boolean
  sound: boolean
  density: 'comfortable' | 'compact'
  consoleOpen: boolean
  sidebarCollapsed: boolean
}

interface AppState {
  settings: Settings
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  resetSettings: () => void

  tabs: Tab[]
  openTab: (tab: Tab) => void
  closeTab: (path: string) => string | null
  closeOthers: (path: string) => void

  logs: LogLine[]
  log: (text: string, kind?: LogKind) => void
  clearLogs: () => void

  toasts: Toast[]
  notify: (title: string, body?: string, kind?: LogKind) => void
  dismiss: (id: number) => void

  paletteOpen: boolean
  setPalette: (open: boolean) => void

  /** Projects view state, hoisted so switching tabs never loses filters. */
  projectQuery: string
  projectStatus: string
  projectSort: { key: string; dir: 'asc' | 'desc' }
  setProjectQuery: (q: string) => void
  setProjectStatus: (s: string) => void
  toggleProjectSort: (key: string) => void
}

const defaultSettings: Settings = {
  theme: 'dark',
  accent: 'blue',
  animations: true,
  sound: false,
  density: 'comfortable',
  consoleOpen: true,
  sidebarCollapsed: false,
}

let seq = 0
const nextId = () => ++seq

export const useApp = create<AppState>()(
  persist(
    (setState, getState) => ({
      settings: defaultSettings,
      set: (key, value) =>
        setState((s) => ({ settings: { ...s.settings, [key]: value } })),
      resetSettings: () => setState({ settings: defaultSettings }),

      tabs: [{ path: '/dashboard', title: 'Dashboard' }],
      openTab: (tab) =>
        setState((s) =>
          s.tabs.some((t) => t.path === tab.path) ? s : { tabs: [...s.tabs, tab] },
        ),
      closeTab: (path) => {
        const { tabs } = getState()
        const idx = tabs.findIndex((t) => t.path === path)
        if (idx === -1) return null
        const remaining = tabs.filter((t) => t.path !== path)
        setState({ tabs: remaining })
        if (remaining.length === 0) return '/dashboard'
        return (remaining[idx] ?? remaining[idx - 1]).path
      },
      closeOthers: (path) =>
        setState((s) => ({ tabs: s.tabs.filter((t) => t.path === path) })),

      logs: [],
      log: (text, kind = 'info') =>
        setState((s) => ({
          logs: [...s.logs, { id: nextId(), at: Date.now(), kind, text }].slice(-200),
        })),
      clearLogs: () => setState({ logs: [] }),

      toasts: [],
      notify: (title, body, kind = 'info') => {
        const id = nextId()
        setState((s) => ({ toasts: [...s.toasts, { id, title, body, kind }] }))
        setTimeout(() => {
          setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
        }, 4200)
      },
      dismiss: (id) =>
        setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      paletteOpen: false,
      setPalette: (open) => setState({ paletteOpen: open }),

      projectQuery: '',
      projectStatus: 'All',
      projectSort: { key: 'year', dir: 'desc' },
      setProjectQuery: (q) => setState({ projectQuery: q }),
      setProjectStatus: (s) => setState({ projectStatus: s }),
      toggleProjectSort: (key) =>
        setState((s) => ({
          projectSort: {
            key,
            dir: s.projectSort.key === key && s.projectSort.dir === 'asc' ? 'desc' : 'asc',
          },
        })),
    }),
    {
      name: 'reconos.state',
      // Logs, toasts and transient UI flags should not survive a reload.
      partialize: (s) => ({ settings: s.settings, tabs: s.tabs }),
    },
  ),
)
