/**
 * Ink primitives. Everything on a page is drawn with these — no image
 * assets, so the whole volume is generated at runtime.
 *
 * All sizes are authored against a 896-wide page and scaled by `s`.
 */

export const INK = "#17120d";
export const INK_SOFT = "#3a3128";
export const PAPER = "#efe6d2";
export const PAPER_DARK = "#e2d7bf";
export const ACCENT = "#c8412f";

export type Ctx = CanvasRenderingContext2D;

/* ── deterministic randomness so pages look the same every reload ── */

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

/* ── paper ─────────────────────────────────────────────────────── */

let fiberTile: HTMLCanvasElement | null = null;

function makeFiberTile(): HTMLCanvasElement {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const x = c.getContext("2d")!;
  const img = x.createImageData(size, size);
  const r = rng(0xbeef);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 128 + (r() - 0.5) * 46;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
    img.data[i + 3] = 26;
  }
  x.putImageData(img, 0, 0);
  // a few longer fibres
  x.globalAlpha = 0.16;
  x.strokeStyle = "#8a7c62";
  for (let i = 0; i < 40; i++) {
    const px = r() * size;
    const py = r() * size;
    x.beginPath();
    x.moveTo(px, py);
    x.lineTo(px + (r() - 0.5) * 26, py + (r() - 0.5) * 26);
    x.lineWidth = r() * 0.9;
    x.stroke();
  }
  return c;
}

export function paper(ctx: Ctx, W: number, H: number, seed: number, dark = false) {
  const s = W / 896;
  const r = rng(seed);

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, dark ? "#e6dbc2" : "#f2ead8");
  g.addColorStop(0.5, dark ? "#ded2b6" : "#ece2cc");
  g.addColorStop(1, dark ? "#d8cbad" : "#e5dac1");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  if (!fiberTile) fiberTile = makeFiberTile();
  const pat = ctx.createPattern(fiberTile, "repeat")!;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // age spots
  ctx.save();
  for (let i = 0; i < 26; i++) {
    const x = r() * W;
    const y = r() * H;
    const rad = (2 + r() * 26) * s;
    const gg = ctx.createRadialGradient(x, y, 0, x, y, rad);
    gg.addColorStop(0, "rgba(150,124,80,0.10)");
    gg.addColorStop(1, "rgba(150,124,80,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  ctx.restore();

  // gutter shading is applied by the caller (depends on which side the page is)
  vignette(ctx, W, H);
}

export function vignette(ctx: Ctx, W: number, H: number) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.78);
  g.addColorStop(0, "rgba(60,44,20,0)");
  g.addColorStop(1, "rgba(60,44,20,0.16)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/** Darkening toward the spine. side = which edge sits in the gutter. */
export function gutter(ctx: Ctx, W: number, H: number, side: "left" | "right") {
  const w = W * 0.13;
  const g = ctx.createLinearGradient(side === "left" ? 0 : W, 0, side === "left" ? w : W - w, 0);
  g.addColorStop(0, "rgba(40,28,10,0.30)");
  g.addColorStop(0.45, "rgba(40,28,10,0.08)");
  g.addColorStop(1, "rgba(40,28,10,0)");
  ctx.fillStyle = g;
  ctx.fillRect(side === "left" ? 0 : W - w, 0, w, H);
}

/* ── coffee, creases, dust ─────────────────────────────────────── */

export function coffeeStain(ctx: Ctx, cx: number, cy: number, rad: number, seed: number) {
  const r = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.beginPath();
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr = rad * (0.86 + r() * 0.2);
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr * 0.92;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(cx, cy, rad * 0.2, cx, cy, rad);
  g.addColorStop(0, "rgba(126,88,44,0.06)");
  g.addColorStop(0.82, "rgba(126,88,44,0.10)");
  g.addColorStop(1, "rgba(110,74,34,0.26)");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

/* ── rough ink strokes ─────────────────────────────────────────── */

/** A hand-drawn line: slight wobble and a tapered weight. */
export function inkLine(
  ctx: Ctx,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  seed = 1
) {
  const r = rng(seed);
  const segs = 8;
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const nx = x1 + (x2 - x1) * t + (r() - 0.5) * width * 1.6;
    const ny = y1 + (y2 - y1) * t + (r() - 0.5) * width * 1.6;
    ctx.lineTo(nx, ny);
  }
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.restore();
}

/** Panel border: four hand-drawn strokes that overshoot at the corners. */
export function inkRect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  width: number,
  seed = 1
) {
  const o = width * 1.4;
  inkLine(ctx, x - o, y, x + w + o, y, width, seed);
  inkLine(ctx, x + w, y - o, x + w, y + h + o, width, seed + 1);
  inkLine(ctx, x + w + o, y + h, x - o, y + h, width, seed + 2);
  inkLine(ctx, x, y + h + o, x, y - o, width, seed + 3);
}

/* ── screentone ────────────────────────────────────────────────── */

export function halftone(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  density: number,
  pitch = 9,
  angle = Math.PI / 4,
  fade: "none" | "down" | "up" | "radial" = "none"
) {
  if (density <= 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(angle);
  const diag = Math.hypot(w, h);
  ctx.fillStyle = INK;
  for (let py = -diag / 2; py < diag / 2; py += pitch) {
    for (let px = -diag / 2; px < diag / 2; px += pitch) {
      // fade factor in unrotated space
      const ux = Math.cos(-angle) * px - Math.sin(-angle) * py + w / 2;
      const uy = Math.sin(-angle) * px + Math.cos(-angle) * py + h / 2;
      let f = 1;
      if (fade === "down") f = 1 - uy / h;
      else if (fade === "up") f = uy / h;
      else if (fade === "radial")
        f = 1 - Math.min(1, Math.hypot(ux - w / 2, uy - h / 2) / (diag / 2));
      f = Math.max(0, Math.min(1, f));
      const d = density * f;
      if (d <= 0.02) continue;
      const rad = (pitch / 2) * Math.sqrt(d) * 0.95;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/* ── speed lines ───────────────────────────────────────────────── */

export function speedLines(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  cx: number,
  cy: number,
  count = 90,
  seed = 7,
  inner = 0.22
) {
  const r = rng(seed);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  const R = Math.hypot(w, h);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + r() * 0.05;
    const i0 = R * inner * (0.7 + r() * 0.7);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * i0, cy + Math.sin(a) * i0);
    ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    ctx.lineWidth = 0.6 + r() * 3.4;
    ctx.stroke();
  }
  ctx.restore();
}

/* ── text ──────────────────────────────────────────────────────── */

export function wrap(ctx: Ctx, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    if (para === "") {
      out.push("");
      continue;
    }
    let line = "";
    for (const word of para.split(" ")) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        out.push(line);
        line = word;
      } else line = test;
    }
    out.push(line);
  }
  return out;
}

export function textBlock(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  align: CanvasTextAlign = "left"
): number {
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  const lines = wrap(ctx, text, maxW);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
  return y + lines.length * lineH;
}

/** Big display type with an ink outline, the way chapter titles are set. */
export function displayText(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  size: number,
  opts: {
    align?: CanvasTextAlign;
    fill?: string;
    stroke?: string;
    strokeW?: number;
    rot?: number;
    font?: string;
    shadow?: boolean;
  } = {}
) {
  const {
    align = "center",
    fill = PAPER,
    stroke = INK,
    strokeW = size * 0.085,
    rot = 0,
    font = "Bangers",
    shadow = true,
  } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.font = `${size}px "${font}", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  if (shadow) {
    ctx.save();
    ctx.fillStyle = "rgba(23,18,13,0.5)";
    ctx.fillText(text, size * 0.055, size * 0.055);
    ctx.restore();
  }
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeW;
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = fill;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/* ── speech bubbles ────────────────────────────────────────────── */

export function bubble(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  text: string,
  opts: {
    tail?: "bl" | "br" | "tl" | "tr" | "none";
    kind?: "speech" | "thought" | "shout";
    size?: number;
    seed?: number;
  } = {}
) {
  const { tail = "bl", kind = "speech", size = 26, seed = 3 } = opts;
  const padX = size * 0.95;
  const padY = size * 0.85;
  ctx.save();
  ctx.font = `700 ${size}px "Zen Maru Gothic", "Noto Sans JP", sans-serif`;
  const lines = text.split("\n").flatMap((l) => wrap(ctx, l, w - padX * 2));
  const lineH = size * 1.34;
  const h = lines.length * lineH + padY * 2 - (lineH - size);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = w / 2;
  const ry = h / 2;

  const r = rng(seed);
  ctx.beginPath();
  if (kind === "shout") {
    const spikes = 18;
    for (let i = 0; i <= spikes * 2; i++) {
      const a = (i / (spikes * 2)) * Math.PI * 2;
      const k = i % 2 === 0 ? 1.16 + r() * 0.12 : 0.92;
      const px = cx + Math.cos(a) * rx * k;
      const py = cy + Math.sin(a) * ry * k;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else {
    const steps = 44;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const wob = 1 + (r() - 0.5) * 0.035;
      const px = cx + Math.cos(a) * rx * wob;
      const py = cy + Math.sin(a) * ry * wob;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  // tail
  if (tail !== "none" && kind !== "thought") {
    const dirX = tail.includes("l") ? -1 : 1;
    const dirY = tail.startsWith("b") ? 1 : -1;
    const bx = cx + dirX * rx * 0.42;
    const by = cy + dirY * ry * 0.86;
    ctx.moveTo(bx - dirX * rx * 0.16, by - dirY * ry * 0.1);
    ctx.lineTo(cx + dirX * rx * 1.05, cy + dirY * ry * 1.72);
    ctx.lineTo(bx + dirX * rx * 0.2, by + dirY * ry * 0.12);
    ctx.closePath();
  }

  ctx.fillStyle = "#f7f2e6";
  ctx.shadowColor = "rgba(23,18,13,0.28)";
  ctx.shadowBlur = size * 0.5;
  ctx.shadowOffsetY = size * 0.18;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = INK;
  ctx.lineWidth = size * 0.115;
  ctx.lineJoin = "round";
  ctx.stroke();

  if (kind === "thought") {
    for (let i = 1; i <= 3; i++) {
      const rr = size * (0.3 - i * 0.06);
      ctx.beginPath();
      ctx.arc(cx - rx * 0.5 - i * size * 0.5, cy + ry + i * size * 0.55, rr, 0, Math.PI * 2);
      ctx.fillStyle = "#f7f2e6";
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const startY = cy - ((lines.length - 1) * lineH) / 2;
  lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lineH));
  ctx.restore();
  return h;
}

/** The rectangular narration box manga uses for voice-over. */
export function captionBox(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  text: string,
  size: number
) {
  ctx.save();
  ctx.font = `700 ${size}px "Zen Maru Gothic", sans-serif`;
  const pad = size * 0.6;
  const lines = wrap(ctx, text, w - pad * 2);
  const lineH = size * 1.32;
  const h = lines.length * lineH + pad * 1.6;
  ctx.fillStyle = "#f6f0e2";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = INK;
  ctx.lineWidth = size * 0.1;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, x + pad, y + pad * 0.8 + i * lineH));
  ctx.restore();
  return h;
}

/** Japanese-style sound effect: heavy fill, thick paper-coloured outline. */
export function sfx(ctx: Ctx, text: string, x: number, y: number, size: number, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.font = `900 ${size}px "Noto Sans JP", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#f7f2e6";
  ctx.lineWidth = size * 0.28;
  ctx.strokeText(text, 0, 0);
  ctx.strokeStyle = INK;
  ctx.lineWidth = size * 0.09;
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = INK;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/* ── marginalia ────────────────────────────────────────────────── */

export function handNote(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  size: number,
  rot = -0.05,
  color = "#3f5b8a"
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.font = `700 ${size}px "Caveat", cursive`;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.82;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

export function pencilArrow(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, s: number) {
  ctx.save();
  ctx.strokeStyle = "rgba(63,91,138,0.7)";
  ctx.lineWidth = 2 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo((x1 + x2) / 2, y1 - 30 * s, x2, y2);
  ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a - 0.5) * 14 * s, y2 - Math.sin(a - 0.5) * 14 * s);
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a + 0.5) * 14 * s, y2 - Math.sin(a + 0.5) * 14 * s);
  ctx.stroke();
  ctx.restore();
}

export function stickyNote(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  s: number,
  rot = 0.04
) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.shadowColor = "rgba(23,18,13,0.3)";
  ctx.shadowBlur = 14 * s;
  ctx.shadowOffsetY = 6 * s;
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, "#f5e07a");
  g.addColorStop(1, "#e8cf5c");
  ctx.fillStyle = g;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.shadowColor = "transparent";
  ctx.font = `700 ${20 * s}px "Caveat", cursive`;
  ctx.fillStyle = "#4a3a12";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lines = wrap(ctx, text, w * 0.86);
  lines.forEach((l, i) =>
    ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * 24 * s)
  );
  ctx.restore();
}

export function tape(ctx: Ctx, x: number, y: number, w: number, h: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = "rgba(226,214,180,0.72)";
  ctx.strokeStyle = "rgba(140,124,86,0.4)";
  ctx.lineWidth = 1;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.restore();
}

/* ── page furniture ────────────────────────────────────────────── */

export function folio(
  ctx: Ctx,
  W: number,
  H: number,
  n: number,
  side: "left" | "right",
  head?: string
) {
  const s = W / 896;
  if (n <= 0) return;
  ctx.save();
  ctx.fillStyle = INK_SOFT;
  ctx.globalAlpha = 0.75;
  ctx.font = `600 ${20 * s}px "Noto Sans JP", sans-serif`;
  ctx.textBaseline = "alphabetic";
  const m = 44 * s;
  ctx.textAlign = side === "left" ? "left" : "right";
  ctx.fillText(String(n), side === "left" ? m : W - m, H - m);

  if (head) {
    ctx.font = `600 ${15 * s}px "Noto Sans JP", sans-serif`;
    ctx.globalAlpha = 0.45;
    ctx.textAlign = side === "left" ? "right" : "left";
    ctx.fillText(head, side === "left" ? W - m : m, H - m);
  }
  ctx.restore();
}

/** Barcode block for the covers. Decorative, EAN-shaped. */
export function barcode(ctx: Ctx, x: number, y: number, w: number, h: number, label: string) {
  const r = rng(4242);
  ctx.save();
  ctx.fillStyle = "#f7f2e6";
  ctx.fillRect(x - w * 0.05, y - h * 0.12, w * 1.1, h * 1.42);
  ctx.fillStyle = INK;
  let px = x;
  while (px < x + w) {
    const bw = 1 + Math.floor(r() * 4);
    if (r() > 0.38) ctx.fillRect(px, y, bw, h);
    px += bw + 1 + Math.floor(r() * 3);
  }
  ctx.font = `600 ${h * 0.2}px "Noto Sans JP", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(label, x + w / 2, y + h * 1.06);
  ctx.restore();
}
