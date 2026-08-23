import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { rng } from "../pages/draw";

/** Procedural oak. Cheaper than a 2K PBR download and it tiles cleanly. */
function woodTexture() {
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const x = c.getContext("2d")!;
  const r = rng(0x5eed);

  const g = x.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, "#7a5233");
  g.addColorStop(0.5, "#6b4529");
  g.addColorStop(1, "#5d3b22");
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);

  // grain
  for (let i = 0; i < 260; i++) {
    const y0 = r() * size;
    const amp = 4 + r() * 26;
    const freq = 0.004 + r() * 0.01;
    x.beginPath();
    x.moveTo(0, y0);
    for (let px = 0; px <= size; px += 8) {
      x.lineTo(px, y0 + Math.sin(px * freq + i) * amp);
    }
    x.strokeStyle = `rgba(${r() > 0.5 ? "40,25,12" : "150,110,70"},${0.04 + r() * 0.12})`;
    x.lineWidth = 0.6 + r() * 3.4;
    x.stroke();
  }

  // knots
  for (let k = 0; k < 3; k++) {
    const kx = r() * size;
    const ky = r() * size;
    for (let i = 0; i < 22; i++) {
      x.beginPath();
      x.ellipse(kx, ky, 4 + i * 3.2, 2 + i * 1.5, 0.5, 0, Math.PI * 2);
      x.strokeStyle = `rgba(46,28,14,${0.24 - i * 0.01})`;
      x.lineWidth = 1.6;
      x.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = 8;
  return tex;
}

function Mug({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} castShadow>
      <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.16, 0.13, 0.32, 32, 1, true]} />
        <meshStandardMaterial color="#dcd6c8" roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.02, 32]} />
        <meshStandardMaterial color="#cfc7b6" roughness={0.6} />
      </mesh>
      {/* coffee */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.148, 0.148, 0.01, 32]} />
        <meshStandardMaterial color="#2a170c" roughness={0.25} metalness={0.1} />
      </mesh>
      {/* handle */}
      <mesh position={[0.18, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.075, 0.02, 12, 28, Math.PI * 1.3]} />
        <meshStandardMaterial color="#dcd6c8" roughness={0.55} />
      </mesh>
    </group>
  );
}

function Pencil({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.6, 6]} />
        <meshStandardMaterial color="#c9a227" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.33, 0]} castShadow>
        <coneGeometry args={[0.022, 0.07, 6]} />
        <meshStandardMaterial color="#e0cba2" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.365, 0]}>
        <coneGeometry args={[0.009, 0.02, 6]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.315, 0]} castShadow>
        <cylinderGeometry args={[0.023, 0.023, 0.05, 8]} />
        <meshStandardMaterial color="#b0413a" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Notebook({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.035, 0]}>
        <boxGeometry args={[0.92, 0.07, 1.24]} />
        <meshStandardMaterial color="#e8e0cc" roughness={0.95} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.074, 0]}>
        <boxGeometry args={[0.94, 0.012, 1.26]} />
        <meshStandardMaterial color="#243040" roughness={0.7} />
      </mesh>
    </group>
  );
}

/** Post-its stuck to the desk, the way notes actually accumulate. */
function StickyNotes() {
  const notes: { p: [number, number, number]; r: number; c: string }[] = [
    { p: [-1.95, 0.002, -0.85], r: 0.22, c: "#f0d95e" },
    { p: [-1.62, 0.003, -0.62], r: -0.14, c: "#f2b8a0" },
    { p: [2.05, 0.002, 0.95], r: 0.42, c: "#bfe3a8" },
  ];
  return (
    <>
      {notes.map((n, i) => (
        <mesh key={i} position={n.p} rotation={[-Math.PI / 2, 0, n.r]} receiveShadow>
          <planeGeometry args={[0.36, 0.36]} />
          <meshStandardMaterial color={n.c} roughness={0.95} />
        </mesh>
      ))}
    </>
  );
}

export function Desk() {
  const wood = useMemo(woodTexture, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial map={wood} roughness={0.78} metalness={0.02} />
      </mesh>
      <Mug position={[-2.35, 0, 1.05]} />
      <Pencil position={[1.95, 0.022, 1.15]} rotation={0.35} />
      <Notebook position={[2.55, 0, -0.55]} rotation={-0.18} />
      <StickyNotes />
    </group>
  );
}

/** Motes drifting through the lamp light. */
export function Dust({ count = 420 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const { geometry, speeds } = useMemo(() => {
    const r = rng(0xd057);
    const pos = new Float32Array(count * 3);
    const speeds = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * 9;
      pos[i * 3 + 1] = r() * 3.2;
      pos[i * 3 + 2] = (r() - 0.5) * 7;
      speeds[i * 2] = 0.02 + r() * 0.06;
      speeds[i * 2 + 1] = r() * Math.PI * 2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geometry, speeds };
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const rise = speeds[i * 2];
      const phase = speeds[i * 2 + 1];
      arr[i * 3 + 1] += rise * 0.004;
      if (arr[i * 3 + 1] > 3.4) arr[i * 3 + 1] = 0.05;
      arr[i * 3] += Math.sin(t * 0.25 + phase) * 0.0009;
      arr[i * 3 + 2] += Math.cos(t * 0.19 + phase) * 0.0009;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.016}
        sizeAttenuation
        color="#ffe6bd"
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
