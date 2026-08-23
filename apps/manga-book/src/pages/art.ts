/**
 * Procedural panel art. High-contrast ink silhouettes against screentone —
 * the register manga uses for a dramatic beat, and the one that survives
 * being drawn by code.
 */

import type { ArtKind } from "../content/story";
import { Ctx, INK, halftone, speedLines, rng } from "./draw";

type Box = { x: number; y: number; w: number; h: number };

export function drawArt(ctx: Ctx, kind: ArtKind, b: Box, seed: number, s: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(b.x, b.y, b.w, b.h);
  ctx.clip();
  switch (kind) {
    case "hero":
      hero(ctx, b, seed, s);
      break;
    case "laptop":
      laptop(ctx, b, s);
      break;
    case "desk":
      desk(ctx, b, s);
      break;
    case "city":
      city(ctx, b, seed, s);
      break;
    case "sunburst":
      speedLines(ctx, b.x, b.y, b.w, b.h, b.x + b.w * 0.5, b.y + b.h * 0.52, 110, seed, 0.16);
      break;
    case "speedlines":
      motionLines(ctx, b, seed);
      break;
    case "sparkle":
      sparkles(ctx, b, seed, s);
      break;
    case "door":
      door(ctx, b, s);
      break;
    default:
      break;
  }
  ctx.restore();
}

/* ── the protagonist, back-lit ─────────────────────────────────── */

function hero(ctx: Ctx, b: Box, seed: number, s: number) {
  const r = rng(seed);
  halftone(ctx, b.x, b.y, b.w, b.h, 0.55, 10 * s, Math.PI / 4, "radial");
  speedLines(ctx, b.x, b.y, b.w, b.h, b.x + b.w * 0.34, b.y + b.h * 0.3, 64, seed + 5, 0.3);

  const cx = b.x + b.w * 0.34;
  const base = b.y + b.h;
  const headR = b.h * 0.19;
  const headY = b.y + b.h * 0.42;

  ctx.save();
  ctx.fillStyle = INK;

  // shoulders / torso
  ctx.beginPath();
  ctx.moveTo(cx - headR * 2.5, base);
  ctx.quadraticCurveTo(cx - headR * 2.2, headY + headR * 1.5, cx - headR * 0.95, headY + headR * 1.05);
  ctx.lineTo(cx + headR * 0.95, headY + headR * 1.05);
  ctx.quadraticCurveTo(cx + headR * 2.2, headY + headR * 1.5, cx + headR * 2.5, base);
  ctx.closePath();
  ctx.fill();

  // head
  ctx.beginPath();
  ctx.ellipse(cx, headY, headR * 0.82, headR, 0, 0, Math.PI * 2);
  ctx.fill();

  // spiked hair
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.95, headY + headR * 0.1);
  const spikes = 9;
  for (let i = 0; i <= spikes; i++) {
    const t = i / spikes;
    const a = Math.PI * (1 + t);
    const px = cx + Math.cos(a) * headR * 0.95;
    const py = headY + Math.sin(a) * headR * 1.02;
    const out = headR * (0.34 + r() * 0.5);
    ctx.lineTo(px + Math.cos(a) * out * 0.7, py + Math.sin(a) * out);
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // rim light — a paper-coloured gap along one edge
  ctx.save();
  ctx.strokeStyle = "#f2ead8";
  ctx.lineWidth = 3.4 * s;
  ctx.beginPath();
  ctx.ellipse(cx + headR * 0.1, headY, headR * 0.78, headR * 0.96, 0, -Math.PI * 0.62, Math.PI * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + headR * 1.1, headY + headR * 1.3);
  ctx.quadraticCurveTo(cx + headR * 2.0, headY + headR * 2.0, cx + headR * 2.3, b.y + b.h);
  ctx.stroke();
  ctx.restore();

  // eyes: two hard paper-coloured slashes
  ctx.save();
  ctx.fillStyle = "#f2ead8";
  ctx.translate(cx, headY + headR * 0.06);
  for (const sx of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(sx * headR * 0.16, 0);
    ctx.lineTo(sx * headR * 0.56, -headR * 0.1);
    ctx.lineTo(sx * headR * 0.5, headR * 0.11);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/* ── an open laptop, line art ──────────────────────────────────── */

function laptop(ctx: Ctx, b: Box, s: number) {
  halftone(ctx, b.x, b.y, b.w, b.h, 0.22, 10 * s, Math.PI / 4, "down");
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h * 0.62;
  const w = b.w * 0.6;
  const h = b.h * 0.42;

  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.6 * s;
  ctx.lineJoin = "round";

  // screen
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.44, cy - h * 0.1);
  ctx.lineTo(cx - w * 0.36, cy - h);
  ctx.lineTo(cx + w * 0.36, cy - h);
  ctx.lineTo(cx + w * 0.44, cy - h * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // code lines on the screen
  ctx.strokeStyle = "#f2ead8";
  ctx.lineWidth = 2.6 * s;
  ctx.lineCap = "round";
  const rows = 7;
  for (let i = 0; i < rows; i++) {
    const t = (i + 1) / (rows + 1);
    const y = cy - h + h * 0.92 * t;
    const indent = i % 3 === 1 ? 0.1 : i % 4 === 3 ? 0.16 : 0;
    const len = 0.32 + ((i * 37) % 41) / 100;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.28 + w * indent, y);
    ctx.lineTo(cx - w * 0.28 + w * indent + w * 0.56 * len, y);
    ctx.stroke();
  }

  // base
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.6 * s;
  ctx.fillStyle = "#f2ead8";
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.5, cy);
  ctx.lineTo(cx + w * 0.5, cy);
  ctx.lineTo(cx + w * 0.62, cy + h * 0.16);
  ctx.lineTo(cx - w * 0.62, cy + h * 0.16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // glow from the screen
  const g = ctx.createRadialGradient(cx, cy - h * 0.5, 0, cx, cy - h * 0.5, b.w * 0.5);
  g.addColorStop(0, "rgba(255,255,255,0.4)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(b.x, b.y, b.w, b.h);
}

/* ── figure at a desk, silhouette ──────────────────────────────── */

function desk(ctx: Ctx, b: Box, s: number) {
  halftone(ctx, b.x, b.y, b.w, b.h, 0.4, 11 * s, Math.PI / 4, "up");
  const base = b.y + b.h * 0.86;
  ctx.save();
  ctx.fillStyle = INK;
  ctx.fillRect(b.x, base, b.w, b.h * 0.06);
  const cx = b.x + b.w * 0.42;
  const headR = b.h * 0.12;
  ctx.beginPath();
  ctx.arc(cx, base - headR * 2.4, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - headR * 1.9, base);
  ctx.quadraticCurveTo(cx - headR * 1.4, base - headR * 1.9, cx, base - headR * 1.6);
  ctx.quadraticCurveTo(cx + headR * 1.6, base - headR * 1.4, cx + headR * 1.7, base);
  ctx.closePath();
  ctx.fill();
  // monitor
  ctx.fillRect(b.x + b.w * 0.6, base - b.h * 0.34, b.w * 0.28, b.h * 0.28);
  ctx.strokeStyle = "#f2ead8";
  ctx.lineWidth = 3 * s;
  ctx.strokeRect(b.x + b.w * 0.63, base - b.h * 0.31, b.w * 0.22, b.h * 0.22);
  ctx.restore();
}

/* ── skyline ───────────────────────────────────────────────────── */

function city(ctx: Ctx, b: Box, seed: number, s: number) {
  const r = rng(seed);
  halftone(ctx, b.x, b.y, b.w, b.h, 0.3, 12 * s, Math.PI / 4, "down");
  const base = b.y + b.h;

  // hills behind
  ctx.save();
  ctx.fillStyle = "rgba(23,18,13,0.42)";
  ctx.beginPath();
  ctx.moveTo(b.x, base);
  ctx.lineTo(b.x, b.y + b.h * 0.52);
  for (let i = 0; i <= 6; i++) {
    const x = b.x + (b.w * i) / 6;
    ctx.lineTo(x, b.y + b.h * (0.34 + r() * 0.24));
  }
  ctx.lineTo(b.x + b.w, base);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // buildings
  ctx.save();
  ctx.fillStyle = INK;
  let x = b.x - 10;
  while (x < b.x + b.w) {
    const w = b.w * (0.05 + r() * 0.09);
    const h = b.h * (0.2 + r() * 0.42);
    ctx.fillRect(x, base - h, w, h);
    // windows
    ctx.fillStyle = "#f2ead8";
    for (let wy = base - h + 8 * s; wy < base - 12 * s; wy += 16 * s) {
      for (let wx = x + 6 * s; wx < x + w - 8 * s; wx += 14 * s) {
        if (r() > 0.55) ctx.fillRect(wx, wy, 6 * s, 7 * s);
      }
    }
    ctx.fillStyle = INK;
    x += w + b.w * 0.008;
  }
  ctx.restore();

  // birds
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2 * s;
  ctx.lineCap = "round";
  for (let i = 0; i < 5; i++) {
    const bx = b.x + b.w * (0.15 + r() * 0.7);
    const by = b.y + b.h * (0.1 + r() * 0.22);
    const bw = (7 + r() * 7) * s;
    ctx.beginPath();
    ctx.moveTo(bx - bw, by);
    ctx.quadraticCurveTo(bx - bw * 0.4, by - bw * 0.6, bx, by);
    ctx.quadraticCurveTo(bx + bw * 0.4, by - bw * 0.6, bx + bw, by);
    ctx.stroke();
  }
  ctx.restore();
}

function motionLines(ctx: Ctx, b: Box, seed: number) {
  const r = rng(seed);
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  for (let i = 0; i < 60; i++) {
    const y = b.y + r() * b.h;
    const len = b.w * (0.2 + r() * 0.8);
    const x = b.x + r() * (b.w - len * 0.4);
    ctx.globalAlpha = 0.35 + r() * 0.6;
    ctx.lineWidth = 0.6 + r() * 2.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
  ctx.restore();
}

function sparkles(ctx: Ctx, b: Box, seed: number, s: number) {
  const r = rng(seed);
  ctx.save();
  ctx.fillStyle = INK;
  for (let i = 0; i < 16; i++) {
    const x = b.x + r() * b.w;
    const y = b.y + r() * b.h;
    const k = (5 + r() * 18) * s;
    ctx.beginPath();
    ctx.moveTo(x, y - k);
    ctx.quadraticCurveTo(x, y, x + k * 0.34, y);
    ctx.quadraticCurveTo(x, y, x, y + k);
    ctx.quadraticCurveTo(x, y, x - k * 0.34, y);
    ctx.quadraticCurveTo(x, y, x, y - k);
    ctx.fill();
  }
  ctx.restore();
}

function door(ctx: Ctx, b: Box, s: number) {
  const cx = b.x + b.w / 2;
  const w = b.w * 0.34;
  const h = b.h * 0.72;
  const top = b.y + b.h * 0.16;
  ctx.save();
  halftone(ctx, b.x, b.y, b.w, b.h, 0.5, 10 * s, Math.PI / 4, "radial");
  const g = ctx.createLinearGradient(cx, top, cx, top + h);
  g.addColorStop(0, "#fdf8ec");
  g.addColorStop(1, "#efe6d2");
  ctx.fillStyle = g;
  ctx.fillRect(cx - w / 2, top, w, h);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4 * s;
  ctx.strokeRect(cx - w / 2, top, w, h);
  // light spill
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, top + h);
  ctx.lineTo(cx - w * 1.6, b.y + b.h);
  ctx.lineTo(cx + w * 1.6, b.y + b.h);
  ctx.lineTo(cx + w / 2, top + h);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,250,235,0.55)";
  ctx.fill();
  ctx.restore();
}
