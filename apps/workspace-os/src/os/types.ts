import type { ComponentType } from 'react'

export type AppId =
  | 'files'
  | 'terminal'
  | 'browser'
  | 'music'
  | 'monitor'
  | 'settings'
  | 'trash'
  | 'projects'
  | 'about'
  | 'resume'
  | 'skills'
  | 'experience'
  | 'techstack'
  | 'contact'
  | 'calculator'
  | 'calendar'
  | 'notes'
  | 'editor'
  | 'stations'
  | 'seclab'
  | 'websec'
  | 'aisec'
  | 'network'
  | 'knowledge'
  | 'github'
  | 'services'
  | 'testimonials'

/** Arbitrary launch arguments, e.g. `{ path: '/home/charitra/About.md' }`. */
export type LaunchProps = Record<string, unknown>

export interface AppWindowProps {
  /** Id of the window this app instance is rendered into. */
  winId: string
  props: LaunchProps
}

export interface AppMeta {
  id: AppId
  /** Shown in the panel, dock tooltips and window titlebars. */
  name: string
  /** What the window titlebar says when there are no launch args. */
  title?: string
  glyph: string
  accent: string
  /** One-line description for the launcher and Software Center. */
  description: string
  component: ComponentType<AppWindowProps>
  /** Merged under any launch arguments — how `about` becomes "Editor on About.md". */
  defaultProps?: LaunchProps
  defaultSize: { w: number; h: number }
  minSize?: { w: number; h: number }
  /** Opening again focuses the existing window instead of spawning another. */
  singleInstance?: boolean
  /** Appears on the desktop as an icon. */
  onDesktop?: boolean
  /** Pinned to the dock even when not running. */
  inDock?: boolean
  /** Hidden from the app launcher grid (still openable programmatically). */
  hiddenFromLauncher?: boolean
  /** Category used by the launcher's grouping. */
  category: 'Portfolio' | 'Security' | 'System' | 'Accessories' | 'Internet' | 'Media'
}
