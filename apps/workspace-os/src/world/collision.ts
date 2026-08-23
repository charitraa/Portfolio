/**
 * Collision for the walkable room.
 *
 * Deliberately not a physics engine. The room is static, the player is a
 * cylinder that never leaves the floor, and everything worth bumping into is
 * box-shaped — so an axis-aligned box list and a per-axis resolve gives correct
 * sliding contact for a fraction of the cost of a solver, and adds no
 * dependency to a bundle that already carries Three.
 *
 * Boxes are in world units and match the geometry actually placed in Room3D:
 * the desk spans x -1.7..1.7 at z -1.475..-0.325, the rack sits at
 * [2.86, -2.16], the bookshelf at [-3.62, -2.44].
 */

export interface Box {
  /** Centre. */
  x: number
  z: number
  /** Half-extents. */
  hx: number
  hz: number
}

/** Radius of the player's collision cylinder, in metres. */
export const PLAYER_R = 0.34

/** Walls, as the inside face of the room shell. */
export const BOUNDS = { minX: -4.42, maxX: 4.42, minZ: -2.82, maxZ: 4.6 }

const box = (x: number, z: number, w: number, d: number): Box => ({ x, z, hx: w / 2, hz: d / 2 })

/**
 * Solid furniture. The desk is one slab rather than legs — you cannot walk
 * between the legs of a desk you are sitting at, and pretending otherwise just
 * lets the camera end up inside the drawers.
 */
export const COLLIDERS: Box[] = [
  box(0, -0.9, 3.4, 1.15), // desk: x -1.7..1.7, z -1.475..-0.325
  box(2.86, -2.16, 0.86, 0.72), // server rack, RACK_AT in room/network.tsx
  box(-3.62, -2.44, 0.9, 0.42), // bookshelf
  box(-2.5, -2.4, 0.86, 0.42), // storage cabinet
]

/**
 * Slide the player from `fromX,fromZ` towards `toX,toZ`, stopping against
 * anything solid. Resolved one axis at a time so a glancing contact slides
 * along the surface instead of stopping dead in the corner.
 */
export function resolve(fromX: number, fromZ: number, toX: number, toZ: number): [number, number] {
  let x = clampBounds(toX, BOUNDS.minX, BOUNDS.maxX)
  let z = clampBounds(toZ, BOUNDS.minZ, BOUNDS.maxZ)

  // X first, holding the old Z, then Z against the resolved X.
  if (hits(x, fromZ)) x = fromX
  if (hits(x, z)) z = fromZ
  // A corner — or a step long enough to jump the box entirely — can still land
  // inside after both passes. Hold position if that is legal, and only fall
  // back to a search if the caller was already somewhere it should not be.
  if (hits(x, z)) return hits(fromX, fromZ) ? nearestFree(fromX, fromZ) : [fromX, fromZ]

  return [x, z]
}

function clampBounds(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo + PLAYER_R), hi - PLAYER_R)
}

/** True when the player cylinder at this point overlaps any collider. */
export function hits(x: number, z: number): boolean {
  for (const b of COLLIDERS) {
    // Closest point on the box to the centre of the cylinder.
    const dx = Math.abs(x - b.x) - b.hx
    const dz = Math.abs(z - b.z) - b.hz
    if (dx <= 0 && dz <= 0) return true // centre inside
    const cx = Math.max(dx, 0)
    const cz = Math.max(dz, 0)
    if (cx * cx + cz * cz < PLAYER_R * PLAYER_R) return true
  }
  return false
}

/** Nearest standing point that is not inside anything — used by fast travel. */
export function nearestFree(x: number, z: number): [number, number] {
  if (!hits(x, z)) return [clampBounds(x, BOUNDS.minX, BOUNDS.maxX), clampBounds(z, BOUNDS.minZ, BOUNDS.maxZ)]
  for (let r = 0.2; r <= 2.4; r += 0.2) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      const px = x + Math.cos(a) * r
      const pz = z + Math.sin(a) * r
      if (!hits(px, pz)) return [clampBounds(px, BOUNDS.minX, BOUNDS.maxX), clampBounds(pz, BOUNDS.minZ, BOUNDS.maxZ)]
    }
  }
  return [0, 1.5]
}
