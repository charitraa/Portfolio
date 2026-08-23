import { create } from 'zustand'
import type { AppId, LaunchProps } from '@/os/types'
import { isNarrow, screenSize } from '@/os/screen'

export type SnapEdge = 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null

export interface Win {
  id: string
  appId: AppId
  title: string
  x: number
  y: number
  w: number
  h: number
  /** Geometry to restore to when un-maximising or un-snapping. */
  restore: { x: number; y: number; w: number; h: number } | null
  minimized: boolean
  maximized: boolean
  snapped: SnapEdge
  z: number
  props: LaunchProps
  /** Bumped to trigger an attention shake when a singleton is re-opened. */
  nudge: number
}

/** Chrome reserved by the desktop shell. Windows never occupy these bands. */
/**
 * Chrome reserved by the shell. The workstation this is modelled on runs a
 * single panel along the bottom and nothing at the top, so `PANEL_H` is zero —
 * kept rather than deleted because the work-area maths and the desktop icon
 * grid both read it, and a named zero documents the layout better than its
 * absence would.
 */
export const PANEL_H = 0
/** Height of the bottom taskbar. KDE's default panel is 44px; this matches. */
export const DOCK_H = 44

export interface Workarea {
  x: number
  y: number
  w: number
  h: number
}

/**
 * The area windows may occupy — in *display* coordinates, not browser ones.
 * The display is usually the monitor on the desk, which is not the same size
 * as the browser window it is being looked at through.
 */
export function getWorkarea(): Workarea {
  const { w, h } = screenSize()
  return { x: 0, y: PANEL_H, w, h: Math.max(200, h - PANEL_H - DOCK_H) }
}

interface WindowState {
  windows: Win[]
  focusedId: string | null
  /** Monotonic counters — ids stay unique, z stays strictly increasing. */
  nextZ: number
  seq: number
  /** True while the user holds the "show desktop" state. */
  showingDesktop: boolean

  open: (appId: AppId, opts?: { title?: string; props?: LaunchProps; size?: { w: number; h: number }; singleInstance?: boolean }) => string
  close: (id: string) => void
  closeApp: (appId: AppId) => void
  focus: (id: string) => void
  minimize: (id: string) => void
  toggleMinimize: (id: string) => void
  restore: (id: string) => void
  toggleMaximize: (id: string) => void
  setGeometry: (id: string, geo: Partial<Pick<Win, 'x' | 'y' | 'w' | 'h'>>) => void
  snap: (id: string, edge: Exclude<SnapEdge, null>) => void
  setTitle: (id: string, title: string) => void
  setProps: (id: string, props: LaunchProps) => void
  cycleFocus: (backwards?: boolean) => void
  closeFocused: () => void
  minimizeAll: () => void
  toggleShowDesktop: () => void
  /** Pull every window back inside the work area after a resolution change. */
  fitToScreen: () => void
  /** Window belonging to `appId`, most recently focused first. */
  findByApp: (appId: AppId) => Win | undefined
}

/** Cascade new windows so a second launch doesn't hide the first. */
function cascade(seq: number, w: number, h: number, area: Workarea) {
  const step = 28
  const slots = 6
  const i = seq % slots
  const baseX = Math.max(area.x + 8, Math.round(area.x + (area.w - w) / 2) - (slots * step) / 2)
  const baseY = Math.max(area.y + 8, Math.round(area.y + (area.h - h) / 2) - (slots * step) / 2)
  const x = Math.min(baseX + i * step, area.x + area.w - w - 8)
  const y = Math.min(baseY + i * step, area.y + area.h - h - 8)
  return { x: Math.max(area.x + 8, x), y: Math.max(area.y + 8, y) }
}

function snapGeometry(edge: Exclude<SnapEdge, null>, area: Workarea) {
  const halfW = Math.round(area.w / 2)
  const halfH = Math.round(area.h / 2)
  switch (edge) {
    case 'left':
      return { x: area.x, y: area.y, w: halfW, h: area.h }
    case 'right':
      return { x: area.x + halfW, y: area.y, w: area.w - halfW, h: area.h }
    case 'top-left':
      return { x: area.x, y: area.y, w: halfW, h: halfH }
    case 'top-right':
      return { x: area.x + halfW, y: area.y, w: area.w - halfW, h: halfH }
    case 'bottom-left':
      return { x: area.x, y: area.y + halfH, w: halfW, h: area.h - halfH }
    case 'bottom-right':
      return { x: area.x + halfW, y: area.y + halfH, w: area.w - halfW, h: area.h - halfH }
  }
}

export const useWindows = create<WindowState>((set, get) => ({
  windows: [],
  focusedId: null,
  nextZ: 10,
  seq: 0,
  showingDesktop: false,

  open: (appId, opts = {}) => {
    const state = get()

    if (opts.singleInstance) {
      const existing = state.windows.find((w) => w.appId === appId)
      if (existing) {
        set({
          focusedId: existing.id,
          nextZ: state.nextZ + 1,
          showingDesktop: false,
          windows: state.windows.map((w) =>
            w.id === existing.id
              ? {
                  ...w,
                  minimized: false,
                  z: state.nextZ,
                  nudge: w.nudge + 1,
                  // A re-open with new arguments should actually navigate.
                  props: opts.props ? { ...w.props, ...opts.props } : w.props,
                  title: opts.title ?? w.title,
                }
              : w,
          ),
        })
        return existing.id
      }
    }

    const area = getWorkarea()
    // On a phone there is no room to float or cascade anything: a window is the
    // work area, the way an application is the screen on a handheld.
    const phone = isNarrow()
    const w = phone ? area.w : Math.min(opts.size?.w ?? 900, area.w - 16)
    const h = phone ? area.h : Math.min(opts.size?.h ?? 600, area.h - 16)
    const { x, y } = phone ? { x: area.x, y: area.y } : cascade(state.seq, w, h, area)
    const id = `win-${state.seq + 1}`

    set({
      seq: state.seq + 1,
      nextZ: state.nextZ + 1,
      focusedId: id,
      showingDesktop: false,
      windows: [
        ...state.windows,
        {
          id,
          appId,
          title: opts.title ?? appId,
          x,
          y,
          w,
          h,
          restore: null,
          minimized: false,
          maximized: false,
          snapped: null,
          z: state.nextZ,
          props: opts.props ?? {},
          nudge: 0,
        },
      ],
    })
    return id
  },

  close: (id) =>
    set((s) => {
      const windows = s.windows.filter((w) => w.id !== id)
      const focusedId =
        s.focusedId === id
          ? // Focus falls to the topmost remaining visible window.
            (windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0]?.id ?? null)
          : s.focusedId
      return { windows, focusedId }
    }),

  closeApp: (appId) =>
    set((s) => ({ windows: s.windows.filter((w) => w.appId !== appId) })),

  focus: (id) =>
    set((s) => {
      if (s.focusedId === id && !s.windows.find((w) => w.id === id)?.minimized) return s
      return {
        focusedId: id,
        nextZ: s.nextZ + 1,
        showingDesktop: false,
        windows: s.windows.map((w) => (w.id === id ? { ...w, z: s.nextZ, minimized: false } : w)),
      }
    }),

  minimize: (id) =>
    set((s) => {
      const windows = s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w))
      const focusedId =
        s.focusedId === id
          ? (windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0]?.id ?? null)
          : s.focusedId
      return { windows, focusedId }
    }),

  toggleMinimize: (id) => {
    const win = get().windows.find((w) => w.id === id)
    if (!win) return
    if (win.minimized) get().focus(id)
    else if (get().focusedId === id) get().minimize(id)
    else get().focus(id)
  },

  restore: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => {
        if (w.id !== id || !w.restore) return w
        return { ...w, ...w.restore, restore: null, maximized: false, snapped: null }
      }),
    })),

  toggleMaximize: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => {
        if (w.id !== id) return w
        const area = getWorkarea()
        if (w.maximized || w.snapped) {
          const r = w.restore ?? { x: area.x + 40, y: area.y + 40, w: 900, h: 560 }
          return { ...w, ...r, restore: null, maximized: false, snapped: null }
        }
        return {
          ...w,
          restore: { x: w.x, y: w.y, w: w.w, h: w.h },
          x: area.x,
          y: area.y,
          w: area.w,
          h: area.h,
          maximized: true,
          snapped: null,
        }
      }),
    })),

  setGeometry: (id, geo) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, ...geo } : w)),
    })),

  snap: (id, edge) =>
    set((s) => ({
      windows: s.windows.map((w) => {
        if (w.id !== id) return w
        const area = getWorkarea()
        return {
          ...w,
          restore: w.restore ?? { x: w.x, y: w.y, w: w.w, h: w.h },
          ...snapGeometry(edge, area),
          maximized: false,
          snapped: edge,
        }
      }),
    })),

  setTitle: (id, title) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, title } : w)) })),

  setProps: (id, props) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, props: { ...w.props, ...props } } : w)),
    })),

  cycleFocus: (backwards = false) => {
    const s = get()
    const visible = s.windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)
    if (visible.length < 2) {
      if (visible.length === 1) s.focus(visible[0].id)
      return
    }
    // Alt+Tab goes to the *next least recently* focused window, like a real WM.
    const target = backwards ? visible[visible.length - 1] : visible[1]
    s.focus(target.id)
  },

  closeFocused: () => {
    const { focusedId, close } = get()
    if (focusedId) close(focusedId)
  },

  minimizeAll: () =>
    set((s) => ({ windows: s.windows.map((w) => ({ ...w, minimized: true })), focusedId: null })),

  toggleShowDesktop: () => {
    const s = get()
    if (s.showingDesktop) {
      set({
        showingDesktop: false,
        windows: s.windows.map((w) => ({ ...w, minimized: false })),
      })
    } else {
      set({
        showingDesktop: true,
        windows: s.windows.map((w) => ({ ...w, minimized: true })),
        focusedId: null,
      })
    }
  },

  fitToScreen: () =>
    set((s) => {
      const area = getWorkarea()
      return {
        windows: s.windows.map((win) => {
          if (win.maximized) return { ...win, x: area.x, y: area.y, w: area.w, h: area.h }
          if (win.snapped) return { ...win, ...snapGeometry(win.snapped, area) }
          const w = Math.min(win.w, area.w)
          const h = Math.min(win.h, area.h)
          return {
            ...win,
            w,
            h,
            x: Math.min(Math.max(win.x, area.x), Math.max(area.x, area.x + area.w - w)),
            y: Math.min(Math.max(win.y, area.y), Math.max(area.y, area.y + area.h - 40)),
          }
        }),
      }
    }),

  findByApp: (appId) =>
    get()
      .windows.filter((w) => w.appId === appId)
      .sort((a, b) => b.z - a.z)[0],
}))
