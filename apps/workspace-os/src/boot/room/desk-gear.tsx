import { useRef } from 'react'
import * as THREE from 'three'
import { Cable, Feet, Led, LED_AMBER, LED_GREEN, M, Port, TECH_CYAN, Vents } from './kit'

/**
 * Everything that lives on, above or under the desk.
 *
 * Placement follows how the equipment is actually used: what the hands reach
 * sits within arm's length, what only gets glanced at goes to the outside, and
 * what is plugged in once and forgotten lives at the back or underneath. Small
 * misalignments are deliberate — a desk squared to the millimetre reads as a
 * render, not a workspace.
 */

/** Desk top surface. Everything standing on the desk starts here. */
export const DESK_Y = 0.765
/** Back edge of the desk, where arms and clamps bite. */
export const DESK_BACK_Z = -1.475

// ---------------------------------------------------------------------------
// Displays
// ---------------------------------------------------------------------------

const sideGlassOff = new THREE.MeshStandardMaterial({ color: '#07080b', roughness: 0.07, metalness: 0.1 })

/**
 * The flanking monitors. The centre one is the real display — the session's DOM
 * is transformed onto it — so these two carry quiet, unreadable content that
 * suggests work in progress without competing for attention.
 */
export function SideMonitor({
  x,
  yaw,
  on,
  variant,
}: {
  x: number
  yaw: number
  on: boolean
  variant: 'code' | 'logs'
}) {
  const w = 0.86
  const h = w * 0.62

  return (
    <group position={[x, DESK_Y, -1.16]} rotation={[0, yaw, 0]}>
      <MonitorArm reach={0.34} />
      <group position={[0, 0.62, 0.04]}>
        {/* Chassis */}
        <mesh castShadow material={M.blackMetal}>
          <boxGeometry args={[w + 0.02, h + 0.03, 0.026]} />
        </mesh>
        {/* Thin bezel, thicker chin, as every modern panel is */}
        <mesh position={[0, -h / 2 - 0.006, 0.014]} material={M.blackMetal}>
          <boxGeometry args={[w + 0.02, 0.018, 0.006]} />
        </mesh>
        {/* Glass */}
        <mesh position={[0, 0.004, 0.014]} material={sideGlassOff}>
          <planeGeometry args={[w - 0.012, h - 0.014]} />
        </mesh>
        {on && <PanelContent w={w - 0.02} h={h - 0.022} variant={variant} />}
        <Led position={[w / 2 - 0.03, -h / 2 - 0.006, 0.018]} color={LED_GREEN} on={on} r={0.0025} />
        {/* VESA hump and the cables leaving it */}
        <mesh position={[0, -0.02, -0.02]} material={M.plastic}>
          <boxGeometry args={[0.1, 0.1, 0.016]} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Content for the flanking panels: soft bands of light standing in for code and
 * log output. Deliberately abstract — legible text at this size would only ever
 * render as noise.
 */
function PanelContent({ w, h, variant }: { w: number; h: number; variant: 'code' | 'logs' }) {
  const rows = variant === 'code' ? 22 : 26
  const lines = useRef(
    Array.from({ length: rows }, (_, i) => ({
      // Deterministic pseudo-random, so the layout is stable across remounts.
      len: 0.18 + (((Math.sin(i * 12.9898 + (variant === 'code' ? 0 : 4)) * 43758.5453) % 1) + 1) * 0.34,
      indent: variant === 'code' ? ((i * 7) % 3) * 0.03 : 0,
      hue: (Math.sin(i * 3.17) + 1) / 2,
    })),
  )

  return (
    <group position={[0, 0, 0.0155]}>
      {/* Screen wash, so the panel glows as a whole rather than only where the
          bands are. */}
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          color="#0a1018"
          emissive={variant === 'code' ? '#16283c' : '#131c26'}
          emissiveIntensity={0.7}
          toneMapped={false}
        />
      </mesh>
      {lines.current.map((l, i) => (
        <mesh key={i} position={[-w / 2 + 0.03 + l.indent + (l.len * w * 0.5) / 2, h / 2 - 0.028 - i * (h / rows), 0.001]}>
          <planeGeometry args={[l.len * w * 0.5, h / rows / 2.6]} />
          <meshStandardMaterial
            color="#000000"
            emissive={l.hue > 0.72 ? TECH_CYAN : l.hue > 0.4 ? '#8fa6c4' : '#4c5f78'}
            emissiveIntensity={0.85}
            toneMapped={false}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * A gas-spring monitor arm: desk clamp, post, two articulated segments and a
 * VESA head. The joints are offset slightly so the arm reads as adjusted rather
 * than drawn straight.
 */
export function MonitorArm({
  reach = 0.4,
  /** The parent group's own position, so the clamp can find the desk's back
   *  edge from wherever the display happens to be mounted. Hard-coding this
   *  offset leaves the centre monitor's clamp floating behind the desk. */
  baseY = DESK_Y,
  baseZ = -1.16,
}: {
  reach?: number
  baseY?: number
  baseZ?: number
}) {
  return (
    <group>
      {/* Clamp, biting the back edge of the desk */}
      <group position={[0, DESK_Y - baseY, DESK_BACK_Z + 0.02 - baseZ]}>
        <mesh position={[0, 0.012, 0]} castShadow material={M.aluDark}>
          <boxGeometry args={[0.07, 0.024, 0.07]} />
        </mesh>
        <mesh position={[0, -0.03, 0]} material={M.aluDark}>
          <boxGeometry args={[0.05, 0.05, 0.02]} />
        </mesh>
        <mesh position={[0, -0.058, 0]} material={M.aluDark}>
          <cylinderGeometry args={[0.012, 0.012, 0.014, 12]} />
        </mesh>
        {/* Post */}
        <mesh position={[0, 0.19, 0]} castShadow material={M.alu}>
          <cylinderGeometry args={[0.017, 0.017, 0.36, 16]} />
        </mesh>
        {/* Lower segment, angled up */}
        <group position={[0, 0.36, 0]} rotation={[0.34, 0, 0]}>
          <mesh position={[0, 0, reach * 0.42]} castShadow material={M.alu}>
            <boxGeometry args={[0.036, 0.03, reach * 0.84]} />
          </mesh>
          {/* Elbow */}
          <group position={[0, 0, reach * 0.84]} rotation={[-0.62, 0, 0]}>
            <mesh material={M.aluDark}>
              <cylinderGeometry args={[0.021, 0.021, 0.04, 14]} />
            </mesh>
            <mesh position={[0, 0, reach * 0.3]} castShadow material={M.alu}>
              <boxGeometry args={[0.03, 0.026, reach * 0.6]} />
            </mesh>
            {/* VESA head */}
            <mesh position={[0, 0, reach * 0.6]} material={M.aluDark}>
              <boxGeometry args={[0.075, 0.075, 0.014]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

/** Webcam, clipped over the top edge of the centre monitor. */
export function Webcam({ y, z, live }: { y: number; z: number; live: boolean }) {
  return (
    <group position={[0.04, y, z]}>
      {/* Clip hooking back over the panel */}
      <mesh position={[0, -0.012, -0.012]} material={M.plasticDark}>
        <boxGeometry args={[0.05, 0.03, 0.03]} />
      </mesh>
      <mesh position={[0, 0.012, 0]} castShadow material={M.plastic}>
        <boxGeometry args={[0.07, 0.026, 0.026]} />
      </mesh>
      {/* Lens barrel and glass */}
      <mesh position={[0, 0.012, 0.014]} rotation={[Math.PI / 2, 0, 0]} material={M.plasticDark}>
        <cylinderGeometry args={[0.009, 0.011, 0.008, 18]} />
      </mesh>
      <mesh position={[0, 0.012, 0.019]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.002, 18]} />
        <meshPhysicalMaterial color="#05070c" roughness={0.03} metalness={0.2} clearcoat={1} />
      </mesh>
      {/* Privacy shutter, slid open */}
      <mesh position={[-0.019, 0.012, 0.015]} material={M.aluDark}>
        <boxGeometry args={[0.014, 0.02, 0.004]} />
      </mesh>
      <Led position={[0.024, 0.012, 0.014]} color={LED_GREEN} on={live} r={0.0022} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// Laptop
// ---------------------------------------------------------------------------

/** Laptop raised on an aluminium stand, lid open, screen dimmed. */
export function LaptopOnStand({ position, yaw, on }: { position: [number, number, number]; yaw: number; on: boolean }) {
  const w = 0.34
  const d = 0.24

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Stand: two folded aluminium rails */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.12, 0, 0]}>
          <mesh position={[0, 0.055, 0.03]} rotation={[0.38, 0, 0]} castShadow material={M.alu}>
            <boxGeometry args={[0.026, 0.008, 0.2]} />
          </mesh>
          <mesh position={[0, 0.012, 0.095]} material={M.alu}>
            <boxGeometry args={[0.026, 0.024, 0.03]} />
          </mesh>
          <mesh position={[0, 0.006, -0.055]} material={M.rubber}>
            <boxGeometry args={[0.03, 0.012, 0.05]} />
          </mesh>
        </group>
      ))}

      {/* Base, tilted on the stand */}
      <group position={[0, 0.088, 0.012]} rotation={[0.38, 0, 0]}>
        <mesh castShadow receiveShadow material={M.alu}>
          <boxGeometry args={[w, 0.012, d]} />
        </mesh>
        {/* Keyboard well and trackpad */}
        <mesh position={[0, 0.007, -0.03]} material={M.plasticDark}>
          <boxGeometry args={[w - 0.05, 0.002, 0.11]} />
        </mesh>
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 13 }, (__, c) => (
            <mesh key={`${r}-${c}`} position={[-0.132 + c * 0.022, 0.0095, -0.072 + r * 0.021]} material={M.keycap}>
              <boxGeometry args={[0.018, 0.002, 0.017]} />
            </mesh>
          )),
        )}
        <mesh position={[0, 0.0075, 0.062]} material={M.aluDark}>
          <boxGeometry args={[0.1, 0.001, 0.07]} />
        </mesh>
        {/* Ports on the left flank */}
        <Port position={[-w / 2 + 0.001, 0, -0.05]} w={0.004} h={0.008} />
        <Port position={[-w / 2 + 0.001, 0, -0.02]} w={0.004} h={0.008} />

        {/* Lid, hinged at the back edge and standing up from it. It extends
            along local +y so that the panel's own normal ends up facing the
            chair; laying it along -z instead folds the screen under the base. */}
        <group position={[0, 0.006, -d / 2]} rotation={[-0.62, 0, 0]}>
          <mesh position={[0, 0.108, -0.005]} castShadow material={M.alu}>
            <boxGeometry args={[w, 0.216, 0.008]} />
          </mesh>
          <mesh position={[0, 0.108, 0.0002]} material={on ? laptopScreenOn : M.glass}>
            <planeGeometry args={[w - 0.022, 0.196]} />
          </mesh>
          {on && (
            <group position={[0, 0.108, 0.0008]}>
              {Array.from({ length: 14 }, (_, i) => (
                <mesh key={i} position={[-0.1 + ((i * 13) % 5) * 0.014, 0.082 - i * 0.0125, 0]}>
                  <planeGeometry args={[0.04 + ((i * 7) % 4) * 0.026, 0.0045]} />
                  <meshStandardMaterial
                    color="#000"
                    emissive={i % 5 === 0 ? TECH_CYAN : '#7f95b4'}
                    emissiveIntensity={0.8}
                    toneMapped={false}
                    transparent
                    opacity={0.8}
                  />
                </mesh>
              ))}
            </group>
          )}
          {/* Camera notch and the maker's mark on the back of the lid */}
          <mesh position={[0, 0.203, 0.0008]} material={M.plasticDark}>
            <boxGeometry args={[0.03, 0.004, 0.001]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

const laptopScreenOn = new THREE.MeshStandardMaterial({
  color: '#080d14',
  emissive: '#16283c',
  emissiveIntensity: 0.6,
  roughness: 0.12,
  toneMapped: false,
})

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

/** Open-back headphones hung on an aluminium stand. */
export function HeadphoneStand({ position, yaw }: { position: [number, number, number]; yaw: number }) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Weighted base and post */}
      <mesh position={[0, 0.008, 0]} castShadow material={M.aluDark}>
        <cylinderGeometry args={[0.07, 0.075, 0.016, 28]} />
      </mesh>
      <mesh position={[0, 0.009, 0]} material={M.rubber}>
        <cylinderGeometry args={[0.058, 0.058, 0.002, 24]} />
      </mesh>
      <mesh position={[0, 0.13, 0]} castShadow material={M.alu}>
        <cylinderGeometry args={[0.012, 0.012, 0.25, 16]} />
      </mesh>
      {/* Yoke the band rests over */}
      <mesh position={[0, 0.255, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={M.alu}>
        <torusGeometry args={[0.035, 0.008, 10, 20, Math.PI]} />
      </mesh>

      {/* Headband, draped over the yoke */}
      <group position={[0, 0.246, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow material={M.plasticDark}>
          <torusGeometry args={[0.072, 0.007, 10, 26, Math.PI * 0.92]} />
        </mesh>
        {/* Padded top */}
        <mesh position={[0, 0.062, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.fabric}>
          <torusGeometry args={[0.05, 0.011, 8, 18, Math.PI * 0.7]} />
        </mesh>
        {/* Earcups */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.072, -0.028, 0]} rotation={[0, 0, s * 0.06]}>
            <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow material={M.blackMetal}>
              <cylinderGeometry args={[0.042, 0.045, 0.026, 26]} />
            </mesh>
            {/* Open-back grille */}
            <mesh position={[s * 0.014, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={M.aluDark}>
              <cylinderGeometry args={[0.036, 0.036, 0.003, 26]} />
            </mesh>
            {/* Velour pad */}
            <mesh position={[-s * 0.015, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={M.fabric}>
              <torusGeometry args={[0.03, 0.012, 8, 20]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* Cable falling from the left cup and coiling on the desk */}
      <Cable
        r={0.0035}
        points={[
          [-0.072, 0.212, 0.005],
          [-0.1, 0.13, 0.03],
          [-0.09, 0.04, 0.06],
          [-0.03, 0.006, 0.08],
          [0.05, 0.006, 0.055],
        ]}
      />
    </group>
  )
}

/** Large-diaphragm condenser on a boom, with shockmount and pop filter. */
export function StudioMic({ position, yaw }: { position: [number, number, number]; yaw: number }) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Desk clamp */}
      <mesh position={[0, 0.02, 0]} castShadow material={M.blackMetal}>
        <boxGeometry args={[0.05, 0.04, 0.05]} />
      </mesh>
      <mesh position={[0, -0.03, 0]} material={M.blackMetal}>
        <cylinderGeometry args={[0.014, 0.014, 0.06, 12]} />
      </mesh>
      <mesh position={[0, 0.05, 0]} castShadow material={M.blackMetal}>
        <cylinderGeometry args={[0.011, 0.011, 0.06, 12]} />
      </mesh>

      {/* Lower boom segment. The whole arm is pitched to carry the head clear
          above the displays — at desk height it fouls the left monitor, which
          is exactly where a real boom would be raised out of the way. */}
      <group position={[0, 0.08, 0]} rotation={[0, 0, -0.62]}>
        <mesh position={[0, 0.29, 0]} castShadow material={M.blackMetal}>
          <cylinderGeometry args={[0.009, 0.009, 0.58, 12]} />
        </mesh>
        {/* Spring, the giveaway detail on a real boom */}
        <mesh position={[0, 0.14, 0.014]} rotation={[0, 0, 0]} material={M.steel}>
          <cylinderGeometry args={[0.008, 0.008, 0.09, 10]} />
        </mesh>

        {/* Elbow into the upper segment */}
        <group position={[0, 0.58, 0]} rotation={[0, 0, 0.95]}>
          <mesh material={M.aluDark}>
            <cylinderGeometry args={[0.014, 0.014, 0.022, 12]} />
          </mesh>
          <mesh position={[0, 0.23, 0]} castShadow material={M.blackMetal}>
            <cylinderGeometry args={[0.008, 0.008, 0.46, 12]} />
          </mesh>

          {/* Head: shockmount, mic body, pop filter */}
          <group position={[0, 0.47, 0]} rotation={[0, 0, -0.62]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={M.blackMetal}>
              <torusGeometry args={[0.042, 0.005, 8, 22]} />
            </mesh>
            {/* Elastic suspension */}
            {[0.5, 1.4, 2.3, 3.3, 4.2, 5.1].map((a, i) => (
              <mesh key={i} position={[Math.cos(a) * 0.03, 0, Math.sin(a) * 0.03]} rotation={[0, -a, 0.5]} material={M.rubber}>
                <cylinderGeometry args={[0.0014, 0.0014, 0.035, 5]} />
              </mesh>
            ))}
            {/* Body */}
            <mesh castShadow material={M.aluDark}>
              <cylinderGeometry args={[0.024, 0.024, 0.11, 24]} />
            </mesh>
            {/* Grille basket */}
            <mesh position={[0, 0.062, 0]} material={M.steel}>
              <sphereGeometry args={[0.026, 20, 14, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
            </mesh>
            <mesh position={[0, 0.05, 0]} material={M.aluDark}>
              <cylinderGeometry args={[0.0262, 0.0262, 0.008, 24]} />
            </mesh>
            <Led position={[0, -0.02, 0.0245]} color={LED_AMBER} on r={0.0022} />
            {/* Pop filter on its gooseneck */}
            <group position={[0, 0.03, 0.075]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} material={M.plasticDark}>
                <torusGeometry args={[0.045, 0.004, 8, 24]} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.045, 24]} />
                <meshStandardMaterial color="#0e1116" roughness={0.9} transparent opacity={0.32} side={THREE.DoubleSide} />
              </mesh>
              <Cable
                r={0.0035}
                points={[
                  [0, -0.045, 0],
                  [0, -0.06, -0.03],
                  [0, -0.05, -0.06],
                ]}
                material={M.blackMetal}
              />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

/** Compact two-way desktop monitors, on isolation pads. */
export function DeskSpeaker({ position, yaw }: { position: [number, number, number]; yaw: number }) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Foam isolation wedge */}
      <mesh position={[0, 0.012, 0]} rotation={[-0.1, 0, 0]} material={M.rubber}>
        <boxGeometry args={[0.15, 0.024, 0.17]} />
      </mesh>
      <group position={[0, 0.135, 0]} rotation={[-0.1, 0, 0]}>
        <mesh castShadow receiveShadow material={M.plastic}>
          <boxGeometry args={[0.14, 0.22, 0.16]} />
        </mesh>
        {/* Baffle */}
        <mesh position={[0, 0, 0.081]} material={M.plasticDark}>
          <boxGeometry args={[0.13, 0.21, 0.004]} />
        </mesh>
        {/* Woofer with surround and dust cap */}
        <mesh position={[0, -0.045, 0.084]} rotation={[Math.PI / 2, 0, 0]} material={M.plasticDark}>
          <cylinderGeometry args={[0.046, 0.046, 0.004, 28]} />
        </mesh>
        <mesh position={[0, -0.045, 0.086]} rotation={[Math.PI / 2, 0, 0]} material={M.rubber}>
          <torusGeometry args={[0.04, 0.006, 8, 26]} />
        </mesh>
        <mesh position={[0, -0.045, 0.088]} rotation={[Math.PI / 2, 0, 0]} material={M.aluDark}>
          <cylinderGeometry args={[0.012, 0.012, 0.004, 16]} />
        </mesh>
        {/* Tweeter in its waveguide */}
        <mesh position={[0, 0.055, 0.084]} rotation={[Math.PI / 2, 0, 0]} material={M.plasticDark}>
          <cylinderGeometry args={[0.024, 0.024, 0.004, 22]} />
        </mesh>
        <mesh position={[0, 0.055, 0.087]} rotation={[Math.PI / 2, 0, 0]} material={M.alu}>
          <sphereGeometry args={[0.011, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        {/* Bass port */}
        <mesh position={[0, 0.098, 0.084]} rotation={[Math.PI / 2, 0, 0]} material={M.plasticDark}>
          <cylinderGeometry args={[0.014, 0.014, 0.006, 16]} />
        </mesh>
        <Led position={[0, -0.095, 0.085]} color={TECH_CYAN} on r={0.0028} />
      </group>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Small peripherals
// ---------------------------------------------------------------------------

/** Phone on a folding aluminium stand. */
export function PhoneOnStand({ position, yaw }: { position: [number, number, number]; yaw: number }) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.004, 0.02]} castShadow material={M.aluDark}>
        <boxGeometry args={[0.075, 0.008, 0.06]} />
      </mesh>
      <mesh position={[0, 0.045, -0.012]} rotation={[0.28, 0, 0]} castShadow material={M.aluDark}>
        <boxGeometry args={[0.065, 0.09, 0.007]} />
      </mesh>
      <mesh position={[0, 0.012, 0.04]} rotation={[0.28, 0, 0]} material={M.aluDark}>
        <boxGeometry args={[0.065, 0.016, 0.008]} />
      </mesh>
      {/* Handset */}
      <group position={[0, 0.062, 0.006]} rotation={[0.28, 0, 0]}>
        <mesh castShadow material={M.blackMetal}>
          <boxGeometry args={[0.072, 0.148, 0.008]} />
        </mesh>
        <mesh position={[0, 0, 0.0048]}>
          <planeGeometry args={[0.066, 0.14]} />
          <meshStandardMaterial color="#05070b" emissive="#0e1a2a" emissiveIntensity={0.35} roughness={0.06} toneMapped={false} />
        </mesh>
        {/* Camera island on the back */}
        <mesh position={[0.018, 0.052, -0.0055]} material={M.aluDark}>
          <boxGeometry args={[0.026, 0.026, 0.003]} />
        </mesh>
      </group>
      {/* Charge lead */}
      <Cable
        r={0.0025}
        points={[
          [0, 0.006, 0.045],
          [0.03, 0.004, 0.07],
          [0.11, 0.004, 0.08],
        ]}
      />
    </group>
  )
}

/** Multi-device charging dock with three pads and a status strip. */
export function ChargingStation({ position, yaw, live }: { position: [number, number, number]; yaw: number; live: boolean }) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.014, 0]} castShadow receiveShadow material={M.plastic}>
        <boxGeometry args={[0.24, 0.028, 0.11]} />
      </mesh>
      {/* Fabric top, as these usually have */}
      <mesh position={[0, 0.029, 0]} material={M.fabric}>
        <boxGeometry args={[0.232, 0.003, 0.104]} />
      </mesh>
      {[-0.075, 0, 0.075].map((x, i) => (
        <group key={x} position={[x, 0.031, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={M.rubber}>
            <torusGeometry args={[0.026, 0.002, 6, 22]} />
          </mesh>
          <Led position={[0, 0.002, 0.04]} color={i === 2 ? LED_AMBER : LED_GREEN} on={live} r={0.0022} />
        </group>
      ))}
      <Feet w={0.24} d={0.11} y={0.002} r={0.005} />
      <Cable
        r={0.004}
        points={[
          [-0.12, 0.014, -0.03],
          [-0.2, 0.01, -0.06],
          [-0.3, 0.006, -0.12],
        ]}
      />
    </group>
  )
}

/** Powered USB hub with a row of ports and per-port switches. */
export function UsbHub({ position, yaw, live }: { position: [number, number, number]; yaw: number; live: boolean }) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.011, 0]} castShadow receiveShadow material={M.alu}>
        <boxGeometry args={[0.16, 0.022, 0.055]} />
      </mesh>
      {Array.from({ length: 4 }, (_, i) => (
        <group key={i} position={[-0.054 + i * 0.036, 0.011, 0.028]}>
          <Port position={[0, 0, 0]} w={0.013} h={0.006} />
          <Led position={[0, 0.008, 0.002]} color={TECH_CYAN} on={live && i < 3} r={0.0018} />
        </group>
      ))}
      <Feet w={0.16} d={0.055} y={0.001} r={0.004} />
      <Cable
        r={0.003}
        points={[
          [-0.08, 0.011, -0.02],
          [-0.14, 0.008, -0.05],
          [-0.19, 0.005, -0.1],
        ]}
      />
    </group>
  )
}

/** Pocket NVMe enclosure, warm to the touch and slightly askew. */
export function ExternalSsd({ position, yaw }: { position: [number, number, number]; yaw: number }) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.006, 0]} castShadow receiveShadow material={M.alu}>
        <boxGeometry args={[0.095, 0.011, 0.055]} />
      </mesh>
      {/* Heat-sink fins along the top */}
      <Vents position={[0, 0.012, 0]} count={7} w={0.004} h={0.001} gap={0.011} depth={0.04} />
      <Port position={[-0.048, 0.006, 0]} w={0.009} h={0.004} />
      <Led position={[0.04, 0.012, 0.018]} color={TECH_CYAN} on r={0.0018} />
    </group>
  )
}

/** A few USB sticks, left where they were last put down. */
export function UsbDrives({ position }: { position: [number, number, number] }) {
  const sticks: { p: [number, number, number]; r: number; c: THREE.Material }[] = [
    { p: [0, 0.005, 0], r: 0.5, c: M.aluDark },
    { p: [0.045, 0.005, 0.028], r: -0.9, c: M.blackMetal },
    { p: [0.016, 0.005, 0.058], r: 1.9, c: M.plastic },
  ]
  return (
    <group position={position}>
      {sticks.map((s, i) => (
        <group key={i} position={s.p} rotation={[0, s.r, 0]}>
          <mesh castShadow material={s.c}>
            <boxGeometry args={[0.052, 0.009, 0.018]} />
          </mesh>
          <mesh position={[0.033, 0, 0]} material={M.alu}>
            <boxGeometry args={[0.016, 0.005, 0.012]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Insulated steel water bottle, lid on, condensation-free and slightly worn. */
export function WaterBottle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.4, 0]}>
      {/* Powder-coated body — less reflective than bare steel, and tapered. */}
      <mesh position={[0, 0.105, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.034, 0.037, 0.21, 30]} />
        <meshStandardMaterial color="#2c3440" metalness={0.35} roughness={0.48} />
      </mesh>
      {/* Shoulder into the neck */}
      <mesh position={[0, 0.218, 0]} castShadow material={M.aluDark}>
        <cylinderGeometry args={[0.019, 0.034, 0.018, 30]} />
      </mesh>
      <mesh position={[0, 0.234, 0]} material={M.aluDark}>
        <cylinderGeometry args={[0.019, 0.019, 0.016, 24]} />
      </mesh>
      {/* Screw lid with a knurled grip and a carry loop */}
      <mesh position={[0, 0.25, 0]} castShadow material={M.blackMetal}>
        <cylinderGeometry args={[0.021, 0.021, 0.018, 24]} />
      </mesh>
      <mesh position={[0, 0.262, 0.006]} rotation={[Math.PI / 2.4, 0, 0]} material={M.rubber}>
        <torusGeometry args={[0.013, 0.0035, 8, 18]} />
      </mesh>
      {/* Base ring, where it actually meets the desk */}
      <mesh position={[0, 0.002, 0]} material={M.rubber}>
        <cylinderGeometry args={[0.037, 0.037, 0.004, 30]} />
      </mesh>
    </group>
  )
}

/** Notebook, part-written, with a pen resting in the gutter. */
export function Notebook({ position, yaw }: { position: [number, number, number]; yaw: number }) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Closed lower half plus the open leaf, so it reads as in use */}
      <mesh position={[0, 0.007, 0]} castShadow receiveShadow material={M.woodDark}>
        <boxGeometry args={[0.2, 0.014, 0.26]} />
      </mesh>
      <mesh position={[0, 0.016, 0]} material={M.paper}>
        <boxGeometry args={[0.194, 0.005, 0.254]} />
      </mesh>
      {/* Ruled writing, abstracted to soft strokes */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-0.03 + ((i * 5) % 3) * 0.012, 0.0192, -0.09 + i * 0.021]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.09 + ((i * 11) % 5) * 0.014, 0.0022]} />
          <meshStandardMaterial color="#3d4653" roughness={0.9} />
        </mesh>
      ))}
      {/* Elastic closure */}
      <mesh position={[0.082, 0.011, 0]} material={M.rubber}>
        <boxGeometry args={[0.005, 0.019, 0.258]} />
      </mesh>
      {/* Pen */}
      <group position={[0.045, 0.024, 0.02]} rotation={[0, 0.22, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow material={M.blackMetal}>
          <cylinderGeometry args={[0.005, 0.005, 0.14, 12]} />
        </mesh>
        <mesh position={[0, 0, 0.076]} rotation={[Math.PI / 2, 0, 0]} material={M.aluDark}>
          <coneGeometry args={[0.005, 0.016, 12]} />
        </mesh>
        <mesh position={[0, 0.005, -0.04]} material={M.alu}>
          <boxGeometry args={[0.003, 0.004, 0.03]} />
        </mesh>
      </group>
    </group>
  )
}

/** Sticky notes, stuck down at slightly different angles. */
export function StickyNotes({ position }: { position: [number, number, number] }) {
  const notes: { p: [number, number, number]; r: number; c: string }[] = [
    { p: [0, 0, 0], r: 0.12, c: '#e8d97a' },
    { p: [0.085, 0.0006, 0.02], r: -0.28, c: '#e2a3b8' },
    { p: [0.042, 0.0012, 0.085], r: 0.34, c: '#a8d3c6' },
  ]
  return (
    <group position={position}>
      {notes.map((n, i) => (
        <mesh key={i} position={n.p} rotation={[-Math.PI / 2, 0, n.r]}>
          <planeGeometry args={[0.062, 0.062]} />
          <meshStandardMaterial color={n.c} roughness={0.92} />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Under the desk
// ---------------------------------------------------------------------------

/**
 * Cable-management tray slung under the desk, with the power strip inside it
 * and the bundle leaving towards the wall. This is the bit that makes a desk
 * look owned rather than delivered.
 */
export function CableTray({ live }: { live: boolean }) {
  return (
    <group position={[0.1, 0.6, -1.05]}>
      {/* Mesh basket */}
      <mesh material={M.steel}>
        <boxGeometry args={[0.9, 0.006, 0.2]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.03, s * 0.1]} material={M.steel}>
          <boxGeometry args={[0.9, 0.06, 0.005]} />
        </mesh>
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[-0.42 + i * 0.065, 0.03, 0]} material={M.steel}>
          <boxGeometry args={[0.004, 0.058, 0.2]} />
        </mesh>
      ))}
      {/* Brackets up to the underside of the desk */}
      {[-0.38, 0.38].map((x) => (
        <mesh key={x} position={[x, 0.075, 0]} material={M.steel}>
          <boxGeometry args={[0.02, 0.09, 0.14]} />
        </mesh>
      ))}

      {/* Surge-protected power strip, sitting in the tray */}
      <group position={[-0.12, 0.028, 0]}>
        <mesh castShadow material={M.plastic}>
          <boxGeometry args={[0.4, 0.036, 0.075]} />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[-0.16 + i * 0.064, 0.019, 0]} material={M.plasticDark}>
            <boxGeometry args={[0.042, 0.003, 0.05]} />
          </mesh>
        ))}
        <mesh position={[0.175, 0.019, 0]} material={live ? switchOn : M.plasticDark}>
          <boxGeometry args={[0.028, 0.004, 0.026]} />
        </mesh>
      </group>

      {/* The bundle, dressed and leaving towards the wall */}
      <Cable r={0.014} points={[[0.3, 0.02, 0], [0.44, 0.0, -0.02], [0.6, -0.22, -0.1], [0.72, -0.55, -0.24]]} />
      {[0.42, 0.55].map((t, i) => (
        <mesh key={t} position={[0.38 + i * 0.14, 0.005 - i * 0.14, -0.02 - i * 0.05]} rotation={[0, 0, 0.7]} material={M.rubber}>
          <torusGeometry args={[0.017, 0.004, 6, 14]} />
        </mesh>
      ))}
    </group>
  )
}

const switchOn = new THREE.MeshStandardMaterial({
  color: '#c8503f',
  emissive: '#c8503f',
  emissiveIntensity: 1.6,
  toneMapped: false,
})

// ---------------------------------------------------------------------------
// Electronics bench items
// ---------------------------------------------------------------------------

/** Breadboard with a part-built circuit and jumper wires. */
export function Breadboard({ position, yaw }: { position: [number, number, number]; yaw: number }) {
  const jumpers: { a: [number, number, number]; b: [number, number, number]; c: string }[] = [
    { a: [-0.05, 0.008, -0.02], b: [0.01, 0.03, 0.02], c: '#c0392b' },
    { a: [-0.03, 0.008, 0.01], b: [0.04, 0.026, -0.01], c: '#2c6fbb' },
    { a: [0.0, 0.008, -0.03], b: [0.06, 0.022, 0.02], c: '#d9b23a' },
    { a: [0.02, 0.008, 0.03], b: [-0.06, 0.024, -0.01], c: '#3f9e57' },
  ]

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Board with its centre channel */}
      <mesh position={[0, 0.005, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.17, 0.01, 0.06]} />
        <meshStandardMaterial color="#e4e2dc" roughness={0.66} />
      </mesh>
      <mesh position={[0, 0.0102, 0]}>
        <boxGeometry args={[0.16, 0.001, 0.008]} />
        <meshStandardMaterial color="#c9c6bf" roughness={0.7} />
      </mesh>
      {/* Contact holes, as a sparse grid — enough to read, not enough to cost */}
      {Array.from({ length: 2 }, (_, band) =>
        Array.from({ length: 26 }, (_, c) =>
          Array.from({ length: 2 }, (__, r) => (
            <mesh
              key={`${band}-${c}-${r}`}
              position={[-0.078 + c * 0.006, 0.0104, (band ? 1 : -1) * (0.009 + r * 0.007)]}
              material={M.plasticDark}
            >
              <boxGeometry args={[0.0016, 0.0008, 0.0016]} />
            </mesh>
          )),
        ),
      )}
      {/* A DIP chip and a few discretes */}
      <mesh position={[-0.02, 0.014, 0]} material={M.plasticDark}>
        <boxGeometry args={[0.026, 0.007, 0.017]} />
      </mesh>
      <mesh position={[0.04, 0.013, -0.014]} rotation={[0, 0, Math.PI / 2]} material={M.paper}>
        <cylinderGeometry args={[0.003, 0.003, 0.012, 10]} />
      </mesh>
      <mesh position={[0.058, 0.016, 0.008]} material={M.aluDark}>
        <cylinderGeometry args={[0.006, 0.006, 0.012, 14]} />
      </mesh>
      {jumpers.map((j, i) => (
        <Cable
          key={i}
          r={0.0016}
          segments={16}
          points={[j.a, [(j.a[0] + j.b[0]) / 2, 0.032, (j.a[2] + j.b[2]) / 2], j.b]}
          material={jumperMat(j.c)}
        />
      ))}
    </group>
  )
}

const jumperMats = new Map<string, THREE.Material>()
function jumperMat(c: string) {
  let m = jumperMats.get(c)
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 })
    jumperMats.set(c, m)
  }
  return m
}

/** Digital multimeter with probes coiled beside it. */
export function Multimeter({ position, yaw, live }: { position: [number, number, number]; yaw: number; live: boolean }) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.018, 0]} rotation={[-0.16, 0, 0]} castShadow receiveShadow material={M.plastic}>
        <boxGeometry args={[0.09, 0.028, 0.16]} />
      </mesh>
      <group rotation={[-0.16, 0, 0]} position={[0, 0.018, 0]}>
        {/* Protective boot */}
        <mesh position={[0, 0, 0]} material={M.rubber}>
          <boxGeometry args={[0.096, 0.024, 0.166]} />
        </mesh>
        <mesh position={[0, 0.015, 0]} material={M.plastic}>
          <boxGeometry args={[0.088, 0.004, 0.158]} />
        </mesh>
        {/* LCD */}
        <mesh position={[0, 0.0175, -0.045]}>
          <boxGeometry args={[0.066, 0.002, 0.042]} />
          <meshStandardMaterial
            color={live ? '#93a88c' : '#4a5250'}
            emissive={live ? '#9fc39a' : '#000'}
            emissiveIntensity={live ? 0.5 : 0}
            roughness={0.4}
            toneMapped={false}
          />
        </mesh>
        {/* Rotary selector */}
        <mesh position={[0, 0.019, 0.025]} material={M.plasticDark}>
          <cylinderGeometry args={[0.026, 0.026, 0.006, 24]} />
        </mesh>
        <mesh position={[0, 0.023, 0.014]} material={M.paper}>
          <boxGeometry args={[0.005, 0.002, 0.016]} />
        </mesh>
        {/* Input jacks */}
        {[-0.024, 0, 0.024].map((x) => (
          <mesh key={x} position={[x, 0.018, 0.068]} material={M.plasticDark}>
            <cylinderGeometry args={[0.006, 0.006, 0.004, 14]} />
          </mesh>
        ))}
      </group>
      {/* Probe leads, coiled the way they end up */}
      <Cable
        r={0.0026}
        points={[
          [-0.024, 0.02, 0.08],
          [-0.06, 0.004, 0.12],
          [-0.13, 0.004, 0.1],
          [-0.15, 0.004, 0.03],
          [-0.1, 0.004, 0.0],
        ]}
        material={jumperMat('#1b1d22')}
      />
      <Cable
        r={0.0026}
        points={[
          [0.024, 0.02, 0.08],
          [0.06, 0.004, 0.13],
          [0.14, 0.004, 0.11],
          [0.16, 0.004, 0.04],
        ]}
        material={jumperMat('#8c2f2a')}
      />
    </group>
  )
}

/** Open electronics toolkit: driver bits in a foam tray, a few tools out. */
export function Toolkit({ position, yaw }: { position: [number, number, number]; yaw: number }) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Case with the lid folded back */}
      <mesh position={[0, 0.014, 0]} castShadow receiveShadow material={M.blackMetal}>
        <boxGeometry args={[0.24, 0.028, 0.15]} />
      </mesh>
      <mesh position={[0, 0.03, 0]} material={M.plasticDark}>
        <boxGeometry args={[0.232, 0.006, 0.142]} />
      </mesh>
      {/* Bit tray */}
      {Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 10 }, (__, c) => (
          <group key={`${r}-${c}`} position={[-0.098 + c * 0.022, 0.035, -0.038 + r * 0.032]}>
            <mesh material={M.plasticDark}>
              <cylinderGeometry args={[0.0055, 0.0055, 0.004, 8]} />
            </mesh>
            {(r * 10 + c) % 7 !== 3 && (
              <mesh position={[0, 0.005, 0]} material={M.steel}>
                <cylinderGeometry args={[0.003, 0.003, 0.014, 6]} />
              </mesh>
            )}
          </group>
        )),
      )}
      {/* Driver handle laid across the case */}
      <group position={[0.03, 0.045, 0.095]} rotation={[0, 0.34, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow material={M.plastic}>
          <cylinderGeometry args={[0.011, 0.013, 0.09, 16]} />
        </mesh>
        <mesh position={[0, 0, 0.075]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
          <cylinderGeometry args={[0.0035, 0.0035, 0.07, 10]} />
        </mesh>
      </group>
      {/* Tweezers */}
      <group position={[-0.075, 0.042, 0.1]} rotation={[0, -0.5, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.003, 0, 0]} rotation={[Math.PI / 2, 0, s * 0.03]} material={M.steel}>
            <cylinderGeometry args={[0.0018, 0.0008, 0.085, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
