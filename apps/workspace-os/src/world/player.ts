import { create } from 'zustand'
import { nearestFree } from './collision'
import { stationById } from './stations3d'

/**
 * Where the visitor is standing and which way they are looking, plus the small
 * amount of intent the controller needs from outside the render loop (a
 * pending teleport, a requested look direction).
 *
 * Kept out of React state on purpose: the controller writes to it every frame,
 * and re-rendering the scene sixty times a second to move a camera would be
 * the single most expensive mistake available here. Components that need to
 * *display* position subscribe to the throttled `here` field instead.
 */

/** Eye height, in metres. A little under the seated monitor so the desk reads. */
export const EYE_Y = 1.62

export interface PlayerPose {
  x: number
  z: number
  /** Yaw in radians; 0 looks down -Z, matching Three's forward. */
  yaw: number
  pitch: number
}

/** Live pose, mutated in place by the controller. Never put this in state. */
export const pose: PlayerPose = { x: 0.2, z: 3.4, yaw: 0, pitch: -0.06 }


/** Keys currently held, filled by the controller's listeners. */
export const keys = new Set<string>()
// Dev only: lets a headless browser read where the player actually is, so
// movement and collision can be asserted against numbers rather than inferred
// from the HUD. Same convention as `__THREE_FOR_TEST` in Room3D. Stripped from
// production builds by the bundler.
if (import.meta.env.DEV) {
  ;(window as unknown as { __POSE_FOR_TEST?: PlayerPose }).__POSE_FOR_TEST = pose
  ;(window as unknown as { __KEYS_FOR_TEST?: Set<string> }).__KEYS_FOR_TEST = keys
}


interface WorldState {
  /** Station the player is standing in range of, or null. */
  near: string | null
  /** Station id whose name is shown bottom-left; lags `near` deliberately. */
  here: string | null
  /** Set when something wants the player moved; consumed by the controller. */
  teleport: { x: number; z: number; yaw: number } | null
  /** Pointer lock is engaged, so the crosshair and prompt are meaningful. */
  locked: boolean
  mapOpen: boolean

  setNear: (id: string | null) => void
  setHere: (id: string | null) => void
  setLocked: (v: boolean) => void
  toggleMap: (v?: boolean) => void
  goTo: (stationId: string) => boolean
  consumeTeleport: () => { x: number; z: number; yaw: number } | null
}

export const useWorld = create<WorldState>((set, get) => ({
  near: null,
  here: null,
  teleport: null,
  locked: false,
  mapOpen: false,

  setNear: (id) => {
    if (get().near !== id) set({ near: id })
  },
  setHere: (id) => {
    if (get().here !== id) set({ here: id })
  },
  setLocked: (locked) => set({ locked }),
  toggleMap: (v) => set((s) => ({ mapOpen: v ?? !s.mapOpen })),

  /** Move the player to a station's standing point, facing what it is about. */
  goTo: (stationId) => {
    const st = stationById.get(stationId)
    if (!st) return false
    const [x, z] = nearestFree(st.at[0], st.at[1])
    // Face the thing, not the standing point. The controller builds the camera
    // orientation from a YXZ euler, whose forward vector is (-sin yaw, -cos yaw)
    // — so both components are negated here.
    const yaw = Math.atan2(-(st.face[0] - x), -(st.face[1] - z))
    set({ teleport: { x, z, yaw }, mapOpen: false })
    return true
  },

  consumeTeleport: () => {
    const t = get().teleport
    if (t) set({ teleport: null })
    return t
  },
}))

/** Reset the pose to the doorway, for a fresh entry into explore mode. */
export function resetPose() {
  pose.x = 0.2
  pose.z = 3.4
  pose.yaw = 0
  pose.pitch = -0.06
  keys.clear()
}
