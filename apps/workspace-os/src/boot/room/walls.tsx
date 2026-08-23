import * as THREE from 'three'
import { M, TECH_CYAN } from './kit'

/**
 * Wall-mounted surfaces: whiteboard, task board, a network diagram, framed
 * certificates and floating shelves.
 *
 * Nothing here spells anything out. Text at the size these read on screen would
 * be pure noise, so diagrams are drawn as real diagrams — nodes and links with
 * meaningful topology — and written matter is abstracted to strokes. That reads
 * as legible-from-across-the-room, which is what it would be.
 */

const WALL_Z = -2.96

const inkDark = new THREE.MeshStandardMaterial({ color: '#2b3440', roughness: 0.85 })
const inkBlue = new THREE.MeshStandardMaterial({ color: '#3f6fa8', roughness: 0.85 })
const inkRed = new THREE.MeshStandardMaterial({ color: '#9e4b45', roughness: 0.85 })
const inkGreen = new THREE.MeshStandardMaterial({ color: '#4c8560', roughness: 0.85 })

/** Aluminium-framed dry-wipe board with a pen tray, marker set and eraser. */
export function Whiteboard({ x, y }: { x: number; y: number }) {
  const w = 1.5
  const h = 1.0

  return (
    <group position={[x, y, WALL_Z]}>
      {/* Frame */}
      <mesh position={[0, 0, -0.014]} castShadow material={M.alu}>
        <boxGeometry args={[w + 0.05, h + 0.05, 0.028]} />
      </mesh>
      {/* Writing surface, glossy enough to pick up the room */}
      <mesh position={[0, 0, 0.001]} material={M.whiteboard}>
        <boxGeometry args={[w, h, 0.004]} />
      </mesh>

      {/* Content: an architecture sketch on the left, a checklist on the right,
          divided by a hand-drawn rule. */}
      <group position={[0, 0, 0.004]}>
        <ArchSketch x={-0.36} y={0.06} />
        <mesh position={[0.06, 0, 0]}>
          <planeGeometry args={[0.004, h - 0.16]} />
          <primitive object={inkDark} attach="material" />
        </mesh>
        <Checklist x={0.34} y={0.28} />
        {/* A half-wiped patch, because boards are never clean */}
        <mesh position={[-0.3, -0.34, 0.001]}>
          <planeGeometry args={[0.5, 0.14]} />
          <meshStandardMaterial color="#e2e7ec" roughness={0.3} transparent opacity={0.55} />
        </mesh>
      </group>

      {/* Pen tray with markers and an eraser */}
      <group position={[0, -h / 2 - 0.045, 0.03]}>
        <mesh castShadow material={M.alu}>
          <boxGeometry args={[w * 0.55, 0.014, 0.05]} />
        </mesh>
        {[
          { x: -0.16, c: '#1f2630' },
          { x: -0.1, c: '#2f5f9c' },
          { x: -0.04, c: '#9c3f39' },
          { x: 0.05, c: '#3f7f56' },
        ].map((p) => (
          <mesh key={p.x} position={[p.x, 0.014, 0.004]} rotation={[Math.PI / 2, 0, 0.06]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.11, 12]} />
            <meshStandardMaterial color={p.c} roughness={0.45} />
          </mesh>
        ))}
        {/* Eraser, felt side down */}
        <group position={[0.17, 0.02, 0]}>
          <mesh castShadow material={M.plastic}>
            <boxGeometry args={[0.075, 0.026, 0.042]} />
          </mesh>
          <mesh position={[0, -0.016, 0]} material={M.fabric}>
            <boxGeometry args={[0.072, 0.008, 0.04]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/** A boxes-and-arrows system sketch, as anyone would actually draw it. */
function ArchSketch({ x, y }: { x: number; y: number }) {
  const boxes: { p: [number, number]; w: number; h: number }[] = [
    { p: [0, 0.26], w: 0.22, h: 0.1 },
    { p: [-0.18, 0.04], w: 0.2, h: 0.09 },
    { p: [0.18, 0.04], w: 0.2, h: 0.09 },
    { p: [0, -0.18], w: 0.26, h: 0.1 },
  ]
  const links: { a: [number, number]; b: [number, number] }[] = [
    { a: [0, 0.21], b: [-0.18, 0.085] },
    { a: [0, 0.21], b: [0.18, 0.085] },
    { a: [-0.18, -0.005], b: [0, -0.13] },
    { a: [0.18, -0.005], b: [0, -0.13] },
  ]

  return (
    <group position={[x, y, 0]}>
      {boxes.map((b, i) => (
        <group key={i} position={[b.p[0], b.p[1], 0]}>
          {/* Drawn as four strokes rather than a filled rect */}
          {[
            [0, b.h / 2, b.w, 0.004],
            [0, -b.h / 2, b.w, 0.004],
            [-b.w / 2, 0, 0.004, b.h],
            [b.w / 2, 0, 0.004, b.h],
          ].map(([px, py, pw, ph], k) => (
            <mesh key={k} position={[px, py, 0]}>
              <planeGeometry args={[pw, ph]} />
              <primitive object={i === 0 ? inkBlue : inkDark} attach="material" />
            </mesh>
          ))}
          {/* A label stroke inside each box */}
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[b.w * 0.55, 0.008]} />
            <primitive object={inkDark} attach="material" />
          </mesh>
        </group>
      ))}
      {links.map((l, i) => {
        const dx = l.b[0] - l.a[0]
        const dy = l.b[1] - l.a[1]
        const len = Math.hypot(dx, dy)
        return (
          <mesh key={i} position={[(l.a[0] + l.b[0]) / 2, (l.a[1] + l.b[1]) / 2, 0]} rotation={[0, 0, Math.atan2(dy, dx)]}>
            <planeGeometry args={[len, 0.0035]} />
            <primitive object={inkBlue} attach="material" />
          </mesh>
        )
      })}
    </group>
  )
}

/** A ticked-off checklist. */
function Checklist({ x, y }: { x: number; y: number }) {
  return (
    <group position={[x, y, 0]}>
      {Array.from({ length: 7 }, (_, i) => (
        <group key={i} position={[0, -i * 0.072, 0]}>
          {/* Box */}
          {[
            [0, 0.014, 0.028, 0.003],
            [0, -0.014, 0.028, 0.003],
            [-0.014, 0, 0.003, 0.028],
            [0.014, 0, 0.003, 0.028],
          ].map(([px, py, pw, ph], k) => (
            <mesh key={k} position={[px - 0.2, py, 0]}>
              <planeGeometry args={[pw, ph]} />
              <primitive object={inkDark} attach="material" />
            </mesh>
          ))}
          {/* Tick, on the first four only */}
          {i < 4 && (
            <>
              <mesh position={[-0.204, -0.004, 0.001]} rotation={[0, 0, -0.9]}>
                <planeGeometry args={[0.014, 0.004]} />
                <primitive object={inkGreen} attach="material" />
              </mesh>
              <mesh position={[-0.195, 0.002, 0.001]} rotation={[0, 0, 0.7]}>
                <planeGeometry args={[0.024, 0.004]} />
                <primitive object={inkGreen} attach="material" />
              </mesh>
            </>
          )}
          {/* The line item itself */}
          <mesh position={[-0.06 + ((i * 7) % 4) * 0.014, 0, 0]}>
            <planeGeometry args={[0.24 - ((i * 5) % 4) * 0.028, 0.0055]} />
            <primitive object={i < 4 ? inkDark : inkRed} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * The network topology diagram: a printed sheet in a slim frame. Drawn as a
 * genuine topology — internet to firewall, down through the switch, out to the
 * subnets — so it survives being looked at closely.
 */
export function TopologyDiagram({ x, y }: { x: number; y: number }) {
  const w = 0.62
  const h = 0.8

  const nodes: { p: [number, number]; r: number; kind: 'cloud' | 'box' | 'leaf' }[] = [
    { p: [0, 0.3], r: 0.038, kind: 'cloud' },
    { p: [0, 0.15], r: 0.03, kind: 'box' },
    { p: [0, -0.01], r: 0.034, kind: 'box' },
    { p: [-0.19, -0.18], r: 0.024, kind: 'leaf' },
    { p: [-0.06, -0.18], r: 0.024, kind: 'leaf' },
    { p: [0.07, -0.18], r: 0.024, kind: 'leaf' },
    { p: [0.2, -0.18], r: 0.024, kind: 'leaf' },
    { p: [-0.12, -0.31], r: 0.02, kind: 'leaf' },
    { p: [0.13, -0.31], r: 0.02, kind: 'leaf' },
  ]
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [2, 6],
    [3, 7],
    [6, 8],
  ]

  return (
    <group position={[x, y, WALL_Z]}>
      <mesh position={[0, 0, -0.008]} castShadow material={M.aluDark}>
        <boxGeometry args={[w + 0.03, h + 0.03, 0.016]} />
      </mesh>
      <mesh position={[0, 0, 0.001]} material={M.paper}>
        <boxGeometry args={[w, h, 0.002]} />
      </mesh>
      <group position={[0, 0, 0.003]}>
        {/* Title rule */}
        <mesh position={[0, h / 2 - 0.06, 0]}>
          <planeGeometry args={[w - 0.1, 0.005]} />
          <primitive object={inkDark} attach="material" />
        </mesh>
        {edges.map(([a, b], i) => {
          const na = nodes[a].p
          const nb = nodes[b].p
          const dx = nb[0] - na[0]
          const dy = nb[1] - na[1]
          return (
            <mesh
              key={i}
              position={[(na[0] + nb[0]) / 2, (na[1] + nb[1]) / 2, 0]}
              rotation={[0, 0, Math.atan2(dy, dx)]}
            >
              <planeGeometry args={[Math.hypot(dx, dy), 0.0028]} />
              <primitive object={inkBlue} attach="material" />
            </mesh>
          )
        })}
        {nodes.map((n, i) => (
          <group key={i} position={[n.p[0], n.p[1], 0.001]}>
            {n.kind === 'cloud' ? (
              <mesh>
                <circleGeometry args={[n.r, 20]} />
                <primitive object={inkBlue} attach="material" />
              </mesh>
            ) : (
              <mesh>
                <planeGeometry args={[n.r * 2, n.r * 1.3]} />
                <primitive object={n.kind === 'box' ? inkDark : inkGreen} attach="material" />
              </mesh>
            )}
          </group>
        ))}
        {/* Subnet annotations, as short strokes */}
        {[-0.19, -0.06, 0.07, 0.2].map((nx, i) => (
          <mesh key={nx} position={[nx, -0.225, 0]}>
            <planeGeometry args={[0.05 - (i % 2) * 0.012, 0.003]} />
            <primitive object={inkDark} attach="material" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/**
 * Kanban-style project board: three columns of cards, unevenly filled, because
 * the middle column always is.
 */
export function TaskBoard({ x, y }: { x: number; y: number }) {
  const w = 0.66
  const h = 0.5
  const cols = [4, 3, 2]
  const colColor = ['#c9b45e', '#5e8ec9', '#5eb37f']

  return (
    <group position={[x, y, WALL_Z]}>
      <mesh position={[0, 0, -0.01]} castShadow material={M.woodDark}>
        <boxGeometry args={[w + 0.03, h + 0.03, 0.018]} />
      </mesh>
      <mesh position={[0, 0, 0]} material={M.fabric}>
        <boxGeometry args={[w, h, 0.004]} />
      </mesh>
      {cols.map((n, c) =>
        Array.from({ length: n }, (_, i) => (
          <mesh
            key={`${c}-${i}`}
            position={[-w / 2 + 0.12 + c * 0.21, h / 2 - 0.09 - i * 0.088, 0.004]}
            rotation={[0, 0, ((c + i) % 3) * 0.016 - 0.016]}
          >
            <planeGeometry args={[0.15, 0.062]} />
            <meshStandardMaterial color={colColor[c]} roughness={0.9} />
          </mesh>
        )),
      )}
      {/* Column headers */}
      {[0, 1, 2].map((c) => (
        <mesh key={c} position={[-w / 2 + 0.12 + c * 0.21, h / 2 - 0.035, 0.004]}>
          <planeGeometry args={[0.09, 0.006]} />
          <primitive object={inkDark} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

/** Framed certificates, hung as a pair with a slight height difference. */
export function Certificates({ x, y }: { x: number; y: number }) {
  const items = [
    { dx: -0.2, dy: 0.0, w: 0.32, h: 0.24 },
    { dx: 0.19, dy: -0.012, w: 0.3, h: 0.23 },
  ]
  return (
    <group position={[x, y, WALL_Z]}>
      {items.map((c, i) => (
        <group key={i} position={[c.dx, c.dy, 0]} rotation={[0, 0, i ? 0.008 : -0.006]}>
          <mesh position={[0, 0, -0.008]} castShadow material={M.woodDark}>
            <boxGeometry args={[c.w + 0.03, c.h + 0.03, 0.016]} />
          </mesh>
          {/* Glazing over the print */}
          <mesh position={[0, 0, 0.002]}>
            <boxGeometry args={[c.w, c.h, 0.003]} />
            <meshPhysicalMaterial color="#ffffff" roughness={0.05} metalness={0} transmission={0.9} thickness={0.003} transparent opacity={0.25} />
          </mesh>
          <mesh position={[0, 0, 0]} material={M.paper}>
            <boxGeometry args={[c.w, c.h, 0.002]} />
          </mesh>
          {/* Seal, heading rule and body strokes */}
          <mesh position={[0, c.h / 2 - 0.05, 0.002]}>
            <planeGeometry args={[c.w * 0.5, 0.008]} />
            <primitive object={inkDark} attach="material" />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[0, c.h / 2 - 0.09 - k * 0.026, 0.002]}>
              <planeGeometry args={[c.w * (0.62 - k * 0.12), 0.004]} />
              <primitive object={inkDark} attach="material" />
            </mesh>
          ))}
          <mesh position={[-c.w / 2 + 0.05, -c.h / 2 + 0.045, 0.002]}>
            <circleGeometry args={[0.022, 18]} />
            <meshStandardMaterial color="#b08d3f" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[c.w / 2 - 0.07, -c.h / 2 + 0.04, 0.002]}>
            <planeGeometry args={[0.07, 0.004]} />
            <primitive object={inkBlue} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * Minimal floating shelves, bracket-free, holding the overflow: a couple of
 * books on their side, a small plant, a coiled cable and a spare drive.
 */
export function FloatingShelves({ x, y }: { x: number; y: number }) {
  return (
    <group position={[x, y, WALL_Z + 0.14]}>
      {[0, 1].map((i) => (
        <group key={i} position={[i * 0.06, i * 0.34, 0]}>
          <mesh castShadow receiveShadow material={M.wood}>
            <boxGeometry args={[0.78 - i * 0.1, 0.032, 0.2]} />
          </mesh>
          {/* Shadow line under the front lip sells the float */}
          <mesh position={[0, -0.018, 0.02]} material={M.woodDark}>
            <boxGeometry args={[0.78 - i * 0.1, 0.004, 0.16]} />
          </mesh>
        </group>
      ))}

      {/* Lower shelf: stacked books and a drive */}
      <group position={[-0.22, 0.036, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, i * 0.026, ((i * 7) % 3) * 0.006]} rotation={[0, ((i * 5) % 3) * 0.04, 0]} castShadow>
            <boxGeometry args={[0.2, 0.024, 0.14]} />
            <meshStandardMaterial color={['#3f5570', '#6b4551', '#3f6b58'][i]} roughness={0.8} />
          </mesh>
        ))}
      </group>
      <mesh position={[0.12, 0.05, 0.01]} rotation={[0, 0.3, 0]} castShadow material={M.alu}>
        <boxGeometry args={[0.1, 0.014, 0.06]} />
      </mesh>
      {/* Coiled spare cable */}
      <mesh position={[0.28, 0.042, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={M.rubber}>
        <torusGeometry args={[0.045, 0.008, 8, 22]} />
      </mesh>

      {/* Upper shelf: a small trailing plant and a lit accent */}
      <group position={[0.2, 0.376, 0]}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.038, 0.08, 20]} />
          <meshStandardMaterial color="#8d8378" roughness={0.9} />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.03, 0.085 + (i % 3) * 0.02, Math.sin(a) * 0.03]} rotation={[0.4, a, 0.3]} castShadow>
              <sphereGeometry args={[0.022, 8, 6]} />
              <meshStandardMaterial color="#4a7a52" roughness={0.85} />
            </mesh>
          )
        })}
      </group>
      {/* Under-shelf LED wash — the only decorative light in the room */}
      <mesh position={[-0.06, 0.32, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.62, 0.16]} />
        <meshStandardMaterial color="#000" emissive={TECH_CYAN} emissiveIntensity={0.16} toneMapped={false} transparent opacity={0.35} />
      </mesh>
    </group>
  )
}
