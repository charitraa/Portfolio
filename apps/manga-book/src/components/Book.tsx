import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import { PAGES, SHEET_COUNT } from "../content/story";
import { useBook } from "../state";
import { sfx } from "../audio";
import { clamp01, release, turn } from "../turn";
import type { Volume } from "../textures";

/* ── physical dimensions of the volume ─────────────────────────── */

export const PAGE_WIDTH = 1.28;
export const PAGE_HEIGHT = 1.81;
const PAGE_DEPTH = 0.008;
const COVER_DEPTH = 0.024;

/**
 * Paper always stacks *below* the open spread, so how far the block hangs
 * down depends on which half is thicker. The rig lifts the book by this
 * much to keep the bottom sheet resting on the desk.
 */
export const stackDepth = (sheet: number) =>
  Math.max(sheet, SHEET_COUNT - sheet) * PAGE_DEPTH + COVER_DEPTH;

export const bookThickness = (SHEET_COUNT - 2) * PAGE_DEPTH + COVER_DEPTH * 2;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

/**
 * A page is a box subdivided across its width and bound to a chain of bones,
 * one per segment. Rotating the chain with a delay per bone is what makes
 * paper bend and settle instead of pivoting like a flat card.
 */
function buildPageGeometry(depth: number) {
  const geometry = new THREE.BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    depth,
    PAGE_SEGMENTS,
    2
  );
  geometry.translate(PAGE_WIDTH / 2, 0, 0); // hinge at the spine

  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const skinIndexes: number[] = [];
  const skinWeights: number[] = [];

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;
    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
    const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }

  geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndexes, 4));
  geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));
  return geometry;
}

const pageGeometry = buildPageGeometry(PAGE_DEPTH);
const coverGeometry = buildPageGeometry(COVER_DEPTH);

const paperEdge = new THREE.MeshStandardMaterial({
  color: "#e6dcc2",
  roughness: 0.96,
  metalness: 0,
});
const coverEdge = new THREE.MeshStandardMaterial({
  color: "#151b25",
  roughness: 0.62,
  metalness: 0.06,
});

/* ── the shape of a bending sheet ──────────────────────────────── */

const HALF = Math.PI / 2;

/** how far the free edge trails the spine at the peak of a turn, in radians */
const CURL = 1.12;
/** paper never lies perfectly flat once it has been bound — a slight spring up */
const REST_BOW = 0.05;
/** the gutter: a sheet has to climb out of the binding before it settles */
const GUTTER = 0.3;
/** twist along the length, so the far corner droops as the page swings */
const TWIST = 0.22;

const smoothstep = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

/**
 * Accumulated bend at distance `u` along the sheet (0 at the spine, 1 at the
 * free edge). Curvature peaks halfway out and falls to nothing at the tip,
 * which is exactly how a held page looks: creased near the binding, dead
 * straight along the last third.
 */
const bendShape = (u: number) => smoothstep(u * 1.06);

/**
 * The gutter hump: the sheet climbs out of the binding over the first quarter
 * and comes back down onto the block by halfway. A full period means the two
 * halves cancel, so the outer half of the page ends up lying flat again rather
 * than floating above the stack or diving through the desk.
 */
const gutterShape = (u: number) => Math.sin(2 * Math.PI * Math.min(1, u / 0.5));

/* ── page materials ────────────────────────────────────────────── */

type PageUniforms = {
  uPeel: { value: number };
  uShow: { value: number };
  uOther: { value: THREE.Texture };
};

/**
 * Standard paper, plus two things the stock material cannot do:
 * a corner that lifts under the cursor, and ink from the far side of the
 * sheet showing faintly through it.
 */
function pageMaterial(map: THREE.Texture, other: THREE.Texture) {
  const material = new THREE.MeshStandardMaterial({
    map,
    roughness: 0.92,
    metalness: 0,
    emissive: new THREE.Color("#ffb37a"),
    emissiveIntensity: 0,
  });

  const uniforms: PageUniforms = {
    uPeel: { value: 0 },
    uShow: { value: 0 },
    uOther: { value: other },
  };

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nuniform float uPeel;`)
      .replace(
        "#include <skinning_vertex>",
        `#include <skinning_vertex>
        {
          float pu = position.x / ${PAGE_WIDTH.toFixed(4)};
          float pv = position.y / ${PAGE_HEIGHT.toFixed(4)} + 0.5;
          // only the outer, near corner lifts — the rest of the sheet stays down
          float grip = smoothstep(0.52, 1.0, pu) * (1.0 - smoothstep(0.0, 0.46, pv));
          transformed.z += uPeel * grip * 0.13;
          transformed.x -= uPeel * grip * 0.045; // paper shortens as it bows
        }`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>\nuniform sampler2D uOther;\nuniform float uShow;`
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        {
          // real paper is not opaque: the ink printed on the far side shows
          // through, mirrored, and much more so with a lamp behind the sheet
          vec3 behind = texture2D(uOther, vec2(1.0 - vMapUv.x, vMapUv.y)).rgb;
          diffuseColor.rgb = mix(diffuseColor.rgb, min(diffuseColor.rgb, behind), uShow);
        }`
      );
  };

  return { material, uniforms };
}

type SheetProps = {
  number: number;
  front: THREE.Texture;
  back: THREE.Texture;
  page: number;
  opened: boolean;
  bookClosed: boolean;
  isCover: boolean;
  onGrab: (e: ThreeEvent<PointerEvent>) => void;
  onHover: (number: number, e: ThreeEvent<PointerEvent>) => void;
};

function Sheet({
  number,
  front,
  back,
  page,
  opened,
  bookClosed,
  isCover,
  onGrab,
  onHover,
}: SheetProps) {
  const group = useRef<THREE.Group>(null!);
  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);

  /** 0 = lying to the right of the spine, 1 = turned over to the left */
  const t = useRef(opened ? 1 : 0);
  /** which way the sheet was last travelling — the bend trails the motion */
  const travel = useRef(1);
  const peel = useRef(0);

  const { mesh, faceMaterials, uniforms } = useMemo(() => {
    const bones: THREE.Bone[] = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new THREE.Bone();
      bones.push(bone);
      bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH;
      if (i > 0) bones[i - 1].add(bone);
    }
    const skeleton = new THREE.Skeleton(bones);

    const a = pageMaterial(front, back);
    const b = pageMaterial(back, front);
    const faceMaterials = [a.material, b.material];
    const uniforms = [a.uniforms, b.uniforms];

    const edge = isCover ? coverEdge : paperEdge;
    const materials = [edge, edge, edge, edge, faceMaterials[0], faceMaterials[1]];

    const mesh = new THREE.SkinnedMesh(
      isCover ? coverGeometry : pageGeometry,
      materials
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return { mesh, faceMaterials, uniforms };
  }, [front, back, isCover]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const bones = mesh.skeleton.bones;
    const held = turn.active === number;

    /* where the sheet wants to be */
    const target = held ? turn.t : opened ? 1 : 0;
    const before = t.current;
    // a sheet under the finger tracks it almost exactly; one that has been let
    // go — whether by the drag or by a button — settles at its own weight
    easing.damp(t, "current", target, held && !turn.settling ? 0.05 : 0.34, delta);
    const speed = delta > 0 ? (t.current - before) / delta : 0;
    // once the page stops moving it keeps the bend it had, like real paper
    if (Math.abs(speed) > 0.05) travel.current = Math.sign(speed);

    /* the corner peel under the cursor */
    const wantsPeel = turn.peeled === number && !held && t.current < 0.02;
    easing.damp(peel, "current", wantsPeel ? 1 : 0, 0.22, delta);

    /**
     * A positive angle swings a sheet's free edge down towards the desk, so
     * every resting shape has to be signed by the half it is lying on or the
     * two sides of the spread come out mirrored instead of matching.
     */
    const side = Math.cos(Math.PI * clamp01(t.current)); // +1 right, -1 left
    // the deeper into its half a sheet is buried, the more it splays
    const buried = Math.min(opened ? page - 1 - number : number - page, 8);
    const fan = bookClosed
      ? 0
      : THREE.MathUtils.degToRad(Math.max(0, buried) * 0.3) * (opened ? -1 : 1);
    const root = THREE.MathUtils.lerp(HALF, -HALF, t.current) + fan;
    // a turn bends the sheet hardest halfway across and not at all at rest
    const arc = Math.sin(Math.PI * clamp01(t.current)) ** 0.85;

    // board is far stiffer than paper — a cover swings, it does not billow
    const limp = isCover ? 0.28 : 1;
    const bend = bookClosed ? 0 : limp * (CURL * arc * travel.current - REST_BOW * side);
    const gutter = bookClosed ? 0 : -limp * GUTTER * side;
    const twist = bookClosed ? 0 : limp * TWIST * arc * travel.current;

    for (let i = 0; i < bones.length; i++) {
      const node = i === 0 ? group.current : bones[i];

      if (i === 0) {
        easing.dampAngle(node.rotation, "y", root, held ? 0.05 : 0.28, delta);
        easing.dampAngle(node.rotation, "x", 0, 0.3, delta);
        continue;
      }

      const u = i / PAGE_SEGMENTS;
      const prev = (i - 1) / PAGE_SEGMENTS;

      // each bone carries only its own share of the accumulated bend
      const y =
        bend * (bendShape(u) - bendShape(prev)) +
        gutter * (gutterShape(u) - gutterShape(prev));
      const x = twist * (bendShape(u) - bendShape(prev));

      // the further out the bone, the later it reacts — that lag is the whip
      // you see when a page is flicked rather than dragged
      const lag = 0.03 + u * 0.11;
      easing.dampAngle(node.rotation, "y", y, lag, delta);
      easing.dampAngle(node.rotation, "x", x, lag * 1.4, delta);
    }

    /* material response */
    const glow = highlighted ? 0.18 : 0;
    for (let f = 0; f < faceMaterials.length; f++) {
      faceMaterials[f].emissiveIntensity = THREE.MathUtils.lerp(
        faceMaterials[f].emissiveIntensity,
        glow,
        0.12
      );
      uniforms[f].uPeel.value = peel.current;
      // a lifted sheet has the lamp behind it, so more of the far side reads.
      // board does not transmit at all, so the covers stay opaque
      uniforms[f].uShow.value = isCover
        ? 0
        : 0.045 + arc * 0.2 + peel.current * 0.08;
    }

    // the store has caught up with where the sheet was thrown — let go of it
    if (held && turn.settling && (opened ? 1 : 0) === turn.t) release();
  });

  const depth = isCover ? COVER_DEPTH : PAGE_DEPTH;

  return (
    <group
      ref={group}
      onPointerMove={(e) => {
        e.stopPropagation();
        onHover(number, e);
      }}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHighlighted(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHighlighted(false);
        if (turn.peeled === number) turn.peeled = -1;
      }}
      onPointerDown={onGrab}
    >
      <primitive object={mesh} position-z={-number * depth + page * depth} />
    </group>
  );
}

/* ── the bookmark ribbon ───────────────────────────────────────── */

function Ribbon() {
  const ref = useRef<THREE.Group>(null!);
  const bookmark = useBook((s) => s.bookmark);
  const sheet = useBook((s) => s.sheet);

  useFrame((state, delta) => {
    if (!ref.current) return;
    /**
     * In the book's frame the spread runs along ±z and paper stacks along -x,
     * so the ribbon slides *into* the block as the bookmark gets buried.
     */
    const buried = Math.abs(bookmark - sheet);
    // +z is the read half; a shut book keeps the ribbon on the front board
    const side = sheet === 0 ? -1 : bookmark <= sheet ? 1 : -1;
    easing.damp3(
      ref.current.position,
      [-buried * PAGE_DEPTH, -PAGE_HEIGHT * 0.5 - 0.14, side * PAGE_WIDTH * 0.3],
      0.4,
      delta
    );
    const sway = Math.sin(state.clock.elapsedTime * 1.2) * 0.025;
    easing.dampAngle(ref.current.rotation, "x", sway, 0.5, delta);
  });

  const ribbon = <meshStandardMaterial color="#a8202b" roughness={0.74} side={THREE.DoubleSide} />;

  return (
    <group ref={ref}>
      <mesh castShadow position={[0, -0.02, 0]}>
        <boxGeometry args={[0.0016, 0.42, 0.075]} />
        {ribbon}
      </mesh>
      {/* the notched tail */}
      <mesh position={[0, -0.245, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <boxGeometry args={[0.0016, 0.053, 0.053]} />
        {ribbon}
      </mesh>
    </group>
  );
}

/* ── the bound spine ───────────────────────────────────────────── */

function Spine({ map }: { map: THREE.Texture }) {
  const ref = useRef<THREE.Mesh>(null!);
  const sheet = useBook((s) => s.sheet);
  const mat = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame((_, delta) => {
    if (!ref.current || !mat.current) return;
    // an open book buries its own spine — fade it out as the covers part
    const shut = sheet === 0 || sheet === SHEET_COUNT;
    easing.damp(mat.current, "opacity", shut ? 1 : 0, 0.25, delta);
    ref.current.visible = mat.current.opacity > 0.02;
  });

  return (
    <mesh
      ref={ref}
      position={[-bookThickness / 2, 0, 0.004]}
      rotation={[0, 0, 0]}
      castShadow
    >
      <planeGeometry args={[bookThickness, PAGE_HEIGHT]} />
      <meshStandardMaterial
        ref={mat}
        map={map}
        roughness={0.6}
        metalness={0.08}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

/* ── the volume ────────────────────────────────────────────────── */

/** how far past the halfway mark a release still counts as a turn */
const COMMIT = 0.5;
/** progress per second above which a flick carries the page over anyway */
const FLICK = 1.1;

export function Book({ textures }: { textures: Volume }) {
  const root = useRef<THREE.Group>(null!);
  const { camera, size } = useThree();
  const sheet = useBook((s) => s.sheet);
  const setSheet = useBook((s) => s.setSheet);
  const [delayed, setDelayed] = useState(sheet);
  const delayedRef = useRef(delayed);
  delayedRef.current = delayed;

  /**
   * Flip through the intermediate sheets instead of teleporting on a chapter
   * jump. The walk is driven off a ref rather than from inside a setState
   * updater: React re-runs updaters to check they are pure, so scheduling the
   * next hop in there spawned a second, untracked timer chain on every hop
   * that nothing ever cleared. Those orphans raced each other and the book
   * ended up stuck part-way through a turn.
   */
  useEffect(() => {
    let timeout = 0;
    const step = () => {
      const d = delayedRef.current;
      if (d === sheet) return;
      const gap = Math.abs(sheet - d);
      const next = d + Math.sign(sheet - d);

      delayedRef.current = next;
      setDelayed(next);
      gap > 2 ? sfx.fastFlip() : sfx.flip();

      if (next !== sheet) timeout = window.setTimeout(step, gap > 2 ? 62 : 165);
    };
    step();
    return () => clearTimeout(timeout);
  }, [sheet]);

  useEffect(() => () => release(), []);

  /**
   * The spread's axis in screen pixels: from the spine out to the fore-edge of
   * the right-hand page. Dragging is measured along it rather than along the
   * screen's x, so a turn tracks the finger no matter where the camera drifts.
   */
  const readAxis = () => {
    const spine = root.current.localToWorld(new THREE.Vector3(0, 0, 0));
    const edge = root.current.localToWorld(new THREE.Vector3(0, 0, -PAGE_WIDTH));
    spine.project(camera);
    edge.project(camera);
    const sx = ((spine.x + 1) * size.width) / 2;
    const sy = ((1 - spine.y) * size.height) / 2;
    const ex = ((edge.x + 1) * size.width) / 2;
    const ey = ((1 - edge.y) * size.height) / 2;
    const dx = ex - sx;
    const dy = ey - sy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len, len, sx, sy };
  };

  const onGrab = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (turn.active !== -1) return;

    const axis = readAxis();
    // which half of the spread did they put their finger on?
    const grabbed = (e.clientX - axis.sx) * axis.x + (e.clientY - axis.sy) * axis.y;
    const dir: 1 | -1 = grabbed >= 0 ? 1 : -1;

    const index = dir === 1 ? delayedRef.current : delayedRef.current - 1;
    if (index < 0 || index >= SHEET_COUNT) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startTime = performance.now();
    let last = { p: 0, time: startTime };
    let moved = 0;

    turn.active = index;
    turn.dir = dir;
    turn.progress = 0;
    turn.t = dir === 1 ? 0 : 1;
    turn.velocity = 0;
    turn.peeled = -1;

    const onMove = (ev: PointerEvent) => {
      const a = readAxis();
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      moved = Math.max(moved, Math.hypot(dx, dy));

      // distance travelled along the page, as a fraction of its width
      const along = (dx * a.x + dy * a.y) / a.len;
      const p = clamp01(dir === 1 ? -along : along);

      const now = performance.now();
      const dt = Math.max(1, now - last.time) / 1000;
      turn.velocity = (p - last.p) / dt;
      last = { p, time: now };

      turn.progress = p;
      turn.t = dir === 1 ? p : 1 - p;
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);

      const tap = moved < 7 && performance.now() - startTime < 400;
      const commit = tap || turn.progress > COMMIT || turn.velocity > FLICK;

      if (!commit) {
        // it falls back to exactly where the props already say it is, so the
        // store can take it straight back with nothing to hand over
        release();
        return;
      }

      // keep driving the sheet to the far side until the store agrees it is
      // there; the Sheet hands itself back once its own props catch up
      turn.settling = true;
      turn.velocity = 0;
      turn.progress = dir === 1 ? 1 : 0;
      turn.t = dir === 1 ? 1 : 0;
      setSheet(delayedRef.current + dir);

      // insurance: never leave a sheet stranded if that hand-off never lands
      window.setTimeout(() => turn.settling && release(), 900);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  /**
   * Only the two sheets on top of each half can be peeled, and only near the
   * corner nearest the reader — the same place you would actually pinch.
   */
  const onHover = (number: number, e: ThreeEvent<PointerEvent>) => {
    if (turn.active !== -1) return;
    const top = number === delayedRef.current || number === delayedRef.current - 1;
    if (!top) {
      if (turn.peeled === number) turn.peeled = -1;
      return;
    }
    const local = root.current.worldToLocal(e.point.clone());
    const nearForeEdge = Math.abs(local.z) > PAGE_WIDTH * 0.5;
    const nearReader = local.y < -PAGE_HEIGHT * 0.08;

    if (nearForeEdge && nearReader) {
      if (turn.peeled !== number) sfx.corner();
      turn.peeled = number;
    } else if (turn.peeled === number) {
      turn.peeled = -1;
    }
  };

  const sheets = useMemo(
    () =>
      Array.from({ length: SHEET_COUNT }, (_, i) => ({
        front: textures.pages[i * 2],
        back: textures.pages[i * 2 + 1],
        isCover: i === 0 || i === SHEET_COUNT - 1,
      })),
    [textures]
  );

  return (
    <group ref={root} rotation-y={-Math.PI / 2}>
      {sheets.map((s, i) => (
        <Sheet
          key={i}
          number={i}
          page={delayed}
          opened={delayed > i}
          bookClosed={delayed === 0 || delayed === PAGES.length / 2}
          front={s.front}
          back={s.back}
          isCover={s.isCover}
          onGrab={onGrab}
          onHover={onHover}
        />
      ))}
      <Spine map={textures.spine} />
      <Ribbon />
    </group>
  );
}
