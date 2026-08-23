import { create } from 'zustand'
import { owner } from '@/data/portfolio'
import { withBase } from '@/lib/base'

/**
 * The machine's power/session state. The whole app is a function of `phase`.
 *
 *   room     — 3D scene, bulb cord not pulled, PC off. Nothing is running.
 *   post     — BIOS power-on self test scrolling on the monitor.
 *   boot     — kernel + init messages.
 *   login    — greeter. One guest account, no password.
 *   desktop  — the session. Windows, dock, panel.
 *   locked   — session still alive, screen locked.
 *   shutdown — powering off, returning to `room`.
 */
export type Phase = 'room' | 'post' | 'boot' | 'login' | 'desktop' | 'locked' | 'shutdown'

/**
 * Where the camera is standing.
 *
 *   room   — inside the door, the whole workspace in frame.
 *   desk   — up at the desk, close enough to reach everything on it.
 *   screen — square-on to the monitor. Only here is the display usable.
 */
/**
 * Where the camera is.
 *
 *   room / desk / screen — the rail camera, lerping between fixed shots.
 *   explore              — handed to the player controller; free movement.
 */
export type View = 'room' | 'desk' | 'screen' | 'explore'

/**
 * The way in. Before the room is yours to click on, the visitor arrives in the
 * corridor outside it and has to be let through the door.
 *
 *   loading   — the secure-workspace splash, over the corridor.
 *   door      — standing in the hallway, the lab door shut and locked.
 *   unlocking — access granted: locks cycling, leaf swinging, camera pushing in.
 *   inside    — the entrance is over; the room behaves as it always has.
 */
export type Entry = 'loading' | 'door' | 'unlocking' | 'inside'

/** How long the door takes to unlock, swing, and be walked through. */
export const ENTRY_SWING_MS = 4000

export interface Wallpaper {
  id: string
  name: string
  /** CSS background value. Kept as pure CSS so no image assets are needed. */
  css: string
  /** Used to tint window chrome and the panel for this wallpaper. */
  mood: 'dark' | 'light'
}

export const wallpapers: Wallpaper[] = [
  {
    /*
     * The default, matching the workstation's own desktop: a Big Sur style
     * graduated dark field. Drawn in CSS rather than shipped as an image —
     * the wallpaper on the real machine is a copyrighted film still, which
     * cannot be redistributed here. Drop your own at `public/wallpaper.jpg`
     * and pick "Custom" below to use it.
     */
    id: 'bigsur-dark',
    name: 'Big Sur Dark',
    mood: 'dark',
    css:
      'radial-gradient(120% 85% at 78% 6%, #2b3a56 0%, rgba(43,58,86,0) 55%),' +
      'radial-gradient(95% 70% at 12% 96%, #3a2b4e 0%, rgba(58,43,78,0) 58%),' +
      'linear-gradient(168deg, #1b1f2a 0%, #15171f 46%, #0f1014 100%)',
  },
  {
    /*
     * The desk's own wallpaper, at `public/wallpaper.jpg` — swap that file to
     * change it. The gradient behind it is not decoration: it is what shows
     * while the image decodes, and if the file is ever missing the desktop is
     * still a desktop rather than a black rectangle.
     */
    id: 'photo',
    name: 'Desk Photo',
    mood: 'dark',
    css:
      `url('${withBase('/wallpaper.jpg')}') center / cover no-repeat,` +
      'linear-gradient(168deg, #1b1f2a 0%, #15171f 46%, #0f1014 100%)',
  },
  {
    id: 'nord-dusk',
    name: 'Nord Dusk',
    mood: 'dark',
    css: 'radial-gradient(120% 90% at 20% 0%, #3b4a6b 0%, #232936 45%, #14181f 100%)',
  },
  {
    id: 'terminal-green',
    name: 'Phosphor',
    mood: 'dark',
    css: 'radial-gradient(100% 100% at 50% 120%, #0d3b2e 0%, #071a16 55%, #040a09 100%)',
  },
  {
    id: 'mountains',
    name: 'Mountains',
    mood: 'dark',
    css: 'linear-gradient(180deg, #1b2a4a 0%, #395b8c 38%, #7ba3c9 60%, #2c3e5c 61%, #16202f 100%)',
  },
  {
    id: 'cyber',
    name: 'Cyber',
    mood: 'dark',
    css: 'radial-gradient(90% 70% at 80% 10%, #6d28d9 0%, #1e1b4b 45%, #0a0a1a 100%)',
  },
  {
    id: 'ember',
    name: 'Ember',
    mood: 'dark',
    css: 'radial-gradient(110% 80% at 10% 100%, #7c2d12 0%, #291410 50%, #120a08 100%)',
  },
  {
    id: 'paper',
    name: 'Paper',
    mood: 'light',
    css: 'radial-gradient(120% 90% at 30% 0%, #f8fafc 0%, #e2e8f0 55%, #cbd5e1 100%)',
  },
]

export const accents = [
  /* MkosBigSurDark's Colors:Selection BackgroundNormal — rgb(57,172,225). */
  { id: 'bigsur', name: 'Big Sur Blue', value: '#39ace1' },
  { id: 'blue', name: 'Blue', value: '#3b82f6' },
  { id: 'purple', name: 'Purple', value: '#a78bfa' },
  { id: 'green', name: 'Green', value: '#34d399' },
  { id: 'amber', name: 'Amber', value: '#f59e0b' },
  { id: 'rose', name: 'Rose', value: '#fb7185' },
  { id: 'cyan', name: 'Cyan', value: '#22d3ee' },
]

export interface Settings {
  wallpaper: string
  accent: string
  dark: boolean
  animations: boolean
  sounds: boolean
  /** Panel/dock translucency. */
  transparency: boolean
  fontScale: number
  reduceMotionRespected: boolean
  /**
   * `panel` renders the session on the monitor in the room. `fullscreen` pops
   * the display out to fill the browser — the honest choice on a phone, where
   * a 3D room costs a lot and reading the screen inside it costs more.
   */
  display: 'panel' | 'fullscreen'
}

const DEFAULT_SETTINGS: Settings = {
  wallpaper: 'photo',
  accent: 'bigsur',
  dark: true,
  animations: true,
  sounds: false,
  transparency: true,
  fontScale: 1,
  reduceMotionRespected: true,
  display: 'panel',
}

const SETTINGS_KEY = 'charitraos.settings.v1'

function loadSettings(): Settings {
  // A narrow viewport gets the popped-out display by default. It can still be
  // switched back — this only picks the sensible first impression.
  const defaults: Settings = {
    ...DEFAULT_SETTINGS,
    display: typeof window !== 'undefined' && window.innerWidth < 860 ? 'fullscreen' : 'panel',
  }
  if (typeof localStorage === 'undefined') return defaults
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaults
    return { ...defaults, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return defaults
  }
}

interface SystemState {
  phase: Phase
  /** Where the camera is standing in the room. */
  view: View
  /** The arrival sequence: splash, corridor, door, and then the room. */
  entry: Entry
  /** The room. Live for the whole session — the machine never leaves the desk. */
  mainsOn: boolean
  pcOn: boolean
  deskLampOn: boolean
  keyboardRgb: boolean
  /** Blinds over the window on the back wall. */
  blindsOpen: boolean
  /** The chair, rolled up to the desk or pushed aside. */
  chairIn: boolean
  /** Which book on the desk is lying open, if any. */
  openBook: string | null
  /** Set once the visitor has booted at least once this tab. */
  hasBooted: boolean

  settings: Settings
  volume: number
  muted: boolean
  wifiConnected: boolean
  /** Fake but self-consistent: drains slowly, shown in the panel. */
  battery: number
  charging: boolean

  bootLog: string[]
  uptimeStart: number

  setPhase: (phase: Phase) => void
  setView: (view: View) => void
  /** Splash finished — hand over to the corridor. */
  finishLoading: () => void
  /** The access panel accepted the credential. */
  unlockDoor: () => void
  /** Straight into the room, from the splash or the hallway. */
  skipEntry: () => void
  toggleMains: () => void
  pressPowerButton: () => void
  powerOn: () => void
  toggleLamp: () => void
  toggleKeyboardRgb: () => void
  toggleBlinds: () => void
  toggleChair: () => void
  setOpenBook: (id: string | null) => void
  skipIntro: () => void
  login: () => void
  lock: () => void
  unlock: () => void
  shutdown: () => void
  reboot: () => void

  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  resetSettings: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleWifi: () => void
  pushBootLine: (line: string) => void
  clearBootLog: () => void
}

const _q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams()

const _settings = loadSettings()

/**
 * The entrance is a thing you walk through on the way to the room, so it only
 * exists when there is a room to walk into. Popped out to fullscreen there is
 * no corridor to stand in, and `?lit`/`?view=` are the dev and measurement
 * doors into the scene — none of them should be made to wait at a lock.
 */
const _entry: Entry =
  _settings.display === 'panel' && !_q.has('lit') && !_q.has('view') && !_q.has('inside') ? 'loading' : 'inside'

export const useSystem = create<SystemState>((set, get) => ({
  phase: 'room',
  view: (_q.get('view') as View) ?? 'room',
  entry: _entry,
  mainsOn: _q.has('lit'),
  pcOn: _q.has('lit'),
  deskLampOn: _q.has('lit'),
  keyboardRgb: _q.has('lit'),
  blindsOpen: true,
  chairIn: false,
  openBook: null,
  hasBooted: false,

  settings: _settings,
  volume: 45,
  muted: true,
  wifiConnected: true,
  battery: 87,
  charging: true,

  bootLog: [],
  uptimeStart: Date.now(),

  setPhase: (phase) => set({ phase }),
  // Sitting down at the machine and rolling the chair in are the same act.
  setView: (view) => set({ view, chairIn: view === 'screen' }),

  finishLoading: () => set((s) => (s.entry === 'loading' ? { entry: 'door' } : {})),

  unlockDoor: () => {
    if (get().entry !== 'door') return
    set({ entry: 'unlocking' })
    // The camera is walking through the doorway for the whole of the swing;
    // the room only becomes clickable once it has arrived.
    setTimeout(() => {
      if (get().entry === 'unlocking') set({ entry: 'inside', view: 'room' })
    }, ENTRY_SWING_MS)
  },

  skipEntry: () => set({ entry: 'inside', view: 'room' }),

  toggleMains: () =>
    set((s) => {
      const mainsOn = !s.mainsOn
      return {
        mainsOn,
        keyboardRgb: mainsOn,
        deskLampOn: mainsOn && s.deskLampOn,
        // Lights on: walk up to the desk. Lights off: back to the doorway.
        view: mainsOn ? (s.view === 'room' ? 'desk' : s.view) : 'room',
      }
    }),

  pressPowerButton: () => {
    const { mainsOn, pcOn } = get()
    // No mains, no boot. This is the one place the room enforces a rule.
    if (!mainsOn || pcOn) return
    // Sit down as it comes up, then hand over to the BIOS. Owned by the
    // machine rather than the camera, so it also works with the display
    // popped out, where there is no room to walk across.
    set({ pcOn: true, view: 'screen', chairIn: true })
    setTimeout(() => {
      if (get().phase === 'room') set({ phase: 'post' })
    }, 900)
  },

  /** Power on from the display itself, with nobody in the room to pull the cord. */
  powerOn: () => {
    if (!get().mainsOn) set({ mainsOn: true, keyboardRgb: true })
    get().pressPowerButton()
  },

  toggleLamp: () => set((s) => ({ deskLampOn: s.mainsOn ? !s.deskLampOn : false })),
  toggleKeyboardRgb: () => set((s) => ({ keyboardRgb: !s.keyboardRgb })),
  toggleBlinds: () => set((s) => ({ blindsOpen: !s.blindsOpen })),
  toggleChair: () => set((s) => ({ chairIn: !s.chairIn, view: s.chairIn ? 'desk' : 'screen' })),
  setOpenBook: (openBook) => set((s) => ({ openBook: s.openBook === openBook ? null : openBook })),

  skipIntro: () =>
    set({
      phase: 'desktop',
      entry: 'inside',
      view: 'screen',
      mainsOn: true,
      pcOn: true,
      deskLampOn: true,
      keyboardRgb: true,
      chairIn: true,
      hasBooted: true,
      uptimeStart: Date.now(),
    }),

  login: () => set({ phase: 'desktop', hasBooted: true, uptimeStart: Date.now() }),
  lock: () => set({ phase: 'locked' }),
  unlock: () => set({ phase: 'desktop' }),

  shutdown: () => {
    set({ phase: 'shutdown' })
    setTimeout(() => {
      // The machine goes off; the room is still there, and you are still
      // sitting at the desk in front of a dark monitor.
      set({ phase: 'room', pcOn: false, bootLog: [], view: 'desk', chairIn: false })
    }, 2200)
  },

  reboot: () => {
    set({ phase: 'shutdown', bootLog: [] })
    setTimeout(() => set({ phase: 'post' }), 1600)
  },

  update: (key, value) =>
    set((s) => {
      const settings = { ...s.settings, [key]: value }
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      } catch {
        // Private browsing, quota, whatever — settings just don't persist.
      }
      // Popping the display out of the room leaves no room to be let into.
      const leaving = key === 'display' && value === 'fullscreen' && s.entry !== 'inside'
      return leaving ? { settings, entry: 'inside' as Entry, view: 'room' as View } : { settings }
    }),

  resetSettings: () => {
    try {
      localStorage.removeItem(SETTINGS_KEY)
    } catch {
      /* ignore */
    }
    set({ settings: DEFAULT_SETTINGS })
  },

  setVolume: (v) => set({ volume: Math.max(0, Math.min(100, Math.round(v))), muted: v === 0 }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  toggleWifi: () => set((s) => ({ wifiConnected: !s.wifiConnected })),

  pushBootLine: (line) => set((s) => ({ bootLog: [...s.bootLog, line] })),
  clearBootLog: () => set({ bootLog: [] }),
}))

/** Convenience selectors — keep components from subscribing to the whole store. */
export const useWallpaper = () =>
  useSystem((s) => wallpapers.find((w) => w.id === s.settings.wallpaper) ?? wallpapers[0])

export const useAccent = () =>
  useSystem((s) => accents.find((a) => a.id === s.settings.accent)?.value ?? accents[0].value)

export const hostLabel = `${owner.username}@${owner.hostname}`
