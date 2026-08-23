import { create } from 'zustand'

/**
 * The virtual display.
 *
 * The shell does not render into the browser viewport — it renders into a fixed
 * logical surface which is then CSS-3D-transformed onto the monitor standing on
 * the desk. So a pointer event arriving from the browser is in *client* space,
 * while every coordinate the window manager works in is in *screen* space, and
 * the two differ by the scale and offset the monitor happens to have on screen.
 *
 * Everything that reads a pointer position or the size of the display goes
 * through here. In the popped-out (2D) display the mapping is the identity, so
 * both modes run the same code.
 */

/**
 * Logical resolution of the panel. 16:9, matching the monitor's geometry.
 *
 * Deliberately modest: the panel covers roughly the width of the browser
 * window when you are sat in front of it, so 1280 lands near 1 CSS pixel per
 * rendered pixel and the shell's type stays the size it was drawn at.
 */
export const SCREEN_W = 1280
export const SCREEN_H = 720

interface ScreenState {
  /** Logical size the shell lays itself out in. */
  w: number
  h: number
  /**
   * True when the display is actually usable: either popped out, or the camera
   * has settled square-on to the monitor. Keyboard shortcuts and pointer
   * events are gated on it — you cannot type at a machine you are stood across
   * the room from.
   */
  active: boolean
}

export const useScreen = create<ScreenState>(() => ({ w: SCREEN_W, h: SCREEN_H, active: false }))

let root: HTMLElement | null = null

/** Where the surface currently lands in client space, and at what scale. */
let box = { left: 0, top: 0, sx: 1, sy: 1 }

export function registerScreen(el: HTMLElement | null) {
  root = el
  measureScreen()
}

/**
 * Re-read the surface's position and scale. Called when the display resizes and
 * at the start of every pointer gesture — the camera is locked while the screen
 * is in use, so between those two moments the mapping cannot drift.
 */
export function measureScreen() {
  if (!root) return
  const r = root.getBoundingClientRect()
  const w = root.offsetWidth || SCREEN_W
  const h = root.offsetHeight || SCREEN_H
  box = {
    left: r.left,
    top: r.top,
    sx: (r.width || w) / w,
    sy: (r.height || h) / h,
  }
  const s = useScreen.getState()
  if (s.w !== w || s.h !== h) useScreen.setState({ w, h })
}

export function screenSize() {
  const { w, h } = useScreen.getState()
  return { w, h }
}

/** Client (browser) coordinates → screen (virtual display) coordinates. */
export function toScreen(clientX: number, clientY: number) {
  return { x: (clientX - box.left) / box.sx, y: (clientY - box.top) / box.sy }
}

/** Same, for a whole rect — used to anchor popovers to an element. */
export function rectToScreen(r: DOMRect) {
  const tl = toScreen(r.left, r.top)
  return { x: tl.x, y: tl.y, w: r.width / box.sx, h: r.height / box.sy, right: tl.x + r.width / box.sx }
}

export function setScreenActive(active: boolean) {
  if (useScreen.getState().active !== active) useScreen.setState({ active })
}

export function isScreenActive() {
  return useScreen.getState().active
}

/**
 * Below this logical width the shell is being driven on a phone: the surface is
 * the viewport rather than the 1280×720 panel, so there is no room for floating
 * windows or a fixed sidebar. Apps use `useIsNarrow` to switch layout, and the
 * window manager opens new windows maximised.
 */
export const NARROW_W = 720

export function isNarrow() {
  return useScreen.getState().w < NARROW_W
}

/** Reactive form of `isNarrow`, for components that must re-render on rotate. */
export function useIsNarrow() {
  return useScreen((s) => s.w < NARROW_W)
}
