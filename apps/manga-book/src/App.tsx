import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Experience } from "./components/Experience";
import { Loader, UI } from "./components/UI";
import { buildVolume, type Volume } from "./textures";
import { useBook } from "./state";
import { PAGES } from "./content/story";

export default function App() {
  const [textures, setTextures] = useState<Volume | null>(null);
  const [done, setDone] = useState(0);
  const toggleZoom = useBook((s) => s.toggleZoom);

  useEffect(() => {
    let cancelled = false;
    buildVolume((n) => !cancelled && setDone(n)).then((v) => {
      if (!cancelled) setTextures(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {!textures && <Loader done={done} total={PAGES.length} />}

      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ fov: 42, position: [1.15, 1.85, 2.55], near: 0.1, far: 60 }}
        onDoubleClick={toggleZoom}
        className="!fixed inset-0"
      >
        <color attach="background" args={["#0b0907"]} />
        {textures && <Experience textures={textures} />}
      </Canvas>

      {textures && <UI />}
    </>
  );
}
