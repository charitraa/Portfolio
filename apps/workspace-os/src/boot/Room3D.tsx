import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, Environment, Html, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { M } from './room/kit'
import PlayerController from '@/world/PlayerController'
import WorldUI from '@/world/WorldUI'
import { stationById } from '@/world/stations3d'

// Dev only: lets a headless browser walk the scene graph and measure world
// bounding boxes, so object placement can be checked against real geometry
// instead of by eye. Stripped from production builds by the bundler.
if (import.meta.env.DEV) {
  ;(window as unknown as { __THREE_FOR_TEST?: unknown }).__THREE_FOR_TEST = THREE
}
import {
  Breadboard,
  CableTray,
  ChargingStation,
  DeskSpeaker,
  ExternalSsd,
  HeadphoneStand,
  LaptopOnStand,
  MonitorArm,
  Multimeter,
  Notebook,
  PhoneOnStand,
  SideMonitor,
  StickyNotes,
  StudioMic,
  Toolkit,
  UsbDrives,
  UsbHub,
  WaterBottle,
  Webcam,
  DESK_Y,
} from './room/desk-gear'
import { RaspberryPi, ServerRack } from './room/network'
import { Entrance, HALL_SHOT, SWING_START, SWING_TIME, type DoorTimeline } from './room/door'
import { entryAudio } from './entry-audio'
import { Certificates, FloatingShelves, TaskBoard, TopologyDiagram, Whiteboard } from './room/walls'
import { BookStack, Bookshelf, FloorMat, StorageCabinet } from './room/furniture'
import { useAccent, useSystem, type Entry, type View } from '@/store/system'
import { useMusic } from '@/store/music'
import { launchApp } from '@/os/launch'
import { measureScreen, SCREEN_H, SCREEN_W, setScreenActive } from '@/os/screen'
import ScreenSurface from '@/os/ScreenSurface'
import { owner } from '@/data/portfolio'
import type { AppId } from '@/os/types'

/**
 * The workspace.
 *
 * Everything is built from primitive geometry — no GLTF, no HDRI, no textures.
 * That keeps the bundle small and means the scene renders identically offline.
 * The trade-off is stylised rather than photoreal, which suits a workstation
 * you are about to switch on.
 *
 * The session itself is not a texture: the real shell — window manager,
 * terminal, applications — is CSS-3D-transformed onto the panel, so what you
 * are clicking on the monitor is the DOM, standing in the room.
 */

const WARM = '#ffb37a'
const COOL = '#89b4ff'

// ---------------------------------------------------------------------------
// The monitor, in world units. The display's logical resolution is 16:9, so
// the panel is too — anything else would letterbox the session.
// ---------------------------------------------------------------------------

const PANEL_W = 1.36
const PANEL_H = PANEL_W * (SCREEN_H / SCREEN_W)
/** Monitor group origin, and the panel's offset inside it. */
const MONITOR_AT = new THREE.Vector3(0, 0.79, -1.25)
const PANEL_LOCAL = new THREE.Vector3(0, 0.62, 0.026)
const PANEL_AT = MONITOR_AT.clone().add(PANEL_LOCAL)

/** Ceiling height, and where the pendant bulb hangs to.
 *
 *  Offset in x on purpose. Hung dead centre the flex reads, from the doorway,
 *  as a line ruled straight down the middle of the whiteboard — a cord is thin
 *  enough to look like a mistake rather than an object. This sits it in the
 *  clear strip of wall between the whiteboard and the task board instead.
 *
 *  It hangs just clear of the desk's front edge (z -0.325) rather than over it,
 *  because the light is worked by a pull cord that has to run all the way down
 *  to somebody standing under it. Over the desk the cord would drop through the
 *  desk, and from the doorway it would hang behind the monitor. */
const CEILING_Y = 4.4
const BULB_AT = new THREE.Vector3(0.62, 2.28, -0.22)
/** How far the bulb drops below the ceiling. */
const BULB_DROP = CEILING_Y - BULB_AT.y
/** Where the pull cord's knob hangs: hand height above the floor, so it is
 *  reached by standing under the bulb rather than by climbing on the desk. */
const CORD_KNOB_Y = 1.32
/** How far the cord hangs out from the flex, clearing the glass below it. */
const CORD_X = 0.12

/** CSS pixels → world units, the ratio drei's transform mode is built around. */
const PIXEL_FACTOR = (PANEL_W / SCREEN_W) * 400

// ---------------------------------------------------------------------------
// Camera choreography
// ---------------------------------------------------------------------------

const SHOTS: Record<Exclude<View, 'screen' | 'explore'>, { pos: THREE.Vector3; look: THREE.Vector3 }> = {
  // Just inside the door: the whole room, dark, one thing worth clicking.
  room: { pos: new THREE.Vector3(0.2, 1.52, 4.15), look: new THREE.Vector3(0.05, 1.16, -1.15) },
  // Lights on — up at the desk, everything on it within reach.
  desk: { pos: new THREE.Vector3(0.06, 1.44, 1.85), look: new THREE.Vector3(0, 1.22, -1.2) },
}

const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()

/** The camera's resting field of view, which the screen shot depends on. */
const BASE_FOV = 46
/** Tighter in the corridor: a long lens compresses it and holds the door. */
const HALL_FOV = 41

/**
 * The entrance, from the camera's side.
 *
 *   door      — a slow, unbroken push down the hallway towards the reader.
 *   unlocking — the walk through, timed to arrive as the leaf comes to rest.
 *
 * Handing over: the last frame of the walk is the room's own `room` shot, so
 * nothing jumps when the rig goes back to its ordinary business.
 */
const APPROACH_TIME = 9
const WALK_FROM = 1
const WALK_TIME = 2.6

function smoothstep(x: number) {
  const t = THREE.MathUtils.clamp(x, 0, 1)
  return t * t * (3 - 2 * t)
}

/** Advances the door's own animation. Returns nothing; the timeline is shared. */
function driveTimeline(tl: DoorTimeline, entry: Entry, now: number, start: number | null, delta: number) {
  if (entry === 'unlocking' && start !== null) {
    tl.t = now - start
    tl.bolt = THREE.MathUtils.clamp((tl.t - 0.45) / 0.28, 0, 1)
    tl.swing = smoothstep((tl.t - SWING_START) / SWING_TIME)
    tl.glow = 1
  } else if (entry === 'inside') {
    tl.t = Number.POSITIVE_INFINITY
    tl.bolt = 1
    tl.swing += (1 - tl.swing) * Math.min(1, delta * 4)
    // The frame LEDs drop back once you are through and being watched matters
    // less than being able to see.
    tl.glow += (0.4 - tl.glow) * Math.min(1, delta * 1.4)
  } else {
    tl.t = -1
    tl.bolt = 0
    tl.swing = 0
    tl.glow = 1
  }
}

/** Where the camera has to stand for the panel to fill the viewport. */
function screenShot(camera: THREE.PerspectiveCamera) {
  const t = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
  const byHeight = PANEL_H / 2 / t
  const byWidth = PANEL_W / 2 / (t * camera.aspect)
  // A little margin, so the bezel stays in frame and the panel reads as a
  // physical object rather than a full-bleed web page.
  const d = Math.max(byHeight, byWidth) * 1.12
  _pos.copy(PANEL_AT).add(new THREE.Vector3(0, 0, d))
  _look.copy(PANEL_AT)
  return { pos: _pos, look: _look }
}

function CameraRig({ view, entry, tl, onSettle }: {
  view: View
  entry: Entry
  tl: DoorTimeline
  onSettle: (settled: boolean) => void
}) {
  const target = useRef(new THREE.Vector3())
  const look = useRef(SHOTS.room.look.clone())
  const settled = useRef(false)
  /** How far down the corridor the approach has got, 0..1. */
  const approach = useRef(0)
  /** Scene time the credential was accepted, and where we were standing then. */
  const unlockAt = useRef<number | null>(null)
  const walkFrom = useRef(new THREE.Vector3())

  useFrame(({ camera, pointer, clock }, delta) => {
    const cam = camera as THREE.PerspectiveCamera

    if (entry === 'unlocking' && unlockAt.current === null) {
      unlockAt.current = clock.elapsedTime
      walkFrom.current.copy(cam.position)
    }
    driveTimeline(tl, entry, clock.elapsedTime, unlockAt.current, delta)

    if (entry !== 'inside') {
      // Outside: the camera is a person, so it walks and it breathes. The
      // sway is tiny and dies away as they step through the doorway.
      const t = clock.elapsedTime
      let sway = 1
      if (entry === 'unlocking') {
        const u = smoothstep((tl.t - WALK_FROM) / WALK_TIME)
        _pos.lerpVectors(walkFrom.current, SHOTS.room.pos, u)
        _look.lerpVectors(HALL_SHOT.look, SHOTS.room.look, u)
        cam.fov = THREE.MathUtils.lerp(HALL_FOV, BASE_FOV, u)
        sway = 1 - u
      } else {
        // The walk belongs to the corridor, not to the splash: while the
        // loading screen is up the camera holds its mark, or the visitor
        // arrives at the door having watched none of the approach.
        if (entry === 'door') approach.current = Math.min(1, approach.current + delta / APPROACH_TIME)
        // Ease out, so the walk arrives at the reader rather than stopping at it.
        _pos.lerpVectors(HALL_SHOT.far, HALL_SHOT.near, 1 - Math.pow(1 - approach.current, 2.2))
        _look.copy(HALL_SHOT.look)
        cam.fov = HALL_FOV
      }

      _pos.x += (Math.sin(t * 0.62) * 0.014 + pointer.x * 0.05) * sway
      _pos.y += (Math.sin(t * 0.47 + 1.3) * 0.009 + pointer.y * 0.03) * sway

      cam.position.copy(_pos)
      cam.lookAt(_look)
      cam.updateProjectionMatrix()

      look.current.copy(_look)
      target.current.copy(_pos)
      if (settled.current) {
        settled.current = false
        onSettle(false)
      }
      return
    }

    // Inside. The corridor is behind us and the camera is a camera again.
    if (cam.fov !== BASE_FOV) {
      cam.fov = BASE_FOV
      cam.updateProjectionMatrix()
    }

    // `explore` is driven by PlayerController, which is mounted in place of
    // this rig once the visitor is inside — but a frame can still land here
    // during the swap, and `view` can legally be 'explore' out in the corridor.
    if (view === 'explore') return
    const shot = view === 'screen' ? screenShot(cam) : SHOTS[view]

    target.current.copy(shot.pos)
    // Parallax keeps the room alive while you look around it, but square-on to
    // the monitor the camera has to hold perfectly still: the session is real
    // DOM, and a drifting camera would drag every window with it.
    // Kept small on purpose: the parallax has to breathe without shifting a
    // small target out from under the cursor between hovering and clicking it.
    if (view !== 'screen') {
      target.current.x += pointer.x * 0.09
      target.current.y += pointer.y * 0.05
    }

    const k = 1 - Math.pow(0.0016, delta)
    camera.position.lerp(target.current, k)
    look.current.lerp(shot.look, k)
    camera.lookAt(look.current)

    const near = view === 'screen' && camera.position.distanceTo(target.current) < 0.004
    if (near !== settled.current) {
      settled.current = near
      onSettle(near)
    }
  })

  return null
}

// ---------------------------------------------------------------------------
// Interactive helper
// ---------------------------------------------------------------------------

function Hoverable({
  children,
  onClick,
  label,
  /** Where the tooltip hangs, in this group's local space. */
  anchor = [0, 0.22, 0],
  disabled,
  /** Most things here are clicked; a couple are dragged instead. */
  cursor = 'pointer',
}: {
  children: React.ReactNode
  onClick?: () => void
  label?: string
  anchor?: [number, number, number]
  disabled?: boolean
  cursor?: string
}) {
  const [hover, setHover] = useState(false)

  return (
    <group
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        if (disabled) return
        setHover(true)
        document.body.style.cursor = cursor
      }}
      onPointerOut={() => {
        setHover(false)
        document.body.style.cursor = 'auto'
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        // While exploring, a click is "capture the pointer" — not "press the
        // thing under the crosshair". Stations are used with E instead.
        if (useSystem.getState().view === 'explore') return
        e.stopPropagation()
        if (!disabled) onClick?.()
      }}
    >
      {children}
      {hover && label && !disabled && (
        // No distanceFactor: the tooltip is UI, so it keeps a constant size
        // rather than ballooning as the camera moves in.
        <Html center position={anchor} zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
          <div
            className="rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap"
            style={{ background: 'rgba(10,13,18,.92)', color: '#e6eaf2', boxShadow: '0 0 0 1px rgba(255,255,255,.14)' }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}

/** Eases a value towards a target every frame; the workhorse of the room. */
function useSpring(to: number, speed = 6) {
  const v = useRef(to)
  useFrame((_, delta) => {
    v.current += (to - v.current) * Math.min(1, delta * speed)
  })
  return v
}

// ---------------------------------------------------------------------------
// Scene pieces
// ---------------------------------------------------------------------------

function Room({ lit, onBackdropClick }: { lit: boolean; onBackdropClick: () => void }) {
  const wall = lit ? '#464b5c' : '#0e1016'
  const floor = lit ? '#5a4636' : '#12100e'

  return (
    <group onClick={onBackdropClick}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={floor} roughness={0.92} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 2.2, -3]} receiveShadow>
        <planeGeometry args={[14, 5]} />
        <meshStandardMaterial color={wall} roughness={1} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-4.6, 2.2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color={wall} roughness={1} />
      </mesh>
      <mesh position={[4.6, 2.2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color={wall} roughness={1} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, CEILING_Y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={lit ? '#23252e' : '#0a0c11'} roughness={1} />
      </mesh>

      {/* A poster, because the room should say something about its occupant */}
      <Poster lit={lit} />
    </group>
  )
}

/** Drop-in artwork. Missing is fine — see public/README.txt. */
const POSTER_SRC = `${import.meta.env.BASE_URL}poster.jpg`
/** The space on the wall the picture is fitted into, whatever shape it is. */
const POSTER_MAX_W = 0.95
const POSTER_MAX_H = 1.25

/**
 * The framed picture on the right of the back wall — above the certificates,
 * and in shot from the desk as well as the doorway.
 *
 * It shows public/poster.png if that file is there. If it isn't, the frame
 * comes off and you get the plain tinted sheet the room used to have, so
 * nothing here depends on an asset being present.
 */
function Poster({ lit }: { lit: boolean }) {
  const [art, setArt] = useState<THREE.Texture | null>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)

  useEffect(() => {
    let live = true
    const tex = new THREE.TextureLoader().load(
      POSTER_SRC,
      (t) => {
        if (!live) return
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 8
        setArt(t)
      },
      undefined,
      // No file, no picture. The fallback sheet stands in.
      () => {},
    )
    return () => {
      live = false
      tex.dispose()
    }
  }, [])

  // The material's very first compile can happen before the texture is
  // ready (the room takes a few seconds to settle, but a cached image can
  // resolve sooner than that). Assigning `map` afterwards doesn't by itself
  // force the shader to recompile with sampling enabled — without this the
  // plane keeps using its no-map program and just shows flat `color`.
  useEffect(() => {
    if (mat.current) mat.current.needsUpdate = true
  }, [art])

  // Letterbox the image into the wall space rather than stretching it, so a
  // landscape picture doesn't come out squashed into a portrait frame.
  const [w, h] = useMemo<[number, number]>(() => {
    const img = art?.image as { width?: number; height?: number } | undefined
    if (!img?.width || !img.height) return [POSTER_MAX_W, POSTER_MAX_H]
    const aspect = img.width / img.height
    return aspect > POSTER_MAX_W / POSTER_MAX_H
      ? [POSTER_MAX_W, POSTER_MAX_W / aspect]
      : [POSTER_MAX_H * aspect, POSTER_MAX_H]
  }, [art])

  return (
    <group position={[2.5, 2.66, -2.96]}>
      {art && (
        <mesh position={[0, 0, -0.012]} castShadow>
          <boxGeometry args={[w + 0.06, h + 0.06, 0.022]} />
          <meshStandardMaterial color="#15171d" roughness={0.55} metalness={0.2} />
        </mesh>
      )}
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          ref={mat}
          map={art ?? undefined}
          // With a picture the lighting does the darkening; without one the
          // sheet has to be tinted by hand.
          color={art ? '#ffffff' : lit ? '#31405c' : '#14181f'}
          roughness={0.9}
        />
      </mesh>
    </group>
  )
}

/**
 * The window, on the back wall where it can be seen, with blinds you can raise.
 * Closing them is the difference between a room lit by the night and a room lit
 * only by whatever is on the desk.
 */
function WallWindow({ open }: { open: boolean }) {
  const toggle = useSystem((s) => s.toggleBlinds)
  const slats = useRef<THREE.Group>(null)
  const t = useSpring(open ? 1 : 0, 3.4)

  const stars = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        x: (Math.sin(i * 12.9898) * 43758.5453) % 1,
        y: (Math.sin(i * 78.233) * 12345.6789) % 1,
        s: 0.006 + (i % 4) * 0.0025,
      })),
    [],
  )

  useFrame(() => {
    if (!slats.current) return
    slats.current.children.forEach((slat, i) => {
      // Open: the stack gathers at the top. Closed: it fills the frame.
      const spread = 0.7 - i * 0.155
      slat.position.y = THREE.MathUtils.lerp(spread, 0.68 - i * 0.012, t.current)
      slat.rotation.x = THREE.MathUtils.lerp(0, -1.3, t.current)
    })
  })

  return (
    <group position={[-2.4, 2.15, -2.965]}>
      {/* Night beyond the glass */}
      <mesh>
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial color="#0d1730" emissive="#1b3059" emissiveIntensity={0.85} roughness={1} />
      </mesh>
      {stars.map((s, i) => (
        <mesh key={i} position={[(s.x - 0.5) * 1.9, (s.y - 0.5) * 1.4, 0.004]}>
          <circleGeometry args={[s.s, 8]} />
          <meshBasicMaterial color="#dce8ff" transparent opacity={0.85} />
        </mesh>
      ))}

      <Hoverable onClick={toggle} label={open ? 'Close the blinds' : 'Open the blinds'} anchor={[0, 0.98, 0.1]}>
        {/* Hit area covering the whole frame */}
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[2.05, 1.55]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        <group ref={slats} position={[0, 0, 0.03]}>
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={i}>
              <boxGeometry args={[1.9, 0.15, 0.012]} />
              <meshStandardMaterial color="#cfd3da" roughness={0.85} />
            </mesh>
          ))}
        </group>
      </Hoverable>

      {/* Frame */}
      {[
        [0, 0.77, 2.1, 0.07],
        [0, -0.77, 2.1, 0.07],
        [-1.02, 0, 0.07, 1.6],
        [1.02, 0, 0.07, 1.6],
        [0, 0, 0.04, 1.5],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.06]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial color="#1b1d24" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * The desk. Wide enough for three displays on arms, on a sit-stand frame —
 * which is what this equipment would actually be sitting on.
 */
function Desk({ onBackdropClick }: { onBackdropClick: () => void }) {
  return (
    <group position={[0, 0, -0.9]} onClick={onBackdropClick}>
      {/* Top, with a thin edge band so it doesn't read as a solid slab */}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.042, 1.15]} />
        <meshStandardMaterial color="#8a6644" roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.716, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.37, 0.01, 1.13]} />
        <meshStandardMaterial color="#6d5036" roughness={0.7} />
      </mesh>

      {/* Sit-stand frame: T-feet, uprights and the crossbeam between them */}
      {[-1.44, 1.44].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.03, 0]} castShadow receiveShadow material={FRAME_MAT}>
            <boxGeometry args={[0.07, 0.05, 0.66]} />
          </mesh>
          {/* Two-stage column */}
          <mesh position={[0, 0.36, 0]} castShadow material={FRAME_MAT}>
            <boxGeometry args={[0.085, 0.64, 0.085]} />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow material={FRAME_MAT}>
            <boxGeometry args={[0.068, 0.4, 0.068]} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow material={FRAME_MAT}>
            <boxGeometry args={[0.14, 0.03, 0.5]} />
          </mesh>
          {/* Levelling feet */}
          {[-0.28, 0.28].map((z) => (
            <mesh key={z} position={[0, 0.008, z]} material={M.rubber}>
              <cylinderGeometry args={[0.018, 0.02, 0.016, 12]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.6, -0.02]} castShadow material={FRAME_MAT}>
        <boxGeometry args={[2.8, 0.05, 0.05]} />
      </mesh>
      {/* Height controller under the front edge */}
      <group position={[-0.9, 0.695, 0.55]}>
        <mesh castShadow material={FRAME_MAT}>
          <boxGeometry args={[0.13, 0.026, 0.05]} />
        </mesh>
        <mesh position={[0, -0.002, 0.026]}>
          <planeGeometry args={[0.05, 0.014]} />
          <meshStandardMaterial color="#0b1016" emissive="#3f6f8f" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

const FRAME_MAT = new THREE.MeshStandardMaterial({ color: '#33363d', roughness: 0.44, metalness: 0.55 })

/**
 * The monitor, and the session running on it.
 *
 * The panel is a hole in the geometry: the DOM sits exactly where the glass
 * would be, at exactly the panel's size, so windows, the dock and the terminal
 * are objects in the room rather than a picture of one.
 */
function Monitor({ on, active, atScreen, accent, mountPanel, onScreenClick }: {
  on: boolean
  /** The DOM is live — the camera has arrived and stopped. */
  active: boolean
  /** The camera is on its way to, or already at, the panel. */
  atScreen: boolean
  accent: string
  /**
   * Whether the session's DOM is in the tree at all. A drei `Html` in transform
   * mode is not depth-tested — from the corridor it would hang in the doorway
   * as a dark rectangle over the door — so the panel waits until the visitor is
   * through it.
   */
  mountPanel: boolean
  onScreenClick: () => void
}) {
  const glow = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    if (!glow.current) return
    // A screen is never perfectly steady — a subtle breathe sells it.
    glow.current.emissiveIntensity = on ? 0.5 + Math.sin(clock.elapsedTime * 2.1) * 0.05 : 0
  })

  return (
    <group position={MONITOR_AT.toArray()}>
      {/* Mounted on an arm rather than a stand, like the two beside it. The
          desk surface underneath stays clear, which is the whole point of
          them. */}
      <MonitorArm reach={0.44} baseY={MONITOR_AT.y} baseZ={MONITOR_AT.z} />

      {/* Bezel. Clicking it sits you down at the machine, or gets you back up —
          but never mid-journey, or an impatient click would bounce you back. */}
      <mesh
        position={[0, PANEL_LOCAL.y, 0]}
        castShadow
        onClick={(e: ThreeEvent<MouseEvent>) => {
        // While exploring, a click is "capture the pointer" — not "press the
        // thing under the crosshair". Stations are used with E instead.
        if (useSystem.getState().view === 'explore') return
          e.stopPropagation()
          if (!atScreen || active) onScreenClick()
        }}
        onPointerOver={() => {
          if (!atScreen) document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <boxGeometry args={[PANEL_W + 0.055, PANEL_H + 0.09, 0.045]} />
        <meshStandardMaterial color="#111318" roughness={0.45} />
      </mesh>

      {/* The panel itself — dark glass the session is drawn onto */}
      <mesh position={[0, PANEL_LOCAL.y, PANEL_LOCAL.z - 0.004]}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshStandardMaterial
          ref={glow}
          color="#05060a"
          emissive={on ? accent : '#000000'}
          emissiveIntensity={0}
          roughness={0.25}
        />
      </mesh>

      {mountPanel && (
        <Html
          transform
          position={PANEL_LOCAL.toArray()}
          distanceFactor={PIXEL_FACTOR}
          zIndexRange={[30, 0]}
          pointerEvents={active ? 'auto' : 'none'}
          style={{ width: SCREEN_W, height: SCREEN_H }}
        >
          <ScreenSurface mode="panel" />
        </Html>
      )}

      {/* Power LED */}
      <mesh position={[0.6, PANEL_LOCAL.y - PANEL_H / 2 - 0.03, 0.03]}>
        <circleGeometry args={[0.008, 12]} />
        <meshStandardMaterial
          color={on ? '#4ade80' : '#3a1010'}
          emissive={on ? '#4ade80' : '#220505'}
          emissiveIntensity={on ? 1.4 : 0.4}
        />
      </mesh>

      {/* Light spill onto the desk once the panel is live */}
      {on && <pointLight position={[0, 0.5, 0.55]} intensity={2.6} distance={3.2} color={accent} />}
    </group>
  )
}

function Keyboard({ rgb }: { rgb: boolean }) {
  const toggleRgb = useSystem((s) => s.toggleKeyboardRgb)
  const mat = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    if (!mat.current) return
    if (!rgb) {
      mat.current.emissiveIntensity = 0
      return
    }
    // Slow hue cycle across the underglow.
    const hue = (clock.elapsedTime * 0.07) % 1
    mat.current.emissive.setHSL(hue, 0.85, 0.55)
    mat.current.emissiveIntensity = 1.6
  })

  return (
    <Hoverable onClick={toggleRgb} label={rgb ? 'Turn RGB off' : 'Turn RGB on'} anchor={[-0.16, 0.95, -0.62]}>
      <group position={[0, 0.775, -0.62]}>
        {/* Mousepad under everything */}
        <mesh position={[0.16, -0.0015, 0.02]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.5, 0.54]} />
          <meshStandardMaterial color="#15171d" roughness={0.95} />
        </mesh>

        {/* Body */}
        <mesh position={[-0.16, 0.012, 0]} castShadow>
          <boxGeometry args={[0.86, 0.024, 0.3]} />
          <meshStandardMaterial color="#22242b" roughness={0.6} />
        </mesh>

        {/* Underglow */}
        <mesh position={[-0.16, 0.001, 0]}>
          <boxGeometry args={[0.88, 0.006, 0.32]} />
          <meshStandardMaterial ref={mat} color="#101218" emissive="#000000" emissiveIntensity={0} toneMapped={false} />
        </mesh>

        {/* Keycaps — five rows of little boxes reads as a keyboard at this scale */}
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 14 }).map((__, col) => (
            <mesh key={`${row}-${col}`} position={[-0.55 + col * 0.058, 0.028, -0.108 + row * 0.052]}>
              <boxGeometry args={[0.048, 0.008, 0.042]} />
              <meshStandardMaterial color="#2f323b" roughness={0.75} />
            </mesh>
          )),
        )}
      </group>
    </Hoverable>
  )
}

/** Top of the mousepad — everything on the right of the desk rests here. */
const PAD_Y = 0.7745
/**
 * Where the mouse is allowed to end up: the clear right-hand part of the pad,
 * inset far enough that neither the drag nor the idle drift can walk it off
 * the edge or into the keyboard.
 */
const PAD_MIN_X = 0.4
const PAD_MAX_X = 0.8
const PAD_MIN_Z = -0.75
const PAD_MAX_Z = -0.37

/**
 * The mouse. Drag it anywhere on the pad; let go and it stays where you put it,
 * drifting slightly with the real cursor from there.
 */
function Mouse() {
  const ref = useRef<THREE.Group>(null)
  const { camera, gl } = useThree()
  const [dragging, setDragging] = useState(false)
  /** Where it rests, as (x, z). Dragging is just moving this. */
  const home = useRef(new THREE.Vector2(0.62, -0.6))

  // Scratch objects — a drag runs every pointermove, so nothing is allocated
  // per event.
  const cast = useMemo(
    () => ({
      plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -PAD_Y),
      ray: new THREE.Raycaster(),
      ndc: new THREE.Vector2(),
      hit: new THREE.Vector3(),
    }),
    [],
  )

  useEffect(() => {
    if (!dragging) return
    const el = gl.domElement

    // Listening on the window rather than the mesh: the mouse is a small
    // target and the pointer runs ahead of it, so object-level moves would
    // drop out the moment the drag got going.
    function move(e: PointerEvent) {
      const r = el.getBoundingClientRect()
      cast.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      cast.ray.setFromCamera(cast.ndc, camera)
      // Where the pointer meets the surface of the pad.
      if (!cast.ray.ray.intersectPlane(cast.plane, cast.hit)) return
      home.current.set(
        THREE.MathUtils.clamp(cast.hit.x, PAD_MIN_X, PAD_MAX_X),
        THREE.MathUtils.clamp(cast.hit.z, PAD_MIN_Z, PAD_MAX_Z),
      )
      document.body.style.cursor = 'grabbing'
    }

    function up() {
      setDragging(false)
      document.body.style.cursor = 'auto'
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [dragging, camera, gl, cast])

  useFrame(({ pointer }) => {
    if (!ref.current) return
    // Under the hand it goes exactly where you point, and snappily. Left
    // alone it drifts around its resting place with the real cursor.
    const tx = dragging ? home.current.x : home.current.x + pointer.x * 0.05
    const tz = dragging ? home.current.y : home.current.y + pointer.y * -0.03
    const ease = dragging ? 0.35 : 0.06
    ref.current.position.x += (tx - ref.current.position.x) * ease
    ref.current.position.z += (tz - ref.current.position.z) * ease
  })

  return (
    // The moving group is the outer one, so the tooltip travels with the mouse
    // instead of sitting at the origin.
    <group
      ref={ref}
      position={[0.62, PAD_Y, -0.6]}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        setDragging(true)
        document.body.style.cursor = 'grabbing'
      }}
    >
      <Hoverable label="Drag it around the pad" anchor={[0, 0.17, 0]} cursor="grab">
        {/* Shell: a flattened dome, longer than it is wide. Only the top half
            of the sphere, so it sits flush on the pad instead of half-buried. */}
        <mesh position={[0, 0.008, 0]} scale={[0.055, 0.034, 0.088]} castShadow>
          <sphereGeometry args={[1, 26, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#26282f" roughness={0.42} side={THREE.DoubleSide} />
        </mesh>

        {/* The body it rests on — closes off the open dome and gives the
            shadow something to come from. */}
        <mesh position={[0, 0.004, 0]} scale={[0.055, 1, 0.088]}>
          <cylinderGeometry args={[1, 0.94, 0.008, 26]} />
          <meshStandardMaterial color="#15171c" roughness={0.8} />
        </mesh>

        {/* Scroll wheel, standing just proud of the shell — at this scale it is
            the one detail that says "mouse" rather than "pebble". */}
        <mesh position={[0, 0.036, -0.03]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.0105, 0.0105, 0.009, 14]} />
          <meshStandardMaterial color="#0f1116" roughness={0.65} />
        </mesh>
      </Hoverable>
    </group>
  )
}

function PCTower({ on, lit }: { on: boolean; lit: boolean }) {
  const press = useSystem((s) => s.pressPowerButton)
  const mains = useSystem((s) => s.mainsOn)
  const fanA = useRef<THREE.Mesh>(null)
  const fanB = useRef<THREE.Mesh>(null)
  const gpu = useRef<THREE.MeshStandardMaterial>(null)
  const halo = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }, delta) => {
    if (on) {
      if (fanA.current) fanA.current.rotation.z += delta * 9
      if (fanB.current) fanB.current.rotation.z += delta * 7.4
    }
    if (gpu.current) {
      gpu.current.emissiveIntensity = on ? 1.2 + Math.sin(clock.elapsedTime * 1.6) * 0.4 : 0
    }
    if (halo.current) {
      halo.current.opacity = 0.35 + Math.sin(clock.elapsedTime * 2.6) * 0.28
    }
  })

  return (
    // On the floor beside the desk, not under it: the case stands 0.84 tall
    // and the desk's underside is at 0.716, so there is no clearance for it.
    <group position={[2.02, 0, -1.62]}>
      {/* Case */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.84, 0.82]} />
        <meshStandardMaterial color="#2b2f39" roughness={0.45} metalness={0.35} />
      </mesh>

      {/* Tempered-glass side panel with the internals glowing behind it */}
      <mesh position={[-0.212, 0.44, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.72, 0.7]} />
        <meshStandardMaterial color="#0b0d12" transparent opacity={0.55} roughness={0.1} metalness={0.2} />
      </mesh>

      {/* GPU RGB bar, visible through the glass */}
      <mesh position={[-0.19, 0.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.5, 0.06]} />
        <meshStandardMaterial ref={gpu} color="#141822" emissive="#7c3aed" emissiveIntensity={0} toneMapped={false} />
      </mesh>

      {/* Front fans */}
      {[
        { ref: fanA, y: 0.62 },
        { ref: fanB, y: 0.3 },
      ].map(({ ref, y }, i) => (
        <group key={i} position={[0, y, 0.412]}>
          <mesh>
            <ringGeometry args={[0.055, 0.088, 24]} />
            <meshStandardMaterial color="#101218" roughness={0.7} />
          </mesh>
          <mesh ref={ref}>
            <boxGeometry args={[0.13, 0.014, 0.006]} />
            <meshStandardMaterial
              color={on ? '#3b82f6' : '#1c1f27'}
              emissive={on ? '#3b82f6' : '#000'}
              emissiveIntensity={on ? 1.4 : 0}
            />
          </mesh>
        </group>
      ))}

      {/* Power button */}
      <Hoverable
        onClick={press}
        disabled={!mains || on}
        anchor={[0, 1.0, 0.45]}
        label={!mains ? 'No power — pull the light cord first' : on ? 'Already running' : 'Press to power on'}
      >
        {/* Generous invisible hit area. Pressing this button is the one thing
            the visitor *must* do, so it forgives an imprecise click. */}
        <mesh position={[0, 0.74, 0.43]}>
          <planeGeometry args={[0.4, 0.3]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        <mesh position={[0, 0.775, 0.415]}>
          <cylinderGeometry args={[0.024, 0.024, 0.012, 20]} />
          <meshStandardMaterial
            color={on ? '#4ade80' : mains ? '#3f4450' : '#24272e'}
            emissive={on ? '#4ade80' : mains ? '#8ea0c0' : '#000'}
            emissiveIntensity={on ? 2.6 : mains ? 0.55 : 0}
            roughness={0.4}
            metalness={0.4}
          />
        </mesh>
        {/* Pulsing halo, facing the camera, so the next step is unmissable */}
        {mains && !on && (
          <mesh position={[0, 0.775, 0.418]}>
            <ringGeometry args={[0.032, 0.062, 28]} />
            <meshBasicMaterial ref={halo} color="#7dd3fc" transparent opacity={0.5} depthWrite={false} />
          </mesh>
        )}
      </Hoverable>

      {/* Cable to the wall socket, so "mains" means something visually */}
      <mesh position={[0.05, 0.02, -0.6]} rotation={[Math.PI / 2, 0, 0.3]}>
        <cylinderGeometry args={[0.008, 0.008, 1.2, 8]} />
        <meshStandardMaterial color={lit ? '#15171c' : '#0a0b0f'} roughness={1} />
      </mesh>
    </group>
  )
}

function DeskLamp({ on }: { on: boolean }) {
  const toggle = useSystem((s) => s.toggleLamp)

  return (
    <Hoverable onClick={toggle} label={on ? 'Turn the lamp off' : 'Turn the lamp on'} anchor={[-0.95, 1.45, -1.15]}>
      <group position={[-0.95, 0.775, -1.15]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.11, 0.02, 20]} />
          <meshStandardMaterial color="#2a2d35" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0.16]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.4, 10]} />
          <meshStandardMaterial color="#2a2d35" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0.09, 0.41, 0]} rotation={[0, 0, -0.5]} castShadow>
          <coneGeometry args={[0.11, 0.15, 20, 1, true]} />
          <meshStandardMaterial
            color="#3b3f49"
            emissive={on ? WARM : '#000'}
            emissiveIntensity={on ? 0.45 : 0}
            side={THREE.DoubleSide}
            roughness={0.6}
          />
        </mesh>
        {on && <pointLight position={[0.14, 0.34, 0]} intensity={3.4} distance={2.4} color={WARM} castShadow />}
      </group>
    </Hoverable>
  )
}

/**
 * The room's main light: a bare bulb on a flex, and the only power control in
 * the room. There is no switch on the wall — the light is worked the way a bare
 * bulb usually is, by the cord hanging off the lampholder, which runs down to a
 * knob at hand height above the floor.
 *
 * While the room is dark that knob is the one thing worth clicking, so it
 * carries a slow glow; lit, the glow goes and the same pull turns everything
 * back off. A pull is an impulse rather than a state: the cord stretches, snaps
 * back, and leaves the pendant swinging for a moment.
 */
function CeilingBulb({ on }: { on: boolean }) {
  const toggle = useSystem((s) => s.toggleMains)
  const swing = useRef<THREE.Group>(null)
  const cord = useRef<THREE.Mesh>(null)
  const knob = useRef<THREE.Group>(null)
  const halo = useRef<THREE.MeshBasicMaterial>(null)
  /** How far the cord is stretched past its rest length, in metres, and how
   *  fast that is changing. A yank sets the velocity; the spring does the rest. */
  const pull = useRef(0)
  const pullV = useRef(0)
  /** What the yank left the pendant swinging with, in radians. */
  const kick = useRef(0)

  // Where the flex meets the lampholder, in the group's local space (origin at
  // the ceiling rose, y running downwards into the room).
  const socketY = -(BULB_DROP - 0.12)
  /** The cord's two ends, in the same local space. */
  const cordTop = socketY - 0.03
  const knobY = CORD_KNOB_Y - CEILING_Y
  const cordLen = cordTop - knobY

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05)

    // Damped spring back to rest: stiff enough that a pull snaps rather than
    // sags, damped enough that it is done bouncing in about a second.
    pullV.current += (-140 * pull.current - 13 * pullV.current) * dt
    pull.current += pullV.current * dt
    kick.current *= 1 - Math.min(1, dt * 1.6)

    if (swing.current) {
      // Barely perceptible drift, so the bulb reads as hanging rather than
      // welded to the ceiling, plus whatever the last pull put into it.
      const t = clock.elapsedTime
      swing.current.rotation.z = Math.sin(t * 0.61) * 0.013 + Math.sin(t * 5.2) * kick.current
      swing.current.rotation.x = Math.sin(t * 0.44 + 1.2) * 0.009
    }
    if (cord.current) {
      // The cord is modelled at its rest length and stretched about its top.
      const len = cordLen + pull.current
      cord.current.scale.y = len / cordLen
      cord.current.position.y = cordTop - len / 2
    }
    if (knob.current) knob.current.position.y = knobY - pull.current
    if (halo.current) {
      halo.current.opacity = on ? 0 : 0.2 + Math.sin(clock.elapsedTime * 2.4) * 0.14
    }
  })

  function yank() {
    pullV.current = 1.15
    kick.current = 0.02
    toggle()
  }

  return (
    <group position={[BULB_AT.x, CEILING_Y, BULB_AT.z]}>
      {/* Ceiling rose */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.07, 0.085, 0.04, 20]} />
        <meshStandardMaterial color="#2b2e37" roughness={0.75} />
      </mesh>

      {/* Everything below the rose swings as one piece. */}
      <group ref={swing}>
        {/* Flex */}
        <mesh position={[0, socketY / 2, 0]}>
          <cylinderGeometry args={[0.008, 0.008, -socketY, 8]} />
          <meshStandardMaterial color="#1b1d23" roughness={0.9} />
        </mesh>

        {/* Lampholder, with the switch body the cord comes out of */}
        <mesh position={[0, socketY, 0]}>
          <cylinderGeometry args={[0.042, 0.036, 0.1, 18]} />
          <meshStandardMaterial color="#33373f" roughness={0.45} metalness={0.55} />
        </mesh>
        {/* The cord guide: the cord leaves the holder sideways, so it hangs
            clear of the glass instead of down through it. */}
        <mesh position={[CORD_X / 2, socketY - 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.011, 0.011, CORD_X, 10]} />
          <meshStandardMaterial color="#33373f" roughness={0.5} metalness={0.5} />
        </mesh>

        {/* Glass. Off, it is a dull grey bulb you can still make out against
            the dark ceiling; on, it is the brightest thing in the room. */}
        <mesh position={[0, -BULB_DROP, 0]}>
          <sphereGeometry args={[0.085, 24, 20]} />
          <meshStandardMaterial
            color={on ? '#fff4dc' : '#8f97a8'}
            emissive={on ? '#ffdfae' : '#000'}
            emissiveIntensity={on ? 2.8 : 0}
            transparent
            opacity={on ? 1 : 0.5}
            roughness={0.15}
            toneMapped={false}
          />
        </mesh>

        {/* Filament, so the bulb isn't a featureless ball when it's off */}
        <mesh position={[0, -BULB_DROP + 0.01, 0]}>
          <boxGeometry args={[0.026, 0.05, 0.004]} />
          <meshStandardMaterial
            color="#4a4436"
            emissive={on ? '#fff1cd' : '#000'}
            emissiveIntensity={on ? 5 : 0}
            toneMapped={false}
          />
        </mesh>

        {/* The pull cord. Everything about the room's power hangs off this. */}
        <Hoverable
          onClick={yank}
          label={on ? 'Pull the cord — lights off' : 'Pull the cord — lights on'}
          anchor={[CORD_X + 0.2, knobY + 0.1, 0]}
        >
          {/* Lit, the cord hangs in the foreground of the desk shot, so it is
              kept thin and unbleached: bright white it read as a scratch on
              the lens rather than as string. */}
          <mesh ref={cord} position={[CORD_X, cordTop - cordLen / 2, 0]}>
            <cylinderGeometry args={[0.0045, 0.0045, cordLen, 6]} />
            <meshStandardMaterial color={on ? '#b3a892' : '#7d7970'} roughness={1} />
          </mesh>

          {/* Wooden acorn on the end, which is the part you actually aim at */}
          <group ref={knob} position={[CORD_X, knobY, 0]}>
            <mesh>
              <cylinderGeometry args={[0.019, 0.026, 0.07, 14]} />
              <meshStandardMaterial color="#a9713f" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.045, 0]}>
              <sphereGeometry args={[0.026, 14, 12]} />
              <meshStandardMaterial color="#a9713f" roughness={0.7} />
            </mesh>
            {/* Attention glow — fades to nothing once the lights are on */}
            <mesh>
              <sphereGeometry args={[0.075, 16, 12]} />
              <meshBasicMaterial ref={halo} color="#9fd4ff" transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>

          {/* A cord is a few millimetres wide: the hit area is not. */}
          <mesh position={[CORD_X, (cordTop + knobY) / 2, 0]} visible={false}>
            <cylinderGeometry args={[0.09, 0.09, cordLen + 0.3, 8]} />
          </mesh>
        </Hoverable>
      </group>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Books — physical shortcuts into the session
// ---------------------------------------------------------------------------

interface BookSpec {
  id: string
  title: string
  colour: string
  app: AppId
  props?: Record<string, unknown>
}

const BOOKS: BookSpec[] = [
  { id: 'about', title: 'About the author', colour: '#7f5af0', app: 'about' },
  { id: 'projects', title: 'Selected work', colour: '#2d7d6a', app: 'projects' },
  { id: 'resume', title: 'Curriculum vitae', colour: '#b5533c', app: 'resume' },
]

function Book({ spec, index, open, pcOn, onClick }: {
  spec: BookSpec
  index: number
  open: boolean
  pcOn: boolean
  onClick: () => void
}) {
  const group = useRef<THREE.Group>(null)
  const cover = useRef<THREE.Group>(null)
  const t = useSpring(open ? 1 : 0, 5)
  const lean = -0.06 - index * 0.015

  useFrame(() => {
    if (!group.current || !cover.current) return
    const k = t.current
    // Out of the row, down onto the desk, and open.
    group.current.position.x = 0.84 + index * 0.078 + k * 0.14
    group.current.position.y = 0.79 + k * 0.005
    group.current.position.z = -1.12 + k * 0.2
    group.current.rotation.z = THREE.MathUtils.lerp(lean, -Math.PI / 2, k)
    group.current.rotation.y = k * 0.35
    cover.current.rotation.z = -k * 2.5
  })

  return (
    <group ref={group}>
      <Hoverable
        onClick={onClick}
        label={open ? 'Close it' : pcOn ? `Open “${spec.title}”` : `${spec.title} — boot the machine to read it`}
        anchor={[0, 0.3, 0]}
      >
        {/* Pages */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.056, 0.2, 0.14]} />
          <meshStandardMaterial color="#e7e2d6" roughness={0.9} />
        </mesh>
        {/* Boards, the front one hinged at the spine */}
        <group ref={cover} position={[-0.028, 0, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.008, 0.206, 0.146]} />
            <meshStandardMaterial color={spec.colour} roughness={0.62} />
          </mesh>
        </group>
        <mesh position={[0.03, 0.1, 0]}>
          <boxGeometry args={[0.008, 0.206, 0.146]} />
          <meshStandardMaterial color={spec.colour} roughness={0.62} />
        </mesh>
        {/* Spine band */}
        <mesh position={[0, 0.1, -0.072]}>
          <boxGeometry args={[0.064, 0.208, 0.006]} />
          <meshStandardMaterial color={spec.colour} roughness={0.55} />
        </mesh>
      </Hoverable>
    </group>
  )
}

function Books({ pcOn, openBook, onOpen }: {
  pcOn: boolean
  openBook: string | null
  onOpen: (spec: BookSpec) => void
}) {
  return (
    <>
      {/* Bookend */}
      <mesh position={[0.79, 0.83, -1.12]} castShadow>
        <boxGeometry args={[0.012, 0.13, 0.15]} />
        <meshStandardMaterial color="#3a3d46" metalness={0.5} roughness={0.4} />
      </mesh>
      {BOOKS.map((spec, i) => (
        <Book
          key={spec.id}
          spec={spec}
          index={i}
          open={openBook === spec.id}
          pcOn={pcOn}
          onClick={() => onOpen(spec)}
        />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// The hi-fi — the same playlist the Music application plays
// ---------------------------------------------------------------------------

function HiFi({ lit }: { lit: boolean }) {
  const playing = useMusic((s) => s.playing)
  const pulse = useMusic((s) => s.pulse)
  const platter = useRef<THREE.Group>(null)
  const arm = useRef<THREE.Group>(null)
  const bars = useRef<THREE.Group>(null)
  const armT = useSpring(playing ? 1 : 0, 3)

  useFrame((_, delta) => {
    if (platter.current && playing) platter.current.rotation.y += delta * 3.5
    if (arm.current) arm.current.rotation.y = THREE.MathUtils.lerp(0.55, -0.05, armT.current)
    if (bars.current) {
      bars.current.children.forEach((bar, i) => {
        // Driven by the synthesiser's own note counter, so the meter is
        // reading the music rather than miming it.
        const target = playing ? 0.25 + (((pulse * 7 + i * 13) % 11) / 11) * 0.75 : 0.05
        bar.scale.y += (target - bar.scale.y) * Math.min(1, delta * 9)
        // Grow from the bottom edge rather than the middle.
        bar.position.y = (bar.scale.y - 1) * 0.05
      })
    }
  })

  function toggle() {
    const sys = useSystem.getState()
    const music = useMusic.getState()
    // Starting a record is an explicit request for sound — the session is
    // muted by default, and staying muted here would just look broken.
    if (!music.playing && sys.muted) sys.setVolume(45)
    music.toggle()
  }

  return (
    <Hoverable
      onClick={toggle}
      label={playing ? 'Stop the record' : 'Play a record'}
      anchor={[-2.2, 1.05, -1.7]}
    >
      <group position={[-2.2, 0, -1.8]}>
        {/* Cabinet */}
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.95, 0.56, 0.44]} />
          <meshStandardMaterial color={lit ? '#6b4b33' : '#241a13'} roughness={0.75} />
        </mesh>

        {/* Level meter on the front */}
        <group ref={bars} position={[0.24, 0.2, 0.223]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[i * 0.05, 0, 0]}>
              <planeGeometry args={[0.03, 0.1]} />
              <meshStandardMaterial
                color="#0f1116"
                emissive={playing ? '#4ade80' : '#1a2a20'}
                emissiveIntensity={playing ? 2 : 0.2}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>

        {/* Turntable */}
        <mesh position={[0, 0.585, 0]} castShadow>
          <boxGeometry args={[0.62, 0.05, 0.42]} />
          <meshStandardMaterial color="#1b1e25" roughness={0.5} metalness={0.3} />
        </mesh>
        <group ref={platter} position={[-0.06, 0.615, 0]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.16, 0.012, 32]} />
            <meshStandardMaterial color="#0c0d11" roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.008, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.004, 24]} />
            <meshStandardMaterial color="#c8503f" roughness={0.6} />
          </mesh>
        </group>
        <group ref={arm} position={[0.22, 0.625, -0.13]}>
          {/* Pivot */}
          <mesh>
            <cylinderGeometry args={[0.022, 0.022, 0.02, 16]} />
            <meshStandardMaterial color="#8f959f" metalness={0.7} roughness={0.35} />
          </mesh>
          {/* Arm, laid along +z by rotating the mesh, not the geometry */}
          <mesh position={[0, 0.006, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.28, 8]} />
            <meshStandardMaterial color="#b9bec8" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>

        {/* Speaker */}
        <mesh position={[0.62, 0.36, 0]} castShadow>
          <boxGeometry args={[0.22, 0.72, 0.24]} />
          <meshStandardMaterial color="#1d1f26" roughness={0.8} />
        </mesh>
      </group>
    </Hoverable>
  )
}

function Mug() {
  const steam = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!steam.current) return
    steam.current.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 0.35 + i * 0.33) % 1
      c.position.y = t * 0.28
      c.scale.setScalar(0.4 + t * 0.9)
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial
      m.opacity = (1 - t) * 0.16
    })
  })

  return (
    <group position={[-0.82, 0.775, -0.55]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.045, 0.038, 0.09, 18]} />
        <meshStandardMaterial color="#c94f4f" roughness={0.55} />
      </mesh>
      {/* The coffee surface itself — the mesh is what rotates flat, not the material. */}
      <mesh position={[0, 0.046, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 18]} />
        <meshStandardMaterial color="#3b2418" roughness={0.3} />
      </mesh>
      <group ref={steam} position={[0, 0.06, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.12} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Plant() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.03
  })

  return (
    // Moved out towards the corner: at its old spot it stood squarely in front
    // of the network rack from the doorway.
    <group position={[3.24, 0, -1.5]}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.32, 16]} />
        <meshStandardMaterial color="#8a5a3c" roughness={0.85} />
      </mesh>
      <group ref={ref} position={[0, 0.32, 0]}>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.1, 0.22, Math.sin(a) * 0.1]} rotation={[0.4, a, 0]} castShadow>
              <coneGeometry args={[0.06, 0.44, 6]} />
              <meshStandardMaterial color="#3f7a4a" roughness={0.85} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

/**
 * The chair rolls up to the desk and back out again. Its back is deliberately
 * low: tucked in, it must not stand in front of the panel, because the panel is
 * a live DOM surface and cannot be drawn behind anything.
 */
function Chair({ inAtDesk }: { inAtDesk: boolean }) {
  const toggle = useSystem((s) => s.toggleChair)
  const group = useRef<THREE.Group>(null)
  const t = useSpring(inAtDesk ? 1 : 0, 3.2)
  const spin = useRef(0)

  useFrame((_, delta) => {
    if (!group.current) return
    const k = t.current
    // Pushed back it has to stay inside the doorway shot, and off the furniture
    // down the left-hand wall. At -1.8/0.9 it was cropped by the left edge and
    // parked squarely in front of the hi-fi; rolling it straight back onto the
    // rug instead keeps the whole chair on screen and that corner readable.
    group.current.position.x = THREE.MathUtils.lerp(-0.7, -0.42, k)
    group.current.position.z = THREE.MathUtils.lerp(0.75, 0.05, k)
    // A shove towards the desk sets it turning, and it settles square.
    spin.current += (THREE.MathUtils.lerp(0.42, 0, k) - spin.current) * Math.min(1, delta * 2.2)
    group.current.rotation.y = spin.current + Math.sin(k * Math.PI) * 0.5
  })

  return (
    <group ref={group} position={[-0.7, 0, 0.75]}>
      <Hoverable onClick={toggle} label={inAtDesk ? 'Push the chair back' : 'Sit down'} anchor={[0, 1.1, 0]}>
        {/* Seat: a dark shell with a lighter cushion, so it isn't a black slab */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.52, 0.06, 0.5]} />
          <meshStandardMaterial color="#1b1d23" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.485, 0]} castShadow>
          <boxGeometry args={[0.46, 0.035, 0.44]} />
          <meshStandardMaterial color="#343842" roughness={0.9} />
        </mesh>

        {/* Low back — deliberately low, so tucked in it never stands in front
            of the panel, which is live DOM and cannot be drawn behind glass. */}
        <group position={[0, 0.72, 0.24]} rotation={[0.2, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.44, 0.05]} />
            <meshStandardMaterial color="#1b1d23" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.02, -0.032]} castShadow>
            <boxGeometry args={[0.42, 0.34, 0.03]} />
            <meshStandardMaterial color="#343842" roughness={0.9} />
          </mesh>
        </group>

        {/* Armrests */}
        {[-0.3, 0.3].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.56, 0.16]} castShadow>
              <boxGeometry args={[0.035, 0.19, 0.035]} />
              <meshStandardMaterial color="#15171c" metalness={0.4} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.66, 0.06]} castShadow>
              <boxGeometry args={[0.06, 0.03, 0.26]} />
              <meshStandardMaterial color="#2a2d35" roughness={0.8} />
            </mesh>
          </group>
        ))}
        {/* Column */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.44, 10]} />
          <meshStandardMaterial color="#15171c" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Base and castors */}
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (i / 5) * Math.PI * 2
          return (
            <group key={i} rotation={[0, a, 0]}>
              <mesh position={[0, 0.06, 0.15]} castShadow>
                <boxGeometry args={[0.05, 0.03, 0.3]} />
                <meshStandardMaterial color="#15171c" metalness={0.4} roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.03, 0.3]}>
                <sphereGeometry args={[0.032, 10, 10]} />
                <meshStandardMaterial color="#0d0f13" roughness={0.6} />
              </mesh>
            </group>
          )
        })}
      </Hoverable>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

/**
 * The room's own environment map.
 *
 * This is what makes the aluminium, steel and screen glass read as those
 * materials instead of as flat grey: a metal surface shows almost nothing but
 * its reflection, so with no environment to sample, high `metalness` renders
 * near-black. Rather than ship an HDRI, the scene renders a handful of emissive
 * planes into a small cube map — the ceiling bulb overhead, the window's cold
 * light to one side, a warm bounce off the floor and a broad fill.
 *
 * `frames={1}` bakes it once. It is re-baked only when the mains are switched,
 * via the key, because that is the only moment the room's light actually
 * changes character.
 */
function RoomEnvironment({ lit }: { lit: boolean }) {
  return (
    <Environment key={lit ? 'lit' : 'dark'} frames={1} resolution={128}>
      {/* Overhead: the bulb, as the dominant source when the mains are on */}
      <Lightformer
        form="circle"
        intensity={lit ? 2.6 : 0.12}
        color="#ffe6c4"
        position={[0, 4, -1]}
        scale={[3, 3, 1]}
        target={[0, 0, 0]}
      />
      {/* The window, always cold and always there */}
      <Lightformer
        form="rect"
        intensity={lit ? 0.7 : 1.5}
        color="#89b4ff"
        position={[-4, 2.2, -2]}
        scale={[3, 2, 1]}
        target={[0, 1, -1]}
      />
      {/* Warm bounce up off the floor, which stops undersides going dead */}
      <Lightformer
        form="rect"
        intensity={lit ? 0.5 : 0.08}
        color="#c98f5a"
        position={[0, -1, 0]}
        scale={[6, 6, 1]}
        target={[0, 1, 0]}
      />
      {/* Broad fill from the camera's side, so front faces have something to
          reflect other than the dark of the room behind the viewer */}
      <Lightformer
        form="rect"
        intensity={lit ? 0.45 : 0.14}
        color="#b9c6e8"
        position={[1.5, 2, 5]}
        scale={[6, 4, 1]}
        target={[0, 1, -1]}
      />
    </Environment>
  )
}

function Scene({ settled, onSettle, onUnlock }: {
  settled: boolean
  onSettle: (settled: boolean) => void
  onUnlock: () => void
}) {
  const { mainsOn, pcOn, deskLampOn, keyboardRgb, blindsOpen, chairIn, openBook, view, entry } = useSystem()
  const setView = useSystem((s) => s.setView)
  const setOpenBook = useSystem((s) => s.setOpenBook)
  const accent = useAccent()

  // The door's moving parts and the camera read the same numbers, and neither
  // of them is worth a render sixty times a second.
  const tl = useRef<DoorTimeline>({ swing: entry === 'inside' ? 1 : 0, bolt: 0, glow: 1, t: -1 }).current
  const inside = entry === 'inside'

  function backdrop() {
    // Clicking the room while you're sat at the machine gets you up again.
    if (inside && view === 'screen' && settled) setView('desk')
  }

  /**
   * Using a station. The application opens first and the camera moves second,
   * so the visitor arrives at a screen that is already showing the thing they
   * walked over to look at — rather than watching it load once they get there.
   *
   * The main workstation has no application of its own: it *is* the machine,
   * so using it simply sits the visitor down in front of the whole desktop.
   */
  function onStationInteract(stationId: string) {
    const st = stationById.get(stationId)
    if (!st) return
    if (st.app) launchApp(st.app, st.props)
    setView('screen')
  }

  function openBookSpec(spec: BookSpec) {
    const closing = openBook === spec.id
    setOpenBook(spec.id)
    if (closing || !pcOn) return
    // A book is a physical shortcut: it opens the application that holds the
    // same material, and puts you in front of the screen to read it.
    setTimeout(() => {
      launchApp(spec.app, spec.props)
      setView('screen')
    }, 520)
  }

  const moon = blindsOpen ? 1 : 0.22

  return (
    <>
      {/* One of these owns `camera.position`, never both: the rig is unmounted
          for as long as the visitor is walking around. */}
      {inside && view === 'explore' ? (
        <PlayerController onInteract={onStationInteract} />
      ) : (
        <CameraRig view={view} entry={entry} tl={tl} onSettle={onSettle} />
      )}

      {/* The corridor, the door and the reader that opens it. All of it lives
          behind the camera once you are inside. */}
      <Entrance state={entry} tl={tl} onUnlock={onUnlock} />

      {/* Before the mains go on the room is lit only by the window — dim, but
          bright enough that every shape (and the pull cord) is still findable. */}
      <ambientLight intensity={mainsOn ? 0.95 : 0.3 + moon * 0.06} color={mainsOn ? '#cdd6f4' : COOL} />
      <hemisphereLight intensity={mainsOn ? 0.7 : 0.26} color="#cfd8ff" groundColor="#4a3524" />
      {mainsOn && (
        <>
          {/* Cast from the bulb itself, so the desk's shadows point away from
              the thing you can see glowing. A spot rather than a shadowed
              point light: one shadow map instead of a cube of six. */}
          <spotLight
            position={BULB_AT.toArray()}
            angle={1.2}
            penumbra={0.9}
            intensity={17}
            distance={13}
            color="#ffe6c4"
            castShadow
            shadow-bias={-0.0012}
            shadow-mapSize={[1024, 1024]}
          />
          {/* A bare bulb throws light everywhere, not just down the cone —
              this picks up the ceiling and the wall behind it. */}
          <pointLight position={BULB_AT.toArray()} intensity={7} distance={11} color="#ffe6c4" />
          {/* Warm fill from in front, so the desk objects aren't lit only from
              directly above (which reads as flat and murky). */}
          <pointLight position={[0.4, 2.1, 1.8]} intensity={13} distance={9} color="#ffd9a8" />
          {/* Grazing fill along the desk, so the gear at both ends is lit
              rather than falling away into the corners. */}
          <pointLight position={[-1.5, 1.55, -0.3]} intensity={3.2} distance={3.4} color="#ffe0b8" />
          <pointLight position={[1.5, 1.55, -0.3]} intensity={3.2} distance={3.4} color="#ffe0b8" />
          {/* Bounce off the back wall to separate it from the furniture. */}
          <pointLight position={[0, 2.4, -2.4]} intensity={6} distance={7} color="#b9c6e8" />
        </>
      )}
      {/* Moonlight through the window — only if the blinds are up. */}
      <directionalLight position={[-3, 3.4, -2]} intensity={(mainsOn ? 0.25 : 1.5) * moon} color={COOL} />
      {!mainsOn && (
        <pointLight position={[-2.4, 2.15, -1.6]} intensity={9 * moon} distance={9} color={COOL} />
      )}
      {/* Cool rim from behind the camera so silhouettes separate from the wall. */}
      {!mainsOn && <directionalLight position={[2.5, 2.2, 4]} intensity={0.55} color="#9fb4e0" />}

      <RoomEnvironment lit={mainsOn} />

      <Room lit={mainsOn} onBackdropClick={backdrop} />
      <CeilingBulb on={mainsOn} />
      <WallWindow open={blindsOpen} />
      <Desk onBackdropClick={backdrop} />
      <Monitor
        on={pcOn}
        active={inside && view === 'screen' && settled}
        atScreen={view === 'screen'}
        accent={accent}
        mountPanel={inside}
        onScreenClick={() => setView(view === 'screen' ? 'desk' : 'screen')}
      />
      {/* The two flanking displays, toed in towards the chair. The centre one
          is the live session; these carry quiet ambient content. */}
      <SideMonitor x={-1.16} yaw={0.36} on={pcOn} variant="code" />
      <SideMonitor x={1.16} yaw={-0.36} on={pcOn} variant="logs" />
      <Webcam y={1.87} z={-1.21} live={pcOn} />

      <Keyboard rgb={keyboardRgb} />
      <Mouse />
      <PCTower on={pcOn} lit={mainsOn} />
      <DeskLamp on={deskLampOn} />
      <Books pcOn={pcOn} openBook={openBook} onOpen={openBookSpec} />
      <HiFi lit={mainsOn} />
      <Mug />
      <Plant />
      <Chair inAtDesk={chairIn} />

      {/*
        Desk gear. The surface runs x -1.7..1.7 by z -1.475..-0.325, and these
        are placed against measured footprints so nothing intersects anything
        else or hangs off an edge. Three regions are already spoken for and
        everything here works around them: the keyboard and mat in the middle
        (x -0.59..0.91), the books by the right-hand bookend (x 0.82..1.20),
        and the three arm clamps along the back edge (x 0 and ±1.16).
      */}
      <StudioMic position={[-1.64, DESK_Y, -1.36]} yaw={-1.15} />
      <DeskSpeaker position={[-1.58, DESK_Y, -1.15]} yaw={0.5} />
      <Toolkit position={[-1.3, DESK_Y, -1.15]} yaw={0.3} />
      <ChargingStation position={[-0.66, DESK_Y, -1.2]} yaw={0.1} live={mainsOn} />
      <LaptopOnStand position={[-1.3, DESK_Y, -0.68]} yaw={0.42} on={pcOn} />
      <StickyNotes position={[-1.46, DESK_Y + 0.001, -0.5]} />
      <Notebook position={[-1.0, DESK_Y, -0.5]} yaw={-0.14} />

      <DeskSpeaker position={[1.58, DESK_Y, -1.15]} yaw={-0.5} />
      <UsbHub position={[1.42, DESK_Y, -1.18]} yaw={-0.22} live={mainsOn} />
      <Breadboard position={[1.28, DESK_Y, -0.98]} yaw={-0.18} />
      <Multimeter position={[1.55, DESK_Y, -0.95]} yaw={-0.42} live={mainsOn} />
      <ExternalSsd position={[1.05, DESK_Y, -0.93]} yaw={0.34} />
      <UsbDrives position={[1.18, DESK_Y, -0.82]} />
      <HeadphoneStand position={[1.44, DESK_Y, -0.66]} yaw={-0.35} />
      <PhoneOnStand position={[1.12, DESK_Y, -0.58]} yaw={-0.3} />
      <WaterBottle position={[1.62, DESK_Y, -0.52]} />

      <CableTray live={mainsOn} />

      {/* The network corner */}
      <ServerRack live={mainsOn} />
      <RaspberryPi position={[2.3, 0.655, -2.62]} live={mainsOn} />

      {/* Storage and shelving. The cabinet used to stand square in front of the
          hi-fi and hide it outright. It now sits behind the deck against the
          back wall, where it is taller than the deck and so still reads — and
          the book stack on its lid clears the deck entirely. */}
      <Bookshelf position={[-3.62, 0, -2.44]} yaw={0.32} />
      <StorageCabinet position={[-2.5, 0, -2.4]} yaw={0.22} />
      <BookStack position={[-2.52, 0.636, -2.36]} />
      <FloorMat position={[0, 0.002, 0.15]} />

      {/* The walls. Laid out around the window on the left and the poster on
          the right, with the eye-level strip left clear for the displays.
          Read left to right the occupied bands are:

            window       -3.43 .. -1.38
            whiteboard   -1.13 ..  0.43
            (bulb flex)   0.43 ..  1.21   ← deliberately empty
            task board    1.21 ..  1.90
            poster        2.03 ..  2.98   (certificates below it)
            diagram       3.28 ..  3.93   (shelves below it)

          Nothing shares a band with anything else, and the two gaps carry the
          pendant and the doorway sightline. */}
      <Whiteboard x={-0.35} y={2.95} />
      <TaskBoard x={1.55} y={2.55} />
      <Certificates x={2.55} y={1.74} />
      {/* The network diagram belongs over the rack it describes. */}
      <TopologyDiagram x={3.6} y={2.9} />
      <FloatingShelves x={3.62} y={1.72} />

      <ContactShadows position={[0, 0.001, -0.6]} opacity={mainsOn ? 0.5 : 0.25} scale={9} blur={2.4} far={3} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Wrapper with the HUD
// ---------------------------------------------------------------------------

/** The HUD floats over whatever the camera happens to be pointing at — a lit
 *  whiteboard, a window, the pale desktop. A plain shadow is what keeps it
 *  legible against all of them without putting a panel over the room. */
const HUD_SHADOW = '0 1px 2px rgba(0,0,0,.85), 0 0 14px rgba(0,0,0,.55)'

export default function Room3D() {
  const { mainsOn, pcOn, view, phase, entry } = useSystem()
  const setView = useSystem((s) => s.setView)
  const skipIntro = useSystem((s) => s.skipIntro)
  const unlockDoor = useSystem((s) => s.unlockDoor)
  const update = useSystem((s) => s.update)
  const sounds = useSystem((s) => s.settings.sounds)
  const [settled, setSettled] = useState(false)

  const inside = entry === 'inside'

  // Settings → Interface sounds is the master switch for the door and the room
  // tone. Turning it off takes the ambience away with it.
  useEffect(() => {
    entryAudio.enabled = sounds
    if (!sounds) entryAudio.ambience(false)
    else if (entry === 'inside') entryAudio.ambience(true)
  }, [sounds, entry])

  /**
   * Badging in. The audio context is built inside this click, which is the
   * only place the browser will let us open one without complaint.
   */
  function unlock() {
    entryAudio.unlock()
    unlockDoor()
    // The room's own noise arrives with the door, not before it.
    window.setTimeout(() => entryAudio.ambience(true), 1100)
  }

  useEffect(() => {
    if (view !== 'explore') return
    setSettled(false)
    setScreenActive(false)
  }, [view])

  // The session only becomes usable once the camera has stopped moving: until
  // then the display is a picture of a screen, not a screen.
  function onSettle(next: boolean) {
    setSettled(next)
    setScreenActive(next)
    measureScreen()
  }

  const hint = useMemo(() => {
    if (entry === 'door') return 'Present a credential at the reader beside the door.'
    if (entry === 'unlocking') return 'Access granted.'
    if (!mainsOn) return 'The room is dark. Pull the cord hanging from the bulb.'
    if (!pcOn) return 'Power is on. Now press the button on the front of the tower.'
    if (view !== 'screen') return 'Click the monitor to sit back down at the machine.'
    return null
  }, [entry, mainsOn, pcOn, view])

  const atScreen = inside && view === 'screen'
  const exploring = inside && view === 'explore'

  return (
    <div className="absolute inset-0" style={{ background: '#05070a' }}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0.2, 1.52, 4.15], fov: 46, near: 0.05, far: 60 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
        }}
      >
        <Suspense fallback={null}>
          <Scene settled={settled} onSettle={onSettle} onUnlock={unlock} />
        </Suspense>
      </Canvas>

      {/* HUD. Sits above the session, which drei parks in the canvas's own
          stacking context with a much lower z-index.

          Out in the corridor the top of the frame belongs to the lit sign over
          the door, so the caption moves down to the corner and leaves it. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-50 p-6 transition-opacity duration-500"
        style={{ opacity: atScreen || exploring || !inside ? 0 : 1 }}
      >
        <div className="text-center">
          <div
            className="text-[11px] font-semibold tracking-[0.22em] uppercase"
            style={{ color: 'rgba(190,205,230,.55)', textShadow: HUD_SHADOW }}
          >
            {owner.workspaceName}
          </div>
          {hint && (
            <div className="mt-2 text-[13.5px]" style={{ color: 'rgba(220,232,250,.9)', textShadow: HUD_SHADOW }}>
              {hint}
            </div>
          )}
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex items-end justify-between gap-4 p-5"
        style={{ display: exploring ? 'none' : undefined }}
      >
        <div
          className="text-[11px] leading-relaxed transition-opacity duration-500"
          style={{ color: 'rgba(184,198,220,.62)', textShadow: HUD_SHADOW, opacity: atScreen ? 0 : 1 }}
        >
          {inside ? (
            <>
              Click the bulb's cord, the tower, the lamp, the keyboard, the chair.
              <br />
              The books on the desk open the same material as the applications.
              <br />
              The record player and the Music app share a playlist.
            </>
          ) : (
            <>
              <span className="text-[13px]" style={{ color: 'rgba(220,232,250,.9)' }}>
                {hint}
              </span>
            </>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {inside && view !== 'room' && (
            <HudButton
              onClick={() => setView(view === 'screen' ? 'desk' : 'room')}
              title={view === 'screen' ? 'Get up from the desk' : 'Back to the doorway'}
            >
              ← Step back
            </HudButton>
          )}
          {/* Nothing in the corridor but the reader: the scan is the way in, so
              the HUD out here stays empty rather than offering a way around it. */}
          {inside && (
            <HudButton
              onClick={() => setView('explore')}
              title="Get up and walk around the room (WASD)"
            >
              Walk around ⤳
            </HudButton>
          )}
          {inside && (
            <HudButton onClick={() => update('display', 'fullscreen')} title="Fill the browser with the session">
              Pop out display ⤢
            </HudButton>
          )}
          {/* Only before the machine is running: every screen after this one
              carries its own skip, inside the display where it belongs. */}
          {inside && phase === 'room' && <HudButton onClick={skipIntro}>Skip intro →</HudButton>}
        </div>
      </div>

      {exploring && (
        <WorldUI
          onInteract={(id) => {
            const st = stationById.get(id)
            if (!st) return
            if (st.app) launchApp(st.app, st.props)
            setView('screen')
          }}
          onExit={() => setView('desk')}
        />
      )}

      {/* While the camera is travelling the DOM is inert; say so rather than
          letting clicks quietly do nothing. */}
      {atScreen && !settled && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-50 text-center">
          <span className="rounded-full px-3 py-1 text-[11px]" style={{ background: 'rgba(8,11,16,.7)', color: 'rgba(200,214,235,.7)' }}>
            sitting down…
          </span>
        </div>
      )}
    </div>
  )
}

function HudButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded-lg px-4 py-2 text-[12px] font-medium transition-colors hover:bg-white/10"
      style={{ color: 'rgba(210,225,245,.8)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.16)' }}
    >
      {children}
    </button>
  )
}
