import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import { Book, PAGE_HEIGHT, stackDepth } from "./Book";
import { Desk, Dust } from "./Desk";
import { useBook } from "../state";
import type { Volume } from "../textures";

/**
 * Camera stations. The book lies flat on the desk, so reading means looking
 * down at it from slightly in front — the angle you actually hold a book at.
 */
const STATIONS = {
  /** shut: the volume sits to one side of the spine, so we frame it there */
  closed: { pos: [-1.05, 1.75, 2.35], target: [0.62, 0.06, 0.02] },
  reading: { pos: [0, 2.72, 1.62], target: [0, 0, 0.04] },
  zoomed: { pos: [0, 1.78, 0.95], target: [0, 0, 0] },
} as const;

function CameraRig() {
  const { camera } = useThree();
  const started = useBook((s) => s.started);
  const sheet = useBook((s) => s.sheet);
  const zoomed = useBook((s) => s.zoomed);
  const target = useRef(new THREE.Vector3(...STATIONS.closed.target));
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const closed = !started || sheet === 0;
    const station = zoomed ? STATIONS.zoomed : closed ? STATIONS.closed : STATIONS.reading;

    // "never static" — a couple of pixels of parallax, eased hard
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;
    const drift: [number, number, number] = [
      station.pos[0] + pointer.current.x * 0.16,
      station.pos[1] + pointer.current.y * 0.09,
      station.pos[2] + Math.abs(pointer.current.x) * -0.04,
    ];

    easing.damp3(camera.position, drift, closed ? 0.9 : 0.55, delta);
    easing.damp3(target.current, station.target as unknown as [number, number, number], 0.5, delta);
    camera.lookAt(target.current);
  });

  return null;
}

/** The book breathes a little and settles after each turn. */
function BookRig({ textures }: { textures: Volume }) {
  const group = useRef<THREE.Group>(null!);
  const sheet = useBook((s) => s.sheet);
  const last = useRef(sheet);
  const impulse = useRef(0);
  const rest = useRef({ y: stackDepth(sheet) + 0.004 });

  useFrame((state, delta) => {
    if (!group.current) return;
    if (last.current !== sheet) {
      impulse.current = 1;
      last.current = sheet;
    }
    impulse.current = Math.max(0, impulse.current - delta * 3.4);

    const t = state.clock.elapsedTime;
    const bounce = Math.sin(impulse.current * Math.PI * 3) * impulse.current * 0.012;
    // the block hangs below the spread, so the rig rides on top of it
    easing.damp(rest.current, "y", stackDepth(sheet) + 0.004, 0.3, delta);
    group.current.position.y = rest.current.y + bounce + Math.sin(t * 0.6) * 0.0015;
    easing.dampAngle(group.current.rotation, "z", impulse.current * 0.006, 0.25, delta);
  });

  return (
    <group ref={group} rotation-x={-Math.PI / 2}>
      <Book textures={textures} />
    </group>
  );
}

export function Experience({ textures }: { textures: Volume }) {
  return (
    <>
      <CameraRig />

      {/* key: the desk lamp, warm and low */}
      <spotLight
        position={[-2.6, 4.2, 2.2]}
        angle={0.62}
        penumbra={0.85}
        intensity={42}
        color="#ffd7a3"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {/* fill */}
      <directionalLight position={[3.2, 2.4, 2.8]} intensity={0.5} color="#cfe0ff" />
      {/* rim, so the page edges read against the dark room */}
      <directionalLight position={[0, 1.4, -4]} intensity={0.9} color="#ffe9c8" />
      <ambientLight intensity={0.22} color="#8fa4c4" />

      <Environment resolution={256}>
        <Lightformer
          intensity={2.4}
          color="#ffe0b8"
          position={[-2, 3, 2]}
          scale={[6, 6, 1]}
        />
        <Lightformer intensity={0.7} color="#9fb8e0" position={[3, 2, -2]} scale={[5, 5, 1]} />
        <Lightformer intensity={0.4} color="#ffffff" position={[0, -3, 0]} scale={[10, 10, 1]} />
      </Environment>

      <BookRig textures={textures} />

      <ContactShadows
        position={[0, 0.002, 0]}
        opacity={0.62}
        scale={9}
        blur={2.1}
        far={1.4}
        resolution={1024}
        color="#2a1a0c"
      />

      <Desk />
      <Dust />

      <fog attach="fog" args={["#0b0907", 5.5, 15]} />
    </>
  );
}

export { PAGE_HEIGHT };
