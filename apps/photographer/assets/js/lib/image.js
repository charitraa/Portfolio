/* ============================================================
   IMAGE — responsive sources, aspect-ratio boxes, tone placeholders.

   Every frame renders at a known aspect ratio with a solid average
   colour behind it, so nothing shifts while the photograph loads.
   Sources are requested at the size they will be displayed and
   served as AVIF/WebP where the browser supports it.

   `id` accepts either an Unsplash photo id (the default placeholder
   imagery) or a path to your own file — anything containing "/" or
   ending in an image extension is used verbatim.
   ============================================================ */
import { esc } from "./dom.js";

const CDN = "https://images.unsplash.com/photo-";
const WIDTHS = [480, 720, 960, 1280, 1600, 2000];
const QUALITY = 72;

const isLocal = (id) => /^(https?:|\/|\.)/.test(id) || /\.(avif|webp|jpe?g|png)$/i.test(id);

export function imageURL(id, width, ratio) {
  if (isLocal(id)) return id;
  const height = Math.round(width / ratio);
  return `${CDN}${id}?auto=format&fit=crop&crop=faces,entropy&w=${width}&h=${height}&q=${QUALITY}`;
}

export function imageSrcset(id, ratio, widths = WIDTHS) {
  if (isLocal(id)) return "";
  return widths.map((w) => `${imageURL(id, w, ratio)} ${w}w`).join(", ");
}

/**
 * Markup for one framed photograph.
 * @param {object} o
 * @param {string} o.id      photo id or path
 * @param {string} o.alt     description of what is in the frame
 * @param {number} o.ratio   width / height of the frame
 * @param {string} o.tone    average colour, shown while loading
 * @param {string} o.sizes   sizes attribute
 * @param {boolean} o.priority  eager-load and prioritise (hero only)
 */
export function frame({ id, alt = "", ratio = 1.5, tone = "#1B1E21", sizes = "100vw", priority = false, className = "" }) {
  const width = 1600;
  const height = Math.round(width / ratio);
  const srcset = imageSrcset(id, ratio);
  return `
    <div class="ph-img ${className}" style="--ratio:${ratio};--tone:${esc(tone)}">
      <img src="${esc(imageURL(id, 1280, ratio))}"
           ${srcset ? `srcset="${esc(srcset)}" sizes="${esc(sizes)}"` : ""}
           width="${width}" height="${height}"
           alt="${esc(alt)}"
           loading="${priority ? "eager" : "lazy"}"
           decoding="${priority ? "sync" : "async"}"
           ${priority ? 'fetchpriority="high"' : ""}>
    </div>`;
}

/** Fade each photograph in once it has actually decoded. */
export function bindImageLoading(root = document) {
  root.querySelectorAll("img:not([data-load-bound])").forEach((img) => {
    img.dataset.loadBound = "true";
    if (img.complete && img.naturalWidth) { img.classList.add("is-loaded"); return; }
    img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
    img.addEventListener("error", () => img.classList.add("is-loaded"), { once: true });
  });
}
