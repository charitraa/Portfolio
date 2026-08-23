import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EYE_Y, keys, pose, useWorld } from './player'
import { resolve } from './collision'
import { stationAt } from './stations3d'
import { useDiscovery } from '@/store/discovery'

/** Metres per second. A room this size is crossed in a couple of seconds. */
const WALK = 2.35
const SPRINT = 4.1
/** How fast velocity chases the input, so starting and stopping are not steps. */
const ACCEL = 12
/**
 * Movement is integrated in fixed slices rather than one variable step.
 *
 * Clamping a long frame to a maximum instead would be simpler, but it makes
 * the player move in slow motion whenever the frame rate drops — a device
 * rendering at 10fps would travel at a sixth of walking pace, because five
 * sixths of every frame's time is thrown away. Substepping keeps the distance
 * covered correct at any frame rate, and keeps each step short enough that the
 * collider cannot be tunnelled through.
 */
const SUBSTEP = 1 / 60
/** Longer than this and the tab was backgrounded; do not simulate the gap. */
const MAX_FRAME = 0.5
const LOOK_SENS = 0.0022
const PITCH_LIMIT = Math.PI / 2 - 0.08

/** Bob is what sells walking; it has to be small enough not to be noticed. */
const BOB_SPEED = 9.4
const BOB_AMOUNT = 0.021

const MOVE_KEYS: Record<string, [number, number]> = {
  keyw: [0, -1],
  arrowup: [0, -1],
  keys: [0, 1],
  arrowdown: [0, 1],
  keya: [-1, 0],
  arrowleft: [-1, 0],
  keyd: [1, 0],
  arrowright: [1, 0],
}

/**
 * First-person movement inside the room.
 *
 * Owns the camera for as long as it is mounted — `Room3D` only mounts it in
 * `explore`, and the rail-camera rig is unmounted for the same period, so the
 * two never fight over `camera.position`.
 *
 * Everything per-frame is read from module-level mutable state rather than
 * React state: a walk cycle that re-rendered the scene graph would drop frames
 * for no benefit. The only thing pushed into the store is which station the
 * player is near, and only when it changes.
 */
export default function PlayerController({ onInteract }: { onInteract: (stationId: string) => void }) {
  const { camera, gl } = useThree()
  const velocity = useRef({ x: 0, z: 0 })
  const bobPhase = useRef(0)
  const setNear = useWorld((s) => s.setNear)
  const setHere = useWorld((s) => s.setHere)
  const setLocked = useWorld((s) => s.setLocked)
  const discover = useDiscovery((s) => s.discover)
  // Head bob is the part of first-person movement most likely to make someone
  // ill; honour the OS setting rather than offering our own toggle for it.
  const reducedMotion = useRef(
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  // Latest interact handler without re-binding listeners every render.
  const interactRef = useRef(onInteract)
  interactRef.current = onInteract

  // --- input ---------------------------------------------------------------
  useEffect(() => {
    const canvas = gl.domElement

    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code.toLowerCase()
      if (MOVE_KEYS[code] || code === 'shiftleft' || code === 'shiftright') {
        // Arrow keys scroll the page; movement keys must not.
        e.preventDefault()
        keys.add(code)
        return
      }
      if (code === 'keye' || code === 'enter') {
        e.preventDefault()
        const near = useWorld.getState().near
        if (near) interactRef.current(near)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code.toLowerCase())

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return
      pose.yaw -= e.movementX * LOOK_SENS
      pose.pitch = THREE.MathUtils.clamp(pose.pitch - e.movementY * LOOK_SENS, -PITCH_LIMIT, PITCH_LIMIT)
    }

    const onLockChange = () => {
      const locked = document.pointerLockElement === canvas
      setLocked(locked)
      // Keys held when focus is lost would otherwise stick down forever.
      if (!locked) keys.clear()
    }

    // Clicking the world grabs the pointer; Escape releases it (browser default).
    const onPointerDown = () => {
      if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onLockChange)
    canvas.addEventListener('pointerdown', onPointerDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onLockChange)
      canvas.removeEventListener('pointerdown', onPointerDown)
      keys.clear()
      if (document.pointerLockElement === canvas) document.exitPointerLock?.()
    }
  }, [gl, setLocked])

  // --- per-frame -----------------------------------------------------------
  useFrame((_, rawDelta) => {
    const frame = Math.min(rawDelta, MAX_FRAME)

    const jump = useWorld.getState().consumeTeleport()
    if (jump) {
      pose.x = jump.x
      pose.z = jump.z
      pose.yaw = jump.yaw
      velocity.current.x = 0
      velocity.current.z = 0
    }

    // Desired direction in local space.
    let ix = 0
    let iz = 0
    for (const code of keys) {
      const dir = MOVE_KEYS[code]
      if (dir) {
        ix += dir[0]
        iz += dir[1]
      }
    }
    const len = Math.hypot(ix, iz)
    if (len > 0) {
      ix /= len
      iz /= len
    }

    const sprinting = keys.has('shiftleft') || keys.has('shiftright')
    const speed = sprinting ? SPRINT : WALK

    // Rotate the input into world space by yaw.
    const sin = Math.sin(pose.yaw)
    const cos = Math.cos(pose.yaw)
    const wantX = (ix * cos - iz * sin) * speed
    const wantZ = (ix * sin + iz * cos) * speed

    for (let remaining = frame; remaining > 0; remaining -= SUBSTEP) {
      const dt = Math.min(SUBSTEP, remaining)

      const k = 1 - Math.exp(-ACCEL * dt)
      velocity.current.x += (wantX - velocity.current.x) * k
      velocity.current.z += (wantZ - velocity.current.z) * k

      const [nx, nz] = resolve(
        pose.x,
        pose.z,
        pose.x + velocity.current.x * dt,
        pose.z + velocity.current.z * dt,
      )
      // Contact kills the velocity into the surface, so we do not keep pushing.
      if (nx === pose.x) velocity.current.x = 0
      if (nz === pose.z) velocity.current.z = 0
      pose.x = nx
      pose.z = nz
    }

    // Head bob, scaled by how fast we are actually going rather than by input.
    const groundSpeed = Math.hypot(velocity.current.x, velocity.current.z)
    bobPhase.current += frame * BOB_SPEED * (groundSpeed / WALK)
    const bob = reducedMotion.current
      ? 0
      : Math.sin(bobPhase.current) * BOB_AMOUNT * Math.min(groundSpeed / WALK, 1.4)

    camera.position.set(pose.x, EYE_Y + bob, pose.z)
    camera.quaternion.setFromEuler(new THREE.Euler(pose.pitch, pose.yaw, 0, 'YXZ'))

    // Proximity. Cheap enough to run every frame for nine stations.
    const st = stationAt(pose.x, pose.z)
    setNear(st?.id ?? null)
    setHere(st?.id ?? null)
    if (st) discover(st.id)
  })

  return null
}
