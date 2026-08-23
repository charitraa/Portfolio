/**
 * Turns a `Page` from src/content/story.ts into a finished manga page on a
 * canvas. Even indices are right-hand pages, odd indices are left-hand pages.
 */

import QRCode from "qrcode";
import {
  AUTHOR,
  CHAPTERS,
  PAGES,
  folioFor,
  type Page,
  type Panel,
} from "../content/story";
import {
  ACCENT,
  Ctx,
  INK,
  INK_SOFT,
  barcode,
  bubble,
  captionBox,
  coffeeStain,
  displayText,
  folio,
  gutter,
  halftone,
  handNote,
  inkRect,
  paper,
  pencilArrow,
  rng,
  sfx as drawSfx,
  speedLines,
  stickyNote,
  tape,
  textBlock,
} from "./draw";
import { drawArt } from "./art";

export type Side = "left" | "right";

const sideOf = (i: number): Side => (i % 2 === 0 ? "right" : "left");

type Layout = {
  ctx: Ctx;
  W: number;
  H: number;
  s: number;
  /** content box */
  x: number;
  y: number;
  w: number;
  h: number;
  side: Side;
};

function frame(ctx: Ctx, W: number, H: number, index: number, dark = false): Layout {
  const s = W / 896;
  const side = sideOf(index);
  paper(ctx, W, H, index * 977 + 13, dark);
  gutter(ctx, W, H, side === "right" ? "left" : "right");
  const inner = 96 * s; // wider margin on the gutter side
  const outer = 64 * s;
  const x = side === "right" ? inner : outer;
  return {
    ctx,
    W,
    H,
    s,
    x,
    y: 78 * s,
    w: W - inner - outer,
    h: H - 78 * s - 96 * s,
    side,
  };
}

/* ── QR ─────────────────────────────────────────────────────────── */

async function qr(url: string, px: number): Promise<HTMLCanvasElement> {
  const c = document.createElement("canvas");
  await QRCode.toCanvas(c, url, {
    width: px,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#17120dff", light: "#f7f2e600" },
  });
  return c;
}

/* ── entry point ────────────────────────────────────────────────── */

export async function renderPage(
  page: Page,
  index: number,
  W: number,
  H: number
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";

  switch (page.kind) {
    case "cover":
      cover(ctx, W, H);
      return canvas;
    case "backcover":
      await backcover(ctx, W, H);
      return canvas;
  }

  const L = frame(ctx, W, H, index);

  switch (page.kind) {
    case "inside":
      inside(L, page.lines, page.sticky);
      break;
    case "toc":
      toc(L);
      break;
    case "chapter":
      chapter(L, page);
      break;
    case "panels":
      panelsPage(L, page.panels, index);
      if (page.note) handNote(L.ctx, page.note, L.x + L.w * 0.62, L.y - 26 * L.s, 30 * L.s, -0.06);
      break;
    case "skills":
      skills(L, page);
      break;
    case "project":
      await project(L, page.p, page.side);
      break;
    case "timeline":
      timeline(L, page.items);
      if (page.note) handNote(L.ctx, page.note, L.x + 8 * L.s, L.y + L.h + 34 * L.s, 27 * L.s, -0.03);
      break;
    case "equipment":
      equipment(L, page.items, page.display ?? "LOADOUT");
      break;
    case "awards":
      awards(L, page.items, page.display ?? "TROPHIES");
      break;
    case "contact":
      await contact(L, page.lines);
      break;
    case "end":
      end(L, page);
      break;
  }

  const head =
    "head" in page && typeof page.head === "string"
      ? page.head
      : page.kind === "chapter"
        ? `CH. ${page.n}`
        : undefined;
  folio(ctx, W, H, folioFor(index), L.side, head);

  // one lived-in page per volume
  if (index === 18) coffeeStain(ctx, W * 0.74, H * 0.2, 74 * L.s, 99);

  return canvas;
}

/* ── covers ─────────────────────────────────────────────────────── */

function clothBoard(ctx: Ctx, W: number, H: number) {
  const s = W / 896;
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#1d2430");
  g.addColorStop(0.55, "#141a24");
  g.addColorStop(1, "#0d1118");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // cloth weave
  const r = rng(31337);
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = "#9fb2cc";
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 3 * s) {
    ctx.beginPath();
    ctx.moveTo(0, y + r() * 1.2);
    ctx.lineTo(W, y + r() * 1.2);
    ctx.stroke();
  }
  for (let x = 0; x < W; x += 3 * s) {
    ctx.beginPath();
    ctx.moveTo(x + r() * 1.2, 0);
    ctx.lineTo(x + r() * 1.2, H);
    ctx.stroke();
  }
  ctx.restore();

  // board edge bevel
  ctx.save();
  const e = ctx.createLinearGradient(0, 0, 26 * s, 0);
  e.addColorStop(0, "rgba(255,255,255,0.10)");
  e.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = e;
  ctx.fillRect(0, 0, 26 * s, H);
  ctx.restore();
}

function foilText(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  size: number,
  align: CanvasTextAlign = "center"
) {
  ctx.save();
  ctx.font = `${size}px "Bangers", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  const w = ctx.measureText(text).width;
  const g = ctx.createLinearGradient(x - w / 2, y - size, x + w / 2, y);
  g.addColorStop(0, "#8a6a2c");
  g.addColorStop(0.25, "#f0d493");
  g.addColorStop(0.45, "#c8a250");
  g.addColorStop(0.7, "#fbeec0");
  g.addColorStop(1, "#9a7635");
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = size * 0.12;
  ctx.shadowOffsetY = size * 0.04;
  ctx.fillStyle = g;
  ctx.fillText(text, x, y);
  ctx.shadowColor = "transparent";
  // embossed highlight
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#fff6d8";
  ctx.fillText(text, x - size * 0.012, y - size * 0.018);
  ctx.restore();
}

function cover(ctx: Ctx, W: number, H: number) {
  const s = W / 896;
  clothBoard(ctx, W, H);

  // dust-jacket illustration window
  const mx = 58 * s;
  const my = 150 * s;
  const mw = W - mx * 2;
  const mh = H * 0.44;
  ctx.save();
  ctx.fillStyle = "#efe6d2";
  ctx.fillRect(mx, my, mw, mh);
  ctx.restore();

  drawArt(ctx, "hero", { x: mx, y: my, w: mw, h: mh }, 5, s);
  ctx.save();
  ctx.strokeStyle = "#c8a250";
  ctx.lineWidth = 4 * s;
  ctx.strokeRect(mx, my, mw, mh);
  ctx.restore();

  // title block
  foilText(ctx, AUTHOR.title, W / 2, my - 44 * s, 108 * s);

  ctx.save();
  ctx.font = `${34 * s}px "Bangers", sans-serif`;
  ctx.fillStyle = "#e8dcc0";
  ctx.textAlign = "center";
  ctx.fillText(`VOL. ${AUTHOR.volume}`, W / 2, my - 96 * s);
  ctx.restore();

  // accent bar
  ctx.save();
  ctx.fillStyle = ACCENT;
  ctx.fillRect(mx, my + mh + 34 * s, mw, 6 * s);
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#f0e8d4";
  ctx.font = `${52 * s}px "Bangers", sans-serif`;
  ctx.fillText(AUTHOR.name.toUpperCase(), W / 2, my + mh + 108 * s);
  ctx.font = `700 ${24 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.fillStyle = "#a9b6c8";
  ctx.fillText(AUTHOR.role.toUpperCase(), W / 2, my + mh + 152 * s);
  ctx.font = `700 ${19 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.fillStyle = "#7f8ea3";
  ctx.fillText(AUTHOR.subtitle, W / 2, my + mh + 190 * s);
  ctx.restore();

  // price + publisher, Jump-style
  ctx.save();
  ctx.translate(W - 118 * s, 84 * s);
  ctx.rotate(-0.12);
  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  const R = 56 * s;
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const rr = i % 2 === 0 ? R : R * 0.82;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff6e2";
  ctx.font = `${34 * s}px "Bangers", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(AUTHOR.price, 0, 2 * s);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#8d9aab";
  ctx.font = `700 ${17 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(AUTHOR.publisher, 62 * s, 84 * s);
  ctx.fillText(AUTHOR.year, 62 * s, 110 * s);
  ctx.restore();

  // bottom rule + japanese subtitle
  ctx.save();
  ctx.strokeStyle = "rgba(200,162,80,0.4)";
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(mx, H - 96 * s);
  ctx.lineTo(W - mx, H - 96 * s);
  ctx.stroke();
  ctx.fillStyle = "#6f7c8d";
  ctx.font = `700 ${22 * s}px "Noto Sans JP", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("物語はここから", W / 2, H - 56 * s);
  ctx.restore();
}

async function backcover(ctx: Ctx, W: number, H: number) {
  const s = W / 896;
  clothBoard(ctx, W, H);

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#e8dcc0";
  ctx.font = `${44 * s}px "Bangers", sans-serif`;
  ctx.fillText("TO BE CONTINUED", W / 2, 150 * s);
  ctx.restore();

  // blurb panel
  const bx = 88 * s;
  const bw = W - bx * 2;
  ctx.save();
  ctx.fillStyle = "rgba(239,230,210,0.94)";
  ctx.fillRect(bx, 200 * s, bw, 300 * s);
  ctx.fillStyle = INK;
  ctx.font = `700 ${23 * s}px "Zen Maru Gothic", sans-serif`;
  let y = textBlock(
    ctx,
    `A full stack developer from ${AUTHOR.location} builds things that have to work when the network does not — and then goes looking for the way in.\n\nThis volume collects the origin story, the training arc, four boss fights, the side quests and the equipment — with the mistakes left in.`,
    bx + 34 * s,
    246 * s,
    bw - 68 * s,
    34 * s
  );
  ctx.font = `700 ${21 * s}px "Caveat", cursive`;
  ctx.fillStyle = ACCENT;
  ctx.fillText("Story & art by " + AUTHOR.name, bx + 34 * s, y + 34 * s);
  ctx.restore();

  // scan-me QR
  const q = await qr(AUTHOR.github, Math.round(190 * s));
  ctx.save();
  ctx.fillStyle = "#f7f2e6";
  ctx.fillRect(bx, 540 * s, 216 * s, 216 * s);
  ctx.drawImage(q, bx + 13 * s, 553 * s);
  ctx.fillStyle = "#a9b6c8";
  ctx.font = `700 ${19 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("SCAN → GITHUB", bx + 240 * s, 592 * s);
  ctx.fillStyle = "#7f8ea3";
  ctx.font = `600 ${17 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.fillText(AUTHOR.email, bx + 240 * s, 628 * s);
  ctx.fillText(AUTHOR.linkedin, bx + 240 * s, 660 * s);
  ctx.fillText(`${AUTHOR.position}, ${AUTHOR.company} · ${AUTHOR.location}`, bx + 240 * s, 692 * s);
  ctx.restore();

  // "read this way" — the classic tankoubon note
  ctx.save();
  ctx.strokeStyle = "#c8a250";
  ctx.lineWidth = 2 * s;
  ctx.strokeRect(bx, H - 300 * s, bw, 96 * s);
  ctx.fillStyle = "#e8dcc0";
  ctx.font = `${30 * s}px "Bangers", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("PANELS READ RIGHT → LEFT", W / 2, H - 240 * s);
  ctx.restore();

  barcode(ctx, bx, H - 176 * s, 240 * s, 92 * s, AUTHOR.isbn);

  ctx.save();
  ctx.fillStyle = "#8d9aab";
  ctx.font = `700 ${18 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText(AUTHOR.publisher, W - bx, H - 140 * s);
  ctx.fillText(`VOL. ${AUTHOR.volume}  ·  ${AUTHOR.year}`, W - bx, H - 110 * s);
  ctx.fillText(`PRICE ${AUTHOR.price}`, W - bx, H - 80 * s);
  ctx.restore();
}

/* ── front matter ───────────────────────────────────────────────── */

function inside(L: Layout, lines: string[], sticky?: string) {
  const { ctx, W, s } = L;
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = INK_SOFT;
  ctx.font = `700 ${26 * s}px "Zen Maru Gothic", sans-serif`;
  let y = L.y + L.h * 0.3;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += 44 * s;
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 70 * s, y + 34 * s);
  ctx.lineTo(W / 2 + 70 * s, y + 34 * s);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = INK_SOFT;
  ctx.globalAlpha = 0.7;
  ctx.font = `${28 * s}px "Bangers", sans-serif`;
  ctx.fillText(AUTHOR.publisher, W / 2, y + 96 * s);
  ctx.restore();

  stickyNote(
    ctx,
    L.x + L.w * 0.02,
    L.y + L.h * 0.74,
    190 * s,
    150 * s,
    sticky ?? "drag a page corner to turn it",
    s,
    -0.05
  );
}

function toc(L: Layout) {
  const { ctx, s } = L;
  displayText(ctx, "CONTENTS", L.x + L.w / 2, L.y + 78 * s, 78 * s);
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(L.x, L.y + 104 * s);
  ctx.lineTo(L.x + L.w, L.y + 104 * s);
  ctx.stroke();
  ctx.restore();

  let y = L.y + 176 * s;
  const step = Math.min(74 * s, (L.h - 240 * s) / CHAPTERS.length);
  ctx.save();
  for (const c of CHAPTERS) {
    ctx.fillStyle = ACCENT;
    ctx.font = `${30 * s}px "Bangers", sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(`CH. ${c.n}`, L.x, y);

    ctx.fillStyle = INK;
    ctx.font = `700 ${28 * s}px "Zen Maru Gothic", sans-serif`;
    ctx.fillText(c.title, L.x + 108 * s, y);

    const titleW = ctx.measureText(c.title).width;
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.setLineDash([2 * s, 7 * s]);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(L.x + 120 * s + titleW, y - 8 * s);
    ctx.lineTo(L.x + L.w - 52 * s, y - 8 * s);
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = "right";
    ctx.font = `600 ${25 * s}px "Noto Sans JP", sans-serif`;
    ctx.fillText(String(c.folio), L.x + L.w, y);
    y += step;
  }
  ctx.restore();

  handNote(ctx, "click a chapter in the tab strip →", L.x + L.w * 0.06, L.y + L.h - 26 * s, 28 * s, -0.03);
}

/* ── chapter title page ─────────────────────────────────────────── */

/**
 * The occasional colour insert a tankoubon prints on glossier stock.
 * A duotone wash over the finished ink — so the linework still reads,
 * it has just been run through a second plate on the press.
 */
function colorPlate(ctx: Ctx, W: number, H: number, [top, bottom]: [string, string]) {
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, W * 0.35, H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.62;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // lift the paper back up, or the wash reads as a filter rather than ink
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // registration is never perfect on cheap colour stock
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = bottom;
  ctx.fillRect(2.5, 3.5, W, H);
  ctx.restore();
}

function chapter(L: Layout, page: Extract<Page, { kind: "chapter" }>) {
  const { ctx, s } = L;
  const cx = L.x + L.w / 2;
  const cy = L.y + L.h * 0.44;

  speedLines(ctx, L.x, L.y, L.w, L.h, cx, cy, 130, page.n * 17 + 3, 0.2);
  halftone(ctx, L.x, L.y, L.w, L.h, 0.4, 11 * s, Math.PI / 4, "radial");

  // big chapter number, ghosted behind everything
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = INK;
  ctx.font = `${420 * s}px "Bangers", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(String(page.n), cx, cy + 150 * s);
  ctx.restore();

  // banner
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.025);
  ctx.fillStyle = INK;
  ctx.fillRect(-L.w * 0.52, -76 * s, L.w * 1.04, 152 * s);
  ctx.restore();

  displayText(ctx, page.title, cx, cy + 22 * s, Math.min(96 * s, (L.w * 1.5) / page.title.length), {
    rot: -0.025,
    fill: "#f4ecd8",
    stroke: "#f4ecd8",
    strokeW: 1,
    shadow: false,
  });

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = ACCENT;
  ctx.font = `${38 * s}px "Bangers", sans-serif`;
  ctx.fillText(`CHAPTER ${page.n}`, cx, cy - 118 * s);
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  ctx.font = `700 ${26 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.fillText(page.sub, cx, cy + 148 * s);
  ctx.restore();

  // vertical japanese chapter mark
  ctx.save();
  ctx.fillStyle = INK;
  ctx.font = `900 ${40 * s}px "Noto Sans JP", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const chars = [...page.jp];
  chars.forEach((c, i) =>
    ctx.fillText(c, L.side === "right" ? L.x + L.w - 26 * s : L.x + 26 * s, L.y + 10 * s + i * 48 * s)
  );
  ctx.restore();

  if (page.color) colorPlate(ctx, L.W, L.H, page.color);
}

/* ── panel page ─────────────────────────────────────────────────── */

function panelsPage(L: Layout, panels: Panel[], index: number) {
  const { ctx, s } = L;
  const gap = 16 * s;
  panels.forEach((p, i) => {
    const x = L.x + p.x * L.w;
    const y = L.y + p.y * L.h;
    const w = p.w * L.w - (p.x + p.w < 1 ? gap : 0);
    const h = p.h * L.h - (p.y + p.h < 1 ? gap : 0);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = "#f4ecd9";
    ctx.fillRect(x, y, w, h);
    if (p.tone) halftone(ctx, x, y, w, h, p.tone, 10 * s, Math.PI / 4, "down");
    if (p.art) drawArt(ctx, p.art, { x, y, w, h }, index * 31 + i * 7 + 1, s);
    ctx.restore();

    inkRect(ctx, x, y, w, h, 4.4 * s, index * 41 + i * 5 + 2);

    if (p.caption) captionBox(ctx, x + 16 * s, y + 16 * s, w * 0.52, p.caption, 20 * s);
    if (p.sfx)
      drawSfx(ctx, p.sfx.text, x + p.sfx.x * w, y + p.sfx.y * h, (p.sfx.size ?? 60) * s, ((p.sfx.rot ?? 0) * Math.PI) / 180);

    // manga panels read right→left, so bubbles are drawn in that order
    for (const b of p.bubbles ?? []) {
      bubble(ctx, x + b.x * w, y + b.y * h, b.w * w, b.text, {
        tail: b.tail,
        kind: b.kind,
        size: 25 * s,
        seed: index * 13 + i * 3 + 1,
      });
    }
  });
}

/* ── skills: the RPG sheet ──────────────────────────────────────── */

function skills(L: Layout, page: Extract<Page, { kind: "skills" }>) {
  const { ctx, s } = L;
  displayText(ctx, page.display ?? "STATUS", L.x + L.w / 2, L.y + 68 * s, 76 * s);
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = INK_SOFT;
  ctx.font = `700 ${20 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.fillText(page.sub ?? "training log — updated continuously", L.x + L.w / 2, L.y + 104 * s);
  ctx.restore();

  let y = L.y + 168 * s;
  for (const g of page.groups) {
    ctx.save();
    ctx.fillStyle = INK;
    ctx.fillRect(L.x, y - 26 * s, L.w, 36 * s);
    ctx.fillStyle = "#f4ecd8";
    ctx.font = `${26 * s}px "Bangers", sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(g.name, L.x + 14 * s, y);
    ctx.restore();
    y += 52 * s;

    for (const it of g.items) {
      ctx.save();
      ctx.fillStyle = INK;
      ctx.font = `700 ${24 * s}px "Zen Maru Gothic", sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(it.name, L.x + 6 * s, y);

      // bar
      const bx = L.x + L.w * 0.34;
      const bw = L.w * 0.44;
      const bh = 20 * s;
      const by = y - bh + 3 * s;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.6 * s;
      ctx.strokeRect(bx, by, bw, bh);
      const cells = 20;
      for (let c = 0; c < cells; c++) {
        if (c / cells >= it.level) break;
        ctx.fillStyle = INK;
        ctx.fillRect(bx + 3 * s + c * (bw / cells), by + 3 * s, bw / cells - 3 * s, bh - 6 * s);
      }
      // tag
      ctx.textAlign = "right";
      ctx.font = `${21 * s}px "Bangers", sans-serif`;
      ctx.fillStyle = it.tag === "MASTERED" ? ACCENT : INK_SOFT;
      ctx.fillText(it.tag, L.x + L.w, y);
      ctx.restore();
      y += 44 * s;
    }
    y += 22 * s;
  }

  if (page.note) handNote(ctx, page.note, L.x, L.y + L.h + 14 * s, 26 * s, -0.02);
}

/* ── projects: the two-page spread ──────────────────────────────── */

async function project(L: Layout, p: Extract<Page, { kind: "project" }>["p"], side: "left" | "right") {
  const { ctx, s } = L;

  if (side === "left") {
    ctx.save();
    ctx.fillStyle = INK;
    ctx.fillRect(L.x, L.y, L.w, 116 * s);
    ctx.restore();
    displayText(ctx, p.name.toUpperCase(), L.x + 20 * s, L.y + 82 * s, 62 * s, {
      align: "left",
      fill: "#f4ecd8",
      stroke: "#f4ecd8",
      strokeW: 1,
      shadow: false,
    });
    ctx.save();
    ctx.fillStyle = ACCENT;
    ctx.font = `${22 * s}px "Bangers", sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("BOSS FIGHT", L.x + 22 * s, L.y + 34 * s);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = INK;
    ctx.font = `700 ${25 * s}px "Zen Maru Gothic", sans-serif`;
    textBlock(ctx, p.tagline, L.x, L.y + 168 * s, L.w, 34 * s);
    ctx.restore();

    let y = L.y + 250 * s;
    p.arc.forEach((step, i) => {
      // beat marker
      ctx.save();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(L.x + 12 * s, y - 9 * s, 11 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f4ecd8";
      ctx.font = `${15 * s}px "Bangers", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(String(i + 1), L.x + 12 * s, y - 3 * s);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = ACCENT;
      ctx.font = `${24 * s}px "Bangers", sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(step.label, L.x + 38 * s, y);
      ctx.fillStyle = INK;
      ctx.font = `600 ${21 * s}px "Zen Maru Gothic", sans-serif`;
      const endY = textBlock(ctx, step.body, L.x + 38 * s, y + 34 * s, L.w - 46 * s, 29 * s);
      ctx.restore();

      if (i < p.arc.length - 1) {
        ctx.save();
        ctx.strokeStyle = "rgba(23,18,13,0.35)";
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(L.x + 12 * s, y + 6 * s);
        ctx.lineTo(L.x + 12 * s, endY - 4 * s);
        ctx.stroke();
        ctx.restore();
      }
      y = endY + 26 * s;
    });
    return;
  }

  /* right page: evidence */
  ctx.save();
  ctx.fillStyle = ACCENT;
  ctx.font = `${22 * s}px "Bangers", sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("EVIDENCE", L.x, L.y + 24 * s);
  ctx.restore();

  // taped screenshot mocks
  const shotW = L.w * 0.52;
  const shotH = 190 * s;
  const shots: [number, number, number][] = [
    [L.x, L.y + 56 * s, -0.02],
    [L.x + L.w * 0.42, L.y + 200 * s, 0.03],
  ];
  shots.forEach(([sx, sy, rot], i) => {
    ctx.save();
    ctx.translate(sx + shotW / 2, sy + shotH / 2);
    ctx.rotate(rot);
    ctx.shadowColor = "rgba(23,18,13,0.35)";
    ctx.shadowBlur = 18 * s;
    ctx.shadowOffsetY = 8 * s;
    ctx.fillStyle = "#f7f2e6";
    ctx.fillRect(-shotW / 2, -shotH / 2, shotW, shotH);
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6 * s;
    ctx.strokeRect(-shotW / 2, -shotH / 2, shotW, shotH);
    // wireframe of a UI
    ctx.fillStyle = INK;
    ctx.fillRect(-shotW / 2 + 10 * s, -shotH / 2 + 10 * s, shotW - 20 * s, 22 * s);
    ctx.globalAlpha = 0.5;
    const r = rng(i * 77 + 5);
    for (let row = 0; row < 5; row++) {
      const y0 = -shotH / 2 + 46 * s + row * 26 * s;
      ctx.fillRect(-shotW / 2 + 10 * s, y0, (shotW - 24 * s) * (0.35 + r() * 0.6), 12 * s);
    }
    ctx.restore();
    tape(ctx, sx + shotW * 0.5, sy - 4 * s, 92 * s, 30 * s, rot + 0.06);
  });

  let y = L.y + 430 * s;
  ctx.save();
  ctx.fillStyle = ACCENT;
  ctx.font = `${24 * s}px "Bangers", sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("LOADOUT", L.x, y);
  ctx.restore();
  y += 34 * s;

  // stack chips
  ctx.save();
  ctx.font = `700 ${20 * s}px "Zen Maru Gothic", sans-serif`;
  let cx = L.x;
  for (const t of p.stack) {
    const tw = ctx.measureText(t).width + 26 * s;
    if (cx + tw > L.x + L.w) {
      cx = L.x;
      y += 44 * s;
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4 * s;
    ctx.strokeRect(cx, y - 22 * s, tw, 34 * s);
    ctx.fillStyle = INK;
    ctx.fillText(t, cx + 13 * s, y + 1 * s);
    cx += tw + 12 * s;
  }
  ctx.restore();
  y += 74 * s;

  ctx.save();
  ctx.fillStyle = ACCENT;
  ctx.font = `${24 * s}px "Bangers", sans-serif`;
  ctx.fillText("RESULTS", L.x, y);
  ctx.restore();
  y += 34 * s;
  ctx.save();
  ctx.fillStyle = INK;
  ctx.font = `600 ${21 * s}px "Zen Maru Gothic", sans-serif`;
  for (const r of p.results) {
    ctx.fillText("▪ " + r, L.x + 4 * s, y);
    y += 32 * s;
  }
  ctx.restore();

  // QR to the repo
  const q = await qr(p.link, Math.round(140 * s));
  ctx.save();
  ctx.fillStyle = "#f7f2e6";
  ctx.fillRect(L.x + L.w - 168 * s, L.y + L.h - 168 * s, 164 * s, 164 * s);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4 * s;
  ctx.strokeRect(L.x + L.w - 168 * s, L.y + L.h - 168 * s, 164 * s, 164 * s);
  ctx.drawImage(q, L.x + L.w - 156 * s, L.y + L.h - 156 * s);
  ctx.fillStyle = INK_SOFT;
  ctx.font = `700 ${16 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(p.linkLabel ?? "SCAN → CODE", L.x + L.w - 86 * s, L.y + L.h + 14 * s);
  ctx.restore();

  if (p.note) {
    handNote(ctx, p.note, L.x, L.y + L.h - 60 * s, 28 * s, -0.04);
    pencilArrow(ctx, L.x + 10 * s, L.y + L.h - 76 * s, L.x + L.w * 0.3, L.y + L.h - 190 * s, s);
  }
}

/* ── timeline / education ───────────────────────────────────────── */

function timeline(L: Layout, items: { year: string; title: string; body: string }[]) {
  const { ctx, s } = L;
  const railX = L.x + 46 * s;

  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4 * s;
  ctx.setLineDash([12 * s, 9 * s]);
  ctx.beginPath();
  ctx.moveTo(railX, L.y + 40 * s);
  ctx.lineTo(railX, L.y + L.h - 20 * s);
  ctx.stroke();
  ctx.restore();

  const step = (L.h - 90 * s) / items.length;
  items.forEach((it, i) => {
    const y = L.y + 64 * s + i * step;

    ctx.save();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(railX, y - 10 * s, 15 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f2ead8";
    ctx.beginPath();
    ctx.arc(railX, y - 10 * s, 6 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.textAlign = "left";
    ctx.fillStyle = ACCENT;
    ctx.font = `${30 * s}px "Bangers", sans-serif`;
    ctx.fillText(it.year, railX + 34 * s, y);
    ctx.fillStyle = INK;
    ctx.font = `700 ${27 * s}px "Zen Maru Gothic", sans-serif`;
    ctx.fillText(it.title, railX + 34 * s, y + 38 * s);
    ctx.font = `600 ${21 * s}px "Zen Maru Gothic", sans-serif`;
    ctx.fillStyle = INK_SOFT;
    textBlock(ctx, it.body, railX + 34 * s, y + 74 * s, L.w - 90 * s, 29 * s);
    ctx.restore();
  });
}

/* ── equipment grid ─────────────────────────────────────────────── */

function equipment(
  L: Layout,
  items: { slot: string; name: string; desc: string }[],
  display: string
) {
  const { ctx, s } = L;
  displayText(ctx, display, L.x + L.w / 2, L.y + 64 * s, 72 * s);

  const cols = 2;
  const rows = Math.ceil(items.length / cols);
  const cw = L.w / cols;
  const ch = (L.h - 130 * s) / rows;

  items.forEach((it, i) => {
    const cx = L.x + (i % cols) * cw;
    const cy = L.y + 118 * s + Math.floor(i / cols) * ch;
    const w = cw - 16 * s;
    const h = ch - 16 * s;

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(cx, cy, w, h);
    ctx.restore();
    inkRect(ctx, cx, cy, w, h, 3.4 * s, i * 9 + 3);
    halftone(ctx, cx, cy, w, h, 0.18, 9 * s, Math.PI / 4, "radial");

    ctx.save();
    ctx.fillStyle = INK;
    ctx.fillRect(cx, cy, 96 * s, 26 * s);
    ctx.fillStyle = "#f2ead8";
    ctx.font = `${19 * s}px "Bangers", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(it.slot, cx + 48 * s, cy + 20 * s);

    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = `${38 * s}px "Bangers", sans-serif`;
    ctx.fillText(it.name, cx + 14 * s, cy + 76 * s);
    ctx.font = `600 ${19 * s}px "Zen Maru Gothic", sans-serif`;
    ctx.fillStyle = INK_SOFT;
    textBlock(ctx, it.desc, cx + 14 * s, cy + 108 * s, w - 28 * s, 26 * s);
    ctx.restore();
  });
}

/* ── achievements ───────────────────────────────────────────────── */

function awards(L: Layout, items: { title: string; body: string }[], display: string) {
  const { ctx, s } = L;
  displayText(ctx, display, L.x + L.w / 2, L.y + 66 * s, 72 * s);
  speedLines(ctx, L.x, L.y, L.w, 120 * s, L.x + L.w / 2, L.y + 40 * s, 60, 21, 0.5);

  let y = L.y + 150 * s;
  const step = (L.h - 170 * s) / items.length;
  items.forEach((it, i) => {
    // medal
    ctx.save();
    ctx.translate(L.x + 34 * s, y + 6 * s);
    ctx.fillStyle = INK;
    ctx.beginPath();
    for (let k = 0; k <= 20; k++) {
      const a = (k / 20) * Math.PI * 2;
      const rr = k % 2 === 0 ? 28 * s : 21 * s;
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f2ead8";
    ctx.font = `${22 * s}px "Bangers", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), 0, 1 * s);
    ctx.restore();

    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = ACCENT;
    ctx.font = `${28 * s}px "Bangers", sans-serif`;
    ctx.fillText(it.title, L.x + 80 * s, y);
    ctx.fillStyle = INK;
    ctx.font = `600 ${21 * s}px "Zen Maru Gothic", sans-serif`;
    textBlock(ctx, it.body, L.x + 80 * s, y + 32 * s, L.w - 90 * s, 28 * s);
    ctx.restore();

    y += step;
  });
}

/* ── contact ────────────────────────────────────────────────────── */

async function contact(L: Layout, lines: string[]) {
  const { ctx, s } = L;

  // letter paper
  ctx.save();
  ctx.fillStyle = "rgba(255,253,246,0.75)";
  ctx.fillRect(L.x, L.y, L.w, L.h * 0.56);
  ctx.strokeStyle = "rgba(23,18,13,0.5)";
  ctx.lineWidth = 2 * s;
  ctx.strokeRect(L.x, L.y, L.w, L.h * 0.56);
  ctx.restore();

  displayText(ctx, "LET'S BUILD", L.x + L.w / 2, L.y + 76 * s, 62 * s);

  ctx.save();
  ctx.fillStyle = INK;
  ctx.font = `600 ${23 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.textAlign = "left";
  let y = L.y + 136 * s;
  for (const l of lines) {
    ctx.fillText(l, L.x + 34 * s, y);
    y += 34 * s;
  }
  ctx.font = `700 ${34 * s}px "Caveat", cursive`;
  ctx.fillStyle = "#1f3a63";
  ctx.fillText("— " + AUTHOR.name, L.x + 34 * s, y + 30 * s);
  ctx.restore();

  // contact block
  const by = L.y + L.h * 0.62;
  ctx.save();
  ctx.fillStyle = INK;
  ctx.fillRect(L.x, by, L.w, 42 * s);
  ctx.fillStyle = "#f2ead8";
  ctx.font = `${26 * s}px "Bangers", sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("REACH ME", L.x + 14 * s, by + 30 * s);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = INK;
  ctx.font = `700 ${23 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.textAlign = "left";
  const strip = (u: string) => u.replace(/^https?:\/\//, "");
  const rows: [string, string][] = [
    ["EMAIL", AUTHOR.email],
    ["WEB", strip(AUTHOR.site)],
    ["GITHUB", strip(AUTHOR.github)],
    ["BASED IN", AUTHOR.location],
  ];
  rows.forEach(([k, v], i) => {
    const ry = by + 80 * s + i * 42 * s;
    ctx.fillStyle = ACCENT;
    ctx.font = `${21 * s}px "Bangers", sans-serif`;
    ctx.fillText(k, L.x + 4 * s, ry);
    ctx.fillStyle = INK;
    ctx.font = `600 ${22 * s}px "Zen Maru Gothic", sans-serif`;
    ctx.fillText(v, L.x + 130 * s, ry);
  });
  ctx.restore();

  const q = await qr(`mailto:${AUTHOR.email}`, Math.round(130 * s));
  ctx.save();
  ctx.fillStyle = "#f7f2e6";
  ctx.fillRect(L.x + L.w - 158 * s, by + 62 * s, 152 * s, 152 * s);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4 * s;
  ctx.strokeRect(L.x + L.w - 158 * s, by + 62 * s, 152 * s, 152 * s);
  ctx.drawImage(q, L.x + L.w - 147 * s, by + 73 * s);
  ctx.restore();

  handNote(ctx, "I answer every real message.", L.x + 4 * s, L.y + L.h - 8 * s, 28 * s, -0.02);
}

/* ── the end ────────────────────────────────────────────────────── */

function end(L: Layout, page: Extract<Page, { kind: "end" }>) {
  const { ctx, s } = L;
  const cx = L.x + L.w / 2;
  const cy = L.y + L.h * 0.42;
  speedLines(ctx, L.x, L.y, L.w, L.h, cx, cy, 150, 88, 0.14);
  halftone(ctx, L.x, L.y, L.w, L.h, 0.45, 12 * s, Math.PI / 4, "radial");

  const big = page.big ?? "THE END";
  displayText(ctx, big, cx, cy, Math.min(128 * s, (L.w * 1.55) / big.length), { rot: -0.03 });
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  ctx.font = `700 ${28 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.fillText(page.sub ?? "thank you for reading", cx, cy + 92 * s);
  ctx.font = `${34 * s}px "Bangers", sans-serif`;
  ctx.fillStyle = ACCENT;
  ctx.fillText(page.kicker ?? "SEE YOU IN THE NEXT PROJECT", cx, cy + 148 * s);
  ctx.restore();

  drawSfx(ctx, "つづく", cx, L.y + L.h - 70 * s, 54 * s, -0.04);

  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.textAlign = "center";
  ctx.fillStyle = INK_SOFT;
  ctx.font = `600 ${18 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.fillText(
    `${PAGES.length} pages · ${CHAPTERS.length} chapters · vol. ${AUTHOR.volume}`,
    cx,
    L.y + L.h - 16 * s
  );
  ctx.restore();
}

/* ── the spine, visible whenever the volume is shut ─────────────── */

export function renderSpine(W: number, H: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const s = H / 1264;

  clothBoard(ctx, W, H);

  // gold rules top and bottom, the way a bound volume is finished
  ctx.save();
  ctx.strokeStyle = "rgba(200,162,80,0.75)";
  ctx.lineWidth = Math.max(1, 2 * s);
  for (const y of [70 * s, H - 70 * s]) {
    ctx.beginPath();
    ctx.moveTo(W * 0.18, y);
    ctx.lineTo(W * 0.82, y);
    ctx.stroke();
  }
  ctx.restore();

  // text runs along the length of the spine
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  foilText(ctx, AUTHOR.title, -H * 0.16, W * 0.06, W * 0.5);
  ctx.font = `${W * 0.34}px "Bangers", sans-serif`;
  ctx.fillStyle = "#c3cddb";
  ctx.fillText(AUTHOR.name.toUpperCase(), H * 0.18, W * 0.05);
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#c8a250";
  ctx.font = `${W * 0.4}px "Bangers", sans-serif`;
  ctx.fillText(AUTHOR.volume, W / 2, 52 * s);
  ctx.fillStyle = "#7f8ea3";
  ctx.font = `700 ${W * 0.2}px "Zen Maru Gothic", sans-serif`;
  ctx.fillText(AUTHOR.year, W / 2, H - 40 * s);
  ctx.restore();

  return canvas;
}

/* used by the loading screen to show real progress */
export const TOTAL_PAGES = PAGES.length;
