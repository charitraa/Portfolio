import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * Shared materials and the small repeated details that make hardware read as
 * manufactured rather than modelled: screws, ventilation, port cutouts, status
 * LEDs, rubber feet and routed cable.
 *
 * Everything here is still primitive geometry — the room ships no GLTF, no
 * texture maps and no HDRI — so realism has to come from correct PBR response
 * instead. Metal needs something to reflect, which is why the scene renders its
 * own environment map (see <RoomEnvironment/> in Room3D): without one, high
 * metalness reads as flat black.
 *
 * Materials are module-level singletons. Forty pieces of equipment built from
 * per-mesh materials would mean hundreds of shader programs and draw calls; a
 * couple of dozen shared ones keeps the room cheap enough to open a portfolio
 * with.
 */

function std(p: THREE.MeshStandardMaterialParameters) {
  return new THREE.MeshStandardMaterial(p)
}

export const M = {
  /** Brushed aluminium — laptop lids, monitor arms, rack ears. */
  alu: std({ color: '#b6bac2', metalness: 0.92, roughness: 0.3, envMapIntensity: 1.1 }),
  /** Darker anodised aluminium, the finish most of this gear actually has. */
  aluDark: std({ color: '#585d67', metalness: 0.88, roughness: 0.38, envMapIntensity: 1 }),
  /** Cold-rolled steel, as used on rack panels and cabinet shells. */
  steel: std({ color: '#767c88', metalness: 0.85, roughness: 0.44, envMapIntensity: 0.95 }),
  /** The satin black of most network hardware. */
  blackMetal: std({ color: '#23262c', metalness: 0.7, roughness: 0.45, envMapIntensity: 0.8 }),
  /** ABS housings — routers, hubs, chargers. */
  plastic: std({ color: '#2a2e35', metalness: 0.04, roughness: 0.62 }),
  /** Deep matte plastic for recessed areas and vent interiors. */
  plasticDark: std({ color: '#101318', metalness: 0.02, roughness: 0.8 }),
  /** Keycaps and other lightly textured mouldings. */
  keycap: std({ color: '#33373f', metalness: 0.02, roughness: 0.78 }),
  /** Rubber feet, cable jackets, grommets. */
  rubber: std({ color: '#131519', metalness: 0, roughness: 0.95 }),
  /** Screen glass, off. Smooth enough to carry a real reflection. */
  glass: std({ color: '#07080b', metalness: 0.1, roughness: 0.07, envMapIntensity: 1.6 }),
  /** Bare PCB. */
  pcb: std({ color: '#1c5638', metalness: 0.15, roughness: 0.62 }),
  /** Gold-plated contacts and pin headers. */
  contact: std({ color: '#c9a44c', metalness: 1, roughness: 0.32, envMapIntensity: 1.2 }),
  /** Chair and speaker fabric. */
  fabric: std({ color: '#31353e', metalness: 0, roughness: 1 }),
  /** Desk and shelf timber. */
  wood: std({ color: '#8d6a48', metalness: 0, roughness: 0.66 }),
  woodDark: std({ color: '#5c452f', metalness: 0, roughness: 0.72 }),
  /** Whiteboard surface — glossy, so it catches the room. Deliberately off
   *  white: a pure white board under the bulb blows out and flattens. */
  whiteboard: std({ color: '#c9d0d8', metalness: 0.02, roughness: 0.26, envMapIntensity: 0.8 }),
  /** Paper: notebook pages, certificates, printouts. */
  paper: std({ color: '#e6e3db', metalness: 0, roughness: 0.94 }),
  /** Copper, for the odd exposed conductor. */
  copper: std({ color: '#b87333', metalness: 1, roughness: 0.36 }),
}

/** Restrained technology accents. No gaming RGB anywhere in the room. */
export const TECH_CYAN = '#4fd6e8'
export const TECH_BLUE = '#5b9cf8'
export const LED_GREEN = '#57d98a'
export const LED_AMBER = '#e8a33d'

/** Emissive indicator materials, shared so they cost one program each. */
const ledCache = new Map<string, THREE.MeshStandardMaterial>()
export function ledMat(color: string, on = true) {
  const key = `${color}:${on}`
  let m = ledCache.get(key)
  if (!m) {
    m = std({
      color: on ? color : '#1b1e24',
      emissive: on ? color : '#000000',
      emissiveIntensity: on ? 2.4 : 0,
      roughness: 0.4,
      toneMapped: false,
    })
    ledCache.set(key, m)
  }
  return m
}

// ---------------------------------------------------------------------------
// Repeated hardware details
// ---------------------------------------------------------------------------

/** A single panel screw, countersunk. */
export function Screw({ position, r = 0.006 }: { position: [number, number, number]; r?: number }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]} material={M.aluDark}>
      <cylinderGeometry args={[r, r, 0.004, 8]} />
    </mesh>
  )
}

/**
 * A run of ventilation slots. Real equipment is defined as much by where the
 * heat leaves as by its outline.
 */
export function Vents({
  position,
  count = 8,
  w = 0.012,
  h = 0.05,
  gap = 0.02,
  depth = 0.006,
  vertical = false,
}: {
  position: [number, number, number]
  count?: number
  w?: number
  h?: number
  gap?: number
  depth?: number
  vertical?: boolean
}) {
  const span = (count - 1) * gap
  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => {
        const o = -span / 2 + i * gap
        return (
          <mesh key={i} position={vertical ? [0, o, 0] : [o, 0, 0]} material={M.plasticDark}>
            <boxGeometry args={[w, h, depth]} />
          </mesh>
        )
      })}
    </group>
  )
}

/** A honeycomb-ish punched grille, for fans and server faces. */
export function Grille({
  position,
  w = 0.1,
  h = 0.1,
  step = 0.014,
}: {
  position: [number, number, number]
  w?: number
  h?: number
  step?: number
}) {
  const holes = useMemo(() => {
    const out: [number, number][] = []
    const cols = Math.floor(w / step)
    const rows = Math.floor(h / step)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Offset every other row so the pattern reads as punched, not gridded.
        const x = -w / 2 + step / 2 + c * step + (r % 2 ? step / 2 : 0)
        const y = -h / 2 + step / 2 + r * step
        if (x > w / 2 - step / 4) continue
        out.push([x, y])
      }
    }
    return out
  }, [w, h, step])

  return (
    <group position={position}>
      <mesh material={M.plasticDark}>
        <boxGeometry args={[w, h, 0.004]} />
      </mesh>
      {holes.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.003]} material={M.blackMetal}>
          <cylinderGeometry args={[step * 0.3, step * 0.3, 0.002, 6]} />
        </mesh>
      ))}
    </group>
  )
}

/** An RJ45 / USB style port cutout. */
export function Port({
  position,
  w = 0.014,
  h = 0.011,
  lit,
}: {
  position: [number, number, number]
  w?: number
  h?: number
  lit?: string
}) {
  return (
    <group position={position}>
      <mesh material={M.plasticDark}>
        <boxGeometry args={[w, h, 0.008]} />
      </mesh>
      <mesh position={[0, -h / 2 + 0.002, 0.005]} material={M.contact}>
        <boxGeometry args={[w * 0.7, 0.002, 0.001]} />
      </mesh>
      {lit && (
        <mesh position={[w / 2 - 0.002, h / 2 - 0.002, 0.005]} material={ledMat(lit)}>
          <boxGeometry args={[0.003, 0.002, 0.001]} />
        </mesh>
      )}
    </group>
  )
}

/** A row of ports, the way a switch or router actually presents them. */
export function PortBank({
  position,
  count = 8,
  gap = 0.022,
  lit = LED_GREEN,
  litEvery = 2,
}: {
  position: [number, number, number]
  count?: number
  gap?: number
  lit?: string
  litEvery?: number
}) {
  const span = (count - 1) * gap
  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => (
        <Port key={i} position={[-span / 2 + i * gap, 0, 0]} lit={i % litEvery === 0 ? lit : undefined} />
      ))}
    </group>
  )
}

/** A status LED. */
export function Led({
  position,
  color = LED_GREEN,
  on = true,
  r = 0.004,
}: {
  position: [number, number, number]
  color?: string
  on?: boolean
  r?: number
}) {
  return (
    <mesh position={position} material={ledMat(color, on)}>
      <circleGeometry args={[r, 10]} />
    </mesh>
  )
}

/** Rubber feet, so equipment sits on a surface instead of touching it. */
export function Feet({
  w,
  d,
  y = 0,
  r = 0.008,
}: {
  w: number
  d: number
  y?: number
  r?: number
}) {
  const pts: [number, number][] = [
    [-w / 2 + r * 2, -d / 2 + r * 2],
    [w / 2 - r * 2, -d / 2 + r * 2],
    [-w / 2 + r * 2, d / 2 - r * 2],
    [w / 2 - r * 2, d / 2 - r * 2],
  ]
  return (
    <>
      {pts.map(([x, z], i) => (
        <mesh key={i} position={[x, y, z]} material={M.rubber}>
          <cylinderGeometry args={[r, r, 0.006, 8]} />
        </mesh>
      ))}
    </>
  )
}

/**
 * A cable, routed along a path rather than dropped in a heap. Points are world
 * positions relative to the parent group; the curve does the sagging.
 */
export function Cable({
  points,
  r = 0.006,
  material = M.rubber,
  segments = 40,
}: {
  points: [number, number, number][]
  r?: number
  material?: THREE.Material
  segments?: number
}) {
  // Keyed on the values, not the array identity: callers write their routing
  // inline, so a literal array arrives new on every render and would otherwise
  // rebuild the tube geometry every frame.
  const key = JSON.stringify(points)
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
    return new THREE.TubeGeometry(curve, segments, r, 7, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, r, segments])
  return <mesh geometry={geo} material={material} castShadow />
}

/** An RJ45 boot on the end of a patch lead. */
export function Rj45({
  position,
  rotation = [0, 0, 0],
  color = '#2f3742',
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  color?: string
}) {
  const mat = useMemo(() => std({ color, metalness: 0.05, roughness: 0.7 }), [color])
  return (
    <group position={position} rotation={rotation}>
      <mesh material={mat}>
        <boxGeometry args={[0.014, 0.013, 0.026]} />
      </mesh>
      <mesh position={[0, 0.009, -0.004]} material={mat}>
        <boxGeometry args={[0.006, 0.007, 0.012]} />
      </mesh>
    </group>
  )
}

/** 1U of rack front panel, with ears and fixings. */
export function RackPanel({
  y,
  w = 0.44,
  h = 0.043,
  d = 0.3,
  material = M.blackMetal,
  children,
}: {
  y: number
  w?: number
  h?: number
  d?: number
  material?: THREE.Material
  children?: React.ReactNode
}) {
  return (
    <group position={[0, y, 0]}>
      <mesh castShadow receiveShadow material={material}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      {/* Mounting ears */}
      <Screw position={[-w / 2 + 0.012, h / 2 - 0.011, d / 2 + 0.001]} />
      <Screw position={[-w / 2 + 0.012, -h / 2 + 0.011, d / 2 + 0.001]} />
      <Screw position={[w / 2 - 0.012, h / 2 - 0.011, d / 2 + 0.001]} />
      <Screw position={[w / 2 - 0.012, -h / 2 + 0.011, d / 2 + 0.001]} />
      {children}
    </group>
  )
}
