import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  Cable,
  Feet,
  Grille,
  Led,
  LED_AMBER,
  LED_GREEN,
  M,
  Port,
  PortBank,
  RackPanel,
  Rj45,
  Screw,
  TECH_CYAN,
  Vents,
} from './kit'

/**
 * The network and server section: a half-height rack in the back-right corner,
 * carrying the things a security practitioner actually runs at home. It is a
 * working corner, not a display cabinet — patch leads are routed, not draped,
 * and the front panels carry the ports and indicators the real hardware has.
 *
 * `live` follows the room mains: with the power off the indicators go dark and
 * the fans stop, same as everything else in here.
 */

const RACK_AT: [number, number, number] = [2.86, 0, -2.16]

/** Rack unit height, near enough to the real 44.45mm. */
const U = 0.0445

export function ServerRack({ live }: { live: boolean }) {
  return (
    <group position={RACK_AT} rotation={[0, -0.5, 0]}>
      <RackFrame />
      {/* Filled from the top down, the way a rack accumulates. */}
      <PatchPanel y={0.98} />
      <ManagedSwitch y={0.98 - U * 1.2} live={live} />
      <Router y={0.98 - U * 2.5} live={live} />
      <Nas y={0.98 - U * 4.4} live={live} />
      <MiniServer y={0.98 - U * 7.2} live={live} />
      <Ups y={0.3} live={live} />
      <RackCabling live={live} />
    </group>
  )
}

/** The frame itself: four posts, a vented top, castors and a glass door. */
function RackFrame() {
  const w = 0.52
  const d = 0.42
  const h = 1.18

  return (
    <group>
      {/* Posts */}
      {([
        [-w / 2, -d / 2],
        [w / 2, -d / 2],
        [-w / 2, d / 2],
        [w / 2, d / 2],
      ] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, h / 2, z]} castShadow material={M.blackMetal}>
          <boxGeometry args={[0.03, h, 0.03]} />
        </mesh>
      ))}

      {/* Side panels, slightly inset so the posts still read */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * w) / 2, h / 2, 0]} castShadow receiveShadow material={M.steel}>
          <boxGeometry args={[0.006, h - 0.06, d - 0.04]} />
        </mesh>
      ))}

      {/* Vented top */}
      <mesh position={[0, h, 0]} castShadow material={M.steel}>
        <boxGeometry args={[w + 0.02, 0.018, d + 0.02]} />
      </mesh>
      <group position={[0, h + 0.011, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <Vents position={[0, 0, 0]} count={12} w={0.016} h={0.24} gap={0.032} depth={0.004} />
      </group>

      {/* Base plinth */}
      <mesh position={[0, 0.04, 0]} castShadow material={M.blackMetal}>
        <boxGeometry args={[w + 0.02, 0.05, d + 0.02]} />
      </mesh>
      {/* Castors */}
      {([
        [-w / 2 + 0.04, -d / 2 + 0.05],
        [w / 2 - 0.04, -d / 2 + 0.05],
        [-w / 2 + 0.04, d / 2 - 0.05],
        [w / 2 - 0.04, d / 2 - 0.05],
      ] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.012, z]} rotation={[0, 0, Math.PI / 2]} castShadow material={M.rubber}>
          <cylinderGeometry args={[0.014, 0.014, 0.014, 12]} />
        </mesh>
      ))}

      {/* Smoked glass front door, swung well open — a closed rack is a black
          box, and everything worth modelling is behind it. Plain transparency
          rather than transmission: refraction here costs a render target per
          frame and buys nothing at this size. */}
      <group position={[-w / 2 + 0.01, h / 2 + 0.02, d / 2]} rotation={[0, -1.16, 0]}>
        <mesh position={[w / 2 - 0.01, 0, 0]} material={M.blackMetal}>
          <boxGeometry args={[w - 0.02, h - 0.12, 0.012]} />
        </mesh>
        <mesh position={[w / 2 - 0.01, 0, 0.008]}>
          <boxGeometry args={[w - 0.08, h - 0.2, 0.004]} />
          <meshStandardMaterial color="#8fa6bd" metalness={0.1} roughness={0.05} transparent opacity={0.17} />
        </mesh>
        {/* Handle */}
        <mesh position={[w - 0.05, 0, 0.014]} material={M.alu}>
          <boxGeometry args={[0.012, 0.09, 0.014]} />
        </mesh>
      </group>

      {/* A little light spilling out of the rack itself, so the panels and
          their indicators are readable from across the room. */}
      <pointLight position={[0, 0.72, 0.24]} intensity={0.5} distance={1.5} color="#9fc4e8" />
    </group>
  )
}

/** Patch panel — 24 numbered ports, half of them populated. */
function PatchPanel({ y }: { y: number }) {
  return (
    <RackPanel y={y} h={U} d={0.16} material={M.steel}>
      {[0, 1].map((row) =>
        Array.from({ length: 12 }, (_, i) => (
          <group key={`${row}-${i}`} position={[-0.2 + i * 0.036, row ? 0.009 : -0.009, 0.081]}>
            <mesh material={M.plasticDark}>
              <boxGeometry args={[0.026, 0.014, 0.004]} />
            </mesh>
            {(i + row) % 3 !== 0 && <Rj45 position={[0, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]} />}
          </group>
        )),
      )}
    </RackPanel>
  )
}

/** Managed switch: 24 gigabit ports with link lights and a console port. */
function ManagedSwitch({ y, live }: { y: number; live: boolean }) {
  const blink = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    // Link activity: a few ports flicker independently.
    if (!blink.current) return
    const t = clock.elapsedTime
    blink.current.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial
      if (!m?.emissiveIntensity && m?.emissiveIntensity !== 0) return
      m.emissiveIntensity = live ? (Math.sin(t * (5 + i * 2.3) + i) > 0.1 ? 2.6 : 0.25) : 0
    })
  })

  return (
    <RackPanel y={y} h={U * 1.05} d={0.3} material={M.aluDark}>
      {/* Two banks of twelve, split the way real switches group them */}
      <PortBank position={[-0.108, 0.006, 0.151]} count={12} gap={0.0175} litEvery={99} />
      <PortBank position={[0.108, 0.006, 0.151]} count={12} gap={0.0175} litEvery={99} />
      <group ref={blink} position={[0, 0.016, 0.152]}>
        {Array.from({ length: 24 }, (_, i) => {
          const bank = i < 12 ? -0.108 : 0.108
          const k = i % 12
          return (
            <mesh key={i} position={[bank - 0.0175 * 5.5 + k * 0.0175, 0, 0]} material={ledMatFor(i)}>
              <boxGeometry args={[0.004, 0.002, 0.001]} />
            </mesh>
          )
        })}
      </group>
      {/* Console + management */}
      <Port position={[-0.198, -0.008, 0.151]} w={0.012} h={0.009} />
      <Led position={[0.2, -0.009, 0.152]} color={LED_GREEN} on={live} r={0.003} />
      <Vents position={[0, -0.012, 0.151]} count={16} w={0.006} h={0.006} gap={0.011} depth={0.003} />
    </RackPanel>
  )
}

/** Each activity LED gets its own material instance so it can blink alone. */
const linkMats: THREE.MeshStandardMaterial[] = []
function ledMatFor(i: number) {
  if (!linkMats[i]) {
    linkMats[i] = new THREE.MeshStandardMaterial({
      color: LED_GREEN,
      emissive: LED_GREEN,
      emissiveIntensity: 2.4,
      toneMapped: false,
    })
  }
  return linkMats[i]
}

/** Rack-mount router / firewall appliance. */
function Router({ y, live }: { y: number; live: boolean }) {
  return (
    <RackPanel y={y} h={U * 1.6} d={0.32} material={M.aluDark}>
      <mesh position={[0, 0, 0.161]} material={M.blackMetal}>
        <boxGeometry args={[0.44, U * 1.6, 0.002]} />
      </mesh>
      {/* WAN / LAN, deliberately grouped apart */}
      <Port position={[-0.185, 0.012, 0.163]} lit={live ? LED_AMBER : undefined} />
      <PortBank position={[-0.06, 0.012, 0.163]} count={6} gap={0.021} lit={live ? LED_GREEN : ''} litEvery={live ? 2 : 99} />
      {/* SFP cages */}
      {[0.135, 0.175].map((x) => (
        <mesh key={x} position={[x, 0.012, 0.163]} material={M.aluDark}>
          <boxGeometry args={[0.03, 0.014, 0.006]} />
        </mesh>
      ))}
      <Grille position={[0.06, -0.016, 0.163]} w={0.16} h={0.018} step={0.009} />
      <Led position={[-0.205, -0.016, 0.163]} color={LED_GREEN} on={live} r={0.0035} />
      <Led position={[-0.192, -0.016, 0.163]} color={TECH_CYAN} on={live} r={0.0035} />
    </RackPanel>
  )
}

/** Four-bay NAS with drive trays and per-drive activity. */
function Nas({ y, live }: { y: number; live: boolean }) {
  return (
    <RackPanel y={y} h={U * 3} d={0.4} material={M.steel}>
      {Array.from({ length: 4 }, (_, i) => (
        <group key={i} position={[-0.15 + i * 0.1, 0, 0.201]}>
          {/* Tray face with its handle and lock */}
          <mesh material={M.blackMetal}>
            <boxGeometry args={[0.094, U * 2.6, 0.006]} />
          </mesh>
          <mesh position={[-0.03, 0, 0.005]} material={M.aluDark}>
            <boxGeometry args={[0.01, U * 2, 0.006]} />
          </mesh>
          <Vents position={[0.015, 0, 0.005]} count={5} w={0.004} h={U * 1.8} gap={0.011} depth={0.003} />
          <Led position={[0.038, U * 1.1, 0.005]} color={LED_GREEN} on={live} r={0.0025} />
          <Led position={[0.038, U * 0.8, 0.005]} color={live && i < 3 ? LED_AMBER : '#1b1e24'} on={live && i < 3} r={0.0025} />
        </group>
      ))}
      <Led position={[0.19, U * 1.1, 0.201]} color={TECH_CYAN} on={live} r={0.004} />
    </RackPanel>
  )
}

/** 2U mini server, with a spinning fan you can see through the grille. */
function MiniServer({ y, live }: { y: number; live: boolean }) {
  const fan = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (fan.current && live) fan.current.rotation.z += delta * 11
  })

  return (
    <RackPanel y={y} h={U * 2} d={0.44} material={M.steel}>
      <mesh position={[0, 0, 0.221]} material={M.blackMetal}>
        <boxGeometry args={[0.44, U * 2, 0.004]} />
      </mesh>
      {/* Fan behind a punched grille */}
      <group position={[-0.15, 0, 0.223]}>
        <mesh ref={fan} material={M.plasticDark}>
          <cylinderGeometry args={[0.028, 0.028, 0.004, 7]} />
        </mesh>
        <Grille position={[0, 0, 0.004]} w={0.062} h={0.062} step={0.011} />
      </group>
      {/* Drive bays */}
      {[0, 1].map((i) => (
        <mesh key={i} position={[0.02 + i * 0.07, 0, 0.223]} material={M.aluDark}>
          <boxGeometry args={[0.062, U * 1.5, 0.004]} />
        </mesh>
      ))}
      {/* Power button and diagnostics */}
      <mesh position={[0.19, 0.014, 0.224]} material={M.aluDark}>
        <cylinderGeometry args={[0.007, 0.007, 0.004, 12]} />
      </mesh>
      <Led position={[0.19, -0.006, 0.224]} color={LED_GREEN} on={live} r={0.003} />
      <Led position={[0.176, -0.006, 0.224]} color={LED_AMBER} on={false} r={0.003} />
      <Screw position={[-0.208, 0.014, 0.222]} />
      <Screw position={[-0.208, -0.014, 0.222]} />
    </RackPanel>
  )
}

/** UPS at the bottom, where the weight belongs. */
function Ups({ y, live }: { y: number; live: boolean }) {
  return (
    <group position={[0, y, 0]}>
      <mesh castShadow receiveShadow material={M.blackMetal}>
        <boxGeometry args={[0.46, 0.16, 0.36]} />
      </mesh>
      {/* Recessed front with an LCD and the load bar */}
      <mesh position={[0, 0, 0.181]} material={M.plasticDark}>
        <boxGeometry args={[0.42, 0.13, 0.004]} />
      </mesh>
      <mesh position={[-0.1, 0.02, 0.184]} material={live ? screenOn : screenOff}>
        <boxGeometry args={[0.09, 0.05, 0.002]} />
      </mesh>
      {live &&
        Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[-0.135 + i * 0.018, 0.006, 0.186]}>
            <boxGeometry args={[0.012, 0.004, 0.001]} />
            <meshStandardMaterial
              color={i < 3 ? LED_GREEN : '#1b2430'}
              emissive={i < 3 ? LED_GREEN : '#000'}
              emissiveIntensity={i < 3 ? 2 : 0}
              toneMapped={false}
            />
          </mesh>
        ))}
      <mesh position={[0.08, 0.02, 0.184]} material={M.aluDark}>
        <cylinderGeometry args={[0.014, 0.014, 0.004, 16]} />
      </mesh>
      <Led position={[0.15, 0.02, 0.185]} color={LED_GREEN} on={live} r={0.004} />
      <Vents position={[0.06, -0.036, 0.184]} count={10} w={0.005} h={0.03} gap={0.011} depth={0.003} />
      <Feet w={0.46} d={0.36} y={-0.083} />
    </group>
  )
}

const screenOn = new THREE.MeshStandardMaterial({
  color: '#0d2b33',
  emissive: TECH_CYAN,
  emissiveIntensity: 0.55,
  roughness: 0.3,
  toneMapped: false,
})
const screenOff = new THREE.MeshStandardMaterial({ color: '#0e1116', roughness: 0.3 })

/**
 * Patch leads between the panels. Short, routed down the side of the rack and
 * bundled — the detail that separates a real rack from a props cupboard.
 */
function RackCabling({ live }: { live: boolean }) {
  void live
  return (
    <group>
      {/* Panel-to-switch jumpers, looping down the right-hand post */}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = -0.12 + i * 0.036
        return (
          <Cable
            key={i}
            r={0.0035}
            points={[
              [x, 0.972, 0.09],
              [x + 0.02, 0.95 - i * 0.004, 0.16],
              [0.235, 0.93 - i * 0.008, 0.13],
              [0.235, 0.9 - i * 0.006, 0.05],
              [0.16 - i * 0.03, 0.888, 0.152],
            ]}
          />
        )
      })}
      {/* Uplink from switch to router */}
      <Cable
        r={0.004}
        points={[
          [-0.19, 0.885, 0.155],
          [-0.245, 0.87, 0.12],
          [-0.245, 0.83, 0.06],
          [-0.2, 0.802, 0.155],
        ]}
      />
      {/* Power feeds gathered down the back to the UPS */}
      {[-0.1, 0, 0.1].map((x, i) => (
        <Cable
          key={x}
          r={0.005}
          points={[
            [x, 0.88 - i * 0.12, -0.14],
            [x * 0.6, 0.7 - i * 0.06, -0.2],
            [0.04, 0.5, -0.19],
            [0.04, 0.36, -0.16],
          ]}
        />
      ))}
      {/* Uplink leaving the rack towards the desk */}
      <Cable
        r={0.005}
        points={[
          [-0.2, 0.8, 0.14],
          [-0.34, 0.7, 0.1],
          [-0.42, 0.36, -0.05],
          [-0.5, 0.06, -0.2],
          [-0.9, 0.035, -0.3],
        ]}
      />
    </group>
  )
}

/**
 * A Raspberry Pi on the shelf beside the rack, in an open acrylic case with a
 * GPIO ribbon running off to the breadboard. Every home lab has one.
 */
export function RaspberryPi({ position, live }: { position: [number, number, number]; live: boolean }) {
  return (
    <group position={position} rotation={[0, 0.4, 0]}>
      {/* Acrylic base */}
      <mesh position={[0, 0.002, 0]} castShadow>
        <boxGeometry args={[0.11, 0.004, 0.075]} />
        <meshPhysicalMaterial color="#1a2430" roughness={0.12} transmission={0.6} thickness={0.004} transparent opacity={0.7} />
      </mesh>
      {/* Board */}
      <mesh position={[0, 0.011, 0]} castShadow material={M.pcb}>
        <boxGeometry args={[0.085, 0.0016, 0.056]} />
      </mesh>
      {/* SoC and RAM */}
      <mesh position={[-0.005, 0.014, 0]} material={M.aluDark}>
        <boxGeometry args={[0.015, 0.004, 0.015]} />
      </mesh>
      {/* GPIO header */}
      <mesh position={[0, 0.015, -0.024]} material={M.plasticDark}>
        <boxGeometry args={[0.052, 0.006, 0.005]} />
      </mesh>
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={i} position={[-0.025 + i * 0.0026, 0.019, -0.024]} material={M.contact}>
          <boxGeometry args={[0.0008, 0.004, 0.0008]} />
        </mesh>
      ))}
      {/* USB stack and Ethernet */}
      <mesh position={[0.036, 0.017, 0.012]} material={M.alu}>
        <boxGeometry args={[0.014, 0.013, 0.017]} />
      </mesh>
      <mesh position={[0.036, 0.017, -0.014]} material={M.alu}>
        <boxGeometry args={[0.014, 0.013, 0.016]} />
      </mesh>
      <Led position={[-0.036, 0.013, 0.024]} color={LED_GREEN} on={live} r={0.0018} />
      <Led position={[-0.03, 0.013, 0.024]} color={LED_AMBER} on={live} r={0.0018} />
      {/* Ribbon off to the breadboard */}
      <Cable
        r={0.003}
        points={[
          [0, 0.018, -0.026],
          [0.02, 0.03, -0.07],
          [0.09, 0.016, -0.11],
          [0.15, 0.008, -0.13],
        ]}
        material={M.plastic}
      />
    </group>
  )
}
