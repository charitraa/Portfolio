import * as THREE from "three";
import { PAGES } from "./content/story";
import { renderPage, renderSpine } from "./pages/render";

/** Page aspect follows a B6 tankoubon: 1 : 1.41. */
export const PAGE_ASPECT = 1.41;

function textureSize() {
  const small = Math.min(window.innerWidth, window.innerHeight) < 760;
  const W = small ? 640 : 896;
  return { W, H: Math.round(W * PAGE_ASPECT) };
}

const FONTS = [
  '64px "Bangers"',
  '700 32px "Zen Maru Gothic"',
  '900 32px "Noto Sans JP"',
  '700 32px "Caveat"',
];

async function waitForFonts() {
  try {
    await Promise.all(FONTS.map((f) => document.fonts.load(f)));
    await document.fonts.ready;
  } catch {
    /* fall back to system fonts rather than blocking the read */
  }
}

function toTexture(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

export type Volume = {
  pages: THREE.Texture[];
  spine: THREE.Texture;
};

export async function buildVolume(
  onProgress: (done: number, total: number) => void
): Promise<Volume> {
  await waitForFonts();
  const { W, H } = textureSize();
  const pages: THREE.Texture[] = [];

  for (let i = 0; i < PAGES.length; i++) {
    pages.push(toTexture(await renderPage(PAGES[i], i, W, H)));
    onProgress(i + 1, PAGES.length);
    // let the loading screen paint between pages
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }

  const spine = toTexture(renderSpine(Math.round(W * 0.17), H));
  return { pages, spine };
}
