import { M, Screw } from './kit'

/**
 * Freestanding furniture: the bookshelf and the drawer unit.
 *
 * Book spines are generated from a fixed table rather than at random, so the
 * shelf looks the same on every visit — a library that reshuffles itself is
 * the fastest way to break the illusion that this is somebody's actual room.
 */

/** Spine colours and proportions, roughly grouped the way books get shelved. */
const SPINES: { c: string; w: number; lean?: number }[] = [
  { c: '#2f4a6b', w: 0.032 },
  { c: '#6b3f3a', w: 0.026 },
  { c: '#2c5c4a', w: 0.036 },
  { c: '#4a4560', w: 0.022 },
  { c: '#7a5c33', w: 0.03 },
  { c: '#37506b', w: 0.028 },
  { c: '#5c3550', w: 0.034 },
  { c: '#3f6350', w: 0.024 },
  { c: '#6b5233', w: 0.03 },
  { c: '#33455c', w: 0.026, lean: 0.09 },
  { c: '#5c4a3a', w: 0.038 },
  { c: '#2f5566', w: 0.028 },
  { c: '#6b4a4a', w: 0.032 },
  { c: '#404a5c', w: 0.024 },
  { c: '#4a6b52', w: 0.03 },
]

/**
 * Open bookshelf. Shelves are filled to different depths and one row has toppled
 * against its neighbour — a full, perfectly upright shelf reads as wallpaper.
 */
export function Bookshelf({ position, yaw }: { position: [number, number, number]; yaw: number }) {
  const w = 0.9
  const h = 1.7
  const d = 0.28
  const shelves = 5

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Carcass */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * w) / 2, h / 2, 0]} castShadow receiveShadow material={M.wood}>
          <boxGeometry args={[0.024, h, d]} />
        </mesh>
      ))}
      <mesh position={[0, h, 0]} castShadow material={M.wood}>
        <boxGeometry args={[w + 0.024, 0.024, d]} />
      </mesh>
      <mesh position={[0, 0.012, 0]} castShadow material={M.wood}>
        <boxGeometry args={[w + 0.024, 0.024, d]} />
      </mesh>
      {/* Back panel, slightly darker as it is always in shadow */}
      <mesh position={[0, h / 2, -d / 2 + 0.005]} receiveShadow material={M.woodDark}>
        <boxGeometry args={[w, h, 0.01]} />
      </mesh>

      {Array.from({ length: shelves }, (_, row) => {
        const sy = 0.024 + ((h - 0.06) / shelves) * (row + 1)
        return (
          <group key={row}>
            {row < shelves - 1 && (
              <mesh position={[0, sy, 0]} castShadow receiveShadow material={M.wood}>
                <boxGeometry args={[w, 0.02, d]} />
              </mesh>
            )}
            <ShelfRow y={sy - (h - 0.06) / shelves + 0.014} width={w} row={row} />
          </group>
        )
      })}
    </group>
  )
}

/** One row of books, filled from the left and stopping short. */
function ShelfRow({ y, width, row }: { y: number; width: number; row: number }) {
  const height = 0.24
  // Each row starts at a different point in the spine table and runs a
  // different length, so no two rows repeat.
  const start = row * 4
  const count = [11, 9, 12, 7, 10][row % 5]

  let cursor = -width / 2 + 0.03
  const books: { x: number; w: number; c: string; h: number; lean: number }[] = []
  for (let i = 0; i < count; i++) {
    const s = SPINES[(start + i) % SPINES.length]
    const bh = height * (0.74 + (((i * 13) % 5) / 5) * 0.24)
    books.push({ x: cursor + s.w / 2, w: s.w, c: s.c, h: bh, lean: s.lean ?? 0 })
    cursor += s.w + 0.003
  }

  return (
    <group position={[0, y, 0]}>
      {books.map((b, i) => (
        <group key={i} position={[b.x, b.h / 2 + 0.01, 0.01]} rotation={[0, 0, b.lean]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, 0.2]} />
            <meshStandardMaterial color={b.c} roughness={0.82} />
          </mesh>
          {/* Title band on the spine */}
          <mesh position={[0, b.h * 0.22, 0.101]}>
            <planeGeometry args={[b.w * 0.6, 0.004]} />
            <meshStandardMaterial color="#d8cfbd" roughness={0.9} />
          </mesh>
          {i % 4 === 1 && (
            <mesh position={[0, -b.h * 0.28, 0.101]}>
              <planeGeometry args={[b.w * 0.45, 0.003]} />
              <meshStandardMaterial color="#c2b49b" roughness={0.9} />
            </mesh>
          )}
        </group>
      ))}
      {/* A couple laid flat on top of the row, as always happens */}
      {row === 1 && (
        <group position={[cursor + 0.1, 0.028, 0.01]} rotation={[0, 0.06, 0]}>
          {[0, 1].map((i) => (
            <mesh key={i} position={[0, i * 0.028, 0]} castShadow>
              <boxGeometry args={[0.19, 0.026, 0.2]} />
              <meshStandardMaterial color={i ? '#4a5c6b' : '#6b4f3f'} roughness={0.82} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

/**
 * Drawer unit under the far end of the desk. Steel carcass, one drawer left
 * slightly proud because nobody ever closes the middle one properly.
 */
export function StorageCabinet({ position, yaw }: { position: [number, number, number]; yaw: number }) {
  const w = 0.44
  const h = 0.62
  const d = 0.5
  const drawers = 3

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow material={M.steel}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      {/* Top surface, a slightly different finish */}
      <mesh position={[0, h + 0.008, 0]} castShadow material={M.aluDark}>
        <boxGeometry args={[w + 0.014, 0.016, d + 0.014]} />
      </mesh>

      {Array.from({ length: drawers }, (_, i) => {
        const dy = 0.08 + i * 0.18
        // The middle drawer never quite shuts.
        const out = i === 1 ? 0.022 : 0
        return (
          <group key={i} position={[0, dy, d / 2 + out]}>
            <mesh castShadow material={M.blackMetal}>
              <boxGeometry args={[w - 0.02, 0.16, 0.018]} />
            </mesh>
            {/* Recessed pull */}
            <mesh position={[0, 0.035, 0.011]} material={M.aluDark}>
              <boxGeometry args={[0.14, 0.018, 0.006]} />
            </mesh>
            {/* Label holder */}
            <mesh position={[-0.12, -0.03, 0.011]} material={M.paper}>
              <boxGeometry args={[0.07, 0.026, 0.002]} />
            </mesh>
            {out > 0 && (
              // The open drawer shows its side wall, otherwise it reads as a
              // sticker rather than a drawer.
              <mesh position={[0, 0, -0.012]} material={M.steel}>
                <boxGeometry args={[w - 0.03, 0.15, 0.02]} />
              </mesh>
            )}
          </group>
        )
      })}

      {/* Castors */}
      {([
        [-w / 2 + 0.05, -d / 2 + 0.06],
        [w / 2 - 0.05, -d / 2 + 0.06],
        [-w / 2 + 0.05, d / 2 - 0.06],
        [w / 2 - 0.05, d / 2 - 0.06],
      ] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.018, z]} rotation={[0, 0, Math.PI / 2]} castShadow material={M.rubber}>
          <cylinderGeometry args={[0.018, 0.018, 0.016, 12]} />
        </mesh>
      ))}
      <Screw position={[-w / 2 + 0.02, h - 0.03, d / 2 + 0.001]} />
      <Screw position={[w / 2 - 0.02, h - 0.03, d / 2 + 0.001]} />
    </group>
  )
}

/**
 * Books stacked on the cabinet top — the pile that never makes it back to the
 * shelf. Angled slightly off square.
 */
export function BookStack({ position }: { position: [number, number, number] }) {
  const stack = [
    { c: '#3f5570', h: 0.03, r: 0.0 },
    { c: '#6b4551', h: 0.026, r: 0.07 },
    { c: '#2c5c4a', h: 0.034, r: -0.05 },
    { c: '#5c4a3a', h: 0.022, r: 0.11 },
  ]
  let y = 0
  return (
    <group position={position}>
      {stack.map((b, i) => {
        const py = y + b.h / 2
        y += b.h
        return (
          <mesh key={i} position={[0, py, 0]} rotation={[0, b.r, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2 - i * 0.006, b.h, 0.26 - i * 0.008]} />
            <meshStandardMaterial color={b.c} roughness={0.82} />
          </mesh>
        )
      })}
      {/* Reading glasses left on top */}
      <group position={[0.02, y + 0.008, 0.04]} rotation={[0, 0.4, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.026, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.blackMetal}>
            <torusGeometry args={[0.021, 0.0022, 6, 18]} />
          </mesh>
        ))}
        <mesh material={M.blackMetal}>
          <boxGeometry args={[0.014, 0.002, 0.002]} />
        </mesh>
      </group>
    </group>
  )
}

/** Anti-fatigue floor mat under the chair, softening the floor plane. */
export function FloorMat({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0.06]} receiveShadow>
        <circleGeometry args={[0.78, 40]} />
        <meshStandardMaterial color="#2b2f37" roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0.06]}>
        <ringGeometry args={[0.7, 0.74, 40]} />
        <meshStandardMaterial color="#353a44" roughness={0.9} />
      </mesh>
    </group>
  )
}
