import { useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { LED_AMBER, LED_GREEN, M, Screw, TECH_CYAN, Vents } from './kit'
import { owner } from '@/data/portfolio'
import type { Entry } from '@/store/system'

/**
 * The way into the room: a service corridor, and the door at the end of it.
 *
 * This is the only part of the scene the visitor meets before the workspace,
 * so it carries the weight of the first impression — a heavy steel leaf in a
 * concrete opening, lit by a couple of recessed fittings, with a card and
 * fingerprint reader on the jamb. It is built from the same primitives and the
 * same shared materials as everything else, so it costs almost nothing and
 * matches the workspace it opens onto.
 *
 * Nothing here touches the workstation. The corridor lives entirely on the far
 * side of z = DOOR_Z, which is behind the camera in every shot inside the room.
 *
 * Everything that moves is driven from one mutable timeline object rather than
 * from React state: a door swinging is thirty frames a second of change, and
 * none of it is worth a render.
 */

// ---------------------------------------------------------------------------
// The opening, in world units. The room's own "just inside the door" shot
// stands at z = 4.15, so the wall goes just behind it and the corridor runs
// away from there.
// ---------------------------------------------------------------------------

/** Corridor face of the wall the door is hung in. */
export const DOOR_Z = 4.86
const WALL_T = 0.24
/** The doorway itself. Wide and tall — this is a lab, things get wheeled in. */
const OPEN_W = 1.26
const OPEN_H = 2.36
/** Corridor: width, length and ceiling. */
const HALL_W = 3.5
const HALL_LEN = 8.4
const HALL_H = 2.86
const HALL_END = DOOR_Z + HALL_LEN

/** How far the leaf swings, in radians: past square, back against the wall. */
const MAX_SWING = 1.72

/**
 * Where the camera stands, and the mark it walks up to.
 *
 * Both are set by what has to be in frame. Far back, the corridor converges on
 * a door small enough to walk towards; at the near mark the doorway and its
 * sign fill three quarters of the frame with the reader beside them, and the
 * floor and ceiling are still in shot so the door reads as part of a building
 * rather than as a picture of a door.
 */
export const HALL_SHOT = {
  far: new THREE.Vector3(0.16, 1.7, DOOR_Z + 6.6),
  near: new THREE.Vector3(0.04, 1.62, DOOR_Z + 4.2),
  look: new THREE.Vector3(0.05, 1.34, DOOR_Z),
}

/** The unlock timeline, in seconds from the credential being accepted. */
export const SWING_START = 0.8
export const SWING_TIME = 2.4

/** Live values every moving part reads. One object, mutated in place. */
export interface DoorTimeline {
  /** 0 shut, 1 back against the inside wall. */
  swing: number
  /** 0 thrown, 1 withdrawn. */
  bolt: number
  /** Frame LED brightness. */
  glow: number
  /** Seconds since the credential was accepted, or -1 while still locked. */
  t: number
}

// ---------------------------------------------------------------------------
// Materials. A corridor is made of four things: concrete, painted steel,
// anodised trim and dirt.
// ---------------------------------------------------------------------------

function std(p: THREE.MeshStandardMaterialParameters) {
  return new THREE.MeshStandardMaterial(p)
}

const MAT = {
  /** Sealed concrete floor, polished enough to carry the LEDs back. */
  floor: std({ color: '#1a1c21', metalness: 0.16, roughness: 0.36, envMapIntensity: 0.9 }),
  /** Board-formed concrete wall. */
  wall: std({ color: '#22252b', metalness: 0.02, roughness: 0.92 }),
  /** The darker recessed strips between wall panels. */
  reveal: std({ color: '#101318', metalness: 0.1, roughness: 0.75 }),
  ceiling: std({ color: '#16181d', metalness: 0.03, roughness: 0.95 }),
  /** Powder-coated steel: frame, skirting, fixtures. */
  frame: std({ color: '#2c3037', metalness: 0.62, roughness: 0.42, envMapIntensity: 1.1 }),
  /** The leaf. Matte, dark, and heavy-looking. */
  leaf: std({ color: '#1c2026', metalness: 0.55, roughness: 0.52, envMapIntensity: 1 }),
  /** Brushed stainless: inset band, kick plate, handles. */
  brushed: std({ color: '#6e747e', metalness: 0.9, roughness: 0.34, envMapIntensity: 1.15 }),
  /** Wired security glass in the vision panel. */
  vision: std({
    color: '#0a1016',
    metalness: 0.2,
    roughness: 0.08,
    envMapIntensity: 1.5,
    transparent: true,
    opacity: 0.86,
  }),
  /** The wire in that glass. Barely lighter than the glass — real wired glass
   *  is a hint of a grid, not a window with bars across it. */
  wire: std({ color: '#39414c', metalness: 0.7, roughness: 0.5 }),
}

// ---------------------------------------------------------------------------
// Signage. The room deliberately spells nothing out — at that distance text is
// noise. A door is the opposite case: you stand a metre from it, and a door
// with no name on it is not a secure door, it is a cupboard.
// ---------------------------------------------------------------------------

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (ctx) draw(ctx)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/**
 * Letter-spaced text, drawn a character at a time so tracking is dependable,
 * and condensed rather than clipped if the line will not fit the sign.
 */
function tracked(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, spacing: number, maxW?: number) {
  const chars = [...text]
  const width = chars.reduce((w, c) => w + ctx.measureText(c).width + spacing, -spacing)
  const squeeze = maxW && width > maxW ? maxW / width : 1

  ctx.save()
  if (squeeze !== 1) {
    ctx.translate(cx, 0)
    ctx.scale(squeeze, 1)
    ctx.translate(-cx, 0)
  }
  let x = cx - width / 2
  for (const c of chars) {
    ctx.fillText(c, x, y)
    x += ctx.measureText(c).width + spacing
  }
  ctx.restore()
}

/** The illuminated sign over the door. */
const overheadSign = () =>
  canvasTexture(1024, 256, (ctx) => {
    ctx.fillStyle = '#05080c'
    ctx.fillRect(0, 0, 1024, 256)
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#cfe9f6'
    ctx.font = '600 88px ui-sans-serif, system-ui, sans-serif'
    tracked(ctx, owner.workspaceName.toUpperCase(), 512, 128, 10, 900)
  })

/** The reader's status display, one texture per state. */
const readerScreen = (label: string, colour: string, sub: string) =>
  canvasTexture(256, 96, (ctx) => {
    ctx.fillStyle = '#04070a'
    ctx.fillRect(0, 0, 256, 96)
    ctx.textBaseline = 'middle'
    ctx.fillStyle = colour
    ctx.font = '700 36px ui-monospace, monospace'
    tracked(ctx, label, 128, 33, 4, 220)
    ctx.globalAlpha = 0.72
    ctx.font = '500 18px ui-monospace, monospace'
    tracked(ctx, sub, 128, 70, 2, 230)
  })

// ---------------------------------------------------------------------------
// Interaction. The room has its own Hoverable; the door needs a slightly
// different one — a forgiving hit area, and a tooltip that hangs clear of the
// reader rather than over it.
// ---------------------------------------------------------------------------

function Touchable({
  children,
  label,
  onClick,
  anchor,
  disabled,
  onHover,
}: {
  children: React.ReactNode
  label?: string
  onClick?: () => void
  anchor: [number, number, number]
  disabled?: boolean
  onHover?: (hovering: boolean) => void
}) {
  const [hover, setHover] = useState(false)

  return (
    <group
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        if (disabled) return
        setHover(true)
        onHover?.(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHover(false)
        onHover?.(false)
        document.body.style.cursor = 'auto'
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        if (!disabled) onClick?.()
      }}
    >
      {children}
      {hover && label && !disabled && (
        <Html center position={anchor} zIndexRange={[24, 0]} style={{ pointerEvents: 'none' }}>
          <div
            className="rounded-md px-2.5 py-1 text-[11px] font-medium whitespace-nowrap"
            style={{
              background: 'rgba(6,10,14,.92)',
              color: '#dbeaf6',
              boxShadow: '0 0 0 1px rgba(120,200,230,.35), 0 0 22px rgba(79,214,232,.18)',
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}

// ---------------------------------------------------------------------------
// The corridor
// ---------------------------------------------------------------------------

/** A recessed linear fitting in the ceiling, and the light under it. */
function CeilingLight({ z, on }: { z: number; on: boolean }) {
  return (
    <group position={[0, HALL_H, z]}>
      {/* Housing, sunk into the slab */}
      <mesh position={[0, 0.03, 0]} material={MAT.frame}>
        <boxGeometry args={[1.5, 0.06, 0.16]} />
      </mesh>
      {/* Diffuser */}
      <mesh position={[0, -0.006, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.42, 0.1]} />
        <meshStandardMaterial
          color="#0e1218"
          emissive="#cfe4ff"
          emissiveIntensity={on ? 2.4 : 0.05}
          toneMapped={false}
        />
      </mesh>
      {/* Two lights rather than one: a fitting a metre and a half long does not
          throw from a single point, and the pair is what puts a soft double
          highlight down the length of the corridor. */}
      {on &&
        [-0.42, 0.42].map((x) => (
          <pointLight key={x} position={[x, -0.14, 0]} intensity={4.2} distance={6.5} color="#c9dcff" />
        ))}
    </group>
  )
}

/** Dust hanging in the light. Seventy points, drifting upwards. */
function Motes() {
  const ref = useRef<THREE.Points>(null)

  const geo = useMemo(() => {
    const n = 70
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      // Seeded rather than random, so the corridor looks the same every visit.
      const r = (k: number) => Math.abs(Math.sin((i + 1) * k) * 43758.5453) % 1
      pos[i * 3] = (r(12.9898) - 0.5) * HALL_W * 0.8
      pos[i * 3 + 1] = 0.4 + r(78.233) * (HALL_H - 0.8)
      pos[i * 3 + 2] = DOOR_Z + 0.4 + r(37.719) * (HALL_LEN - 1)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    const attr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < attr.count; i++) {
      // Each mote rises on its own slow path and wraps at the ceiling.
      attr.setY(i, 0.4 + ((0.05 * t * (1 + (i % 5) * 0.4) + i * 0.29) % (HALL_H - 0.8)))
    }
    attr.needsUpdate = true
  })

  return (
    // Deliberately not raycastable. A Points object tests against a threshold
    // a metre wide, so seventy motes drifting down the corridor would sit in
    // front of everything — including the one thing here worth clicking — and
    // swallow the pointer.
    <points ref={ref} geometry={geo} raycast={() => null}>
      <pointsMaterial size={0.008} color="#cfe0f5" transparent opacity={0.22} depthWrite={false} sizeAttenuation />
    </points>
  )
}

/** Floor, walls, ceiling, and the wall the door is hung in. */
function Corridor({ lit }: { lit: boolean }) {
  const seams = useMemo(() => {
    const out: number[] = []
    for (let z = DOOR_Z + 0.72; z < HALL_END; z += 1.15) out.push(z)
    return out
  }, [])

  /** Centre of each slab of wall either side of the opening. */
  const jamb = (OPEN_W / 2 + 4.6) / 2
  const mid = DOOR_Z + HALL_LEN / 2

  return (
    <group>
      {/* Floor. Sits a hair over the room's own, which reaches this far. */}
      <mesh position={[0, 0.003, mid]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={MAT.floor}>
        <planeGeometry args={[HALL_W, HALL_LEN + 0.2]} />
      </mesh>
      {/* Painted keep-clear line across the approach */}
      <mesh position={[0, 0.005, DOOR_Z + 0.95]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[HALL_W, 0.05]} />
        <meshStandardMaterial color="#6b5a24" roughness={0.9} emissive={LED_AMBER} emissiveIntensity={lit ? 0.14 : 0} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, HALL_H, mid]} rotation={[Math.PI / 2, 0, 0]} material={MAT.ceiling}>
        <planeGeometry args={[HALL_W, HALL_LEN + 0.2]} />
      </mesh>

      {/* Side walls: a seam every panel, a skirting, and the conduit that got
          power down here in the first place. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[(side * HALL_W) / 2, 0, mid]}>
          <mesh rotation={[0, -side * (Math.PI / 2), 0]} receiveShadow material={MAT.wall}>
            <planeGeometry args={[HALL_LEN + 0.2, HALL_H * 2]} />
          </mesh>
          {seams.map((z) => (
            <mesh
              key={z}
              position={[-side * 0.012, HALL_H / 2, z - mid]}
              rotation={[0, -side * (Math.PI / 2), 0]}
              material={MAT.reveal}
            >
              <planeGeometry args={[0.02, HALL_H]} />
            </mesh>
          ))}
          <mesh position={[-side * 0.03, 0.055, 0]} material={MAT.frame}>
            <boxGeometry args={[0.03, 0.11, HALL_LEN]} />
          </mesh>
          <mesh position={[-side * 0.05, 2.34, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.frame}>
            <cylinderGeometry args={[0.026, 0.026, HALL_LEN, 10]} />
          </mesh>
        </group>
      ))}

      {/* The end of the corridor, so it comes from somewhere */}
      <mesh position={[0, HALL_H / 2, HALL_END]} rotation={[0, Math.PI, 0]} material={MAT.wall}>
        <planeGeometry args={[HALL_W, HALL_H]} />
      </mesh>

      {/* The wall the door is hung in: three slabs around the opening, full
          room height, so from inside there is no gap above the header. */}
      <group position={[0, 0, DOOR_Z - WALL_T / 2]}>
        {/* Receiving only: nothing out here casts, and these are the largest
            surfaces in the scene — no reason to run them through the room's
            shadow pass as well. */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * jamb, 2.2, 0]} receiveShadow material={MAT.wall}>
            <boxGeometry args={[4.6 - OPEN_W / 2, 4.4, WALL_T]} />
          </mesh>
        ))}
        <mesh position={[0, (OPEN_H + 4.4) / 2, 0]} receiveShadow material={MAT.wall}>
          <boxGeometry args={[OPEN_W, 4.4 - OPEN_H, WALL_T]} />
        </mesh>
      </group>

      {/* One fitting right over the door — a door nobody can see is not a
          focal point — and two more down the hall to lead the eye to it. */}
      <CeilingLight z={DOOR_Z + 0.62} on={lit} />
      <CeilingLight z={DOOR_Z + 2.9} on={lit} />
      <CeilingLight z={DOOR_Z + 5.2} on={lit} />
      {lit && <Motes />}

      {/* Fill: cold, and low enough that the door's own LEDs still read. */}
      {lit && (
        <>
          <ambientLight intensity={0.34} color="#93b2d8" />
          {/* Bounce off the floor, which is the only bright surface down here */}
          <pointLight position={[0, 0.5, DOOR_Z + 1.6]} intensity={1.6} distance={5} color="#6f8cb4" />
        </>
      )}
    </group>
  )
}

/** The camera watching the corridor, in the corner above the door. */
function Cctv({ live }: { live: boolean }) {
  const body = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    // A slow pan that never quite settles. Somebody is watching the hallway.
    if (body.current) body.current.rotation.y = Math.sin(clock.elapsedTime * 0.18) * 0.22
  })

  return (
    <group position={[HALL_W / 2 - 0.26, HALL_H - 0.24, DOOR_Z + 0.32]}>
      <mesh position={[0, 0.15, 0]} material={MAT.frame}>
        <cylinderGeometry args={[0.014, 0.014, 0.18, 8]} />
      </mesh>
      <group ref={body} rotation={[0, 0.5, 0]}>
        <mesh rotation={[0.42, 0, 0]} material={M.blackMetal}>
          <boxGeometry args={[0.075, 0.075, 0.2]} />
        </mesh>
        <mesh position={[0, -0.05, 0.1]} rotation={[Math.PI / 2 + 0.42, 0, 0]} material={M.glass}>
          <cylinderGeometry args={[0.026, 0.03, 0.05, 14]} />
        </mesh>
        <mesh position={[0.032, -0.022, 0.086]}>
          <circleGeometry args={[0.005, 8]} />
          <meshStandardMaterial
            color={live ? '#e05252' : '#2a1414'}
            emissive={live ? '#e05252' : '#000000'}
            emissiveIntensity={live ? 2.4 : 0}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  )
}

// ---------------------------------------------------------------------------
// The door
// ---------------------------------------------------------------------------

/** The steel surround, the LED channel in the reveal, and the sign above it. */
function DoorFrame({ tl, granted }: { tl: DoorTimeline; granted: boolean }) {
  const sign = useMemo(overheadSign, [])
  const strips = useRef<THREE.MeshStandardMaterial[]>([])
  const wash = useRef<THREE.PointLight>(null)
  const led = granted ? LED_GREEN : TECH_CYAN

  useFrame(() => {
    // Deliberately restrained. These are not tone-mapped, so the number is the
    // brightness on screen — a strip around the reveal should say "this door is
    // powered", not be the brightest thing in the building.
    for (const m of strips.current) if (m) m.emissiveIntensity = tl.glow * 0.42
    if (wash.current) wash.current.intensity = tl.glow * 0.55
  })

  const strip = (i: number) => (m: THREE.MeshStandardMaterial | null) => {
    if (m) strips.current[i] = m
  }

  return (
    <group position={[0, 0, DOOR_Z]}>
      {/* Surround, standing proud of the wall on the corridor side */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (OPEN_W / 2 + 0.045), OPEN_H / 2, -WALL_T / 2]}
          castShadow
          material={MAT.frame}
        >
          <boxGeometry args={[0.09, OPEN_H + 0.09, WALL_T + 0.03]} />
        </mesh>
      ))}
      <mesh position={[0, OPEN_H + 0.045, -WALL_T / 2]} castShadow material={MAT.frame}>
        <boxGeometry args={[OPEN_W + 0.18, 0.09, WALL_T + 0.03]} />
      </mesh>

      {/* Threshold plate — the join in the floor a door like this always has */}
      <mesh position={[0, 0.008, -WALL_T / 2]} material={MAT.brushed}>
        <boxGeometry args={[OPEN_W + 0.09, 0.016, 0.16]} />
      </mesh>

      {/* LED channel, set into the reveal so the light is seen and the diode is
          not. Cool while the door is locked, green once it lets you in. */}
      {[-1, 1].map((side, i) => (
        <mesh key={side} position={[side * (OPEN_W / 2 + 0.008), OPEN_H / 2, 0.014]}>
          <boxGeometry args={[0.012, OPEN_H - 0.06, 0.012]} />
          <meshStandardMaterial ref={strip(i)} color="#0b0f14" emissive={led} emissiveIntensity={0.42} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, OPEN_H - 0.012, 0.014]}>
        <boxGeometry args={[OPEN_W - 0.06, 0.012, 0.012]} />
        <meshStandardMaterial ref={strip(2)} color="#0b0f14" emissive={led} emissiveIntensity={0.42} toneMapped={false} />
      </mesh>
      <pointLight ref={wash} position={[0, OPEN_H - 0.2, 0.34]} intensity={0.55} distance={1.9} color={led} />

      {/* Illuminated sign over the header */}
      <group position={[0, OPEN_H + 0.3, 0.02]}>
        <mesh castShadow material={MAT.frame}>
          <boxGeometry args={[1.34, 0.34, 0.07]} />
        </mesh>
        <mesh position={[0, 0, 0.038]}>
          <planeGeometry args={[1.24, 0.27]} />
          <meshStandardMaterial
            map={sign}
            emissiveMap={sign}
            emissive="#ffffff"
            emissiveIntensity={0.55}
            toneMapped={false}
          />
        </mesh>
        {[-1, 1].map((sx) =>
          [-1, 1].map((sy) => <Screw key={`${sx}${sy}`} position={[sx * 0.62, sy * 0.13, 0.036]} r={0.005} />),
        )}
        <pointLight position={[0, -0.22, 0.34]} intensity={1} distance={1.9} color="#bcdcf0" />
      </group>

      {/* Maglock on the frame; its armature is on the leaf */}
      <group position={[OPEN_W / 2 - 0.26, OPEN_H - 0.035, -0.05]}>
        <mesh material={M.blackMetal}>
          <boxGeometry args={[0.26, 0.05, 0.07]} />
        </mesh>
        <mesh position={[0.1, 0, 0.037]}>
          <circleGeometry args={[0.006, 8]} />
          <meshStandardMaterial
            color={granted ? LED_GREEN : '#e05252'}
            emissive={granted ? LED_GREEN : '#e05252'}
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  )
}

/**
 * The leaf. Hinged on the left as you face it and opening into the room, which
 * is the direction that reveals the workspace rather than backing you down the
 * corridor.
 */
function DoorLeaf({ tl }: { tl: DoorTimeline }) {
  const pivot = useRef<THREE.Group>(null)
  const bolts = useRef<THREE.Mesh[]>([])
  const beyond = useRef<THREE.MeshStandardMaterial>(null)

  const W = OPEN_W - 0.03
  const H = OPEN_H - 0.03
  const T = 0.078

  useFrame(() => {
    if (pivot.current) pivot.current.rotation.y = tl.swing * MAX_SWING
    // Bolts withdraw into the edge before anything moves.
    for (const b of bolts.current) if (b) b.position.x = W / 2 - 0.012 - tl.bolt * 0.034
    // Light from the room, arriving through the glass as the leaf comes off
    // the frame.
    if (beyond.current) beyond.current.emissiveIntensity = 0.12 + tl.swing * 0.55
  })

  const bolt = (i: number) => (m: THREE.Mesh | null) => {
    if (m) bolts.current[i] = m
  }

  return (
    // Hinge line: the left edge of the opening, in the plane of the wall.
    <group ref={pivot} position={[-OPEN_W / 2 + 0.015, 0, DOOR_Z - WALL_T / 2]}>
      <group position={[W / 2, H / 2 + 0.012, 0]}>
        {/* Slab */}
        <mesh castShadow receiveShadow material={MAT.leaf}>
          <boxGeometry args={[W, H, T]} />
        </mesh>
        {/* Recessed inset panel, both faces */}
        {[1, -1].map((f) => (
          <mesh key={f} position={[0, 0.06, f * (T / 2 + 0.002)]} material={MAT.leaf}>
            <boxGeometry args={[W - 0.13, H - 0.36, 0.004]} />
          </mesh>
        ))}
        {/* Brushed band across the middle — the one bright line on a dark door */}
        <mesh position={[0, -0.34, T / 2 + 0.004]} material={MAT.brushed}>
          <boxGeometry args={[W - 0.13, 0.035, 0.006]} />
        </mesh>

        {/* Vision panel: wired security glass, on the handle side */}
        <group position={[0.3, 0.42, 0]}>
          <mesh material={MAT.frame}>
            <boxGeometry args={[0.24, 1.02, T + 0.008]} />
          </mesh>
          {[1, -1].map((f) => (
            <mesh key={f} position={[0, 0, f * (T / 2 + 0.007)]} material={MAT.vision}>
              <boxGeometry args={[0.18, 0.96, 0.004]} />
            </mesh>
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <mesh key={`h${i}`} position={[0, -0.44 + i * 0.088, T / 2 + 0.009]} material={MAT.wire}>
              <boxGeometry args={[0.18, 0.001, 0.001]} />
            </mesh>
          ))}
          {Array.from({ length: 2 }, (_, i) => (
            <mesh key={`v${i}`} position={[-0.03 + i * 0.06, 0, T / 2 + 0.009]} material={MAT.wire}>
              <boxGeometry args={[0.001, 0.96, 0.001]} />
            </mesh>
          ))}
          {/* What is on the other side, seen dimly through the glass */}
          <mesh position={[0, 0, -T / 2 - 0.006]}>
            <planeGeometry args={[0.18, 0.96]} />
            <meshStandardMaterial ref={beyond} color="#0a1220" emissive="#2b5f88" emissiveIntensity={0.12} toneMapped={false} />
          </mesh>
        </group>

        {/* Kick plate, both faces */}
        {[1, -1].map((f) => (
          <mesh key={f} position={[0, -H / 2 + 0.13, f * (T / 2 + 0.003)]} material={MAT.brushed}>
            <boxGeometry args={[W - 0.06, 0.24, 0.005]} />
          </mesh>
        ))}
        {/* Louvre above it: there is a rack in that room, air has to move */}
        <Vents position={[0, -H / 2 + 0.4, T / 2 + 0.004]} count={9} w={0.05} h={0.012} gap={0.024} vertical />

        {/* Pull handle on the corridor side, with real standoffs */}
        <group position={[W / 2 - 0.12, 0.06, T / 2 + 0.055]}>
          {[-0.28, 0.28].map((y) => (
            <mesh key={y} position={[0, y, -0.03]} rotation={[0, Math.PI / 2, 0]} castShadow material={MAT.brushed}>
              <cylinderGeometry args={[0.014, 0.016, 0.06, 12]} />
            </mesh>
          ))}
          <mesh castShadow material={MAT.brushed}>
            <cylinderGeometry args={[0.017, 0.017, 0.66, 16]} />
          </mesh>
        </group>
        {/* And the plain bar on the room side */}
        <mesh position={[W / 2 - 0.12, 0.06, -T / 2 - 0.05]} castShadow material={MAT.brushed}>
          <cylinderGeometry args={[0.016, 0.016, 0.6, 12]} />
        </mesh>

        {/* The armature the maglock holds */}
        <mesh position={[W / 2 - 0.26, H / 2 - 0.025, -0.015]} material={MAT.brushed}>
          <boxGeometry args={[0.24, 0.03, 0.05]} />
        </mesh>

        {/* Deadbolts in the leading edge */}
        {[0.24, -0.16].map((y, i) => (
          <mesh key={y} ref={bolt(i)} position={[W / 2 - 0.012, y, 0]} rotation={[0, 0, Math.PI / 2]} material={MAT.brushed}>
            <cylinderGeometry args={[0.016, 0.016, 0.05, 12]} />
          </mesh>
        ))}
      </group>

      {/* Hinges, on the pivot itself */}
      {[0.34, 1.16, 1.98].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <mesh castShadow material={MAT.frame}>
            <cylinderGeometry args={[0.026, 0.026, 0.14, 12]} />
          </mesh>
          <mesh position={[0, 0.078, 0]} material={MAT.brushed}>
            <cylinderGeometry args={[0.014, 0.014, 0.018, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * The reader on the jamb: fingerprint pad, keypad, card field and a status
 * line. It is the only thing in the corridor that can be clicked, so it is lit,
 * labelled, and given a hit area far larger than the housing.
 */
function AccessPanel({ tl, locked, onUnlock }: { tl: DoorTimeline; locked: boolean; onUnlock: () => void }) {
  const [hover, setHover] = useState(false)
  /** Flips once, a beat after the credential lands. */
  const [reading, setReading] = useState(false)
  const scanBar = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.MeshBasicMaterial>(null)
  const keys = useRef<THREE.MeshStandardMaterial[]>([])
  const lamp = useRef<THREE.PointLight>(null)

  const screens = useMemo(
    () => ({
      locked: readerScreen('LOCKED', '#e05252', 'PRESENT CREDENTIAL'),
      reading: readerScreen('READING', LED_AMBER, 'HOLD STILL'),
      granted: readerScreen('GRANTED', LED_GREEN, 'WELCOME, OPERATOR'),
    }),
    [],
  )

  const phase = locked ? 'locked' : reading ? 'reading' : 'granted'
  const accent = phase === 'locked' ? '#e05252' : phase === 'reading' ? LED_AMBER : LED_GREEN

  useFrame(({ clock }, delta) => {
    // The read takes the first stretch of the timeline; after that the panel
    // has made up its mind.
    const shouldRead = !locked && tl.t >= 0 && tl.t < 0.62
    if (shouldRead !== reading) setReading(shouldRead)

    if (scanBar.current) {
      const sweeping = shouldRead || (locked && hover)
      scanBar.current.position.y = sweeping ? Math.sin(clock.elapsedTime * 6) * 0.045 : -0.052
      ;(scanBar.current.material as THREE.MeshStandardMaterial).emissiveIntensity = sweeping ? 2.8 : 0.45
    }
    if (halo.current) {
      // While the door is shut this is the only thing worth clicking in the
      // whole corridor, so it stays lit. It used to breathe on a sine, which at
      // this contrast read as a fault light rather than an invitation — a ring
      // that simply sits there, and answers the cursor, says "use me" without
      // flashing at anyone. Eased rather than switched, so hover has no step.
      const want = locked ? (hover ? 0.62 : 0.3) : 0
      halo.current.opacity += (want - halo.current.opacity) * Math.min(1, delta * 8)
    }
    // Keys scatter while the credential is checked, and rest afterwards.
    for (let i = 0; i < keys.current.length; i++) {
      const m = keys.current[i]
      if (!m) continue
      const lit = shouldRead && (Math.floor(tl.t * 24) + i * 5) % 7 < 2
      m.emissiveIntensity = lit ? 2 : 0.22
    }
    if (lamp.current) lamp.current.intensity = locked ? 0.22 : 0.6
  })

  const keyRef = (i: number) => (m: THREE.MeshStandardMaterial | null) => {
    if (m) keys.current[i] = m
  }

  return (
    <group position={[OPEN_W / 2 + 0.46, 1.16, DOOR_Z + 0.012]}>
      <Touchable onClick={onUnlock} disabled={!locked} onHover={setHover} anchor={[0, 0.4, 0.14]} label="Scan to enter">
        {/* Hit area: the whole plate and then some */}
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[0.54, 0.74]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Attention ring around the housing. A filled halo reads as a smudge
            on the wall; an outline reads as something asking to be used. */}
        <mesh position={[0, 0, 0.004]}>
          <ringGeometry args={[0.176, 0.184, 44]} />
          <meshBasicMaterial ref={halo} color="#7fd8ea" transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Housing: back box, then a bevelled face */}
        <mesh position={[0, 0, 0.018]} castShadow material={M.blackMetal}>
          <boxGeometry args={[0.25, 0.42, 0.036]} />
        </mesh>
        <mesh position={[0, 0, 0.04]} material={MAT.frame}>
          <boxGeometry args={[0.225, 0.395, 0.012]} />
        </mesh>
        {[-1, 1].map((sx) =>
          [-1, 1].map((sy) => <Screw key={`${sx}${sy}`} position={[sx * 0.098, sy * 0.182, 0.047]} r={0.005} />),
        )}

        {/* Status line */}
        <mesh position={[0, 0.155, 0.047]}>
          <planeGeometry args={[0.185, 0.06]} />
          <meshStandardMaterial
            map={screens[phase]}
            emissiveMap={screens[phase]}
            emissive="#ffffff"
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>

        {/* Fingerprint pad */}
        <group position={[0, 0.055, 0.047]}>
          <mesh material={M.glass}>
            <boxGeometry args={[0.12, 0.135, 0.006]} />
          </mesh>
          {/* Ridges, so it reads as a print reader and not a blank window */}
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i} position={[0, 0, 0.004]}>
              <ringGeometry args={[0.012 + i * 0.008, 0.0145 + i * 0.008, 26, 1, Math.PI * 0.15, Math.PI * 1.7]} />
              <meshStandardMaterial color="#12303a" emissive={accent} emissiveIntensity={0.55} toneMapped={false} />
            </mesh>
          ))}
          <mesh ref={scanBar} position={[0, -0.052, 0.005]}>
            <planeGeometry args={[0.115, 0.006]} />
            <meshStandardMaterial color="#0a1216" emissive={accent} emissiveIntensity={0.45} toneMapped={false} />
          </mesh>
        </group>

        {/* Keypad: twelve keys, faintly backlit */}
        <group position={[0, -0.075, 0.047]}>
          {Array.from({ length: 12 }, (_, i) => (
            <mesh key={i} position={[((i % 3) - 1) * 0.058, 0.043 - Math.floor(i / 3) * 0.038, 0]}>
              <boxGeometry args={[0.046, 0.028, 0.005]} />
              <meshStandardMaterial
                ref={keyRef(i)}
                color="#1a1e24"
                emissive={accent}
                emissiveIntensity={0.22}
                roughness={0.6}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>

        {/* Card field: the three arcs everyone recognises */}
        <group position={[0, -0.168, 0.047]} rotation={[0, 0, -Math.PI / 2]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i}>
              <ringGeometry args={[0.008 + i * 0.009, 0.0105 + i * 0.009, 20, 1, Math.PI * 0.1, Math.PI * 0.8]} />
              <meshStandardMaterial color="#0d1319" emissive={accent} emissiveIntensity={1.2} toneMapped={false} />
            </mesh>
          ))}
        </group>

        {/* What the panel throws back onto the wall around it */}
        <pointLight ref={lamp} position={[0, 0, 0.24]} intensity={0.5} distance={1.2} color={accent} />
      </Touchable>
    </group>
  )
}

// ---------------------------------------------------------------------------
// The entrance, assembled
// ---------------------------------------------------------------------------

/**
 * Everything outside the room, driven by the entry state. The unlock timeline,
 * measured from the moment the credential is accepted:
 *
 *   0.00  reader goes amber, keys scatter, three pips
 *   0.45  bolts withdraw, the maglock drops
 *   0.80  the leaf starts to move
 *   2.90  it comes to rest against the inside wall
 *
 * The camera walks in over the back half of that (see Room3D's CameraRig),
 * which is why the swing is slow: you are following it through.
 */
export function Entrance({ state, tl, onUnlock }: { state: Entry; tl: DoorTimeline; onUnlock: () => void }) {
  const granted = state === 'unlocking' || state === 'inside'
  const outside = state !== 'inside'

  return (
    // One guard for the whole entrance: while the visitor is out here, the
    // room behind the wall is not theirs to hover over yet, and a ray that
    // misses the reader must not find the bulb's pull cord through two walls.
    <group
      onPointerOver={(e: ThreeEvent<PointerEvent>) => e.stopPropagation()}
      onClick={(e: ThreeEvent<MouseEvent>) => e.stopPropagation()}
    >
      <Corridor lit={outside} />
      <Cctv live={outside} />
      <DoorFrame tl={tl} granted={granted} />
      <DoorLeaf tl={tl} />
      <AccessPanel tl={tl} locked={state === 'door' || state === 'loading'} onUnlock={onUnlock} />
    </group>
  )
}
